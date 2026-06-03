"""Per-section news-supply measurement (the weekly volume test).

Measures, for each queried section, how many unique articles Sonar returns
(`raw`) and how many survive the promo classifier as real news (`news`). Run
over time, this is the data that decides which borderline sections graduate
tag → section (a one-line `taxonomy.py` edit — promotion stays a human call).

Reuses the live pipeline's own fetch + classifier so the numbers reflect what
the pipeline actually sees, not desk research.
"""
import logging
import os

from sqlalchemy.orm import Session

from services.content_classifier import classify_articles
from services.news_fetcher import SECTION_QUERIES, _fetch_one_query

logger = logging.getLogger(__name__)


def measure_section_supply(
    db: Session, *, classify: bool = True
) -> dict[str, dict[str, int]]:
    """Return {section: {"raw": n_unique, "news": n_classified_news}}.

    `db` is accepted for signature parity with the pipeline (and future use);
    the measurement itself only needs the Perplexity key.
    """
    api_key = os.environ["PERPLEXITY_API_KEY"]
    out: dict[str, dict[str, int]] = {}

    for section, query in SECTION_QUERIES.items():
        articles = _fetch_one_query(api_key, query, section)
        unique = list({a.url: a for a in articles}.values())
        raw = len(unique)

        news = raw
        if classify and unique:
            verdicts = classify_articles(unique)
            news = sum(1 for a in unique if verdicts[a.url].is_news)

        out[section] = {"raw": raw, "news": news}
        logger.info("volume probe section=%s raw=%d news=%d", section, raw, news)

    return out
