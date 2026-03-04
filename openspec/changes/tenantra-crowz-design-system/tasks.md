## 1. Token foundation

- [x] 1.1 Normalize global token variables in `app/globals.css` (canvas/panel/border/text/accent/status)
- [x] 1.2 Update `tailwind.config.js` to map semantic colors, radii, and shadows to CSS tokens
- [x] 1.3 Add typography tokens (display heading + UI body) and wire into Tailwind `fontFamily`
- [x] 1.4 Add focus ring tokens and ensure interactive elements use consistent focus styles

## 2. Core UI primitives

- [x] 2.1 Create `components/ui/button.tsx` with variants (primary/secondary/ghost/destructive) using tokens
- [x] 2.2 Create `components/ui/card.tsx` (surface + border + shadow + padding conventions)
- [x] 2.3 Create `components/ui/badge.tsx` (default + accent + subtle variants)
- [x] 2.4 Create `components/ui/input.tsx` (base input styles + focus ring)
- [x] 2.5 Add a simple className utility (e.g., `lib/cn.ts`) for class composition (if not already present)

## 3. Admin layout refresh

- [x] 3.1 Refactor `app/(admin)/layout.tsx` to use token-backed surfaces and spacing scale
- [x] 3.2 Implement sidebar navigation primitives (optional `components/ui/sidebar.tsx` + `NavItem`)
- [x] 3.3 Update admin header actions to use the new `Button` variants
- [x] 3.4 Verify navigation routes still work and no layout regressions occur

## 4. Dashboard page refresh

- [x] 4.1 Update `app/(admin)/page.tsx` to use `Card` and typography scale for metric tiles
- [x] 4.2 Add a “stat card” pattern (icon + label + value + delta) aligned with the reference style
- [x] 4.3 Introduce accent highlights sparingly (badges, deltas, small chart placeholders) using token semantics
- [x] 4.4 Ensure responsive layout and spacing matches the design system across breakpoints

## 5. Quality and rollout

- [x] 5.1 Run `npm run build` and confirm no TypeScript errors
- [x] 5.2 Run `npm run dev` and smoke-test hydration, navigation, and styling consistency
- [x] 5.3 Add a short usage note in the change docs describing token semantics and component usage conventions
