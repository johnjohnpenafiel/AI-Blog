# {{PROJECT_NAME}} — Planning

> Long-form context about this project. CLAUDE.md `@`-imports this file, so every session has access to it. Update this file whenever you make an architectural decision.

## Project overview

{{2–4 sentences. What is this? Who uses it? What problem does it solve?}}

## Architecture

{{ASCII diagram or brief description of the major components and how they communicate.}}

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Frontend   │ ───► │   Backend   │ ───► │   Database  │
│   (stack)   │      │   (stack)   │      │   (engine)  │
└─────────────┘      └─────────────┘      └─────────────┘
```

### Components
- **Frontend**: {{stack, framework version, hosting}}
- **Backend**: {{stack, framework version, hosting}}
- **Database**: {{engine, version, hosting}}
- **External services**: {{auth provider, payment, analytics, etc.}}

## Stack decisions

For each non-obvious technology choice, record *why* it was picked:

- **{{Technology}}**: {{why this was chosen over alternatives}}
- **{{Technology}}**: {{why}}

## Conventions

### Naming
- Files: {{kebab-case / PascalCase / etc.}}
- Database: {{snake_case columns}}
- API: {{camelCase JSON / kebab-case URLs / etc.}}
- Branches: {{feature/..., bugfix/...}}

### API contracts
- {{Versioning strategy, e.g. `/api/v1/...`}}
- {{Error response format}}
- {{Auth pattern, e.g. JWT in `Authorization` header}}

### Data model
- {{Key entities and their relationships}}
- {{Soft delete vs hard delete}}
- {{Timestamp conventions}}

## Constraints and non-negotiables

{{Things that aren't optional — compliance requirements, performance budgets, accessibility floor, browser support, etc.}}

- {{e.g. WCAG 2.1 AA compliance for all user-facing screens}}
- {{e.g. Page load < 2s on 3G}}
- {{e.g. Must support offline mode for X workflow}}

## Decision log

A running log of architectural decisions. New entries at the top.

### {{YYYY-MM-DD}} — {{decision title}}
**Context**: {{what prompted the decision}}
**Decision**: {{what was decided}}
**Rationale**: {{why this over alternatives}}
**Tradeoffs**: {{what we give up}}

---

## Out of scope

{{Things people might assume are in scope but aren't. Be explicit. This section saves more time than any other.}}

- {{e.g. Multi-tenancy — single tenant only for now}}
- {{e.g. Real-time collaboration — async only}}
