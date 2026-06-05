"""Fetch news articles from Perplexity Sonar, grouped by dealership section.

v2 sourcing (see PLANNING.md → Roadmap → news-sourcing-v2):

- **Section-based queries.** One Sonar `/search` query per volume-safe /
  borderline section; every returned article is attributed to that section.
- **Open canvas.** No `search_domain_filter` allowlist — we search broadly.
  A short `DOMAIN_BLOCKLIST` catches pure vendor-promo channels, and a Haiku
  classifier (`content_classifier`) drops anything that isn't real news.
- **Anti-repetition.** Articles already cited by a previous post (URL in
  `sources`) are dropped; the last published post's section is avoided when
  another section qualifies.
- **Importance ranking.** Among sections with ≥3 news articles, the winner is
  the one with the most operator-relevant coverage (count of high-importance
  stories, then summed importance, then publisher breadth) — not raw volume.

Only the winning section's articles are returned to the blog writer.
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

from models import Post, Source
from services.content_classifier import classify_articles


logger = logging.getLogger(__name__)

SONAR_SEARCH_URL = "https://api.perplexity.ai/search"
RECENCY_FILTER = "week"
MIN_ARTICLES = 3
REQUEST_TIMEOUT_SECONDS = 30.0

# One query per volume-safe / borderline section (per the section-volume
# research). Each article inherits the section of the query that surfaced it.
# Tag-only / adjacent sections (F&I, Back Office/DMS, AI Car Shopping) are not
# queried yet — see news-sourcing-v2 plan.
SECTION_QUERIES: dict[str, str] = {
    "Customer Experience": "news: AI voice agents and chatbots for car dealership sales and customer service 2026",
    "Inventory & Merchandising": "news: AI vehicle merchandising, imaging, and inventory management for car dealerships 2026",
    "Pricing & Analytics": "news: AI vehicle pricing intelligence and data analytics for car dealerships 2026",
    "Sales & Lead Gen / BDC": "news: AI lead generation and BDC automation for automotive dealerships 2026",
    "Fixed Ops / Service": "news: AI service department scheduling and fixed ops for car dealerships 2026",
    "CRM & Marketing": "news: AI CRM automation and marketing for automotive dealerships 2026",
}

# Domains we drop before the classifier ever sees them — a cheap deterministic
# first pass (the Haiku classifier is still the real gate).
#
# Two kinds:
#   1. PR wires — vendor-controlled distribution, promotional by construction.
#   2. Video / social hosts — structurally thin source material. We never fetch
#      a URL; Claude only sees the snippet Perplexity returns, which for a video
#      is its description blurb, not the transcript. A few sentences of marketing
#      copy is too little to ground a post on, so we drop them at the host level
#      regardless of who posted them. (See the 2026-06-05 grounding finding.)
DOMAIN_BLOCKLIST: set[str] = {
    # PR wires
    "prnewswire.com",
    "businesswire.com",
    "globenewswire.com",
    "einpresswire.com",
    "prweb.com",
    "accesswire.com",
    # Video / social (no transcript reaches us — snippet only)
    "youtube.com",
    "youtu.be",
    "vimeo.com",
    "tiktok.com",
    "facebook.com",
    "instagram.com",
    "reddit.com",
    "x.com",
    "twitter.com",
}


class Article(BaseModel):
    title: str
    url: str
    publisher: str
    published_date: date | None = None
    snippet: str
    section: str


def _derive_publisher(url: str) -> str:
    hostname = urlparse(url).hostname or ""
    return hostname.removeprefix("www.")


def _is_blocklisted(url: str) -> bool:
    host = (urlparse(url).hostname or "").removeprefix("www.")
    # Match the apex domain and any subdomain (m.youtube.com, music.youtube.com),
    # but not lookalikes (notyoutube.com).
    return any(
        host == domain or host.endswith(f".{domain}") for domain in DOMAIN_BLOCKLIST
    )


def _parse_result(raw: dict, section: str) -> Article | None:
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
        section=section,
    )


def _fetch_one_query(api_key: str, query: str, section: str) -> list[Article]:
    # Open canvas: no `search_domain_filter`. The classifier gates quality.
    response = httpx.post(
        SONAR_SEARCH_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "query": query,
            "search_recency_filter": RECENCY_FILTER,
        },
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    raw_results = response.json().get("results", [])

    articles: list[Article] = []
    for raw in raw_results:
        parsed = _parse_result(raw, section=section)
        if parsed is not None:
            articles.append(parsed)
    return articles


def _already_cited_urls(db: Session) -> set[str]:
    """Every URL ever attached to a post — so we never re-use an article."""
    return {url for (url,) in db.query(Source.url).all()}


def _last_published_section(db: Session) -> str | None:
    last = (
        db.query(Post)
        .filter(Post.status == "published")
        .order_by(desc(Post.published_at))
        .first()
    )
    return last.section if last is not None else None


def _pick_winning_section(
    clusters: dict[str, list[Article]],
    importance: dict[str, int],
    high_counts: dict[str, int],
    last_section: str | None,
) -> tuple[str | None, list[Article]]:
    """Winner = qualifying section ranked by operator-relevance, not volume.

    Rank key: (# high-importance stories, summed importance, publisher breadth,
    cluster size). The last published section is skipped when another section
    qualifies (anti back-to-back repetition).
    """
    qualifying = {
        s: arts for s, arts in clusters.items() if len(arts) >= MIN_ARTICLES
    }
    if not qualifying:
        return None, []

    candidates = qualifying
    if last_section in qualifying and len(qualifying) > 1:
        candidates = {s: a for s, a in qualifying.items() if s != last_section}

    def _rank(section: str) -> tuple:
        breadth = len({a.publisher for a in candidates[section]})
        return (
            high_counts.get(section, 0),
            importance.get(section, 0),
            breadth,
            len(candidates[section]),
            section,  # final deterministic tie-break
        )

    winner = max(candidates, key=_rank)
    return winner, clusters[winner]


def fetch_qualifying_articles(db: Session) -> list[Article]:
    api_key = os.environ["PERPLEXITY_API_KEY"]

    # 1. Fetch per section, dedupe by URL (first-seen section wins).
    deduped: dict[str, Article] = {}
    for section, query in SECTION_QUERIES.items():
        results = _fetch_one_query(api_key, query, section)
        logger.info("sonar section=%s returned %d raw articles", section, len(results))
        for article in results:
            deduped.setdefault(article.url, article)

    # 2. Deterministic drops: blocklisted domains + already-cited URLs.
    cited = _already_cited_urls(db)
    candidates = [
        a
        for a in deduped.values()
        if not _is_blocklisted(a.url) and a.url not in cited
    ]
    logger.info(
        "%d unique articles; %d after blocklist + already-cited filter",
        len(deduped),
        len(candidates),
    )

    if not candidates:
        logger.info("no fresh articles after filtering — skipping run")
        return []

    # 3. Classifier gate: keep real news, capture importance.
    verdicts = classify_articles(candidates)
    news = [a for a in candidates if verdicts[a.url].is_news]
    logger.info("%d/%d articles classified as news", len(news), len(candidates))

    # 4. Cluster by section + aggregate importance signals.
    clusters: dict[str, list[Article]] = defaultdict(list)
    importance: dict[str, int] = defaultdict(int)
    high_counts: dict[str, int] = defaultdict(int)
    for a in news:
        clusters[a.section].append(a)
        importance[a.section] += verdicts[a.url].importance
        if verdicts[a.url].importance >= 2:
            high_counts[a.section] += 1

    logger.info(
        "section cluster sizes: %s",
        {s: len(items) for s, items in clusters.items()},
    )

    # 5. Importance-ranked winner, avoiding the last published section.
    last_section = _last_published_section(db)
    winning_section, winning_articles = _pick_winning_section(
        clusters, importance, high_counts, last_section
    )

    if winning_section is None:
        logger.info(
            "no section reached %d news articles — skipping run", MIN_ARTICLES
        )
        return []

    logger.info(
        "winning section=%s with %d articles (importance=%d, last_section=%s)",
        winning_section,
        len(winning_articles),
        importance[winning_section],
        last_section,
    )
    return winning_articles
