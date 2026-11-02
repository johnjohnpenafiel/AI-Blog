---
status: in-progress
started: 2026-11-02
---
# Feature: email-subscriptions

## Goal
Readers can subscribe with their email and receive every new Garage AI post
(Mon Brief, Thu Deep Dive, Fri Roundup) by email, sent through Resend.

## Scope
- `subscribers` table: email (unique), status (pending / active / unsubscribed),
  confirm + unsubscribe tokens, timestamps
- `posts.emailed_at` column; migration backfills existing published posts so
  launch doesn't email the back catalog
- Public endpoints: POST /public/subscribe, POST /public/subscribe/confirm,
  POST /public/unsubscribe (token-based, no login)
- Double opt-in: confirmation email; only `active` subscribers get posts
- Scheduler job (every 5 min): published posts with emailed_at NULL are sent
  to all active subscribers, then stamped. Covers all 4 publish paths
- Every post email carries a one-click unsubscribe link (+ List-Unsubscribe header)
- Resend client behind a small sender seam; with no RESEND_API_KEY it logs
  instead of sending (local dev / tests)
- Public UI: Subscribe link in bottom nav + mobile menu; /subscribe,
  /subscribe/confirm, /unsubscribe pages in the Stage design language
- Dashboard Overview: "Subscribers" stat card (active count)

## Out of scope
- Dashboard subscriber list / management
- Per-format preferences (everyone gets every post)
- Open / click tracking
- Signup forms on post pages or the homepage
- Welcome email beyond the confirmation email

## Success criteria
- Sign up at /subscribe → confirmation email → click → status active
- Publishing a post (any path) emails each active subscriber exactly once
- Existing published posts are never emailed on launch
- Unsubscribe link stops future emails immediately
- Duplicate signup doesn't create a second row or leak whether the email exists
- Backend + frontend tests, typecheck, and lint pass

## Dependencies
- Resend account + verified sending domain; RESEND_API_KEY and EMAIL_FROM in
  .env and on Render (needed only to go live)

## Tasks
- [x] Update PLANNING.md + dated PLANNING-decisions.md entry
- [x] Subscriber model + posts.emailed_at + Alembic migration (with backfill)
- [ ] Email sender seam (Resend + log fallback) and email templates
- [ ] Public subscribe / confirm / unsubscribe endpoints + tests
- [ ] Scheduler job to send new posts + tests (exactly-once, all publish paths)
- [ ] Frontend /subscribe, /subscribe/confirm, /unsubscribe pages
- [ ] Subscribe link in bottom nav + mobile menu; update Design/site-map
- [ ] Dashboard Overview subscriber stat card
- [ ] Add RESEND_API_KEY / EMAIL_FROM to .env.example

## Verification
- [ ] Backend pytest suite passes in Docker
- [ ] Frontend typecheck, lint, tests pass
- [ ] Manual end-to-end locally: subscribe → confirm → publish → logged email → unsubscribe
