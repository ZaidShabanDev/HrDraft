# Handoff — HR Tools App

Open-source, self-hosted web app for a People & Culture team: fill a short form, press a button, get
a drafted job description / interview kit / onboarding plan. HR never sees a prompt, a
model name, or the word "skill".

**Status:** Phase 1 (UI) shipped and published as an open-source repo. Phase 2 (backend) in
progress — solution, schema and sign-in are in; generation is not.

---

## Where things are

```
HR-Tool/
├── HrDraft.sln
├── Directory.Build.props                ← TargetFramework lives here; retarget in one line
├── .config/dotnet-tools.json            ← dotnet-ef, pinned to the package version
├── docs/HR_Tools_App/
│   ├── handoff_HR_Tools_App.md          ← this file
│   ├── design/HR - Front-End Design-handoff/
│   │   └── project/HR Tools Front End Sketch.dc.html   ← THE design source of truth
│   └── notes/
│       ├── hr-tools-app-spec.md         ← the project spec (revised)
│       ├── database-schema.md           ← every table, column, index, and why
│       ├── frontend-architecture.md     ← project layout, components, routing, data layer
│       ├── design-system-rules.md       ← tokens, breakpoints, component states
│       └── backend-setup.md             ← projects, secrets, migrations, auth, runbook
└── src/
    ├── HrDraft.Model/                   entities, enums, column-value constants
    ├── HrDraft.Core/                    interfaces + business logic. No EF Core reference.
    ├── HrDraft.DAL/                     DbContext, configs, seed, migrations, repositories
    ├── HrDraft.Service/                 password hashing, mail, later Anthropic + Graph
    ├── HrDraft.Api/                     the only executable
    └── HrDraft.Web/                     React 19 + Vite + TS
```

**`docs/**/design/` is gitignored**, so the design bundle is not in the public repo — it
holds the originating company's logo files and branded sketch, which are not this project's
to publish. Anywhere these notes cite an artboard, the source is local-only. Whoever forks
this works from `design-system-rules.md`, which states the contract in full.

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

**6. Four backend rules that are not guessable from the code.** All four are explained in
[backend-setup.md](notes/backend-setup.md): migrations are never applied at startup;
`AddAsNewCurrentAsync` must be called inside `IUnitOfWork.InTransactionAsync`; the audit log
throws on update or delete; and `dotnet ef` needs `--startup-project` because there is
deliberately no design-time factory.

**7. The design's UI kit added scope the original spec never had.** Versions tab, history
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
- [x] **Renamed** `src/Incube.HRTools.Web` → `src/HrDraft.Web`
- [x] MIT licence, to match the `hr-skills` prompt content it builds on
- [x] Published: `github.com/ZaidShabanDev/HrDraft`

Phase 1 is done. The UI runs on mock data with the deliberate stubs listed in
`src/HrDraft.Web/README.md`.

### Phase 2 — backend

- [x] Solution + five .NET projects, reference graph one-way, `Directory.Build.props`
- [x] Entities, enums and column-value constants in `HrDraft.Model`
- [x] Repository and service interfaces in `HrDraft.Core`; no EF Core reference
- [x] `HrDraftDbContext`, one configuration class per entity, seed data for tools /
      lookups / app settings, repositories, unit of work
- [x] Cookie auth + local password sign-in: `GET /api/config`, `POST /api/auth/login`,
      `POST /api/auth/logout`, `GET /api/auth/me`, `/api/health`
- [x] First-run admin bootstrap, so a fresh deployment has a way in without a seeded
      default password
- [ ] **Next: the first migration.** Not run yet — `dotnet ef migrations add` builds, and
      Claude does not build. Commands are in [backend-setup.md](notes/backend-setup.md).
- [ ] Company profile read/write, then tools / lookups / teams endpoints
- [ ] Vendor the `SKILL.md` files into `HrDraft.Service/Content/Skills/`
- [ ] Anthropic integration — prompt assembly with cache breakpoints, streamed over SSE
- [ ] Remaining six tools, then history, rate limiting, `.docx` export
- [ ] Point the SPA off `mocks/mockData.ts` at the real API
- [ ] Team access admin endpoints (`AuthorizationPolicies.HrAdmin` is already wired)

Nothing has been built or run by Claude. `dotnet restore` was run once, to confirm the
package versions resolve — they are all on the `10.0.11` patch line, which is what cleared
the `NU1903` advisory that `10.0.0` pulled in through the EF design-time tooling.

---

## Conventions

- **Claude does not build or run anything** — no `dotnet build`, no `npm run build/dev`.
  Code gets written; Zaid compiles and tests.
- Docs live only under `docs/HR_Tools_App/`. One task, one folder.
- Comments explain *why*, one or two lines, and only where the code can't speak for itself.
  Longer rationale goes in these docs and gets referenced from the code.
