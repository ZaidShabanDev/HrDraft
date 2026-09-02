# Frontend Architecture — HrDraft

React 19 + Vite + TypeScript SPA. **No Tailwind, no shadcn/ui, no component library.**
The design ships a complete, production-quality plain-CSS design system (Modernist); a
utility framework on top of it would fight it — zero radius, 2px ink rules and flush-left
button labels are all things a default component library gets wrong.

Design contract: [design-system-rules.md](design-system-rules.md).

---

## Project layout

```
src/HrDraft.Web/
├── .oxlintrc.json                  ← copied from the design bundle; the adherence gate
├── index.html
├── vite.config.ts
├── tsconfig.json
├── public/assets/
│   ├── <logo-on-dark>.png            ← on navy chrome
│   └── <logo-on-light>.png              ← on light ground
└── src/
    ├── main.tsx
    ├── App.tsx                     ← routes
    ├── styles/
    │   ├── tokens.css              ← Modernist tokens, brand-derived
    │   ├── components.css          ← Modernist component layer, verbatim
    │   ├── base.css                ← reset, body, type scale
    │   └── responsive.css          ← the three breakpoints
    ├── components/                 ← the design system as React
    ├── layouts/
    │   ├── AuthLayout.tsx          ← the login split
    │   └── AppShell.tsx            ← chrome + paper ground + <Outlet/>
    ├── features/
    │   ├── auth/
    │   ├── tools/
    │   ├── generate/
    │   ├── profile/
    │   ├── history/
    │   └── admin/                  ← "Team access"
    ├── api/                        ← typed fetch client, one module per resource
    ├── hooks/
    ├── lib/                        ← formatting, markdown
    ├── types/
    └── mocks/mockData.ts           ← every fixture from the sketch; deleted in Phase 2
```

---

## White-labelling

HrDraft is open source and self-hosted, so **nothing in the UI may hard-code a company
name, logo, colour or sign-in method.** All of it comes from `src/config/`:

| File | Role |
|---|---|
| `appConfig.ts` | The config *shape* and `DEFAULT_CONFIG` — what a fresh clone runs with |
| `deployment.json` | What a deployment overrides. Every field optional. |
| `ConfigProvider.tsx` | Merges the two, applies the theme to `:root`, exposes `useAppConfig()` |

This is the exact shape `GET /api/config` will return. When the endpoint lands, only the
import in `ConfigProvider` changes — no screen, component or stylesheet is touched. The
endpoint is deliberately public and pre-auth, because the login screen needs the logo,
product name and enabled sign-in methods before anyone has signed in; keep secrets out of it.

**Theming is a token swap, and that is the payoff for not using a utility framework.**
`ConfigProvider` sets `--brand` on `:root` and `tokens.css` derives the 100–950 ramp from it
in OKLCH — every existing rule picks it up untouched. See design-system-rules.md §1 for why
lightness is pinned per step and chroma scaled.

Two components exist purely so callers never branch on configuration:

- **`BrandLogo`** renders the configured logo file, or a text wordmark when there isn't one.
  The wordmark is the *default* state of the project, not an edge case — most people will
  see it before they see their own logo, so it has to look deliberate.
- **`LoginPage`** renders only the sign-in methods that are enabled, and **hides** the rest
  rather than disabling them. An SSO button nobody can use is worse than no button. With
  every method off it says so, pointing at `deployment.json`, instead of showing an empty
  panel.

## Styling strategy

Four global stylesheets, imported once in `main.tsx` in this order:

1. **`tokens.css`** — the single source of truth for every value. The sketch loads
   Modernist's red-accent `styles.css` and then overrides it to the brand colour in an inline
   `<style>` block; that is **merged here into one definition** rather than kept as two
   layers, so there is never a question of which value wins.
2. **`components.css`** — Modernist's component layer verbatim: `.btn` and variants,
   `.field`, `.input`, `.seg`, `.tag`, `.table`, `.hr`, `.card`, `.dialog`. Not rewritten,
   because the design tools lint against these exact class names.
3. **`base.css`** — reset, `body`, the h1–h6 scale.
4. **`responsive.css`** — the `834px` / `1280px` breakpoints and the mobile rules.

Per-component layout that isn't in the design system goes in **CSS Modules** next to the
component (`ToolCard.module.css`). Rule: CSS Modules may only reference `var(--*)` tokens —
never a literal hex or px. The oxlint config enforces it.

---

## Component library

Thin wrappers over the design-system classes, so each class name appears in exactly one
place. Built from artboard 3a — every state in the design has a prop.

| Module | Components |
|---|---|
| `components/Button/` | `Button` (primary · secondary · ghost · destructive · loading · disabled), `IconButton`, `SplitButton`, `DockedActionBar` |
| `components/Field/` | `Field` (label + helper + error), `Input`, `Textarea` (with `maxLength` counter), `Checkbox`, `Toggle`, `SegmentedControl` (with `abbreviations` for phone), `ChipInput` |
| `components/Select/` | `Select` (grouped, disabled options), `Typeahead` (match highlight + result count) |
| `components/Menu/` | `Menu`, `MenuItem` (`destructive` prop), `AccountMenu`, `ActionSheet` |
| `components/Nav/` | `TopBar`, `Drawer`, `TabBar`, `Breadcrumb`, `MobileHeader`, `Tabs` |
| `components/Overlay/` | `Dialog` (+ `destructive`), `BottomSheet`, `Scrim` |
| `components/Feedback/` | `Toast` + `ToastProvider`, `Banner`, `ProgressBar`, `Skeleton`, `EmptyState` |
| `components/Data/` | `DataTable` (sortable, selectable), `StackedRowList`, `SearchInput`, `FilterChip` |
| `components/Layout/` | `PaperPanel`, `PanelHeader` (the 4px accent top rule), `Rule`, `GridLines` |

