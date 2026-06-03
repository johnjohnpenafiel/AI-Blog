---
status: done
started: 2026-06-03
completed: 2026-06-03
---

# weekly-volume-testing

# Goal
Productionize the one-off volume probe into a repeatable per-section measurement that logs qualifying-article counts over time — the data that decides which borderline sections graduate tag → section. Runs alongside the engine; never on the critical path.

## Scope
- `services/volume_probe.py` — `measure_section_supply(db) -> {section: {raw, news}}`: runs each section's open-canvas Sonar query, counts unique articles (`raw`) and classifier-passed news (`news`), reusing `news_fetcher._fetch_one_query` + `content_classifier.classify_articles`.
- `backend/scripts/volume_probe.py` — CLI that runs the measurement, appends a timestamped record to `reports/volume-probe-results.jsonl`, and prints a table.
- Tests with mocked Sonar + classifier.

## Out of scope
- **In-process APScheduler job** — deliberately NOT added (would restructure the scheduler + the single-instance scaling concern). "Recurring" is realized by cron-ing the script externally. Documented.
- **New DB table** for results — results go to a JSONL file, not the schema (keeps it gate-free).
- Any taxonomy/section graduation logic — this only *produces the data*; promotion stays a human call (one-line `taxonomy.py` edit).

## Success criteria
- `measure_section_supply` returns `{raw, news}` per queried section, with `news <= raw`.
- The script appends one JSON record per run to `reports/volume-probe-results.jsonl`.
- Full backend suite green.

## Tasks
- [x] `services/volume_probe.py` — `measure_section_supply(db)`.
- [x] `backend/scripts/volume_probe.py` — CLI: measure, append JSONL record, print table.
- [x] `tests/test_volume_probe.py` — mocked Sonar + classifier; asserts raw/news counts + classify-skip.
- [x] Full backend suite green.

## Verification
- [x] `docker compose run --rm backend pytest` passes — **154 passed** (152 prior + 2 new).
- [x] `test_measure_counts_raw_and_news` asserts per-section raw + news with news < raw when the classifier drops one.

## Notes
- Realized as an externally-cron'd script, NOT an in-process scheduler job (avoids the scaling concern + architecture gate). Results append to `reports/volume-probe-results.jsonl`. Section graduation stays a human call (one-line `taxonomy.py` edit).
