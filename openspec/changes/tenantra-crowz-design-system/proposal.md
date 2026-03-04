## Why

Tenantra’s UI is functional but lacks a cohesive visual language, which makes new screens slower to build and the product feel less premium. A small, opinionated design system inspired by the provided reference aesthetic will improve consistency, speed, and perceived quality.

## What Changes

- Introduce a Tenantra design system (tokens + components) with a warm, editorial “Crowz-inspired” look:
  - Cream canvas backgrounds, soft panels/cards, rounded corners, subtle shadows
  - Bold, friendly editorial headings paired with highly readable UI text
  - A small set of playful accent colors used intentionally (badges, charts, highlights)
- Standardize typography, spacing, radii, shadows, borders, and color usage via CSS variables + Tailwind theme mapping.
- Provide a baseline component set (layout shell, navigation, card, button, badge, table/list rows, inputs) aligned with the new tokens.
- Update the existing admin dashboard route group to use the new tokens/components (incrementally, starting with layout + dashboard page).

## Capabilities

### New Capabilities
- `design-system-tokens`: Define and ship global design tokens (colors, typography, spacing, radii, shadows) and Tailwind mappings.
- `design-system-components`: Provide a small reusable component library (layout primitives + core UI components) that uses the tokens.
- `admin-ui-refresh`: Apply the new design system to the existing admin area layout and dashboard page.

### Modified Capabilities
- (none)

## Impact

- **Frontend styling**: Updates to `app/globals.css`, Tailwind config, and potentially Next.js layout structure for consistent theming.
- **Component architecture**: Introduces/updates `components/` primitives used across pages.
- **Design consistency**: Establishes conventions for spacing, typography scale, and color semantics used across the app.
- **No backend/API changes**: This change is UI-only (visual + component structure).
