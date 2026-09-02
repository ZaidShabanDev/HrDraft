# Design System Rules — HrDraft

The contract the front-end code must follow. Everything here is **stated in the design**,
not inferred: sources are artboard `3a` (Responsive UI kit, panel 10 for the tokens) and
artboard `2a` (Responsive — phone & tablet) in
`docs/HR_Tools_App/design/HR - Front-End Design-handoff/project/HR Tools Front End Sketch.dc.html`.

Base system is **Modernist** (`_ds/modernist-*/styles.css` + `readme.md` in the same
bundle), rebranded from its stock red accent to a configurable brand colour.

---

## 1. Color

### The brand ramp is derived, not listed

HrDraft is white-label, so the palette is generated from **one** value — `--brand`, set per
deployment in `src/config/deployment.json` and applied to `:root` by `ConfigProvider`. The
100–950 ramp is derived from it in OKLCH.

**Lightness is pinned per step; chroma is scaled from the seed.** That split is the whole
mechanism:

- Pinned lightness means step 700 is always L=0.45 whatever the hue, so the rule below
  ("accent text uses 700 minimum") holds for a purple brand as much as a blue one. Scaling
  lightness from the seed instead would make contrast depend on how light the company's
  logo happens to be.
- Scaled chroma means a muted brand yields a muted ramp and a vivid one stays vivid —
  saturation is character, lightness is legibility.

Step 500 keeps the seed exactly, so a company's own colour appears untouched on primary
buttons. `theme.brandRamp` pins individual steps where a brand guideline demands it.

The default seed is `#0d93ea`. `tokens.css` also carries a hand-listed fallback ramp for
browsers without relative colour syntax; a deployment on such a browser gets the default
blue rather than its own colour — a knowingly accepted limit.

`--color-accent` and the whole `--color-accent-*` ramp alias onto the brand ramp. Modernist
is a mono scheme — treat accent and accent-2 as one role.

### Text on a brand fill

Use **`--on-brand`**, never `--color-on-dark`, for anything sitting on `--brand-500` or
`--brand-600`. It resolves to white for a mid-to-dark brand and flips to ink above L=0.7, so
a yellow or lime brand gets readable dark labels instead of white-on-pale. `--color-on-dark`
stays correct for the navy chrome (`--brand-950`), which is dark whatever the hue.

### Ground and ink (inherited from Modernist, unchanged)

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#f3f2f2` | page ground |
| `--color-surface` | `#eae9e9` | inset panels, side rails, input fills |
| `--color-text` | `#201e1d` | ink |
| `--color-divider` | `color-mix(in srgb, #201e1d 40%, transparent)` | 2px section rules |
| `--color-neutral-300` | `#d7d3d3` | 1px row rules, skeletons, progress track |

### Role assignments — from panel 10, non-negotiable

| Role | Rule |
|---|---|
| **Chrome** | `950` bars, `300` for text on dark |
| **Action** | `500` fill · **`600` hover** · **`800` pressed** |
| **Text accent** | **`700` minimum** on a light ground — never `500` for paragraph-size text |
| **Danger** | `#b42318`, destructive only |
| **Selected row / option** | `brand-100` background, `brand-700` check mark |

The `500`-on-ground pair is tuned to ~3:1 — enough for icons, large text and interface
chrome, not for body copy. That is why text accent is `700`.

---

## 2. Geometry, rules, type

| Rule | Value |
|---|---|
| **Radius** | `0` everywhere. `--radius-sm/md/lg` are all `0px` on purpose. Do not round a corner. |
| **Rules** | `2px` between sections (`--color-divider`), `1px` between rows (`--color-neutral-300`) |
| **Dropdown / dialog border** | `2px solid var(--color-text)` — ink, not divider, and **no shadow** |
| **Card top accent** | `4px solid var(--brand-500)` on panel headers |
| **Grid paper** | `16px` fine + `96px` major, via `--paper` (light) / `--paper-dark` (on navy) |
| **Type** | Archivo only — 400/500/600/800. Headings weight 800. |
| **Type sizes** | body 13–14px · H4 18–20px · h6 13px uppercase `0.08em` tracking |
| **Spacing** | `--space-1..8` = 4/8/12/16/24/32px |
| **Touch** | **44px minimum** on phone |

Alignment does the organizing, not decoration. Everything flush left — headings, copy, and
**labels inside wide buttons** (`.btn-block` is `justify-content: flex-start`).

---

## 3. Breakpoints

