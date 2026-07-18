"""Art-director step for per-post cover images.

Turns a post (title / summary / section) + a deterministically-assigned metaphor
DEVICE and BACKDROP into a single Recraft prompt. The model invents the visual
METAPHOR (it does NOT illustrate the article literally) and returns a structured
spec; `build_prompt()` appends the fixed modern-futurist style tail with the
rotated backdrop and an optional text clause. The result goes to Recraft V4.1 in
one call (see `image_generator.py`).

Ported from the Phase-0 bake-off. Structured output uses the codebase's
tool-calling pattern (matching `blog_writer.py`) rather than the newer
`output_config` API, so it works with the pinned `anthropic==0.40.0`.
"""
import logging
import os

import anthropic

logger = logging.getLogger(__name__)

# Opus for the metaphor step — the reasoning quality here IS the value (the
# bake-off validated the metaphors on this model). Just a model string to the
# API; the tool-calling request shape is stable across SDK versions.
MODEL = "claude-opus-4-8"
MAX_TOKENS = 1024
TOOL_NAME = "submit_cover"


class ImageArtDirectorError(Exception):
    """Raised when the model does not return a usable cover spec."""


SYSTEM = """You are the art director for The Garage AI, an editorial blog about AI being \
adopted inside car dealerships. You design ONE striking, symbolic cover image per post — \
the way an illustrator works for The New Yorker or Wired.

You do NOT illustrate what the article literally describes. Every post is about AI used \
somewhere in a dealership, so literal depiction (robots, cars, dashboards, handshakes) \
makes every image identical. Instead you find the single visual METAPHOR for the human or \
operational TENSION underneath, and you vary the METAPHORICAL DEVICE, not the topic.

Work in four steps, in order:

STEP 1 — NAME THE TENSION (one sentence). Not the topic — the underlying human/operational \
stake: what is being handed over, lost, gained, sped up, made invisible, judged, or trusted?

STEP 2 — APPLY THE ASSIGNED DEVICE (you are given exactly one; use it):
  emblem — ONE iconic object as a pure symbol; no second element, no twist. The single object \
carries the whole meaning (a ringed galaxy for exploration, a lighthouse for guidance).
  substitution — replace an expected part of a familiar object with an unexpected one.
  juxtaposition — force two unrelated things together so a third meaning appears.
  scale_shift — make the small monstrous or the large trivial.
  personification — give a system/tool/abstraction a body, gesture, or agency.
  visual_pun — one form reads as two things at once.

STEP 2.5 — PICK THE COMPOSITION that fits the device and tension:
  single — one object alone (always for emblem; often for personification).
  fuse — one hybrid object, the twist merged into a single form (substitution, visual_pun).
  separate — two co-equal objects side by side (juxtaposition, scale_shift).
  RULE: prefer the FEWEST elements that carry the tension. NEVER add a second object just to \
add one — if a single object says it, choose single.

STEP 3 — CHOOSE ONE bold iconic subject that expresses the tension via the device and reads \
cleanly as a bold poster illustration. Antique instruments, machinery, anatomy, botany, \
atomic/Deco motifs all work. One canonical subject, centered, generous negative space. A \
loose, oblique tie to the post is CORRECT — if the connection is obvious, push further.

STEP 4 — WRITE THE SCENE: 2-4 sentences describing ONLY the subject and its single \
transformation, concretely (no color words, no style adjectives, no lettering — the fixed \
poster-style tail added later owns all of that).

OBJECT DESIGN LAW — retrofuturism, not antiques. When the subject (or any man-made element in \
the scene — a device, instrument, machine, appliance, machinery part) would default to a plain \
antique or a modern gadget, design it instead as a SLEEK RETROFUTURISTIC device: \
smooth rounded housing, clean minimal panel seams (not rivet-covered), soft geometric forms — \
a designed "world of tomorrow" object: clean and contemporary, not a cluttered antique machine. \
DETAILING VARIES: give it AT MOST ONE small functional detail, chosen fresh for this post from a \
wide menu — a single dial, a slim antenna, a row of indicator lights, a chrome fin, a ribbed \
vent, a toggle switch, a rounded viewport, a sturdy little stand — and prefer a detail you would \
NOT reach for by default. Gauges, dials, and antennae are this genre's tired defaults: never \
stack more than one on an object, and treat them as the exception, not the signature. Write this build into the \
scene (e.g. not "a telephone" but "a telephone reimagined as a sleek retrofuturistic device \
with a couple of dials and a slim antenna"). Keep the metaphor's TWIST element (the \
second thing) as its own readable plain form so it isn't buried in the machine detail. \
EXCEPTIONS — do NOT machine-ify these: (1) organic, anatomical, botanical, or human-figure \
subjects keep their NATURAL form (never a mechanized eye, shell, hand, or person). (2) simple \
iconic man-made objects whose power is their PLAINNESS — a paper price tag, a key, a match, a \
ticket, a coin, a paper document — stay simple and bold; apply the machine treatment only to \
objects that genuinely benefit (devices, instruments, appliances, machinery).

NAMEABILITY LAW — every object in the scene must be a specific, instantly nameable real-world \
thing (a telephone, a wall plug, a filing cabinet, a megaphone, a key). NEVER an invented or \
generic "machine", "apparatus", "device", or "system" with no real-world identity — an \
unnameable machine renders as visual mush. If the metaphor calls for "a system" or "a machine", \
pick a specific recognizable object to stand for it (a telephone switchboard, an engine block, \
a pipe organ, a loom). The subject field must name the object(s) in plain words a stranger \
could identify at a glance.

STEP 5 — TEXT (optional; DEFAULT OFF). Most posts carry NO text — the symbol does the work. Add \
text ONLY when a few words ADD wit or tone the image cannot say alone; NEVER use text to explain \
or caption the post. Choose text_role:
  none — no text. The default; choose it unless text clearly earns its place.
  slogan — a short (<=4 word) sarcastic/witty tagline on a poster ribbon, in the operator-first, \
proof-over-hype voice ("TRUST THE MATH?", "ALMOST HUMAN!"). The PRIMARY text tool; it stays \
subordinate to the symbol.
  label — a short fictitious brand name on the object when it reads as a product ("PROFITRON"). \
Flavor/wink only, not readable copy.
  headline — ONE punchy reaction word, big ("OOPS", "OH NO!", "AI AGAIN"). RARE — it becomes the \
hero, so reserve it for a deliberate comic beat.
Put the exact string in text (UPPERCASE, <=4 words); use "" when text_role is none.

OVERUSED — NEVER USE THESE (they have appeared too many times; reaching for them is a failure):
  - a balance / weighing scale of any kind. It is the lazy default for value, price, worth, \
tradeoffs, and judgment — banned outright. When the tension is about value or weighing, you \
MUST find a completely different object.
  - a literal automobile, car, truck, or vehicle. Never depict one — the whole point is to \
avoid the literal subject.
  - anything named in the AVOID list you are given.
If your first idea is a scale or a car, discard it and think again."""


