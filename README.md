# HrDraft

Self-hosted HR document drafting. Your team fills a short form, presses a button, and gets
a finished draft — job descriptions, interview kits, scorecards, onboarding plans. Nobody
has to know what a prompt is.

Built on a curated library of HR prompt expertise
([tuanductran/hr-skills](https://github.com/tuanductran/hr-skills), MIT), so output follows
the same good practices — inclusive language, must-have/nice-to-have separation, structured
interview criteria — whoever generates it.

> **Status: front end complete, backend not started.** Every screen runs against mock data.
> See [Roadmap](#roadmap).

---

## Why it exists

HR teams write these documents from scratch or from stale templates: 30–45 minutes each,
inconsistent between authors. HrDraft makes it a form and a button, and keeps the AI layer
completely out of sight — no prompts, no model settings, no "skills" concept exposed to
anyone.

It's self-hosted on purpose. Job descriptions and onboarding plans carry salary bands and
new-hire personal data, so the drafts, the audit log and the API key all stay on your own
server.

## What it drafts

**Recruiting** — job description · JD rewriter (debias an old posting) · interview questions
by competency · scorecard with strong/weak answer guidance

**Onboarding** — 30/60/90-day plan · onboarding checklist · welcome email

Plus a **company profile** written once — benefits, DEI statement, comp bands, culture —
that every generation reads from. That's the feature that makes output sound like your
company instead of generic AI text.

## Make it yours

Nothing in the UI hard-codes a company name, logo, colour or sign-in method. Edit
[`src/HrDraft.Web/src/config/deployment.json`](src/HrDraft.Web/src/config/deployment.json);
every field is optional.

**Colour is one value:**

```json
{ "branding": { "theme": { "brand": "#7c3aed" } } }
```

The full 100–950 ramp derives from it in OKLCH with **lightness pinned per step**, so
contrast rules hold for any hue — and text on brand fills flips to dark automatically for a
light brand. Full details in
[`src/HrDraft.Web/README.md`](src/HrDraft.Web/README.md#making-it-yours).

**Sign-in:** local password, Microsoft Entra ID, or LDAP bind. A method that isn't
configured is hidden, not greyed out.

## Stack

| Layer | Choice |
|---|---|
| Backend | .NET 10 Web API — `Api` / `Core` / `Service` / `Dal` / `Model` |
| Frontend | React 19 + Vite + TypeScript, served from the API's `wwwroot` |
| UI | Plain CSS design system. No Tailwind, no component library. |
| Database | SQL Server via EF Core 10 |
| AI | Anthropic C# SDK, `claude-sonnet-5`, streamed, server-side only |
| Hosting | One process behind IIS or nginx |

The API key and connection string live in server-side environment variables and are never
reachable from the browser.

## Running the front end

```bash
cd src/HrDraft.Web
npm install
npm run dev        # http://localhost:5173
```

Sign-in navigates without authenticating and generation returns a fixed draft — the backend
isn't built yet. See [`src/HrDraft.Web/README.md`](src/HrDraft.Web/README.md) for the full
list of stubs.

## Roadmap

- [x] **Phase 1 — Front end.** Seven screens, responsive at 1280 / 834 / 390, full component
      library, white-label config
- [ ] **Phase 2 — Backend.** EF Core schema, cookie auth, company profile, streamed
      generation, history + audit, `.docx` export
- [ ] **Phase 3 — SSO + email.** Entra ID sign-in, then send drafts as the signed-in user
      via Microsoft Graph
- [ ] **Phase 4 — Deploy.** IIS site, staging, secrets, budget alerts

## Documentation

| Doc | What |
|---|---|
| [Project spec](docs/HR_Tools_App/notes/hr-tools-app-spec.md) | Scope, architecture, decisions |
| [Database schema](docs/HR_Tools_App/notes/database-schema.md) | Every table and column, with reasoning |
| [Frontend architecture](docs/HR_Tools_App/notes/frontend-architecture.md) | Layout, routing, config, data layer |
| [Design system rules](docs/HR_Tools_App/notes/design-system-rules.md) | Tokens, breakpoints, component states |

## Licence

[MIT](LICENSE) — matching the prompt library it builds on. Use it, fork it, deploy it
commercially; just keep the copyright notice.

## Credits

Prompt content derived from [tuanductran/hr-skills](https://github.com/tuanductran/hr-skills)
(MIT). Type is [Archivo](https://fonts.google.com/specimen/Archivo).