Stated in artboard 2a. Note **834 and 1280** — not the common 768/1024.

| Range | Name | Behaviour |
|---|---|---|
| `≥1280px` | desktop | 4-up tool grid; side rails present |
| `834–1279px` | tablet | 2-up tool grid; **side rails become inline horizontal strips** |
| `<834px` | phone | single column; list rows instead of cards |

### Mobile rules

- Primary action **docks to a bottom bar**
- Nav becomes a **3-tab bar** (Tools / History / Profile)
- Company-profile context **collapses to a summary block** (`3 items ▾`)
- Dialogs **dock to the bottom, never center**
- Menus become **action sheets**
- Tables become **stacked rows**
- Every target ≥44px

### Survives every width

Grid paper · navy chrome · blue-500 accent · the human-review flag.

---

## 4. Component states

From artboard 3a, panel by panel. This is the checklist for the component library.

### 01 Buttons

| Variant | Spec |
|---|---|
| Primary | `brand-500` fill, white text |
| Primary hover | `brand-600` |
| Primary pressed | `brand-800` |
| Primary focus | `outline: 2px solid var(--brand-900); outline-offset: 2px` |
| Disabled | `opacity: 0.45`, `cursor: not-allowed` |
| Secondary | `1px` divider border, transparent fill |
| Ghost | accent text, no border |
| Destructive | `#b42318` border **and** text, transparent fill |
| Icon | 40px min-width, square |
| Loading | label becomes `Generating… 0:12`, `opacity: 0.75` |
| Split | two adjacent buttons — `Download .docx` + `▾` (36px) |
| Phone docked | `flex: 1`, `min-height: 44px`, inside a 2px-topped bar |

### 02 Fields & choices

- **Input** — default · focused (`2px` brand-500 outline, `2px` offset) · error
  (`#b42318` border + red 12px helper) · disabled auto-filled (`0.45` + muted helper)
- **Textarea** — with optional character counter, right-aligned (`54 / 400`)
- **Segmented** — desktop full labels (`Junior / Mid / Senior / Lead`); **phone uses
  abbreviations** (`Jr / Mid / Snr / Lead`) at 12px. Selected = `brand-500` fill, white.
- **Checkbox** — 16px. Checked: `brand-500` fill + white ✓. Unchecked: `2px solid` ink border.
- **Toggle** — 34×18 track, 14px knob, **square, not rounded**. On = `brand-500`,
  off = `neutral-300`.
- **Chips** — selected: `brand-500` fill + white + `✕`. Available: `.tag-outline` + `+`.

### 03 Select & typeahead

Closed = an `.input` with a muted `▾`. Open:

- Panel: `2px solid var(--color-text)`, `4px` gap below the field, **no shadow**
- Group header: uppercase 12px on `--color-surface`, 1px bottom rule
- Option: `44px` min-height, `11px 12px` padding, 1px bottom rule
- Selected: `brand-100` background, `brand-700` ✓
- Hover: `--color-surface`
- Disabled: `opacity: 0.45` — this is how *"Remote — global (policy blocked)"* renders
- Typeahead: `border-top: 0` (joins the field), match text bold in `brand-700`,
  footer count (`2 of 14 teams`)

### 04 Menus

- **Overflow menu** — 240px, `2px` ink border, 1px row rules, **`2px` rule before the
  destructive item**, destructive in `#b42318`
- **Account menu** — identity header block (name 13px/600, role muted 12px) with a `2px`
  bottom rule, then items
- **Phone action sheet** — 44×3px drag handle centered, `13px 14px` rows at 44px min,
  `Cancel` last with a `2px` top rule and weight 600

### 05 Navigation

- **Desktop bar** — `brand-950`, logo, `HR Tools` label behind a `1px` white-30% left
  border, then links. Active link: `2px` accent bottom border. Inactive: `brand-100`.
  Right side: generation count + 28px `brand-600` initials tile.
- **Tablet bar** — drops the `HR Tools` label; `Company profile` shortens to `Profile`
- **Phone bar** — logo, `12/20`, 24px initials, hamburger (3 × 2px white bars, 16px wide)
- **Phone drawer** — 64px `rgba(8,42,73,0.45)` scrim strip + `brand-950` panel.
  Active item: `3px` left `brand-500` border, 10px padding. Inactive: `brand-300`, 13px
  padding. Generation count pinned at the bottom behind a white-25% rule.
- **Tab bar** — 3-col grid, `2px` top rule. Active: `brand-700` text + `3px` top
  `brand-500` border. 11px uppercase `0.08em`.