# Tool input_schema — forces the model to return exactly these fields (same
# mechanism blog_writer.py uses for structured output on anthropic 0.40.0).
COVER_SCHEMA = {
    "type": "object",
    "properties": {
        "tension": {"type": "string"},
        "device": {"type": "string"},
        "composition": {"type": "string", "enum": ["single", "fuse", "separate"]},
        "text_role": {"type": "string", "enum": ["none", "slogan", "label", "headline"]},
        "text": {"type": "string"},
        "subject": {"type": "string"},
        "scene": {"type": "string"},
    },
    "required": ["tension", "device", "composition", "text_role", "text", "subject", "scene"],
    "additionalProperties": False,
}

SUBMIT_COVER_TOOL = {
    "name": TOOL_NAME,
    "description": "Submit the finished cover-image design.",
    "input_schema": COVER_SCHEMA,
}


# --- Deterministic per-post rotations (anti-convergence) -------------------------
# Both are assigned by post index so a long run cycles through them instead of
# converging on one device or one background. 6 devices x 5 backdrops (different
# lengths) so they desync — pairings cycle over 30 posts (see `rotate`).
DEVICES = ["emblem", "substitution", "juxtaposition", "scale_shift", "personification", "visual_pun"]
BACKDROPS = [
    "a flat solid color field background",
    "bold flat geometric color blocks behind",
    "a single large flat circle behind the subject",
    "a few minimal floating geometric shapes behind",
    "concentric rings behind",
]

# Locked style: MODERN futurist (leaned cleaner to sit against the sleek modern site).
# On Recraft V4.1 there is no sub-style/style_id, so the whole look rides on this tail
# + the `colors` palette (set in image_generator.py). {backdrop} is filled from the rotation.
STYLE_TAIL = (
    "As a sleek modern futuristic illustration: clean minimal geometric forms, smooth flat "
    "color, crisp precise edges, contemporary, only a subtle retro nod. {backdrop}, limited "
    "warm palette. One iconic subject, centered, generous negative space."
)

