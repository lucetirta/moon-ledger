# People Implementation Plan

Purpose: translate the People feature specification into a low-risk engineering roadmap that preserves financial integrity, minimizes regressions, and supports incremental delivery.

Scope baseline:
- Source of truth remains Debt, Receivables, and Subscriptions.
- People is an aggregation and navigation layer, not a financial mutation engine.
- Finance Engine behavior must remain stable.
- Multi-currency is out of scope for this implementation phase.

# Sprint 1 - Person Data Contract And Safe Migration

Goal
Establish the People data contract and migration safety without introducing user-facing behavior changes.

Scope
- Define the Person entity shape at persistence level.
- Add migration logic for default person lifecycle state and backward compatibility.
- Ensure legacy records load safely even when person references are missing.

Files likely affected
- js/app.js

Dependencies
- Existing migration and persistence flow.
- Existing Debt, Receivables, and Subscriptions schemas.

Business rules affected
- Ledger remains source of truth.
- People owns no independent financial values.
- Backward compatibility with existing local data.

Regression checklist
- Existing app loads old local data without errors.
- Save and reload cycles preserve existing non-People data.
- Net worth and dashboard summaries remain unchanged.
- Debt, Receivables, and Subscriptions flows remain behaviorally identical.

Definition of Done
- Person data contract is present and migration-safe.
- No visible feature regression in existing modules.
- No finance calculation behavior change.

Recommended commit message
feat(people): add person entity contract and backward-safe migration scaffolding

# Sprint 2 - Relationship Reference Normalization

Goal
Normalize relationship references in source modules so People can aggregate reliably from existing domains.

Scope
- Standardize person-link references in Debt, Receivables, and Subscriptions records where applicable.
- Add defensive normalization for partial or inconsistent legacy references.
- Keep source module ownership unchanged.

Files likely affected
- js/app.js

Dependencies
- Sprint 1 data contract and migration scaffolding.
- Existing source-module record structures.

Business rules affected
- Source modules continue to own financial truth.
- People consumes references and does not duplicate ledger values.
- Historical data remains intact.

Regression checklist
- Existing source-module create/edit/delete flows still work.
- Old records with missing references remain valid and viewable.
- Credit-card debt reservation and payment behavior remain unchanged.
- Subscription sharing and receivable linkage remain unchanged.

Definition of Done
- Source records expose normalized relationship references suitable for aggregation.
- No source-module UX regression introduced.

Recommended commit message
feat(people): normalize source-module relationship references for aggregation

# Sprint 3 - Read-Only People Aggregation Layer

Goal
Introduce a dedicated read-only aggregation layer for People summaries and detail projections.

Scope
- Add selectors/helpers that compute person-level relationship summaries from source modules.
- Include settlement recommendation inputs as derived, non-authoritative values.
- Keep all financial mutations in existing source-module flows.

Files likely affected
- js/app.js

Dependencies
- Sprint 2 normalized references.
- Existing dashboard-style summary patterns.

Business rules affected
- Dashboard and People share summary-layer philosophy.
- Settlement remains recommendation-only.
- No duplicate finance engine logic.

Regression checklist
- Aggregated values reconcile with source-module data.
- Derived People values do not alter stored ledger values.
- Existing dashboard calculations remain unchanged.
- No change to debt payment or receivable collection behavior.

Definition of Done
- Aggregation helpers return deterministic outputs from current DB state.
- Manual verification confirms parity between source records and derived People projections.

Recommended commit message
feat(people): add read-only relationship aggregation helpers

# Sprint 4 - People Navigation Entry And Empty-State Shell

Goal
Expose People in navigation with a stable empty-state shell before full list/detail rendering.

Scope
- Add People module entry point in app navigation.
- Add empty-state view aligned with information-first UX.
- Keep action surface minimal and avoid financial mutation actions.

Files likely affected
- index.html
- css/style.css
- js/app.js

Dependencies
- Sprint 3 aggregation layer available.
- Existing page activation and navigation patterns.

Business rules affected
- People acts as a summary and navigation layer.
- Global create and source-module action boundaries remain intact.

Regression checklist
- Desktop and mobile navigation still function for all modules.
- Existing page activation does not break.
- Empty state text remains English-first and localization-ready.
- No existing module layout regressions introduced by new page styles.

Definition of Done
- People appears in navigation and opens a valid page shell.
- Empty-state behavior is stable when no person relationships are available.

Recommended commit message
feat(people): add navigation entry and empty-state page shell

# Sprint 5 - People List (Read-Only)

Goal
Deliver People List with relationship summaries while preserving strict read-only financial behavior.

Scope
- Render person list items from aggregation layer.
- Surface active and archived status in list presentation.
- Support selection/opening of person detail context.

