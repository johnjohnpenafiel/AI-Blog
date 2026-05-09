---
status: done
started: 2026-05-09
completed: 2026-05-09
---

# Feature: frontend-skeleton

## Goal

Boot a Next.js + Tailwind + shadcn/ui shell in `frontend/` with all `Design/README.md` color tokens and fonts wired in, plus a verification page proving they render correctly. Done when `npm run dev` boots, the verification page renders all 8 design tokens and both fonts, and `build` / `lint` / `typecheck` / `test` all pass.

## Scope

- `frontend/` directory scaffolded via `create-next-app`: Next.js 16 + React 19, TypeScript, Tailwind v4, ESLint, `src/` layout. Working `npm run dev`, `build`, `lint`, `typecheck`, `test` scripts. (PLANNING.md updated to Next 16 — see decision log.)
- Design tokens defined as CSS custom properties in `frontend/src/app/globals.css`: `--bg`, `--surface`, `--border`, `--text-primary`, `--text-secondary`, `--accent`, `--accent-glow`, `--accent-dim`.
- Tokens surfaced as Tailwind utility classes via `@theme {}` in the same `globals.css` (Tailwind v4 is CSS-first — there is no `tailwind.config.ts`).
- Fonts loaded via `next/font/google`: JetBrains Mono + Inter (400 / 800 / 900). Exposed as Tailwind `font-mono` and `font-sans`.
- shadcn/ui initialized pointing at the design tokens. **No components installed yet** — features that need them install on demand.
- Root layout (`app/layout.tsx`): dark `--bg` background, base Inter typography, font variables on `<html>`.
- Verification page (`app/page.tsx`): swatch grid showing all 8 tokens with their values + font samples for JetBrains Mono and Inter weights. Replaced by `public-shell-and-homepage` later.
- Vitest + React Testing Library + jsdom; one smoke test on the verification page.
- Update `CLAUDE.md` "Bash commands" — drop TBD markers for `frontend dev / build / typecheck / lint` and add `frontend test`.

## Out of scope

- Route groups (`(public)/`, `dashboard/`, `(auth)/login/`) and placeholder pages — each surface scaffolds its own folder when it has real content.
- Global chrome (public nav/footer, admin sidebar) — built with `public-shell-and-homepage` and `dashboard-shell-and-overview`.
- NextAuth wiring, session provider, login page — deferred to `auth-login`.
- API client / backend integration (`lib/api.ts`, env var for backend URL) — each feature wires its own endpoints as needed.
- shadcn components (Button, Card, etc.) — install on demand per feature.
- Frontend Docker service — frontend runs on the host via `npm run dev` for now.
- E2E / Playwright — Vitest is the testing standard; add Playwright later only if a feature genuinely needs real-browser tests.

## Success criteria

- `npm run dev` boots cleanly on `localhost:3000` with no console errors or build warnings.
- The verification page visibly displays all 8 design tokens (`--bg`, `--surface`, `--border`, `--text-primary`, `--text-secondary`, `--accent`, `--accent-glow`, `--accent-dim`) as labeled swatches with the correct colors.
- JetBrains Mono and Inter (400 / 800 / 900) are visible on the verification page, applied via Tailwind utility classes.
- `npm run build`, `npm run lint`, `npm run typecheck`, and `npm test` all exit 0.

## Dependencies

- Node 20+ available locally (no Docker frontend service in this feature).
- `Design/README.md` is the source of truth for token values and font choices.

## Tasks

- [x] Scaffold `frontend/` via `create-next-app`: Next.js 16, TypeScript, App Router, Tailwind v4, ESLint, `src/` layout. Verify `npm run dev` boots before continuing.
- [x] Add `typecheck` script (`tsc --noEmit`) and `test` script to `frontend/package.json`.
- [x] Define all 8 design tokens as CSS custom properties in `frontend/src/app/globals.css` (values from `Design/README.md`).
- [x] Surface tokens via `@theme {}` in `globals.css` so utility classes resolve (`bg-bg`, `text-accent`, `border-border`, `text-fg`, `text-muted`, etc.). (Tailwind v4 has no `tailwind.config.ts`.)
- [x] Wire fonts via `next/font/google`: JetBrains Mono + Inter (weights 400 / 800 / 900). Expose as CSS variables and as Tailwind `font-mono` / `font-sans`.
- [x] Initialize shadcn/ui (`npx shadcn@latest init --defaults`). Removed the auto-installed Button component; kept `components.json` and `src/lib/utils.ts`.
- [x] Build root layout (`frontend/src/app/layout.tsx`): dark `bg-bg` background, base Inter typography, font variables on `<html>`.
- [x] Build verification page (`frontend/src/app/page.tsx`): swatch grid for all 8 tokens (color block + token name + value) + font samples (JetBrains Mono, Inter 400, Inter 800, Inter 900) with labeled examples.
- [x] Install Vitest + React Testing Library + jsdom + `@vitejs/plugin-react`. Configure `vitest.config.ts` + `vitest.setup.ts` and add `npm test` script.
- [x] Write `frontend/src/app/page.test.tsx` — one smoke test asserting the page renders and the 8 swatches are present (by `data-token` attribute).
- [x] Update `CLAUDE.md` "Bash commands": drop TBD markers for `frontend dev / build / typecheck / lint` and add `frontend tests: cd frontend && npm test`.
- [x] Update `PLANNING.md`: Next 14 → Next 16 (architecture diagram, components list, stack decisions, repo layout) + decision log entry.

## Verification

- [x] `cd frontend && npm run dev` boots on `localhost:3000` (Ready in 156ms, no errors).
- [x] `curl http://localhost:3000/` returns HTTP 200 with all 8 `data-token` swatches present in the rendered HTML. Manual browser check still recommended for visual confirmation of colors and font weights.
- [x] `cd frontend && npm run build` exits 0 (compiled in 986ms, 4 static pages generated).
- [x] `cd frontend && npm run lint` exits 0.
- [x] `cd frontend && npm run typecheck` exits 0.
- [x] `cd frontend && npm test` passes (1 test).

## Notes

- `create-next-app@latest` installed Next.js 16 + React 19 + Tailwind v4. Decision recorded in PLANNING.md decision log (2026-05-09 entry) — adopted current stable instead of pinning to Next 14.
- shadcn `init --defaults` auto-installs a Button component and a giant block of shadcn theme tokens in `globals.css`. Both removed; only `components.json` + `src/lib/utils.ts` (the `cn()` helper) kept. shadcn deps left in `package.json` (`class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `@base-ui/react`, `tw-animate-css`) — they're foundational for any future component install.
- Visual browser check (terminal `curl` confirms HTML structure but not rendered colors / font weights) is the one remaining manual verification step before the feature ships.