### Two components carry the responsive logic

Everything else is width-agnostic. These two are where the design's breakpoint rules live:

- **`Dialog`** renders as a centered dialog `≥834px` and delegates to `BottomSheet` below
  it — the design is explicit that phone dialogs dock and never center.
- **`DataTable`** renders a `<table>` `≥834px` and `StackedRowList` below it.

Both read a single `useBreakpoint()` hook so the threshold is defined once.

### `Menu` follows the same rule

`Menu` becomes `ActionSheet` on phone. Same items, same handlers, different presentation —
the call site passes items, not markup.

---

## Routing

```
/login                          LoginPage            (AuthLayout)
/                               ToolsHomePage        (AppShell)
/tools/:toolKey                 GeneratorPage
/tools/:toolKey/result/:id      DraftResultPage
/history                        HistoryPage
/profile                        CompanyProfilePage
/admin/access                   TeamAccessPage       (HrAdmin only)
```

React Router 7, declarative mode. `AppShell` is a layout route so the chrome mounts once.

---

## The tool registry

`features/tools/toolRegistry.ts` is the load-bearing abstraction. One entry per tool:

```ts
export interface ToolDefinition {
  toolKey: string;              // matches Tools.ToolKey in the database
  displayNumber: string;        // '01'
  title: string;
  blurb: string;
  category: 'Recruiting' | 'Onboarding';
  estimatedSeconds: number;     // the form's "~20 seconds"
  FormComponent: React.ComponentType<ToolFormProps>;
  ResultComponent: React.ComponentType<ToolResultProps>;
  nextSteps?: NextStep[];       // the draft screen's "Interview questions from this JD"
}
```

It mirrors the `Tools` table, so the two stay conceptually aligned: the database owns
*whether* a tool is live and its token cap; the registry owns *what its form looks like*.
Adding tool #8 is one seed row plus one registry entry plus one form component — never a
change to the shell, the router, or the home grid.

The home grid, the breadcrumb, the generator page and the draft page all read from the
registry. None of them contain a tool name.

---

## Forms

`react-hook-form` is **not** used in Phase 1. The forms are small (6–8 fields), the design
specifies exactly one error presentation, and controlled `useState` per form keeps the mock
phase dependency-free. Revisit only if a form grows past ~12 fields.

Each tool form implements `ToolFormProps`:

```ts
interface ToolFormProps {
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  errors: Record<string, string>;
  profileContributions: ProfileContribution[];   // the ✓ in-use rail
  disabled: boolean;
}
```

The parent `GeneratorPage` owns submit, validation display, the profile rail (which becomes
an inline strip on tablet and a collapsed block on phone), and the docked action bar.
Individual forms own only their fields.

---

## Data layer

`api/` holds a thin typed `fetchJson` wrapper plus one module per resource
(`generations.ts`, `companyProfile.ts`, `history.ts`, `auth.ts`, `lookups.ts`). No
TanStack Query in Phase 1 — the mock layer is synchronous and the real API arrives in
Phase 2, which is the right moment to decide whether caching is worth a dependency.

**`mocks/mockData.ts` is the single seam.** Every fixture from the sketch lives there —
the JD draft body, the five history rows, the three comp bands, `12 / 20 generations
today`, the 14 teams, the work-arrangement options including the policy-blocked one. Phase
2 deletes this file and points `api/` at real endpoints; no screen changes.

### Streaming, when it lands

The generate endpoint streams over SSE (see the spec's streaming note). The client contract
is designed for it now so it doesn't need reworking:

```ts
type GenerationEvent =
  | { type: 'started'; generationId: number }
  | { type: 'delta'; text: string }
  | { type: 'done'; generation: Generation }
  | { type: 'error'; message: string; retryable: boolean };
```

`Skeleton` shows until the first `delta`, `ProgressBar` tracks elapsed time against
`estimatedSeconds`, and `error` with `retryable: true` returns the form with inputs intact
plus a retry button — the failure state the design and the spec both call for. Never a
blank screen.

---

## Accessibility

The design system gives most of this for free; these are the parts the code has to get right.

- Semantic elements — `<button>`, `<table>`, `<label for>`. Never a clickable `<div>`.
  The sketch uses `<span class="btn">` in places because it's a static mockup; the real
  build uses real controls.
- `:focus-visible` is the 2px accent ring from `components.css`. Never remove an outline
  without replacing it.
- `SegmentedControl` is a radio group (`role="radiogroup"` + real inputs), not a set of
  spans with `aria-selected`.
- `Dialog` / `BottomSheet` — focus trap, restore focus on close, `Esc` closes, `aria-modal`,
  labelled by the dialog title.
- `Menu` — arrow-key navigation, `Esc` closes, focus returns to the trigger.
- `Toast` — `role="status"` for success, `role="alert"` for errors.
- Errors are tied to fields with `aria-describedby`, not just colored red.
- 44px touch targets on phone are an accessibility requirement, not only a design one.

---

## Verification

Phase 1 is visual. There is no build step run by Claude — see the spec's verification section.

1. `npm install` && `npm run dev`
2. Six screens against artboard **1a** at 1280px, artboard **2a** at 834px and 390px
3. Every component state against artboard **3a**, panel by panel
4. Resize through 1279 and 833 — no horizontal overflow, **no stray grid line at the wrap**
5. `npm run lint` — the adherence config must pass
6. Keyboard-only pass on every screen
7. Phone viewport: docked action, 3-tab nav, collapsed profile block, all targets ≥44px
