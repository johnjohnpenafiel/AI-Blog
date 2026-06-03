"""Canonical content taxonomy (v2) — the single source of truth.

A post carries four pieces of categorization:

- ``section``     — the one primary category (where in the dealership OS it lives)
- ``tags``        — the finer "channels" nested under a section (many per post)
- ``format``      — how the post is written (brief, deep dive, …)
- ``story_type``  — what kind of event it is (vendor launch, field report, …)

These are stored on ``posts`` as plain text and validated against the lists
below in the app layer — deliberately **not** as Postgres ENUMs. That way a
new section/tag/format graduates with a one-line edit here instead of a
schema migration. See PLANNING.md → "Data model".

Values are the human-readable display strings (matching ``notes/v2-ideas.md``);
the same string is what is stored, returned by the API, and shown in the UI.
"""

# --- Sections → their nested tags ---------------------------------------
# The section is the single primary category. The tags under it are the
# labeling vocabulary (for generation prompts, SEO, relating posts) — not
# navigation filters. Order is display order.
SECTION_TAGS: dict[str, list[str]] = {
    "Customer Experience": [
        "Voice AI",
        "Chatbots / Conversational AI",
        "Messaging (SMS/text)",
        "Email Automation",
        "Appointment Booking",
        "After-Hours Coverage",
        "Call & Chat Analytics",
    ],
    "Inventory & Merchandising": [
        "Vehicle Imaging",
        "Video Walkarounds",
        "AI Listing Descriptions",
        "Damage / Condition Detection",
        "Inventory Management & Stocking",
        "Reconditioning",
        "VDP Optimization",
    ],
    "Pricing & Analytics": [
        "Used-Car Pricing",
        "Market / Competitive Pricing",
        "Appraisal & Trade-In Valuation",
        "Demand Forecasting",
        "Margin Optimization",
        "Inventory Aging",
        "Predictive Analytics",
    ],
    "Sales & Lead Gen / BDC": [
        "Lead Generation",
        "Lead Scoring & Prioritization",
        "Follow-Up Automation",
        "BDC Automation",
        "Digital Retailing / Deal Building",
        "Sales Copilots",
        "Test-Drive Scheduling",
    ],
    "Fixed Ops / Service": [
        "Service Scheduling",
        "Service Retention & Marketing",
        "Repair-Order Automation",
        "Service Advisor Copilots",
        "Parts & Inventory",
        "Predictive Maintenance",
        "Recall Management",
    ],
    "CRM & Marketing": [
        "CRM Automation",
        "Customer Data Platforms (CDP)",
        "Campaign Automation",
        "Audience Segmentation",
        "Programmatic / Ad Targeting",
        "Content Generation",
        "Attribution",
        "Reputation & Reviews",
    ],
    "F&I (Finance & Insurance)": [
        "Digital F&I",
        "Credit Decisioning",
        "F&I Menu / Product Recommendation",
        "Compliance Automation",
        "Fraud & Identity Detection",
        "eContracting",
    ],
    "Back Office / DMS & Infrastructure": [
        "DMS Modernization",
        "Integrations & APIs",
        "Accounting Automation",
        "Document Processing",
        "Workforce / Staff Copilots",
        "Cybersecurity",
        "Data Infrastructure",
    ],
    "AI Car Shopping / GEO Visibility": [
        "AI Shopping Assistants (consumer-side)",
        "Generative Engine Optimization (GEO)",
        "AI Search Visibility",
        "Answer-Engine Presence",
        "Conversational Commerce",
    ],
}

SECTIONS: list[str] = list(SECTION_TAGS)

# Flat list of every nested tag, across all sections.
TAGS: list[str] = [tag for tags in SECTION_TAGS.values() for tag in tags]

# How a post is written. Brief/Deep Dive/Roundup ship first; Explainer,
# Timeline, Rankings are defined but not yet generated (see roadmap).
FORMATS: list[str] = [
    "Brief",
    "Deep Dive",
    "Roundup",
    "Explainer",
    "Timeline",
    "Rankings",
]

# What kind of event a post covers. Stored now; promoted to a browse index
# later.
STORY_TYPES: list[str] = [
    "Vendor Launch",
    "Field Report",
    "Industry Move",
]


def is_valid_section(value: str) -> bool:
    return value in SECTION_TAGS


def is_valid_format(value: str) -> bool:
    return value in FORMATS


def is_valid_story_type(value: str) -> bool:
    return value in STORY_TYPES


def is_valid_tag(value: str) -> bool:
    return value in TAGS


def tags_for_section(section: str) -> list[str]:
    """The nested tags that belong to ``section`` (empty if unknown)."""
    return SECTION_TAGS.get(section, [])
