# Moon Ledger Development Log

## Project Status
Overall project status:

- Core product foundation complete
- Core UI foundation complete
- Core finance modules implemented
- Documentation knowledge base established
- Currently in refinement stage

Current refinement areas:

- UX consistency
- partially surfaced flows
- internationalization readiness
- future multi-currency readiness

## Current Sprint
Current development focus:

- documentation foundation completion
- UX refinement
- information architecture consistency
- preparation for the next implementation-focused phase

## Recently Completed
Recent completed milestones:

- permanent documentation knowledge base established
- [docs/PROJECT_PRINCIPLES.md](docs/PROJECT_PRINCIPLES.md) created as the highest-level development reference
- [docs/AI_CONTEXT.md](docs/AI_CONTEXT.md) created as the primary AI onboarding summary
- architecture, business rules, finance engine, UX, design system, coding, product, and roadmap documents established
- product direction clarified as international-first, localized in the future, and multi-currency-ready in the long term
- global FAB already established as the primary creation entry point

## Current Known Issues
Keep this section short and current:

- subscription member management exists but is not fully surfaced after initial creation
- some transaction UI affordances expose options that business rules later reject
- demo data seeding exists but is not fully integrated into the standard save/render workflow

## Current Decisions
Important current product and engineering decisions:

- Dashboard should remain a summary layer, not a second source of business logic
- FAB is the primary global creation entry point
- English will become the primary UI language
- current Indonesian language and IDR usage reflect the development environment only
- Moon Ledger should evolve as an international-first product
- the user's own finances remain the center of the product
- financial logic integrity has priority over UI convenience
- current architecture should be extended carefully rather than rewritten impulsively

## Next Priorities
Prioritized next tasks:

1. Finish refinement of partially surfaced flows, starting with subscription member management.
2. Resolve mismatches between transaction UI affordances and actual business rules.
3. Clean up the demo data seeding workflow so it behaves like normal product actions.
4. Continue UX refinement while preserving the information-first and FAB-centered interaction model.
5. Prepare the codebase for future localization and multi-currency work without premature over-engineering.

## Future Ideas
Ideas intentionally postponed for later consideration:

- localization system
- multi-currency support
- exchange-rate handling
- themes
- icon packs
- financial health score
- richer analytics and trends
- Android app or installable app packaging
- external integrations
- plugin or ecosystem extensions

## Notes for the Next AI Session
Guidance for the next development session:

- Read [docs/AI_CONTEXT.md](docs/AI_CONTEXT.md) first.
- Read [docs/PROJECT_PRINCIPLES.md](docs/PROJECT_PRINCIPLES.md) before making product or engineering decisions.
- Review only the detailed documentation relevant to the current task.
- Avoid unrelated refactoring.
- Preserve financial logic integrity.
- Keep the Dashboard as a summary layer.
- Use the smallest change that solves the real problem.
- Run validation and regression checks after every implementation.
- Update this file after any meaningful development session.

## Maintenance Rule
This file is a living development journal.

- It should represent the current project state, not the full project history.
- Resolved issues should be removed.
- New active priorities should replace old ones.
- Recent completed work should be refreshed as the project moves forward.
- Future AI assistants should update this file whenever a meaningful session changes project direction, active work, or current status.