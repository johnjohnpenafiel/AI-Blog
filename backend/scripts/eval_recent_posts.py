"""Run the generation eval over the most recent posts and print a table.

Usage:
    docker compose run --rm backend python scripts/eval_recent_posts.py [N]

Needs ANTHROPIC_API_KEY. This is an operator QA tool, not part of the
automated pipeline — it surfaces weak posts for a human to review.
"""
import sys

from database import SessionLocal
from models import Post
from services.evals import evaluate_post


def main(limit: int = 5) -> None:
    db = SessionLocal()
    try:
        posts = (
            db.query(Post).order_by(Post.created_at.desc()).limit(limit).all()
        )
        if not posts:
            print("no posts to evaluate")
            return

        print(f"{'slug':<42} {'format':<10} pov fmt grd pass  notes")
        print("-" * 100)
        for p in posts:
            post = {
                "title": p.title,
                "body": p.content,
                "format": p.format,
                "section": p.section,
                "sources": [
                    {"title": s.title, "url": s.url, "publisher": s.publisher}
                    for s in p.sources
                ],
            }
            r = evaluate_post(post)
            print(
                f"{p.slug[:42]:<42} {(p.format or '-'):<10} "
                f"{r.pov_adherence:^3} {r.format_adherence:^3} "
                f"{r.source_grounding:^3} {str(r.passed):<5} {r.notes[:55]}"
            )
    finally:
        db.close()


if __name__ == "__main__":
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    main(n)
