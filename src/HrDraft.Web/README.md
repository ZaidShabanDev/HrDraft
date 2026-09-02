# HrDraft — Web

React 19 + Vite + TypeScript SPA. Phase 1: all screens on mock data, no backend.

```powershell
npm install
npm run dev        # http://localhost:5173
npm run lint       # design-adherence gate (oxlint)
npm run typecheck  # tsc, no emit
```

`npm run build` outputs into `../HrDraft.Api/wwwroot` so the SPA and API ship as one site.
That project doesn't exist yet — use `dev` until Phase 2.

## Making it yours

HrDraft is white-label: nothing in the UI hard-codes a company name, logo or colour. Edit
[`src/config/deployment.json`](src/config/deployment.json) — every field is optional and
falls back to the defaults in `src/config/appConfig.ts`, so a fresh clone runs as-is.

### Colour

Set **one** value:

```json
{ "branding": { "theme": { "brand": "#7c3aed" } } }
```

The whole 100–950 ramp is derived from it in OKLCH, at **pinned lightness per step**. That
pinning is the point: because step 700 is always L=0.45 whatever the hue, the system's
"accent text uses 700 minimum on the light ground" rule holds for a purple brand, a red one
or a green one. Chroma is scaled from your colour, so a muted brand yields a muted ramp.

Text on brand fills uses `--on-brand`, which flips to ink for a light brand — so a yellow
or lime brand gets dark button labels instead of unreadable white.

If a brand guideline pins exact values, override individual steps with `theme.brandRamp`;
anything omitted is still derived.

### Logo

Drop files in `public/assets/` and point `logo.onDark` (navy chrome, login panel) and
`logo.onLight` (breadcrumbs) at them. Leave them `null` and the app renders `logo.wordmark`
as a text mark — that's the default state, not a broken one.

### Sign-in

`auth.local`, `auth.entra`, `auth.ldap`. A method left disabled is **hidden**, not greyed
out. Entra and LDAP also need server-side settings (tenant, client ID and secret, or the
domain controller); those never go in `deployment.json`, which is served publicly to the
login page.

> Enabling LDAP means the app handles real domain passwords in transit. HTTPS is mandatory
> rather than advisable, and some security policies forbid it outright. Prefer Entra where
> it exists.

## Reading order

1. [design-system-rules.md](../../docs/HR_Tools_App/notes/design-system-rules.md) — tokens,
   breakpoints, component states. The contract.
2. [frontend-architecture.md](../../docs/HR_Tools_App/notes/frontend-architecture.md) — why the
   code is laid out this way.
3. `src/styles/tokens.css` — the only file allowed to contain literal hex values.

## Rules worth knowing before you edit

- **No Tailwind, no component library.** The design ships a complete plain-CSS system.
  That's also what makes theming a token swap rather than a rewrite.
- **Animation:** `motion` owns state/presence/layout; CSS owns hover and `:active`.
  Presets in `src/lib/motion.ts`. **Never use a spring** — `MotionConfig` in `App.tsx`
  defaults to a tween because springs overshoot and this system doesn't bounce.
- **Overlays take `open`**, they aren't conditionally rendered — `AnimatePresence` must
  stay mounted to animate an exit.
- **Radius is 0 everywhere.** Don't round a corner.
- **Rules are 2px between sections, 1px between rows.** Don't soften them.
- **Never hard-code a hex, px, company name or logo path** outside `tokens.css` and the
  config module. `npm run lint` catches inline styles.
- Breakpoints are **834** and **1280**, defined in `styles/responsive.css` and
  `hooks/useBreakpoint.ts`. Keep the two in step.

## Where things live

| Path | What |
|---|---|
| `src/config/` | deployment config + the provider that applies the theme to `:root` |
| `src/styles/` | tokens → base → components → responsive, imported in that order |
| `src/lib/motion.ts` | motion presets — read the header before adding an animation |
| `src/components/` | the design system as React; one file per group, barrel at `index.ts` |
| `src/layouts/AppShell.tsx` | chrome; desktop bar / tablet bar / phone bar + drawer + tab bar |
| `src/features/tools/toolRegistry.ts` | one entry per tool — **start here to add a tool** |
| `src/features/generate/` | the form and result screens, plus the profile-context rail |
| `src/mocks/mockData.ts` | every fixture. Deleted in Phase 2. |
| `src/hooks/useBreakpoint.ts` | the only place layout branches on width in JS |

## Responsive: CSS or JS?

CSS media queries whenever the markup is identical. `useBreakpoint()` only where the two
widths render **different markup**:

- `Dialog` → `BottomSheet` below 834px (phone dialogs dock, never center)
- `Menu` → `ActionSheet` below 834px
- `DataTable` → `StackedRowList` below 834px
- The tool grid → list rows, and the chrome's three bar variants

## Adding a tool

1. Seed a row in the `Tools` table (Phase 2).
2. Add a `ToolDefinition` to `src/features/tools/toolRegistry.ts`.
3. Write the form component against `ToolFormProps`.

Nothing else changes — not the shell, not the router, not the home grid.

## Known Phase-1 stubs

- Sign-in navigates without authenticating.
- Generate waits 1.6s and routes to a fixed draft. Phase 2 replaces it with the streamed
  SSE call — the skeleton and progress bar are already wired to that shape.
- Copy works; `.docx` export, rename and email are toasts.
- Route changes are not animated, by choice — see design-system-rules.md §7.

Prompt content is derived from [tuanductran/hr-skills](https://github.com/tuanductran/hr-skills) (MIT).
