# Moon Ledger Project Principles

## Purpose
This document is the highest-level reference for future development of Moon Ledger. It defines the principles that should guide product, UX, architecture, and engineering decisions.

When a future developer or AI assistant is uncertain, these principles should take priority over convenience, speed, or local implementation habits.

This document intentionally describes principles rather than implementation details.

## 1. Product Vision
Moon Ledger is a user-centric personal finance application designed for international users.

- It is not an Indonesia-only finance product.
- Current Indonesian language and IDR-focused behavior belong to the present development environment only.
- The long-term vision is a fully localized and multi-currency application.
- English should become the default product language.
- Localization should be treated as a planned core capability, not a cosmetic later add-on.

Every major decision should be evaluated against the question: does this move Moon Ledger closer to becoming a trustworthy international personal finance product?

## 2. User-Centric Philosophy
Moon Ledger exists to help the user understand and manage their own finances.

- The user is always the center of the product.
- People, shared subscriptions, debtors, creditors, and other related entities are supporting entities.
- Supporting entities should clarify the user's financial situation, not compete with it for attention.

Design should always optimize for the user's ability to answer practical questions such as:

- What do I own?
- What do I owe?
- What is owed to me?
- What needs my attention now?
- What changed, and why?

Features that add complexity without improving user understanding should be treated skeptically.

## 3. Business Logic Integrity
Financial calculations are the foundation of Moon Ledger.

- UX may evolve.
- Visual design may evolve.
- Architecture may evolve.
- Financial calculations must change only intentionally and with careful review.

Core rules:

- Never duplicate financial logic in multiple places.
- Never allow presentation code to become a second source of financial truth.
- Always preserve consistency between balances, debts, receivables, and related derived values.
- Prefer one authoritative calculation path over multiple similar implementations.

When changing financial behavior, correctness is more important than speed of delivery.

## 4. Dashboard Philosophy
The Dashboard exists to summarize, not to own domain logic.

- Modules own their own data and business rules.
- The Dashboard owns summaries, highlights, and attention signals.
- The Dashboard must not become a parallel finance engine.

This means:

- calculations should come from the same underlying domain rules used elsewhere
- dashboard-specific convenience logic should not redefine business meaning
- summary views should remain explainable from module data

If the Dashboard starts to behave like an independent business module, the design is drifting in the wrong direction.

## 5. Information-First Design
Moon Ledger is primarily an information product.

- Pages exist first to help users understand information.
- Creation flows exist to support that understanding, not to dominate the interface.
- Information density should be intentional, not accidental.

Practical consequences:

- reduce unnecessary scrolling whenever possible
- reduce unnecessary user input whenever possible
- avoid repeated actions in multiple places
- show the most important information before secondary actions
- prefer clear summaries over decorative complexity

The product should feel operational, calm, and legible.

## 6. Global Create Principle
Creation of new records should be centralized.

- The Floating Action Button (FAB) is the primary entry point for creating new entities.
- Avoid duplicating generic "Add..." actions across pages when the FAB already serves that purpose.
- Keep the create experience predictable and globally reachable.

Context-specific actions are different from generic creation.

- Actions such as Pay Debt, Receive Payment, or Edit Members belong near the relevant information.
- These actions should remain inside the module or detail context where they make sense.

The goal is to reduce action duplication while preserving workflow clarity.

## 7. International-First Architecture
Moon Ledger should be designed for international use even when the current implementation is still development-local.

- Avoid assumptions tied to one country.
- Avoid hardcoded language as a permanent product choice.
- Avoid hardcoded currency as a permanent product choice.
- Avoid locale-specific formatting assumptions whenever possible.

Every new feature should be designed so that future localization and multi-currency support remain possible.

This does not require premature over-engineering. It does require avoiding decisions that make internationalization harder later.

## 8. Engineering Principles
Moon Ledger should evolve through disciplined extension rather than impulsive reinvention.

- Prefer extending the current architecture over rewriting it.
- Prefer reusable structures over one-off solutions.
- Keep business logic separated from presentation concerns as much as practical.
- Preserve LocalStorage compatibility whenever possible.
- Maintain backward compatibility with existing user data whenever possible.

Future improvement is encouraged, but change should be coherent. A partial architectural shift is often worse than a simple, consistent system.

When choosing between a clever rewrite and a stable extension, default to the stable extension unless there is a clear long-term payoff.

## 9. Quality Principles
No task is complete just because the immediate change appears to work.

Every completed task should include:

- validation
- regression testing or regression checks appropriate to the change
- root cause analysis when fixing bugs
- minimal changes whenever possible

Additional expectations:

- verify that existing functionality still works
- fix problems at the real source when possible
- avoid speculative refactors unrelated to the task
- treat financial regressions as high-severity failures

Completion means the change is implemented, validated, and checked against existing behavior.

## 10. Long-Term Product Direction
Moon Ledger should prioritize:

- simplicity
- clarity
- trustworthiness
- maintainability
- consistency

These qualities matter more than raw feature count.

New features should improve the user's ability to manage finances without making the product harder to understand. If a feature increases surface area but reduces clarity, it is likely the wrong feature or the wrong design.

Growth should feel cumulative, not chaotic.

## Decision Standard
Before making a significant change, future contributors should be able to answer yes to most of these questions:

- Does this help the user understand or manage their own finances more clearly?
- Does this preserve financial integrity?
- Does this avoid duplicating logic or actions?
- Does this keep the Dashboard as a summary layer rather than a business-logic layer?
- Does this remain compatible with future localization and multi-currency support?
- Does this preserve backward compatibility and existing user trust where practical?
- Is this the smallest change that solves the real problem?

If the answer is no, the decision should be reconsidered before implementation.

## Final Principle
Moon Ledger should evolve carefully.

The product earns trust by being understandable, stable, and financially consistent. Every future design and engineering decision should protect that trust.