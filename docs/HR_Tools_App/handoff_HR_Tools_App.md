# Handoff — HR Tools App

Open-source, self-hosted web app for a People & Culture team: fill a short form, press a button, get
a drafted job description / interview kit / onboarding plan. HR never sees a prompt, a
model name, or the word "skill".

**Status:** Phase 1 (UI) starting. Docs and architecture settled.

---

## Where things are

```
HR-Tool/
├── docs/HR_Tools_App/
│   ├── handoff_HR_Tools_App.md          ← this file
│   ├── design/HR - Front-End Design-handoff/
│   │   └── project/HR Tools Front End Sketch.dc.html   ← THE design source of truth
│   └── notes/
│       ├── hr-tools-app-spec.md         ← the project spec (revised)
│       ├── database-schema.md           ← every table, column, index, and why
│       ├── frontend-architecture.md     ← project layout, components, routing, data layer
│       └── design-system-rules.md       ← tokens, breakpoints, component states
└── src/                                 ← not created yet
```

The design file is a Claude Design export containing **three artboards**. Read all three
before touching UI code:

| Artboard | Contents |
|---|---|
| `1a` | The six desktop screens at 1280px |
| `2a` | The same screens at 390px (phone) and 834px (tablet) + the breakpoint rules |
| `3a` | **The full UI kit** — 10 panels, every component, every state, plus the token contract |

---

## Decisions already made — don't relitigate these

| Area | Decision | Note |
|---|---|---|
| Backend | .NET 10 Web API, layered `Api`/`Core`/`Service`/`DAL`/`Model` | .NET 8 fallback is a one-line retarget |
| Frontend | React 19 + Vite + TypeScript | served from the API's `wwwroot`, one origin |
| UI | The design's own plain CSS. **No Tailwind, no shadcn.** | the design system is complete; a utility framework fights it |
| Animation | **`motion`** for state/presence/layout; CSS for hover and `:active` | **never a spring** — `MotionConfig` defaults to a tween |
| Data | EF Core 10 + migrations, repositories in the DAL | repositories keep EF types out of Core |
| Auth | Entra ID, behind `IIdentityProvider`. Local login first. | |
| Email | Microsoft Graph `sendMail`, delegated | **cannot work before Entra lands** |
| Model | `claude-sonnet-5` via the official `Anthropic` C# SDK | $2/$10 per MTok |
| Generation | **Streamed over SSE** | the design specifies a streaming skeleton |
| Hosting | IIS on a new company server, database on the same box | no hosting cost |
| Source control | TFS | not Git — the original spec's `git pull` deploy was rewritten |

---

## Things that will bite you

**1. Email genuinely cannot ship in v1.** Graph delegated `sendMail` needs a token for the
signed-in user, and that token only exists once Entra login is in. The interface and the
whole UI path ship in Phase 2 behind a `NoOpEmailSender`; real sending lands in Phase 3.
Don't try to shortcut this with an SMTP relay and a spoofed From — the mail never appears
in the sender's Sent Items, which is worse than waiting.

**2. Streaming is a Phase 2 decision, not a Phase 3 polish.** Generations run ~20 seconds
and the design specifies a skeleton "while streaming" plus an elapsed-time progress bar.
Building a plain request/response endpoint first means rewriting both ends later.

**3. The tool-card grid lines need a different technique than the sketch uses.** The sketch
draws them as `border-left` on the container + `border-right` per cell. Correct at a fixed
4-up; leaves a stray trailing line once the grid reflows to 2-up (tablet) or list rows
(phone), both of which are required. Use `gap: 1px` + a divider-colored container
background with opaque cells.

**4. Breakpoints are 834 and 1280.** Not 768/1024. They come from artboard 2a and match
iPad widths. Tablet doesn't narrow the side rails — it *removes* them, turning the
"pulled from company profile" rail into a horizontal ✓-strip.

**5. Verify prompt caching rather than assuming it.** Minimum cacheable prefix is ~1024
tokens. Check `Usage.CacheReadInputTokens` on a second identical run; if a short `SKILL.md`
misses the floor, fold it and the company profile under one breakpoint.

**6. The design's UI kit added scope the original spec never had.** Versions tab, history
search/filters, rename, delete, Team access, chips, typeahead, policy-blocked select
options. All in v1 (the UI exists, the backend cost is small). Two things were cut:
"Send to careers site" (external integration) and "Copy share link" (needs a share-token
model).

---

## Blocked on the admin

1. Entra app registration — client ID, tenant ID, client secret
2. **`Mail.Send` delegated** permission on it
3. New database + low-privilege SQL login
4. Confirm the SQL instance is in the backup routine
5. Outbound HTTPS to `api.anthropic.com`
6. TLS cert — internal CA or public
7. **ASP.NET Core 10 Hosting Bundle** on the server (or tell us it must be .NET 8)

None of these block Phase 1.

---

## Next actions

- [x] Move the spec and design bundle into `docs/HR_Tools_App/`
- [x] Write schema, frontend and design-system docs
- [x] Scaffold `src/HrDraft.Web/` (Vite + React + TS)
- [x] Port `tokens.css` / `components.css` / `base.css` / `responsive.css`
- [x] Wire the oxlint adherence config into `npm run lint`
- [x] Build the component library from artboard 3a
- [x] Build the six screens at all three widths (+ Team access)
- [x] Tool registry + seven tool forms
- [x] Reviewed at desktop / tablet / phone; bugs found and fixed:
      unreadable account menu (inherited white text from the navy chrome), panels capped
      too narrow, segmented control stretched with dead track, grid paper not filling the
      viewport, broken flex chain so pages couldn't reach full height
- [x] Animation layer via `motion` — overlays, toasts, toggles, segmented indicator
- [x] **Route transitions: none.** Three were built and removed; see
      [design-system-rules.md](notes/design-system-rules.md) §7 for why, so it isn't
      relitigated.
- [x] **White-labelled and renamed to `HrDraft`** for open-source release: no hard-coded
      company name, logo, colour or sign-in method anywhere in the UI. Config in
      `src/config/`, theming from one brand colour via OKLCH. See
      [frontend-architecture.md](notes/frontend-architecture.md) § White-labelling.
- [ ] **Rename the folder** `src/Incube.HRTools.Web` → `src/HrDraft.Web` (blocked while the
      Vite dev server is running; every file inside is already renamed)
- [ ] Pick a licence — MIT, to match the `hr-skills` prompt content it builds on
- [ ] **Next: Phase 2.** Solution + five .NET projects, DbContext, entities, first migration

Phase 1 is done. The UI runs on mock data with the deliberate stubs listed in
`src/HrDraft.Web/README.md`. Nothing has been type-checked or built by Claude.

---

## Conventions

- **Claude does not build or run anything** — no `dotnet build`, no `npm run build/dev`.
  Code gets written; Zaid compiles and tests.
- Docs live only under `docs/HR_Tools_App/`. One task, one folder.
- Comments explain *why*, one or two lines, and only where the code can't speak for itself.
  Longer rationale goes in these docs and gets referenced from the code.
