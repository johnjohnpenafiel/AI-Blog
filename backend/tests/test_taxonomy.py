"""Tests for the v2 content taxonomy: vocabulary integrity, app-level
validation (model `@validates` + `PostTaxonomyIn`), and the model accepting
all four categorization labels."""
import pytest
from sqlalchemy import text

import taxonomy
from models import Post
from schemas.posts import PostTaxonomyIn


# --- vocabulary integrity -----------------------------------------------

def test_sections_match_section_tags_keys():
    assert taxonomy.SECTIONS == list(taxonomy.SECTION_TAGS)


def test_tags_is_flattened_section_tags():
    expected = [t for tags in taxonomy.SECTION_TAGS.values() for t in tags]
    assert taxonomy.TAGS == expected


def test_no_duplicate_tags_across_sections():
    assert len(taxonomy.TAGS) == len(set(taxonomy.TAGS))


def test_launch_formats_present():
    for fmt in ("Brief", "Deep Dive", "Roundup", "Explainer"):
        assert fmt in taxonomy.FORMATS


def test_story_types_present():
    assert set(taxonomy.STORY_TYPES) == {
        "Vendor Launch",
        "Field Report",
        "Industry Move",
    }


def test_tags_for_section_returns_nested_tags():
    assert "Voice AI" in taxonomy.tags_for_section("Customer Experience")
    assert taxonomy.tags_for_section("Nonexistent Section") == []


# --- helper validators ---------------------------------------------------

def test_is_valid_helpers():
    assert taxonomy.is_valid_section("Customer Experience")
    assert not taxonomy.is_valid_section("Customer Service")
    assert taxonomy.is_valid_format("Brief")
    assert not taxonomy.is_valid_format("Long Read")
    assert taxonomy.is_valid_story_type("Field Report")
    assert not taxonomy.is_valid_story_type("Op-Ed")
    assert taxonomy.is_valid_tag("Voice AI")
    assert not taxonomy.is_valid_tag("Industry Move")  # relocated to story_type


# --- model @validates ----------------------------------------------------

def test_model_rejects_unknown_section():
    with pytest.raises(ValueError):
        Post(section="Nonsense")


def test_model_rejects_unknown_format():
    with pytest.raises(ValueError):
        Post(format="Tweet")


def test_model_rejects_unknown_story_type():
    with pytest.raises(ValueError):
        Post(story_type="Rumor")


def test_model_allows_none_taxonomy():
    # None is allowed — the pipeline starts populating these in Phase 2.
    post = Post(section=None, format=None, story_type=None)
    assert post.section is None
    assert post.format is None
    assert post.story_type is None


def test_post_saves_with_all_four_labels(db):
    post = Post(
        slug="taxonomy-smoke-test",
        title="Title",
        content="body",
        summary="summary",
        publishing_mode="auto",
        meta_description="meta",
        section="Customer Experience",
        format="Brief",
        story_type="Vendor Launch",
        tags=["Voice AI", "Chatbots / Conversational AI"],
    )
    db.add(post)
    db.flush()
    db.refresh(post)
    assert post.section == "Customer Experience"
    assert post.format == "Brief"
    assert post.story_type == "Vendor Launch"
    assert post.tags == ["Voice AI", "Chatbots / Conversational AI"]


# --- PostTaxonomyIn schema ----------------------------------------------

def test_taxonomy_schema_accepts_valid():
    model = PostTaxonomyIn(
        section="Pricing & Analytics",
        format="Deep Dive",
        story_type="Industry Move",
        tags=["Used-Car Pricing"],
    )
    assert model.section == "Pricing & Analytics"


@pytest.mark.parametrize(
    "kwargs",
    [
        {"section": "Bogus"},
        {"format": "Bogus"},
        {"story_type": "Bogus"},
        {"tags": ["Used-Car Pricing", "Bogus Tag"]},
    ],
)
def test_taxonomy_schema_rejects_invalid(kwargs):
    with pytest.raises(ValueError):
        PostTaxonomyIn(**kwargs)


# --- migration backfill semantics ---------------------------------------
# The dev DB has no pre-v2 rows, so the migration's backfill SQL is never
# exercised by data on `alembic upgrade`. These mirror that SQL against a
# seeded row to prove the Postgres semantics (CASE map, default, array_remove,
# Industry-Move relocation). Keep in sync with c4f1a2b3d6e7.

_BACKFILL_SECTION = """
    UPDATE posts SET section = CASE
        WHEN 'Voice AI' = ANY(tags) THEN 'Customer Experience'
        WHEN 'CRM' = ANY(tags) THEN 'CRM & Marketing'
        WHEN 'Merchandising' = ANY(tags) THEN 'Inventory & Merchandising'
        WHEN 'Pricing & Analytics' = ANY(tags) THEN 'Pricing & Analytics'
        WHEN 'Sales Dev' = ANY(tags) THEN 'Sales & Lead Gen / BDC'
        WHEN 'OT & Infrastructure' = ANY(tags) THEN 'Back Office / DMS & Infrastructure'
        ELSE 'Customer Experience'
    END
    WHERE section IS NULL AND id = :pid
"""
_BACKFILL_FORMAT = "UPDATE posts SET format = 'Deep Dive' WHERE format IS NULL AND id = :pid"
_RELOCATE_STORY = "UPDATE posts SET story_type = 'Industry Move' WHERE 'Industry Move' = ANY(tags) AND id = :pid"
_STRIP_TAG = "UPDATE posts SET tags = array_remove(tags, 'Industry Move') WHERE 'Industry Move' = ANY(tags) AND id = :pid"


def _seed_pre_v2(db, tags):
    post = Post(
        slug=f"pre-v2-{'-'.join(tags).lower().replace(' ', '')[:30]}",
        title="Legacy",
        content="body",
        summary="summary",
        publishing_mode="auto",
        meta_description="meta",
        tags=tags,
    )
    db.add(post)
    db.flush()
    return post


def _run_backfill(db, pid):
    for stmt in (_BACKFILL_SECTION, _BACKFILL_FORMAT, _RELOCATE_STORY, _STRIP_TAG):
        db.execute(text(stmt), {"pid": pid})
    db.flush()


def test_backfill_maps_legacy_tag_to_section(db):
    post = _seed_pre_v2(db, ["Merchandising"])
    _run_backfill(db, post.id)
    db.refresh(post)
    assert post.section == "Inventory & Merchandising"
    assert post.format == "Deep Dive"
    assert post.story_type is None
    assert post.tags == ["Merchandising"]


def test_backfill_relocates_industry_move(db):
    post = _seed_pre_v2(db, ["Voice AI", "Industry Move"])
    _run_backfill(db, post.id)
    db.refresh(post)
    assert post.section == "Customer Experience"
    assert post.story_type == "Industry Move"
    assert post.tags == ["Voice AI"]  # Industry Move stripped


def test_backfill_industry_move_only_defaults_section(db):
    post = _seed_pre_v2(db, ["Industry Move"])
    _run_backfill(db, post.id)
    db.refresh(post)
    assert post.section == "Customer Experience"  # default fallback
    assert post.story_type == "Industry Move"
    assert post.tags == []
