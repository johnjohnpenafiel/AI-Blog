"""Fetch news articles from Perplexity Sonar, grouped by post tag.

Each query maps 1:1 to one of the seven official post tags. Sonar's
`/search` endpoint is hit once per query (not batched) so the source query
— and therefore the tag — of every returned article is known by attribution
rather than by re-classifying the snippet afterward.

After fetching, articles are deduped by URL (first-seen wins), grouped by
tag, and the largest group is selected as the "winning cluster." Ties are
broken by preferring a tag different from the most recently published
post. The ≥3 article threshold applies to the winning cluster, not the
total pool — so a run where no single category reaches 3 articles is
skipped, keeping generated posts focused on one topic instead of forcing
a mash-up.
"""
import logging
import os
from collections import defaultdict
from datetime import date
from urllib.parse import urlparse

import httpx
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from models import Post


logger = logging.getLogger(__name__)

SONAR_SEARCH_URL = "https://api.perplexity.ai/search"
RECENCY_FILTER = "week"
MIN_ARTICLES = 3
REQUEST_TIMEOUT_SECONDS = 30.0

# Insertion order is iteration order (Python 3.7+) and matters for the
# URL-dedup tie-break — when the same URL is returned by two queries, the
# earlier query's tag is the one that sticks.
QUERY_TO_TAG: dict[str, str] = {
    "news: AI voice agents transforming automotive sales and customer service": "Voice AI",
    "news: dealership CRM modernization trends 2026": "CRM",
    "news reports: automated vehicle inspection tools at dealerships": "Merchandising",
    "news: tech companies launching automotive retail products": "Industry Move",
    "news: vehicle pricing intelligence and data analytics for car dealerships 2026": "Pricing & Analytics",
    "news: AI lead generation and BDC automation in automotive retail 2026": "Sales Dev",
    "news: dealership management systems and operational tech modernization 2026": "OT & Infrastructure",
}

# Second-layer filter against vendor product / marketing pages. Sonar's
# `search_domain_filter` accepts up to 20 domains; we use ~18 across
# automotive trade press, dealer-focused publications, general tech news,
# and business news. Even if a query phrasing slips, results can only
# come from this list.
NEWS_DOMAIN_ALLOWLIST: list[str] = [
    "automotivenews.com",
    "wardsauto.com",
    "cbtnews.com",
    "digitaldealer.com",
    "autoremarketing.com",
    "motortrend.com",
    "autoweek.com",
    "caranddriver.com",
    "techcrunch.com",
    "theverge.com",
    "arstechnica.com",
    "wired.com",
    "venturebeat.com",
    "axios.com",
    "reuters.com",
    "bloomberg.com",
    "forbes.com",
    "businessinsider.com",
]


class Article(BaseModel):
    title: str
    url: str
    publisher: str
    published_date: date | None = None
    snippet: str
    tag: str


def _derive_publisher(url: str) -> str:
    hostname = urlparse(url).hostname or ""
    return hostname.removeprefix("www.")


def _parse_result(raw: dict, tag: str) -> Article | None:
    url = raw.get("url")
    title = raw.get("title")
    if not url or not title:
        return None

    published_date: date | None = None
    raw_date = raw.get("date")
    if raw_date:
        try:
            published_date = date.fromisoformat(raw_date)
        except ValueError:
            published_date = None

    return Article(
        title=title,
        url=url,
        publisher=_derive_publisher(url),
        published_date=published_date,
        snippet=raw.get("snippet", ""),
        tag=tag,
    )


def _fetch_one_query(api_key: str, query: str, tag: str) -> list[Article]:
    response = httpx.post(
        SONAR_SEARCH_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "query": query,
            "search_recency_filter": RECENCY_FILTER,
            "search_domain_filter": NEWS_DOMAIN_ALLOWLIST,
        },
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    raw_results = response.json().get("results", [])

    articles: list[Article] = []
    for raw in raw_results:
        parsed = _parse_result(raw, tag=tag)
        if parsed is not None:
            articles.append(parsed)
    return articles


def _last_published_tag(db: Session) -> str | None:
    last = (
        db.query(Post)
        .filter(Post.status == "published")
        .order_by(desc(Post.published_at))
        .first()
    )
    if last is None or not last.tags:
        return None
    return last.tags[0]


def _pick_winning_cluster(
    clusters: dict[str, list[Article]], last_tag: str | None
) -> tuple[str | None, list[Article]]:
    """Return (winning_tag, articles). Largest cluster wins; tie-break = tag != last_tag."""
    if not clusters:
        return None, []

    max_count = max(len(items) for items in clusters.values())
    candidates = [tag for tag, items in clusters.items() if len(items) == max_count]

    if len(candidates) == 1:
        winner = candidates[0]
    else:
        non_last = [t for t in candidates if t != last_tag]
        winner = non_last[0] if non_last else candidates[0]

    return winner, clusters[winner]


def fetch_qualifying_articles(db: Session) -> list[Article]:
    api_key = os.environ["PERPLEXITY_API_KEY"]

    deduped: dict[str, Article] = {}
    for query, tag in QUERY_TO_TAG.items():
        results = _fetch_one_query(api_key, query, tag)
        logger.info("sonar query tag=%s returned %d raw articles", tag, len(results))
        for article in results:
            deduped.setdefault(article.url, article)

    clusters: dict[str, list[Article]] = defaultdict(list)
    for article in deduped.values():
        clusters[article.tag].append(article)

    cluster_summary = {tag: len(items) for tag, items in clusters.items()}
    logger.info(
        "cluster counts after url dedup (%d unique articles): %s",
        len(deduped),
        cluster_summary,
    )

    last_tag = _last_published_tag(db)
    winning_tag, winning_articles = _pick_winning_cluster(clusters, last_tag)

    if winning_tag is None:
        logger.info("no articles returned from any query — skipping run")
        return []

    if len(winning_articles) < MIN_ARTICLES:
        logger.info(
            "winning cluster tag=%s has %d articles (< %d) — skipping run",
            winning_tag,
            len(winning_articles),
            MIN_ARTICLES,
        )
        return []

    logger.info(
        "winning cluster tag=%s with %d articles (last_published_tag=%s)",
        winning_tag,
        len(winning_articles),
        last_tag,
    )
    return winning_articles
