# Feature Overview
People is a Financial Relationship Hub that helps users understand how financial obligations and claims relate to specific individuals. It is not a standalone ledger and not a contact-management product. The feature consolidates relationship context from existing financial modules so users can quickly see who is connected to debts, receivables, and shared subscriptions. People exists to improve clarity, traceability, and decision-making without duplicating financial records.

## Vision
Provide a clear relationship-centered view of personal finance where users can understand "who is involved" in obligations and claims at a glance, while financial truth remains in core ledger modules.

## Goals
- Make financial relationships easier to understand without introducing duplicate financial ownership.
- Let users move from relationship context to source modules quickly.
- Keep People consistent with the same aggregation philosophy used by the Dashboard.
- Preserve ledger transparency by keeping Debt, Receivables, and Subscriptions as the source of truth.
- Keep the feature English-first, localization-ready, and international-ready.

## Non Goals / Out of Scope
- Building a contact manager.
- Creating an independent financial ledger inside People.
- Introducing multi-currency behavior in this feature phase.
- Replacing source-module workflows for debt payment, receivable collection, or subscription management.
- Redesigning existing ledger ownership boundaries.

## User Problems
- Users can understand balances but still struggle to understand relationship exposure by person.
- Relationship-linked financial records are distributed across modules and can be hard to connect mentally.
- Users need a faster way to answer relationship questions without manually searching multiple modules.
- Users need recommendation support for settlement decisions while still seeing transparent source records.

## User Stories
- As a user, I want to see a consolidated relationship view per person, so that I can understand total relationship exposure quickly.
- As a user, I want person views to reflect real-time module data, so that I can trust the information without duplicate maintenance.
- As a user, I want to navigate from People to source records, so that I can take action in the correct module.
- As a user, I want settlement guidance that does not hide ledger details, so that I can decide with confidence.

## Product Philosophy
People follows these product decisions:
- People is not a contact manager.
- People is a Financial Relationship Hub.
- Debt, Receivables, and Subscriptions remain the source of truth.
- People aggregates in real time and does not own financial values.
- The purpose is relationship understanding, not ledger duplication.
- Settlement behavior is recommendation-oriented and must not replace ledger transparency.

## Business Rules
- Financial values displayed in People must be derived from source modules, not stored as independent balances.
- Source-module edits immediately define People outcomes.
- People must not introduce conflicting financial state.
- Actions that change financial state belong in source modules.
- People should guide users to source modules for execution-level actions.
- Archive behavior must preserve historical relationship context and must not remove source financial history.
- Dashboard and People should follow the same summary-first aggregation philosophy.

## Data Model
### Person entity
The Person entity represents relationship identity and context. It should support:
- a stable identifier
- a display name
- lifecycle state (active or archived)
- references to related source records

Person-level financial numbers are derived views from Debt, Receivables, and Subscriptions and are not authoritative stored balances.

## UI / UX Specification
### UI hierarchy
- People provides relationship summaries first, with drill-down into person detail.
- Detail views prioritize clarity of exposure and direct access to source records.
- The interface should favor information legibility over action duplication.

### People List
- Show a concise, scannable list of people and relationship summaries.
- Support clear distinction between active and archived context.
- Use summary states that help users identify where attention is needed.

### Person Detail
- Show relationship-level context, including linked obligations and claims from source modules.
- Keep source traceability visible so users can understand where each number comes from.
- Provide navigation affordances to open the relevant source module records.

### Settlement philosophy
- Settlement in People is a recommendation layer for understanding and planning.
- Settlement presentation must not hide raw obligations and claims.
- Users must be able to inspect source details before or after following recommendations.

### Archive behaviour
- Archiving should reduce active-surface noise while keeping historical visibility.
- Archived person context must remain explainable through source records.
- Archive state must not rewrite ledger history.

## Navigation
- People should be reachable as a primary module in app navigation.
- From People List, users can open Person Detail.
- From Person Detail, users should navigate to related Debt, Receivables, and Subscription contexts for execution.
- Navigation should remain consistent across desktop and mobile patterns.

## User Flow
Primary flow:
1. User opens People.
2. User scans People List summaries.
3. User opens a specific Person Detail.
4. User reviews relationship context and recommendations.
5. User navigates to source module records for actions.

Alternate flow:
1. User accesses a source module first.
2. User navigates to related person context for relationship clarity.
3. User returns to source module to complete financial actions.

## Integration
People integrates with:
- Debt: obligation context and related relationship references.
- Receivables: claim context and collection-related relationship references.
- Subscriptions: shared-cost relationship context where applicable.

Integration principles:
- Source modules own financial truth.
- People consumes and aggregates source data in real time.
- People navigation should direct users to source modules instead of duplicating actions.

## Localization
English-first, localization-ready, no hardcoded language assumptions, international-ready.

All user-facing People labels, statuses, and explanatory text should be structured for translation and locale adaptation. Wording should avoid culture-specific assumptions. Multi-currency behavior is not part of this feature scope.

## Theme & Visual Language
People should align with the existing design system and preserve calm, information-first readability.

Guidance for this feature:
- iconography: use relationship-relevant symbols consistently across list and detail contexts.
- visual hierarchy: emphasize relationship summaries first, then supporting details.
- spacing: preserve readable grouping between summary, detail, and navigation actions.
- component consistency: reuse established card, list, badge, and status patterns.
- empty states: explain that People reflects source-module relationships and guide users to where relationships originate.
- loading states: preserve structure and hierarchy while data is being aggregated.
- color usage: use semantic colors consistently for informational emphasis, not decorative noise.
- accessibility: preserve contrast, readable labels, and clear state meaning.
- future icon pack support: avoid feature-specific icon assumptions that block future icon system changes.

## Migration Strategy
- Existing financial data remains authoritative in Debt, Receivables, and Subscriptions.
- People introduction should map existing relationship references into Person context without altering ledger history.
- Migration should safely establish person identity references and archive state defaults.
- Backward compatibility with existing stored financial records must be preserved.

## Edge Cases
- A person linked to only one source module type.
- A person linked to multiple module types with mixed states.
- Incomplete relationship data in older records.
- Person naming collisions.
- Archived person with continuing historical references.
- Source record updated or removed while person context remains viewable.

## Regression Checklist
- People totals and summaries remain consistent with Debt, Receivables, and Subscriptions.
- Person Detail values stay traceable to source records.
- No financial state can be changed directly in People when source modules should own the action.
- Navigation from People to source modules works in desktop and mobile contexts.
- Archive behavior does not remove historical transparency.
- Settlement recommendations do not replace visibility of underlying ledger entries.
- English-first copy is present and localization readiness is preserved.
- No assumptions force single-country or single-language behavior.

## Future Scope
- Deeper relationship analytics once baseline relationship clarity is stable.
- Expanded recommendation sophistication after validation of core People behavior.
- Multi-currency relationship views in a future dedicated currency phase.

## Open Questions
- What is the final archived-person visibility policy across list and detail views?
- What settlement recommendation presentation format is preferred for first release?
- What minimum relationship metadata is required for older records with partial references?
- What is the confirmed naming and conflict-resolution policy for similarly named people?