Files likely affected
- index.html
- css/style.css
- js/app.js

Dependencies
- Sprint 4 navigation shell.
- Sprint 3 aggregation outputs.

Business rules affected
- People list values are derived only.
- Archive is lifecycle visibility, not ledger deletion.

Regression checklist
- List totals and statuses match source modules.
- People list rendering does not affect dashboard or existing module rendering.
- Localization-ready labels are used for user-facing list text.
- No direct financial mutation can be triggered from list context.

Definition of Done
- Users can scan People List and open a person context reliably.
- Read-only relationship summaries remain consistent after save/reload cycles.

Recommended commit message
feat(people): implement read-only people list with derived summaries

# Sprint 6 - Person Detail, Source Navigation, And Settlement View

Goal
Deliver Person Detail with traceable source links and recommendation-layer settlement presentation.

Scope
- Render person-level linked obligations and claims with source traceability.
- Add navigation affordances to relevant Debt, Receivables, and Subscriptions contexts.
- Present settlement guidance as recommendation-only, never as replacement ledger state.

Files likely affected
- index.html
- css/style.css
- js/app.js

Dependencies
- Sprint 5 list and selection flow.
- Sprint 3 aggregation and settlement-derivation helpers.

Business rules affected
- Ledger transparency remains visible.
- Actions that mutate finance remain in source modules.
- People does not become a second finance engine.

Regression checklist
- Person detail values reconcile to source records.
- Source navigation opens correct module context.
- Settlement guidance does not hide underlying obligations/claims.
- Debt/receivable/subscription existing workflows remain unchanged.

Definition of Done
- Person detail is complete, traceable, and navigation-capable.
- Settlement view is clearly recommendation-oriented and non-mutating.

Recommended commit message
feat(people): add person detail with source navigation and settlement guidance

# Sprint 7 - Archive Behavior, Localization Pass, And Stabilization

Goal
Finalize archive behavior and perform cross-feature hardening before release.

Scope
- Implement/archive lifecycle behavior as specified for active vs archived visibility.
- Validate English-first copy consistency and localization readiness in People views.
- Execute full People regression suite and fix only People-related regressions.

Files likely affected
- index.html
- css/style.css
- js/app.js

Dependencies
- Sprint 6 completed detail workflows.
- Existing regression checklist standards.

Business rules affected
- Archive must preserve historical transparency.
- International-ready language assumptions must be preserved.
- Finance engine stability remains non-negotiable.

Regression checklist
- Archived entities remain historically understandable via source data.
- Active/archived filtering behavior is stable after reload/import.
- People feature does not introduce new finance calculation regressions.
- Accessibility and visual hierarchy remain consistent with design system.

Definition of Done
- Archive behavior is stable and specification-aligned.
- Localization readiness checks pass for all People UI strings.
- Release candidate passes full People and core-finance regression validation.

Recommended commit message
chore(people): finalize archive behavior and harden regressions for release

# Overall Regression Strategy

Validate in layers after all sprints are complete:

1. Data integrity validation
- Load legacy datasets and verify migration safety.
- Confirm source records remain authoritative and unchanged by People views.

2. Financial invariants validation
- Re-run Debt, Receivables, Subscriptions, and Dashboard regression checks.
- Confirm net worth, credit usage, debt payment, and receivable collection behavior are unchanged.

3. People consistency validation
- Verify every People summary and detail value can be traced to source records.
- Verify settlement outputs are recommendations only and do not mutate ledger state.

4. Navigation and UX validation
- Confirm People-to-source navigation works on desktop and mobile.
- Confirm empty states, archived states, and detail states remain clear and stable.

5. Localization and international readiness validation
- Confirm People copy is English-first and translation-ready.
- Confirm no People-specific assumptions enforce single language or country behavior.

6. Release gating
- Merge only after all sprint-level Definition of Done items and regression checklists are satisfied.
- If regression appears, revert at sprint commit boundary and isolate root cause before proceeding.

# Estimated Risk Level

Sprint 1 - Low
Reason: data contract and migration scaffolding can be introduced without UI changes and is easy to isolate.

Sprint 2 - Medium
Reason: reference normalization touches source record structures and needs careful legacy compatibility handling.

Sprint 3 - Medium
Reason: aggregation logic is read-only but can introduce reconciliation errors if derivation rules are incorrect.

Sprint 4 - Low
Reason: navigation entry and empty-state shell are limited UI surface with minimal domain impact.

Sprint 5 - Medium
Reason: list rendering depends on correct aggregation and can expose consistency defects across modules.

Sprint 6 - High
Reason: person detail plus settlement presentation and source navigation is the highest coupling point across modules and UX states.

Sprint 7 - Medium
Reason: stabilization and archive behavior can reveal late-stage edge cases across persistence, visibility, and navigation.
