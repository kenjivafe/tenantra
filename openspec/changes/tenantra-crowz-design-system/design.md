## Context

Tenantra is now a standalone Next.js app using Tailwind CSS with existing global CSS variables (e.g., `--color-bg-surface`, `--color-accent`) and a first-pass admin layout in `app/(admin)`. The current UI is inconsistent across typography, spacing, and color usage, and lacks reusable primitives (card, button, badge, nav).

The reference images show a warm, friendly editorial style:

- Cream canvas backgrounds and soft panels
- Big, bold, slightly “print/editorial” headings
- Rounded cards, subtle shadows, and gentle borders
- Small, playful accent colors (coral, amber, teal, blue) used as highlights

Constraints:

- Next.js App Router, Tailwind CSS
- Prefer CSS variables + Tailwind theme mapping for fast iteration and consistent semantics
- Keep the system small and opinionated: enough to build Tenantra’s admin UI quickly without over-engineering

## Goals / Non-Goals

**Goals:**

- Establish a token-based design foundation:
  - Color semantics (canvas/panel/text/border/accent/status)
  - Typography scale (editorial headings + UI body)
  - Spacing scale, radii, shadows, and focus ring
- Map tokens to Tailwind so most styling is done with utility classes, but with semantic names.
- Create a minimal component set that embodies the tokens:
  - Layout shell primitives (page container, panel, sidebar nav item)
  - Core UI components (Button, Card, Badge, Input)
- Refresh the admin layout + dashboard page to use the new tokens/components first (walking skeleton).

**Non-Goals:**

- A full component library covering every UI pattern (modals, complex data grids, etc.).
- A full marketing site redesign.
- Backend/API changes.

## Decisions

### Decision 1: Use CSS variables as the source of truth for tokens

**Choice:** Define design tokens in `app/globals.css` under `:root` as CSS variables, then map Tailwind colors/shadows/radii to those variables.

**Rationale:**

- Quick theme iteration without refactoring class names
- Easy future support for dark mode (optional) by swapping variables
- Keeps tokens centralized and readable

**Alternatives considered:**

- Hardcode colors in Tailwind config only (faster initially, worse theming)
- Use a JS theme object (more complexity, less CSS-native)

### Decision 2: Typography = editorial headings + clean UI body

**Choice:**

- Headings: a “display” serif or slab-style face (or a strong variable font) to match the editorial feel
- Body/UI: a modern sans (Inter / system stack)

**Rationale:**

- Matches the reference’s contrast between playful headline and highly readable UI text
- Keeps tables/forms legible

**Alternatives considered:**

- All-sans typography (simpler but loses the desired character)

### Decision 3: Token semantics over raw palette naming

**Choice:** Use semantic token names (e.g., `--color-bg-canvas`, `--color-text-primary`, `--color-accent`) rather than palette names (e.g., “beige-50”).

**Rationale:**

- Encourages consistent usage
- Enables palette swaps without rewiring components

### Decision 4: Minimal component layer (composition-first)

**Choice:** Create a small set of “primitive” components that mainly wrap className conventions:

- `Button`, `Card`, `Badge`, `Input`
- Optional `SidebarNav`/`NavItem` primitives

**Rationale:**

- Avoids building a heavy abstraction too early
- Keeps implementation simple and Tailwind-friendly

## Risks / Trade-offs

- **[ESM + config compatibility]** Tailwind/PostCSS configs may break when `package.json` is `type: module` → **Mitigation:** standardize config filenames to `.cjs` where needed (already done for PostCSS) and keep Tailwind config compatible.
- **[Inconsistent token usage]** Developers may mix old ad-hoc colors with new tokens → **Mitigation:** provide clear token naming, update core pages first, and add quick “do/don’t” guidance in the specs.
- **[Typography availability]** If we pick a non-default heading font, it must load consistently on Vercel → **Mitigation:** use `next/font` with a Google font (or self-host) and define fallback stacks.
- **[Over-theming]** Too many tokens can slow decisions → **Mitigation:** start with a tight set (canvas, panel, border, primary text, secondary text, muted text, accent, accent-soft, status tokens).

## Migration Plan

- Step 1: Add/normalize tokens in `app/globals.css` (colors, radii, shadows, typography variables).
- Step 2: Map Tailwind theme colors/shadows/radii to token variables.
- Step 3: Introduce core primitives in `components/ui/*` and update the admin layout to use them.
- Step 4: Refresh the admin dashboard page and a small set of representative UI patterns (stat cards, list rows).
- Step 5: Iterate: only add tokens/components as real screens require them.

## Open Questions

- Should Tenantra support dark mode in this iteration (likely no; design tokens should allow it later)?
- Which exact heading font best matches your preference (serif vs slab vs rounded display)?
- Should we adopt shadcn/ui fully (with Radix primitives) or keep custom primitives minimal for now?

## Usage Notes

- **[Token usage]** Prefer semantic utilities backed by tokens (`bg-surface`, `bg-panel`, `text-text-primary`, `border-border`, `bg-accent`, `bg-accentSoft`) instead of raw hex values.
- **[Typography]** Use `font-display` for high-level headings and `font-sans` for body/UI text. Keep headings short; rely on contrast and whitespace.
- **[Surfaces]** Use `Card` for panels/tiles. Treat `bg-surface` as the canvas and `bg-panel` as the elevated surface.
- **[Actions]** Use `Button` for buttons and `ButtonLink` for navigational actions that look like buttons (avoid nesting `<button>` inside links).
