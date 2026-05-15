import logging
import os
from datetime import date
from urllib.parse import urlparse

import httpx
from pydantic import BaseModel


logger = logging.getLogger(__name__)

SONAR_SEARCH_URL = "https://api.perplexity.ai/search"
RECENCY_FILTER = "week"
MIN_ARTICLES = 3
REQUEST_TIMEOUT_SECONDS = 30.0

SONAR_QUERIES: list[str] = [
    "AI tools being used in car dealerships past 2 weeks",
    "AI voice agents for automotive sales and customer service",
    "dealership CRM modernization AI",
    "automotive merchandising inspection automation",
    "tech companies entering automotive operations",
]


class Article(BaseModel):
    title: str
    url: str
    publisher: str
    published_date: date | None = None
    snippet: str


def _derive_publisher(url: str) -> str:
    hostname = urlparse(url).hostname or ""
    return hostname.removeprefix("www.")


def _parse_result(raw: dict) -> Article | None:
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
    )


def fetch_qualifying_articles() -> list[Article]:
    api_key = os.environ["PERPLEXITY_API_KEY"]

    response = httpx.post(
        SONAR_SEARCH_URL,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "query": SONAR_QUERIES,
            "search_recency_filter": RECENCY_FILTER,
        },
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()

    raw_results = response.json().get("results", [])
    logger.info("sonar /search returned %d raw articles", len(raw_results))

    articles_by_url: dict[str, Article] = {}
    for raw in raw_results:
        article = _parse_result(raw)
        if article is None:
            continue
        articles_by_url.setdefault(article.url, article)

    deduped = list(articles_by_url.values())
    logger.info("after dedup by url: %d articles", len(deduped))

    if len(deduped) < MIN_ARTICLES:
        logger.info(
            "below threshold (%d < %d) — skipping run", len(deduped), MIN_ARTICLES
        )
        return []

    logger.info("threshold met (%d >= %d) — proceeding", len(deduped), MIN_ARTICLES)
    return deduped
