# Moon Ledger UX Principles

## UX Intent
Moon Ledger's current UX is designed around financial clarity, direct manipulation, and low operational friction. It does not aim for playful budgeting or deep reporting. It aims to help a user answer:

- What do I have?
- What do I owe?
- What is owed to me?
- What needs attention soon?

## Current UX Principles
### 1. Local-first trust
The product explicitly signals that data is local and offline-ready. This reduces perceived operational risk for a personal ledger and aligns with the static architecture.

### 2. One shell, many modules
The application uses one persistent app shell with section-based navigation rather than separate routes. This keeps context stable while moving between related financial tasks.

### 3. Dashboard as control surface
The dashboard is not only a summary page. It acts as the user's operational starting point through:

- net worth emphasis
- cash/debt/receivable overview
- recent activity
- attention alerts

### 4. Modal-first CRUD
Create and edit actions happen in modals so the user can stay within the current product context. This keeps the workflow fast and avoids navigation-heavy forms.

### 5. Financial safety over flexibility
The UX intentionally blocks some edits and deletions after funds have moved. From a user perspective, this prevents silent corruption of balances.

### 6. Explicit entity separation
Accounts, debts, receivables, subscriptions, and transactions are separate modules because they represent different mental models:

- money you have
- money you owe
- money owed to you
- recurring commitments
- the event log connecting them

### 7. Mobile accommodation without a separate app
The desktop view uses a sidebar. The mobile view shifts to bottom navigation and preserves fast access through the floating action button.

### 8. Creation should be globally reachable
The floating action button acts as a global create hub. This reflects a product decision that adding financial events is a primary task everywhere in the app.

## Information Hierarchy
The current hierarchy appears to be:

1. Net worth
2. Liquid funds and liabilities
3. Items requiring action
4. Recent history
5. Detailed module management

That hierarchy is consistent with a user checking financial position first, then drilling into causes.

## Language and Tone
The current implementation mixes English section titles with many Indonesian field labels and validation messages. This reflects the present development environment, not the intended long-term language strategy. The practical effect today is:

- a somewhat bilingual interface
- localized currency behavior
- operational messaging that feels direct and utilitarian

Long-term UX direction:

- English should become the default product language.
- The UI should be designed with localization in mind.
- Future versions should support Indonesian, Japanese, Korean, and other languages.
- Labels should not be treated as permanently Indonesian.

Future sessions should preserve the direct operational tone, but should not assume the current Indonesian wording is permanent.

## Current UX Gaps
These are present in the current implementation and should be understood before changing flows:

- The app has a modal for adding subscription members after creation, but no visible trigger for that modal in the current HTML.
- Some transaction affordances expose broader options than the save rules ultimately allow.
- Desktop and mobile navigation are intentionally different, which is useful, but it means feature discoverability should always be checked on both layouts.
- The current interface is not yet structured around full localization concerns such as string expansion, translated empty states, and currency-display preferences.

## Assumptions
- The UX seems optimized for a user who already understands their own financial model and wants fast control, not guided education.
- The product likely prefers compact expert workflows over verbose onboarding.
- The current Indonesian wording should be treated as temporary development-state content rather than a statement about the intended international audience.
