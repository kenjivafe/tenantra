## ADDED Requirements

### Requirement: Admin layout uses the design system
The admin route group layout SHALL be updated to use the design tokens and core components for surfaces, typography, and navigation.

#### Scenario: Admin layout matches token semantics
- **WHEN** the admin layout renders
- **THEN** the canvas, panel surfaces, borders, and text colors are sourced from design tokens

### Requirement: Dashboard page uses refreshed primitives
The admin dashboard page SHALL be updated to use the shared `Card` and typography scale for key sections and metrics.

#### Scenario: Metrics are displayed in consistent cards
- **WHEN** the dashboard page renders metric tiles
- **THEN** each tile uses the `Card` component and token-based typography for headings and values

### Requirement: Visual direction: warm editorial style
The admin UI refresh SHALL align to a warm editorial style:
- cream canvas background
- rounded panels/cards
- subtle shadows
- playful accent highlights for emphasis

#### Scenario: Primary surfaces and emphasis follow the style
- **WHEN** a user views the admin dashboard
- **THEN** primary layout surfaces and emphasis elements visibly match the target aesthetic

### Requirement: No functional regressions
The admin UI refresh SHALL preserve existing navigation behavior and page routing.

#### Scenario: Navigation still works
- **WHEN** a user clicks any existing navigation link
- **THEN** they are routed to the expected path without errors
