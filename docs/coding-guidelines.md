# Moon Ledger Coding Guidelines

## Purpose
These guidelines document how the current codebase works so future engineers can extend it without accidentally fighting its architecture.

## General Approach
- Preserve the local-first static architecture unless there is a clear product reason to change it.
- Prefer minimal, behavior-preserving edits over broad refactors.
- Fix logic at the invariant level, not only at the rendering layer.
- Treat the in-memory `DB` object as the canonical runtime state.

## Current Code Organization
- HTML defines all sections and modals up front.
- CSS owns design tokens and most presentation logic.
- JavaScript owns data normalization, domain rules, event handlers, and rendering.

For now, future work should respect that split instead of introducing partially adopted architectural patterns.

## State Management Conventions
- All persisted collections live in `DB`.
- Entity edits are tracked through top-level `editing...Id` variables.
- After a valid mutation, call `save()` so persistence and rendering stay synchronized.
- Avoid mutating DOM and `DB` independently in ways that bypass `save()`.

## Persistence Conventions
- New persisted fields should be normalized in `migrate()`.
- Backward compatibility matters because users may import old backups.
- Default values should be explicit and defensive.

## Rendering Conventions
- `render()` is the main projection function for the UI.
- When adding a new derived view, compute from `DB` inside `render()` or through a focused helper.
- Use `esc()` when interpolating user-provided content into HTML strings.
- Use the existing currency-formatting helper consistently today, but do not hard-code future product decisions around Rupiah-only behavior.
- New formatting work should keep a future path open for primary-currency selection, additional currencies, and locale-aware display.

## Financial Logic Conventions
- Reuse `adjustAccountBalance()` and `adjustCreditUsed()` for balance mutations.
- Reuse `reverseTransaction()` semantics when implementing editable financial events.
- Keep deletions and edits blocked when doing otherwise would break historical integrity.
- Do not treat credit cards as cash unless the product model is intentionally redesigned.

## UI Interaction Conventions
- Modal reset functions should fully reset editing state and field state.
- New create/edit flows should fit the existing modal-first interaction model.
- Navigation should continue to work on both desktop and mobile layouts.
- New UI should be written with eventual localization in mind rather than assuming fixed Indonesian labels.

## Style Conventions Observed In Code
- The project currently uses plain functions over classes.
- Many DOM references rely on global element IDs becoming window properties.
- String-built HTML is the dominant rendering technique.
- Helper functions are small and utility-focused.

Future work can improve these patterns, but should do so deliberately and consistently, not incrementally and half-adopted.

## Recommended Extension Strategy
When adding a feature:

1. Extend the relevant data structure.
2. Normalize it in `migrate()`.
3. Add or update focused helper functions.
4. Apply business rules in the event handler.
5. Project the result in `render()`.
6. Verify linked entities still remain consistent.

## Guardrails
- Do not bypass escaping for user-supplied strings.
- Do not change persistence keys casually.
- Do not add new financial flows without defining reversal behavior.
- Do not add UI affordances that contradict domain validation rules.
- Do not introduce new user-facing strings or currency behavior in ways that make future localization or multi-currency support harder.

## Assumptions
- The codebase currently values directness and debuggability over abstraction.
- A future modularization should happen only when the product scope justifies it and can be done coherently.
- The current Indonesian text and Rupiah formatting are implementation-stage details, not permanent product constraints.
