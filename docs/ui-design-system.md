# Moon Ledger UI Design System

## Visual Direction
Moon Ledger currently uses a dark, high-contrast financial dashboard aesthetic with warm gold accents. The design system favors seriousness, readability, and premium-control cues over minimalist neutrality.

The design tokens appear to have been aligned with a Figma-based refinement pass and are now the practical source of truth for visual styling.

## Core Tokens
### Color palette
- Background: `#0d1b2a`
- Foreground/Text: `#f0ede4`
- Primary surface: `#162336`
- Secondary surface: `#1a2a40`
- Primary accent: `#f5d76e`
- Muted foreground: `#8a9bb0`
- Border: `#1e3048`
- Danger: `#d4826a`
- Success: `#7ebf8e`

### Semantic use
- Gold is used for primary actions, active navigation, and hero emphasis.
- Coral marks danger, risk, or destructive actions.
- Green marks healthy or positive financial states.
- Blue-gray tones carry secondary and contextual information.

## Typography
- Primary family: `DM Sans`
- Fallbacks: `Inter`, `system-ui`, `Segoe UI`, sans-serif
- Base font size: `15px`
- Heading weight: `600`
- Body weight: `400` to `500`

The typography choices support dense information without feeling cramped.

## Shape and Elevation
- Base radius: `14px`
- Small radius: `10px`
- Medium radius: `12px`
- Large radius: `18px`
- Pill radius: `999px`

Shadows are used sparingly but intentionally:

- small cards and hover states use light depth
- hero cards and modals use deeper elevation

## Layout System
### Shell
- Desktop uses a sidebar plus main content panel.
- Mobile collapses to bottom navigation.

### Content
- Pages are section-based rather than route-based.
- Cards are the main compositional unit.
- Lists use responsive CSS grids with minimum card widths.

## Primary Components
### Sidebar and mobile navigation
- Active state uses gold background with dark text.
- Inactive state uses muted blue-gray text.

### Page headers
- Eyebrow label
- Main title
- Optional section note or actions

### Cards
- Dark surface backgrounds
- Soft borders
- Subtle hover emphasis

### Modals
- Large, centered card treatment
- high-contrast form fields
- consistent action row at the bottom

### Buttons
- Primary: gold background, dark foreground
- Secondary: dark surface with border
- Danger: coral background

### Status badges
- Used for card type, subscription status, debt status, and receivable status.

### Financial hero
The net worth card is the most visually privileged element in the product. It uses a gold gradient treatment and expandable detail breakdown.

## Page-Specific Patterns
### Dashboard
- hero metric
- compact overview cards
- alert list
- recent transaction feed

### Accounts
- card-per-account model
- special visualization for credit utilization

### Transactions
- dense activity list with type icon, metadata, and inline actions

### Debts and receivables
- progress bars and status badges
- action buttons embedded in each card

### Subscriptions
- badge-heavy cards with details grid and sharing summary

### Settings
- section-based layout rather than generic list layout

## Responsive Design Principles
- Maintain primary task access on small screens.
- Preserve creation affordance through the floating action button.
- Reduce navigation depth by using bottom navigation for major areas.
- Keep card layouts readable before maximizing information density.

## Localization And Currency Display Considerations
### Current implementation
- Text lengths and labels currently reflect a development-phase mix of English and Indonesian.
- Currency display is presently aligned with Rupiah-style formatting.

### Long-term direction
- Components should be robust to translation expansion and contraction.
- Labels, buttons, badges, and cards should be designed to tolerate multiple languages.
- Currency presentation should be flexible enough for different symbols, decimal rules, and formatting conventions.
- English should become the default UI language, with localization support added over time.

## Design Constraints For Future Work
- New screens should continue using tokenized colors rather than hard-coded one-off values.
- Primary actions should remain visually unmistakable.
- Financial status colors should stay semantically stable.
- Any new UI should feel native to the current dark, premium-control aesthetic.

## Assumptions
- The gold-accented dark theme is not incidental styling; it appears to be a deliberate brand and trust decision.
- The interface is optimized for repeated use, which explains the emphasis on compact cards and dense summaries.
