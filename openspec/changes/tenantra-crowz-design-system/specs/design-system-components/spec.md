## ADDED Requirements

### Requirement: Core component set
The system SHALL provide a minimal set of reusable UI components built on the design tokens:
- Button
- Card
- Badge
- Input

#### Scenario: Components are available to pages
- **WHEN** a page imports a UI component from the shared components directory
- **THEN** it can render with consistent styling aligned with the token system

### Requirement: Variant-driven styling
Each core component SHALL support a small, explicit set of variants (e.g., `primary`, `secondary`, `ghost`, `destructive`) implemented via stable className composition.

#### Scenario: Button variants are consistent
- **WHEN** a developer renders buttons of different variants
- **THEN** each variant uses consistent colors, borders, and hover/focus treatments from tokens

### Requirement: Accessibility defaults
Core components SHALL include accessible defaults for focus visibility and interactive states.

#### Scenario: Focus is visible
- **WHEN** a user tabs through interactive elements
- **THEN** the focused component shows a visible focus ring that meets accessibility expectations

### Requirement: Composability
Core components SHALL accept `className` overrides and forward props to their underlying HTML elements.

#### Scenario: Page-level layout adjustments
- **WHEN** a page needs minor spacing or layout tweaks
- **THEN** it can pass `className` without modifying component source

### Requirement: Sidebar/navigation primitives
The system SHOULD provide lightweight primitives for admin navigation (e.g., `Sidebar`, `NavItem`) that match the reference layout style.

#### Scenario: Admin nav uses shared primitives
- **WHEN** the admin layout renders a sidebar
- **THEN** the nav items use shared primitives for spacing, hover states, and active states
