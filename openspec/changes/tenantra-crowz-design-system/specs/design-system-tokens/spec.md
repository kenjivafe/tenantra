## ADDED Requirements

### Requirement: Token source of truth
The system SHALL define the design system tokens as CSS variables in `app/globals.css` under `:root`.

#### Scenario: Tokens are globally available
- **WHEN** any route in the app renders
- **THEN** token CSS variables are available for use in Tailwind-mapped utilities and component styles

### Requirement: Color semantics
The system SHALL provide semantic color tokens for canvas, panel, border, text, accent, and status usage.

#### Scenario: Semantic tokens cover core UI needs
- **WHEN** a developer styles a page background, card surface, text, or primary action
- **THEN** they can use semantic tokens (not ad-hoc hex values) for those styles

### Requirement: Typography tokens
The system SHALL define typography tokens for display headings and UI/body text, including font families and a consistent size/line-height scale.

#### Scenario: Headings and body text are consistent
- **WHEN** a page renders headings and body text
- **THEN** typography follows the defined token scale and font pairings

### Requirement: Spacing, radii, and shadow tokens
The system SHALL define tokens for spacing scale, border radii, and elevation (shadows) and map them to Tailwind theme extensions.

#### Scenario: Cards share a consistent surface treatment
- **WHEN** multiple cards/panels are rendered on a page
- **THEN** their corner radius, border, and shadow are consistent via shared tokens

### Requirement: Tailwind mapping
The system SHALL map token variables to Tailwind theme keys so application code can use Tailwind utilities with semantic naming.

#### Scenario: Semantic Tailwind classes compile
- **WHEN** a developer uses Tailwind classes referencing semantic theme keys (e.g., background, text, border)
- **THEN** Tailwind compiles those classes and they resolve to token-backed values