- **Phone back header** — `brand-950` bar, `←` + title in heading 800/14px
- **Draft tabs** — `Edit` / `Preview` / **`Versions`**. Active: `2px` accent bottom border.

### 06 Dialog (desktop / tablet)

- Scrim `rgba(8,42,73,0.45)`
- Box `2px solid var(--color-text)` on `--color-bg`, no shadow
- Header: h6 kicker in `brand-700` + h4 20px + `✕`, `2px` bottom rule
- Footer: `2px` top rule, right-aligned, ghost Cancel + primary confirm
- **Destructive variant**: box border `2px solid #b42318`, kicker `#b42318`, confirm
  button `#b42318` fill

### 07 Bottom sheet (phone)

Dialogs **dock, never center**. `2px` top ink border, drag handle, same header/body
structure, footer buttons **stacked full-width** at 44px — primary first, ghost Cancel below.

### 08 Feedback

| Component | Spec |
|---|---|
| Toast success | `brand-950` fill, white text, action (`Undo`) in `brand-300`, right-aligned |
| Toast error | `#b42318` fill, white text, underlined action (`Retry`) |
| Inline banner | `2px solid brand-500` border on `brand-100` fill, h6 `brand-700` + 12px body |
| Progress bar | `4px` tall, `neutral-300` track, `brand-500` fill, muted caption below |
| Skeleton | bars at `70% / 100% / 92% / 48%` width; first `14px` tall, rest `10px` at `0.7` opacity; `7px` gap |
| Empty state | `1px dashed neutral-300`, 18px padding, h6 + muted 12px + secondary button, all flush left |

### 09 Data

- Toolbar: 200px search input with `⌕`, `.tag-outline` filter chips with `▾`, muted result
  count pushed right
- Table: `.table` — 11px uppercase headers with `2px` bottom rule, 1px row rules, sort
  indicator on the active column (`When ↓`), **selected row = `brand-100`**
- **`≥834px` table · `<834px` stacked rows.** Stacked row: title 14px/600, muted 12px
  `Tool · When` meta line, `⋯` on the right, 1px bottom rule, 12px vertical padding

---

## 5. Enforcement

The design bundle ships an adherence config at
`design/HR - Front-End Design-handoff/project/_ds/modernist-*/_adherence.oxlintrc.json`
that flags raw hex colors, raw `px` literals, and any non-Archivo font. It is adapted into
`src/HrDraft.Web/.oxlintrc.json` and wired into `npm run lint`.

**What it does and does not cover.** oxlint parses TS/TSX, not CSS — so it catches the case
that actually causes drift (`style={{ color: '#0d93ea' }}` in a component) and cannot check
the stylesheets at all. The hex and px rules are therefore scoped to inline `style`
attributes; a bare string elsewhere in the code isn't a design violation.

That leaves the stylesheets governed by convention rather than tooling:

- `styles/tokens.css` is the **only** file allowed to contain literal hex values — it is
  where they are defined.
- `styles/components.css` and `styles/responsive.css` use `var(--*)` throughout, with raw
  px only where a token would be nonsense (a `1px` hairline, a `16px` checkbox).
- CSS Modules must reference tokens exclusively — no literal hex, no literal px.

If that convention starts slipping, add Stylelint with `declaration-property-value-allowed-list`.
It isn't worth the dependency yet.

---

## 6. The grid paper is exactly one layer

The design draws grid paper on individual panels, because each artboard is a
fixed-size frame with no space around it. In a real browser that fails twice: the paper
stops where the element's content stops (flat ground below short pages, and beside any
column with a `max-width`), and two paper elements paint their grids from **their own**
origins, so the lines don't line up across a boundary.

So the app paints it **once**, on `.app-content` in `AppShell`, which is `flex: 1` inside a
`min-height: 100vh` frame. Consequences to keep in mind:

- **Never add `.paper` inside the app shell.** The `Paper` component is for surfaces
  outside it — the login screen — and for `paper-dark` on navy chrome.
- `.panel` is **transparent** so the one grid reads through its body; `.panel-header` is
  **opaque** so it masks the grid behind the title bar, as the design shows.
- Anything that should mask the grid says so explicitly: side rails use
  `--color-surface`, tool cards and menus use `--color-bg`.

## 7. Motion — an extension, not from the design

