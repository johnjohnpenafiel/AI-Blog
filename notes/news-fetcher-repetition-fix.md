# News-fetcher repetition fix — next-iteration notes

> Captured 2026-05-26 after manual verification of the `news-fetcher-quality-filter` feature. The feature shipped and works correctly; live runs revealed a deeper repetition problem the current implementation does not solve.

## Observation

Running the pipeline multiple times across two days produced near-identical posts. Different wording from Claude each run, but the **same source articles**, the **same companies and data points**, and consistently the **Voice AI** tag. The variety the cluster-picking system was supposed to provide is not showing up across runs.

## Why this is happening

Three structural reasons, all interacting:

1. **Sonar's recency window is `"week"`.** Mon / Tue / Wed runs all pull from roughly the same 7-day article pool. The pool barely shifts day-to-day, so consecutive runs see nearly the same input.
2. **Voice AI keeps winning by URL-dedup bias.** Voice AI is the first entry in `QUERY_TO_TAG`, so when the same article URL is returned by both the Voice AI query and (say) the CRM query, the Voice AI tag wins. In one real run, Voice AI got 10/10 unique articles, CRM lost 3 to dedup, and Sales Dev lost *all* of its articles to earlier queries.
3. **The tie-break only triggers on exact ties.** Voice AI winning 10 vs 7 is not a tie — the tie-break does nothing. The "different from last published" rule never fires in practice.

So even without manual re-triggering, the system is biased toward Voice AI on every run.

## Three options to fix

| Option | What it does | Effort |
|---|---|---|
| **A. Recent-tag exclusion** | Hard-exclude any tag used in the last N=2 or 3 published posts. If Voice AI was just published, it is *banned* from this run regardless of cluster size. Forces rotation through other categories. Extends the current `_last_published_tag` helper in `news_fetcher.py` to `_recent_published_tags(db, n=3)`. | Small (~10 lines) |
| **B. Recently-used URL filter** | Before clustering, drop any article URL that already appears in a published post's `sources` rows within the last 30 days. Prevents covering the same article twice even when the topic naturally repeats. | Small |
| **C. Manual category schedule** | Operator-defined weekly rotation (e.g. Mon = Voice AI, Wed = CRM, Fri = Industry Move). Pipeline only runs that day's category query and skips clustering entirely. | Medium — needs a settings surface + UI |

These are not mutually exclusive. A and B compose naturally.

## Recommendation

**Start with A. Layer in B if A is not enough. Treat C as the nuclear option.**

A is small, surgical, and directly addresses the observed problem. It preserves the data-driven "what category is hottest this week" benefit while guaranteeing rotation across recent topics. B is a complementary content-level safety net that prevents the same article from being re-used inside the same category.

C (the manual schedule) works, but it costs the cluster-picking system entirely and adds operator decisions. The same variety guarantee from A + B comes without that overhead. Save C for the case where A and B together still do not produce enough variety.

## When to revisit

After deployment is live and a few real Mon + Thu cycles have run. At that point real signal will be available on:

- How often Voice AI still wins (A's necessity)
- How often the same article would have been re-used across posts (B's necessity)
- Whether the operator wants fine-grained day-of-week control (C's necessity)

## Related context

- Code: `backend/services/news_fetcher.py` — `_last_published_tag`, `_pick_winning_cluster`, `fetch_qualifying_articles`.
- Decision log: `PLANNING-decisions.md` (2026-05-24 entry) — full rationale for the current per-cluster threshold + tie-break.
- Roadmap entry: `PLANNING.md` post-MVP section — `news-fetcher-repetition-fix` line pointing back to this file.
