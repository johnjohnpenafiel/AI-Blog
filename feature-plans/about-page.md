---
status: done
started: 2026-05-20
completed: 2026-05-20
---

# about-page

## Goal
Ship `/about` with a full-viewport atmospheric hero (glow orb + horizontal rules) and three scrollable content sections, matching the Design/README.md v2.0 specification for the About page.

## Scope
- `app/(public)/about/page.tsx` — server component with metadata
- Hero: full-viewport height, orange glow orb (larger than homepage), `// ABOUT DELOREAN` label, Chakra Petch display headline, subheading, horizontal rules
- Content sections: `// WHAT WE COVER`, `// HOW IT WORKS`, `// THE NAME` — each a Tier 2 ChamferedPanel with JetBrains Mono label + Inter body
- Enable the About link in `public-nav.tsx` (change from aria-disabled span to `<Link>`)
- Enable the About link in `public-footer.tsx` (change from aria-disabled span to `<Link>`)

## Out of scope
- Dynamic backend data on the about page (fully static)
- Image assets
- Animations beyond the static glow orb
- Contact form or email capture

## Success criteria
- `/about` renders with hero, glow orb, three content sections
- Nav ABOUT link and footer About link both navigate to `/about`
- `npm run typecheck`, `npm run lint`, `npm test` pass (no backend changes, no backend tests needed)

## Tasks
- [x] Create `frontend/src/app/(public)/about/page.tsx` with hero + content sections
- [x] Enable About link in `public-nav.tsx`
- [x] Enable About link in `public-footer.tsx`

## Verification
- [x] `cd frontend && npm run typecheck` — no errors
- [x] `cd frontend && npm run lint` — no errors
- [x] `cd frontend && npm test` — passes
- [ ] (human) Navigate to `/about` — hero fills viewport with glow orb, three sections render below
- [ ] (human) Click ABOUT in nav and footer — both resolve to `/about`