The design specifies interaction *states* but no motion at all. These rules were added on
top of it, chosen to fit a system that is flat and architectural: **movement is short,
straight, and stops.** No spring, no bounce, no overshoot, and no scaling of a surface —
scaling reads as soft, and nothing in this system is soft.

### Which layer owns what

**Motion (`motion` / `motion/react`) is the standard** for anything driven by React state:
mount and unmount, open and closed, and layout. Presets live in `src/lib/motion.ts`.

**CSS keeps pointer feedback** — hover tints and `:active` states. There are dozens of
them, they need no React render, they run on the compositor, and they work before
hydration. This is Motion's own recommendation, not a shortcut.

One consequence worth knowing: `<MotionConfig>` in `App.tsx` sets a **tween** as the global
default. Motion springs by default on transforms, and springs overshoot — so without that
config a stray animation would silently bounce and break the system's character. Never pass
`type: 'spring'`.

### Values

Canonical in `styles/tokens.css`; `src/lib/motion.ts` mirrors them for the JS side. Change
both or the layers drift.

| Token | Value | Used for |
|---|---|---|
| `--duration-fast` | 120ms | hovers, toggles, dropdowns, menus, carets |
| `--duration-base` | 180ms | dialogs, toasts, route transitions |
| `--duration-slow` | 240ms | bottom sheets and the phone drawer (longer travel) |
| `--ease` | `cubic-bezier(0.2, 0, 0.3, 1)` | anything entering — decelerates to rest |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | anything leaving — accelerates away |
| `--shift-sm` / `--shift-md` | 4px / 8px | how far a surface travels as it appears |

### What moves, and why that direction

Each surface moves along the axis it belongs to, so the motion explains the layout:

| Surface | Motion | Layer |
|---|---|---|
| Dropdown / menu | drops `4px` from its trigger | Motion |
| Typeahead panel | unfurls from its top edge (it is joined to the field) | Motion |
| Dialog | rises `8px`, scrim fades | Motion |
| Bottom sheet | slides up from the bottom edge it docks to | Motion |
| Drawer | slides in from the right edge | Motion |
| Toast | rises in; leaves sideways (down on phone, where it is full-width) | Motion |
| Route change | **nothing** — navigation is instant | — |
| Segmented control | the accent fill *slides* between options (`layoutId`) | Motion |
| Toggle knob | translates 16px | Motion |
| Collapsible reveal | height to `auto` | Motion |
| Skeleton | staggered opacity pulse — a 20s wait shouldn't read as a stall | Motion |
| Determinate progress | width to the new percentage | Motion |
| Hover tints, `:active` | background / colour | CSS |
| Tool card arrow nudge | `4px` right on hover — horizontal, never a lift | CSS |
| Indeterminate progress | travelling segment, no React state behind it | CSS |

### Constraints

- **`prefers-reduced-motion` is handled in both layers**: the global rule in `base.css`
  covers CSS, and `reducedMotion="user"` on `<MotionConfig>` covers Motion. Don't add
  movement that bypasses either.
- **Never animate a property that can't be interpolated.** The toggle originally moved its
  knob with `justify-content`, which teleports rather than animating.
- **Route changes are not animated, deliberately.** Three transitions were built and all
  three were removed: a rise (read as lag), a sliding paper sheet, and a full physical
  page turn. The page turn is instructive about why — a convincing one needs per-pixel
  shading (DOM strips give visible facets, so it has to be canvas or a shader) and around
  1.3s to read as paper rather than a swipe. Both of those are the opposite of what a tool
  someone opens fifty times a day wants. The page is simply there.

  If it is ever revisited, two traps to know: `clip-path` on the page clips its
  `position: fixed` descendants and cuts off dialogs, and a `transform` on the page makes it
  the containing block for `position: sticky` and breaks the phone docked bar. Animate an
  overlay, never the page.
- **Overlays take an `open` prop** rather than being conditionally rendered by the caller.
  `AnimatePresence` needs to stay mounted to animate an exit, so `{open && <Dialog/>}`
  silently loses the exit animation. Pass `open={…}` instead.

## 8. One technique change from the design source

The tool-card grid in the sketch draws its lines as `border-left` on the container plus
`border-right` on each cell. That is correct at a fixed 4-up, but leaves a **stray trailing
line at the wrap point** once the grid reflows to 2-up (tablet) or to list rows (phone) —
both of which the design requires.

Implementation uses `gap: 1px` on the grid with a `--color-neutral-300` container
background and opaque cells. Identical rendering at 4-up, correct at every other column
count. Same fix applies to the comp-bands and history tables when they restack.
