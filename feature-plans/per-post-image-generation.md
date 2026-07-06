---
status: in-progress
started: 2026-06-18
---

# Feature: per-post-image-generation

## Goal
Generate one AI image per post inside the automated pipeline (fal.ai / Recraft) and
render it in the existing homepage featured + card slots — shipped fast on fal's
hosting (v1), behind a swappable hosting seam so moving to our own Cloudflare R2
hosting later is a one-class change, not a rewrite.

## Visual recipe — LOCKED (Phase 0 bake-off complete; updated 2026-07-04)

> Settled after an extended bake-off (throwaway scripts + labeled contact sheets archived on
> the operator's Desktop, `~/Desktop/bakeoff-*`). This **supersedes everything earlier in git
> history** — the engraving form, the "Tron/HUD" language, the deterministic MATERIAL pass,
> AND the earlier V3 `pop_art` recipe. **There is no post-processing:** the image is used
> exactly as Recraft returns it.

**Three steps: art director (LLM) → generate (Recraft V4.1, one call) → use raw. No material, no filter, no post-processing.**

**1. Art director — `claude-opus-4-8`, structured JSON out.** Reads the post (title + summary + section) + a deterministically-assigned metaphor **device** AND **backdrop** (both rotated by post index — see rotation below), and returns `{tension, device, composition, text_role, text, subject, scene}`. It names the underlying *operator* tension, applies the device, and writes a concrete **scene** for one bold iconic subject — never a literal depiction of the post.
- **Composition — single / fuse / separate (not always two objects).** The art director picks a `composition` to fit the metaphor, under a **fewest-elements rule** (*never add a second object just to add one*): `single` (one object alone), `fuse` (one hybrid object — the twist merged in), `separate` (two co-equal objects). The device set includes an **`emblem`** device dedicated to the single-object lane (one iconic object as a pure symbol). Validated on real posts (`testComposition_v41.py`): a genuine single/fuse/separate mix, and the single-object posters (a waving microphone, a ringing tuning-fork instrument) are among the strongest. **Hard bans baked into the prompt: never a balance/weighing scale, never a literal car/vehicle** (both were chronic clichés the model defaulted to on pricing/value posts), plus anything on an AVOID list. Opus finds strong, varied metaphors from title+summary alone (a jeweler's loupe on a gemstone, a pocket watch fused to a price tag, a fountain-pen nib as a factory smokestack).
- **Object-design law (retrofuturism, not antiques).** The art director renders any *man-made* subject as a sleek retrofuturistic device (smooth housing, minimal panel seams, a couple of tidy dials, a slim antenna — modernized from the original chunky/riveted wording to match the modern-futurist style) rather than a literal antique — so a "telephone" becomes a RobCo/Fallout-style device, not a plain rotary phone. **Scoped to objects that benefit** (devices, instruments, appliances, machinery); **two exceptions stay un-mechanized** — (1) organic / anatomical / botanical / figure subjects, and (2) *simple iconic objects whose power is plainness* (a paper price tag, key, match, ticket, coin) — added after a tag test showed the law was machine-ifying a plain price tag into unrecognizable gadgets (price guns, gavels). Validated to **coexist with the metaphor twist** — the twist element (fork, tag) stays readable as its own plain form rather than getting buried in the machine detail (bake-off `testObjectStyle_v41.py` + `testTwistPlusObject_v41.py`).
- **Text — optional, off by default (symbol-first).** The art director may output an optional `text_role` + `text`, appended by `build_prompt` (V4.1 renders short words cleanly — no garbling — `testText_v41.py`, `testTextRole_v41.py`). **Guardrail: text must ADD wit/tone, never *explain* the post; most posts stay text-free.** Roles: `none` (default) · **`slogan`** (primary — a short ≤4-word sarcastic tagline on a poster ribbon in the operator-first / proof-over-hype voice, e.g. "TRUST THE MATH?", "ALMOST HUMAN!"; stays subordinate to the symbol) · `label` (occasional — a fictitious brand nameplate on the object; a wink, ~illegible at card size) · `headline` (rare — one big reaction word like "OOPS"; it becomes the hero). Decision framing = *what role does text play* (prop-in-scene vs caption), judged by: does it preserve the metaphor ethos, and does it add wit rather than restate.

**2. Generate — Recraft V4.1, one call.** `fal-ai/recraft/v4.1/text-to-image`, **`style: "any"`**, `image_size: "landscape_16_9"`, raster (webp/jpg). Prompt = the art director's `scene` + the fixed **general style tail** (rotated backdrop slotted in) + a text ending (`NO_TEXT` by default, or a slogan/label/headline clause when the art director set one).
- **Why V4.1 over V3.** V4.1 reliably renders the metaphor's *second element* (the "twist"): **~90% vs V3's ~10%** on identical hard prompts (phone→tuning fork ~4/5, watch→price tag ~5/5, vs V3 ~1/5 each), at *lower* cost ($0.035 vs $0.04). This closed the device-fidelity gap V3 could not — a documented Recraft V3 weakness ("drops elements"), not a wording problem (rich vs terse made no difference: variance test ~1/10).
- **No sub-style, no `style_id` on V4.** Recraft removed the entire named-style + custom-style system from the V4 line — `style` accepts only `any` / `vector_illustration`, and `style_id` is V3-only (confirmed by the live API + Recraft docs: *"Styles are not yet supported for V4 models"*). So the look is carried **entirely by the prompt (W2 tail) + the `colors` palette**. Proven to hold a consistent style across 5 varied subjects with zero pinning (5/5 consistency pass).
- **Style tail — the locked style: MODERN futurist.** The look is carried entirely by this tail (V4.1 has no sub-style/`style_id`) + the `colors` palette; `{backdrop}` is filled from the rotation:
  `"As a sleek modern futuristic illustration: clean minimal geometric forms, smooth flat color, crisp precise edges, contemporary, only a subtle retro nod. {backdrop}, limited warm palette. One iconic subject, centered, generous negative space."` — the text ending (`NO_TEXT` by default, else a slogan/label/headline clause) is appended after this by `build_prompt`.
  - **How we got here + parked alternatives.** **atomic-age** (BioShock-Deco / Fallout-screenprint — accurate but *too strong/samey*) → **general retro** (calmer, `testRetroVariants_v41.py`/`testRetroRotation_v41.py`) → **modern futurist** (leaned cleaner via a retro→futuristic gradient, `testFuturisticGradient_v41.py`, to sit against the sleek modern site without the dated poster grit clashing). The retro poster looks — **general**, **atomic-age**, **Raygun Gothic** (sleek but *over-abstracts objects*) — are **parked in `art_director.py` `ALT_STYLES`** for a possible future style rotation; all share the palette so rotating stays cohesive.
  - **Follow-up:** object-design law modernized to sleek wording to match the modern render (done — `testObjectModern_v41.py`). Still to **confirm live on the dark site** (the real judge of retro-vs-modern fit) once wired.
- **Color = orange-forward `colors` bias.** Pass `colors: [{r,g,b}...]` weighted orange (bright-orange, light-orange, cream, + a teal complement, + an ink) — a *preference*, not a hard constraint — so **orange is the through-line across every image** while other harmonious colors stay free per post. Generating natively in the palette **beats any post-hoc recolor** (an orange gradient-map produced mud — averaging complements in RGB is grey). V4.1 also exposes `background_color` if per-post field-lock is ever wanted.
- **Backdrop rotation (anti-sameness).** The `{backdrop}` slot is filled from a rotated menu so the *style* stays locked while the *background* varies per post — without it every image got the same background and the series read as monotonous (the same convergence failure the device rotation guards against). **Menu refreshed to a MODERN set** to match the modern-futurist style (`testBackdropGradient_v41.py`) — the retro Deco checkerboard / arch / bold sunburst are retired: `flat solid color field` / `bold geometric color blocks` / `single large circle` / `minimal floating shapes` / `concentric rings`.

**3. Use the image as-is.** The bake-off's deterministic "material" pass (orange dither + CRT scanlines) is **DROPPED** — the native V4.1 generations look better untouched. **`services/image_material.py` is NOT built.**

**Result:** one atomic-age propaganda poster per post — orange-dominant with harmonious accents, a fresh non-cliché metaphor with its twist actually rendered, a varied backdrop, no text artifacts. Cohesive as a series, varied per post. No local image processing at all.

### Rotation (anti-convergence) — both live in the art director
```python
DEVICES   = ["emblem", "substitution", "juxtaposition", "scale_shift", "personification", "visual_pun"]
BACKDROPS = ["flat solid color field", "bold geometric color blocks", "single large circle",
             "minimal floating shapes", "concentric rings"]
device   = DEVICES[i % len(DEVICES)]      # 6 devices
backdrop = BACKDROPS[i % len(BACKDROPS)]  # 5 backdrops — different length desyncs the two (both vary per post; 30-post cycle)
```

**Reference implementation:** throwaway bake-off scripts in the session scratchpad — `art_director.py` (system prompt + **both** the device and backdrop rotations + `build_prompt()` + scale/car bans), `testA_v41.py` (twist variance), `testStyle_v41.py` + `testStyle_consistency.py` (style wording → W2 → general), `testBackdrops_v41.py` (backdrop rotation), `testObjectStyle_v41.py` + `testTwistPlusObject_v41.py` (object-design law), `testComposition_v41.py` (single/fuse/separate + emblem), `testRetroVariants_v41.py` + `testRetroRotation_v41.py` (retrofuturism family → general locked). Port `art_director.py` and the single Recraft **V4.1** call with `style:"any"` + `colors`. `FAL_KEY` is currently in root `.env` as `FAL_API` — standardize to `FAL_KEY` when wiring.

> **Device fidelity — RESOLVED (2026-07-04).** The V3 recipe dropped the metaphor's second element ~85–90% of the time (a "watch fused with a price tag" came back as just a watch). Root cause was a documented Recraft V3 weakness, not wording. Switching the generator to **Recraft V4.1** fixed it (~90% twist rendering on the same prompts) — no best-of-N or two-stage-edit fallback needed at that hit rate.

## Scope
- A throwaway **bake-off** to validate the model and prompt approach *before* wiring anything. ✅ done (see locked recipe above).
- **Art-director step** (`claude-opus-4-8`) deriving the image prompt from post context
  (title / summary / section + assigned device) — port `art_director.py` from the bake-off.
- `services/image_generator.py`: async fal.ai/Recraft call at 16:9, pinned
  `style: "digital_illustration/pop_art"` + orange-forward `colors` bias for cross-post
  cohesion. Fail-soft; handle fal's non-retryable 422 `content_policy_violation` as a graceful skip.
- **Hosting seam**: an `ImageHost` interface + a v1 `FalPassthroughHost` that sets the
  never-expire lifecycle header and returns fal's `v3.fal.media` URL. A settings flag
  selects the host implementation.
- `posts.image_url` (nullable) column + Alembic migration; existing posts backfill to NULL.
- Wire generation+hosting into `run_pipeline` and `run_roundup` after `persist_generated_post`,
  fail-soft (error → `image_url` stays NULL → empty slot, run continues), committed in the
  same transaction.
- Add `image_url` to backend schemas (admin + public) and frontend post types.
- Render the image in the existing slots: featured 16:9 (`featured-story.tsx`) and card 5:4
  (`post-card.tsx`, `object-fit: cover`), with graceful empty fallback.
- **Doc reconciliation (architecture gate)**: flip the "No images in the UI" line in
  `Design/README.md` + `PLANNING.md`, with dated entries in `Design/decisions.md` and
  `PLANNING-decisions.md`, in the same commits.
- New secret: `FAL_KEY` (root `.env` + Render).

## Out of scope
- **Own-hosting / Cloudflare R2 migration ("v2")** — the swappable seam is built now, but the
  `R2Host` implementation + v1-URL backfill ship as a separate sequenced feature so v1 lands fast.
- **Operator regenerate-image / prompt-edit controls** — deferred to a follow-on so it's designed
  after observing real generation quality; full-post `regenerate` already yields a new image meanwhile.
- **Featured-post manual image upload override** — separate follow-on per the Trello card.
- **Per-ratio generation** — using one 16:9 master + CSS crop instead of generating a 5:4 too.
- `story_type` population — unrelated known gap.

## Success criteria
- Bake-off produces side-by-side images; a model + prompt approach is chosen and recorded.
- A pipeline run generates an image, stores a URL on `posts.image_url`, and it renders in both
  the featured 16:9 slot and the 5:4 card slot on the public blog.
- The 5:4 CSS crop of the 16:9 master looks acceptable (no badly clipped composition).
- A generation/hosting failure leaves `image_url` NULL and the run completes — slot renders empty,
  no layout break.
- v1 serves fal's never-expire URL; the hosting seam is in place so the v2 R2 swap touches only the
  host implementation + config flag + secrets.
- Docs + both decision logs updated in the same commits as the change.

## Dependencies
- **fal.ai account + `FAL_KEY`** (user to provision) — needed for the bake-off and v1.
- Confirm Recraft's "Commercial use" badge on fal. (V4 has **no** sub-style or custom `style_id` —
  the look is carried entirely by the W2 prompt tail + the `colors` palette, no style training needed.)
- **Trips the architecture-change gate** (new external service + pipeline step + new column/migration
  + new secret + reverses the no-images policy) → doc updates are mandatory, not optional.

## Tasks
### Phase 0 — De-risk (bake-off) ✅ DONE
- [x] fal.ai key in place (root `.env` as `FAL_API`; standardize to `FAL_KEY` when wiring)
- [x] 5-round bake-off across models / styles / color approaches / material treatments
- [x] Recipe decided & recorded — Recraft **V4.1** (`style:"any"`) + **W2** style tail + orange-forward `colors` + device/backdrop rotation, Opus art director, **no material pass** — see **Visual recipe — LOCKED** above

### Phase 1 — Backend: generation + v1 hosting seam
- [ ] Add `posts.image_url` (nullable) + Alembic migration; backfill existing → NULL
- [ ] `services/image_art_director.py`: `claude-opus-4-8` step → `{tension, device, subject, scene}` from post context + rotated **device AND backdrop**; `build_prompt()` (scene + W2 tail w/ backdrop); scale/car bans (port `art_director.py`)
- [ ] `services/image_generator.py`: async Recraft **V4.1** call (`fal-ai/recraft/v4.1/text-to-image`, 16:9, `style:"any"` + built prompt + orange-forward `colors`), fail-soft, 422 → graceful skip
- [ ] ~~material pass~~ — **dropped**; images are used as generated, no post-processing
- [ ] `ImageHost` interface + `FalPassthroughHost` (never-expire header, return fal URL); settings flag picks host
- [ ] Wire into `run_pipeline` + `run_roundup` after persist; fail-soft → NULL; same transaction
- [ ] Add `image_url` to backend Pydantic schemas (admin `PostOut`/`PostListItem`, public detail/list)

### Phase 2 — Frontend: render
- [ ] Add `image_url` to frontend post types (`public-api.ts`, `api.ts`)
- [ ] Render image in featured 16:9 slot + 5:4 card slot (`object-fit: cover`); graceful empty fallback
- [ ] Frontend typecheck + lint pass

### Phase 3 — Docs (architecture gate, same commits)
- [ ] Update `Design/README.md` (no-images → in-pipeline images) + `Design/decisions.md` entry
- [ ] Update `PLANNING.md` (data model + pipeline step) + `PLANNING-decisions.md` entry

## Verification
- [ ] Bake-off images reviewed; model + prompt chosen and recorded
- [ ] Pipeline run (local Docker) generates an image, stores the URL, renders in both slots on the blog
- [ ] 5:4 crop of the 16:9 master looks acceptable
- [ ] Forced generation failure → run completes, `image_url` NULL, slot empty, no layout break
- [ ] `alembic upgrade head` applies cleanly; existing posts have NULL `image_url`
- [ ] Frontend typecheck + lint pass
- [ ] Docs + both decision logs updated in the same commits
