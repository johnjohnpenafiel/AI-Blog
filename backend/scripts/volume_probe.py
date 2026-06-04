"""Weekly volume test: measure per-section news supply and log a record.

Usage:
    docker compose run --rm backend python scripts/volume_probe.py

Appends one timestamped JSON record per run to
`backend/reports/volume-probe-results.jsonl` (created if absent) and prints a
table. Cron this weekly (externally) to build the time series that decides which
sections graduate tag → section. Needs PERPLEXITY_API_KEY + ANTHROPIC_API_KEY.
"""
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Allow `python scripts/volume_probe.py` from /app (no PYTHONPATH=.)
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from database import SessionLocal  # noqa: E402
from services.volume_probe import measure_section_supply  # noqa: E402

# Write into backend/reports/ — the only path mounted into the container
# (docker-compose mounts ./backend:/app), so the record persists to the host.
RESULTS_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "reports",
    "volume-probe-results.jsonl",
)


def main() -> None:
    db = SessionLocal()
    try:
        sections = measure_section_supply(db)
    finally:
        db.close()

    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "sections": sections,
    }

    os.makedirs(os.path.dirname(RESULTS_PATH), exist_ok=True)
    with open(RESULTS_PATH, "a", encoding="utf-8") as fh:
        fh.write(json.dumps(record) + "\n")

    print(f"{'section':<36} raw  news")
    print("-" * 50)
    for section, counts in sections.items():
        print(f"{section:<36} {counts['raw']:>3}  {counts['news']:>4}")
    print(f"\nappended record to {RESULTS_PATH}")


if __name__ == "__main__":
    main()
