"""Per-post cover image: art director (Opus) -> Recraft V4.1 (fal.ai) -> host.

Mirrors the external-API pattern in `news_fetcher.py` (synchronous `httpx`, key from
`os.environ`, `raise_for_status`) and the fail-soft contract of the pipeline's eval step:
a cover image is OPTIONAL, so image generation NEVER raises into a pipeline run — on any
failure it logs and returns None, leaving `posts.image_url` NULL and the run intact.

Hosting seam: v1 passes fal's image URL straight through (`FalPassthroughHost`). Moving to
our own bucket later (Cloudflare R2) is a one-class swap — implement `ImageHost.persist`
to download + re-upload and return a stable URL; nothing else changes.
"""
import logging
import os
from typing import Protocol

import httpx

from services.image_art_director import design_prompt

logger = logging.getLogger(__name__)

# fal's synchronous endpoint holds the connection until the image is ready (a few
# seconds for Recraft), so the timeout is generous.
FAL_ENDPOINT = "https://fal.run/fal-ai/recraft/v4.1/text-to-image"
REQUEST_TIMEOUT_SECONDS = 120.0
IMAGE_SIZE = "landscape_16_9"

# Orange-forward palette — a bias, not a hard constraint. Makes orange the through-line
# across every cover while leaving harmonious accents free per post. (V4.1 has no
# sub-style/style_id; the look rides entirely on the prompt tail + this palette.)
PALETTE = [
    {"r": 244, "g": 88, "b": 16},
    {"r": 255, "g": 156, "b": 78},
    {"r": 250, "g": 232, "b": 186},
    {"r": 26, "g": 150, "b": 162},
    {"r": 40, "g": 34, "b": 30},
]


class ImageHost(Protocol):
    """Where a generated cover lives. Swap the implementation to move hosting."""

    def persist(self, fal_url: str) -> str:
        ...


class FalPassthroughHost:
    """v1 host: use fal's returned URL as-is (`fal.media`). The storage seam we
    replace with our own bucket later; keeps v1 shipping without extra infra."""

    def persist(self, fal_url: str) -> str:
        return fal_url


def _generate_raster(prompt: str) -> str:
    """One synchronous Recraft V4.1 generation. Returns the image URL; raises on error."""
    api_key = os.environ["FAL_KEY"]
    response = httpx.post(
        FAL_ENDPOINT,
        headers={"Authorization": f"Key {api_key}"},
        json={
            "prompt": prompt,
            "style": "any",
            "image_size": IMAGE_SIZE,
            "colors": PALETTE,
        },
        timeout=REQUEST_TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    return response.json()["images"][0]["url"]


def generate_post_image(
    *,
    title: str,
    summary: str,
    section: str | None,
    index: int,
    host: ImageHost | None = None,
) -> str | None:
    """Full chain for one post's cover: art director -> Recraft V4.1 -> host.

    Returns the hosted image URL, or None if any step fails. Fail-soft by contract —
    a cover is optional and must never break a pipeline run (mirrors `_evaluate_generated`).
    `index` drives the deterministic device/backdrop rotation (see art director)."""
    host = host or FalPassthroughHost()
    try:
        prompt, spec = design_prompt(
            title=title, summary=summary, section=section, index=index
        )
        fal_url = _generate_raster(prompt)
        url = host.persist(fal_url)
    except Exception as exc:  # noqa: BLE001 — an optional cover must never break a run
        logger.warning("post image generation skipped: %s", exc)
        return None

    logger.info(
        "post image generated: device=%s composition=%s text_role=%s",
        spec.get("device"),
        spec.get("composition"),
        spec.get("text_role"),
    )
    return url