# Parked alternatives — same palette + flat-poster family, different mood. For a possible
# future style rotation. `raygun` can over-abstract the subject; keep it a minority if used.
ALT_STYLES = {
    "general": (
        "As a general retrofuturistic poster illustration — the future as imagined mid-century: "
        "bold clean shapes, thick confident outlines, a light touch of halftone, tasteful and "
        "understated. {backdrop}, limited warm palette. One iconic subject, centered, generous "
        "negative space."
    ),
    "atomic": (
        "As a 1950s atomic-age advertising poster: retrofuturism, Art Deco geometry, "
        "screenprint lithograph, bold flat color blocks, thick black outlines, ben-day "
        "halftone dots, {backdrop}, limited warm palette, subtly aged paper, confident "
        "optimistic tone. One iconic subject, centered, generous negative space."
    ),
    "raygun": (
        "As a Raygun Gothic retrofuturistic illustration: sleek streamlined chrome and steel, "
        "Buck Rogers space-age optimism, bold clean shapes, smooth flat color, minimal grain. "
        "{backdrop}, limited warm palette. One iconic subject, centered, generous negative "
        "space."
    ),
}

# Text endings appended by build_prompt. Default is NO_TEXT (most posts). A slogan/label/
# headline is appended only when the art director asked for one. Policy: none by default,
# slogan primary, label occasional, headline rare.
NO_TEXT = " No text, no lettering, no border."
TEXT_CLAUSES = {
    "slogan": ' A short poster banner ribbon reads "{text}" in clean retro lettering; no other text anywhere.',
    "label": ' A small fictitious brand nameplate on the object reads "{text}"; no other text anywhere.',
    "headline": ' The single punchy word "{text}" large across the top in bold retro poster lettering, cleanly spelled; no other text anywhere.',
}


def rotate(index: int) -> tuple[str, str]:
    """Assign (device, backdrop) for a post by its index. Both advance every post;
    the lists are different lengths (6 devices, 5 backdrops) so they desync — pairings
    cycle over 30 posts, giving per-post variety in both metaphor and background."""
    device = DEVICES[index % len(DEVICES)]
    backdrop = BACKDROPS[index % len(BACKDROPS)]
    return device, backdrop


def build_prompt(scene: str, backdrop: str, text_role: str = "none", text: str = "") -> str:
    """Final Recraft prompt = the art director's scene + the style tail (rotated backdrop)
    + a text ending. Default is no text; a slogan/label/headline is appended only when the
    art director asked for one (text_role != none and text non-empty)."""
    scene = scene.strip()
    if not scene.endswith("."):
        scene += "."
    base = f"{scene} {STYLE_TAIL.format(backdrop=backdrop)}"
    if text_role in TEXT_CLAUSES and text:
        return base + TEXT_CLAUSES[text_role].format(text=text)
    return base + NO_TEXT


def _extract_tool_input(response) -> dict:
    for block in response.content:
        if getattr(block, "type", None) == "tool_use" and block.name == TOOL_NAME:
            return block.input
    raise ImageArtDirectorError(
        f"model did not call {TOOL_NAME}; stop_reason={getattr(response, 'stop_reason', None)!r}"
    )


def direct(*, title: str, dek: str, section: str | None, device: str) -> dict:
    """One art-director call. Returns the validated cover spec dict
    ({tension, device, composition, text_role, text, subject, scene})."""
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    user = (
        f"SECTION: {section}\nASSIGNED DEVICE: {device}\n\n"
        f"TITLE: {title}\nSUMMARY: {dek}\n\n"
        f"Design the cover image. Use the assigned device ({device})."
    )
    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=SYSTEM,
        tools=[SUBMIT_COVER_TOOL],
        tool_choice={"type": "tool", "name": TOOL_NAME},
        messages=[{"role": "user", "content": user}],
    )
    return _extract_tool_input(response)


def design_prompt(*, title: str, summary: str, section: str | None, index: int) -> tuple[str, dict]:
    """Full art-director step for one post: rotate device/backdrop, call the model,
    build the final Recraft prompt. Returns (prompt, spec). Raises on model failure —
    the caller (image_generator) owns the fail-soft boundary."""
    device, backdrop = rotate(index)
    spec = direct(title=title, dek=summary, section=section, device=device)
    prompt = build_prompt(spec["scene"], backdrop, spec.get("text_role", "none"), spec.get("text", ""))
    return prompt, spec
