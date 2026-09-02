# HR Tools App — Project Spec

Internal web app that gives the HR team form-based, one-click access to AI-generated
recruiting and onboarding documents, without anyone needing to know Claude, prompts,
or skills exist under the hood.

> **Revised 2026-08-25.** The original spec assumed Next.js + Prisma + PM2 and left auth
> unresolved. Those are now decided — .NET 10 + React, EF Core, Entra ID, IIS on a company
> server, TFS. Email-from-the-tool and response streaming were added to scope. Every
> changed section is marked **[revised]**. Companion docs:
> [database-schema.md](database-schema.md) ·
> [frontend-architecture.md](frontend-architecture.md) ·
> [design-system-rules.md](design-system-rules.md)

---

## 1. Problem & Value

HR currently writes job descriptions, interview questions, scorecards, and onboarding
plans from scratch or from stale templates. This tool replaces that with a form → button
→ finished draft, built on a curated open-source library of HR prompt expertise
([tuanductran/hr-skills](https://github.com/tuanductran/hr-skills), MIT licensed).

**Value delivered:**
- **Time back** — minutes instead of 30–45 minutes per document.
- **Consistency** — every output follows the same good practices (inclusive language,
  must-have/nice-to-have separation, structured interview criteria) regardless of who
  generated it.
- **No AI overhead for HR** — from their side it's a form and a button. No prompts,
  no settings, no "skills" concept exposed.

---

## 2. Scope

### v1 features — Recruiting

| Feature | Inputs | Output |
|---|---|---|
| Job description generator | title, seniority, team, must-haves, nice-to-haves, comp range, work arrangement | Full JD: summary, responsibilities, must/nice-to-have split, team context, comp, inclusive closing |
| JD rewriter | paste existing JD | Rewritten for inclusive language, debiased requirements, structure |
| Interview question generator | role, competencies, interview type (behavioral/technical/culture) | Grouped question set with follow-ups |
| Scorecard builder | role + competencies (or the generated question set) | Structured rating scorecard with strong/weak answer guidance per competency |

### v1 features — Onboarding

| Feature | Inputs | Output |
|---|---|---|
| 30/60/90-day plan generator | role, manager, key goals/stakeholders | Phased milestone plan |
| Onboarding checklist generator | start date, department, systems/equipment needed | Week-by-week checklist |
| Welcome email drafter | role, team, start date | First-day welcome message |

### Cross-cutting features

- **Company profile page** — one-time setup: benefits blurb, DEI statement, comp bands
  by level, culture description. Every generation pulls from this automatically instead
  of the user retyping boilerplate. *(Highest-leverage feature — makes output sound like
  the company, not generic AI text.)*
- **Editable output** — result lands in an editable box, not a locked answer.
- **Export** — copy to clipboard, download as `.docx`.
- **History** — per-user log of past generations, duplicate/riff on old ones.

### Added to v1 scope **[revised]**

- **Send email from the tool** — the welcome-email drafter (and any draft) can be sent
  straight from the app instead of copying into Outlook. Sends as the signed-in user via
  Microsoft Graph, landing in their real Sent Items. **Gated behind Entra ID** — see
  Section 6.
- **Streamed generation** — generations take ~20 seconds. The response streams so the user
  sees text appear rather than staring at a spinner. This is an API-shape decision, not a
  polish item; see Section 7.
- **Draft versions** — each saved edit is kept, exposed as the design's `Versions` tab.
- **History search, filters and sort** — search by title, filter by tool and date range.
- **Team access screen** — HR admins provision and deactivate users.
- **Rename / delete draft** — delete nulls the text but keeps the audit record.

All six come from the finished front-end design, which specifies working UI for them.

### Explicitly out of scope for v1 **[revised]**

The source repo covers ~130 HR domains (compensation, performance management,
compliance, workforce planning, DEI programs, M&A, etc.). None of that is in v1.
Add domains one at a time, after v1 is validated with real usage — resist scope creep
here, it's the easiest way to turn a 2-week build into a 2-month one.

Also cut, despite appearing in the design:

- **"Send this JD to the careers site"** — an integration with an external careers site.
  The confirm dialog is built as a reusable pattern; nothing is wired to a real publish.
- **"Copy share link"** — needs a share-token model and an access decision first.

---

## 3. Architecture **[revised]**

```
Browser — React SPA (Vite build, served from the API's wwwroot)
   |  fills form, clicks "Generate"
   v
IIS  (TLS termination, reverse proxy, ASP.NET Core Module in-process)
   v
HrDraft.Api — one .NET 10 process on the company server
   |  Core: loads the vendored SKILL.md for the tool
   |        merges company profile (SQL Server) + form inputs
   |        builds the prompt with cache breakpoints
   v
Anthropic API (claude-sonnet-5)  — streamed
   |  tokens stream back
   v
Api -> SPA over SSE
   |  skeleton resolves into text as it arrives
   |  render as editable Markdown
   |  buttons: copy / export .docx / save to history / send email
```

Two key principles:

- The Anthropic API key lives **only** in server-side environment variables. It is never
  sent to, or callable from, the browser.
- The SPA and the API are **one deployable unit on one origin** — Vite builds into
  `HrDraft.Api/wwwroot` and .NET serves it with a SPA fallback route. One IIS site,
  no CORS, one artifact to deploy.

---

## 4. Stack **[revised]**

| Layer | Choice | Why |
|---|---|---|
| Backend | **.NET 10 Web API**, layered `Api` / `Core` / `Service` / `DAL` / `Model` | Matches how everything else here is built; .NET 10 is current LTS |
| Frontend | **React 19 + Vite + TypeScript** | SPA served from the API; no SSR needed for an internal tool |
| UI | **The design's own plain CSS** (Modernist, rebranded) | The design ships a complete system — zero radius, 2px ink rules, flush-left labels. Tailwind or shadcn would fight it, not help. See [design-system-rules.md](design-system-rules.md) |
| Animation | **`motion`** (Motion for React) for state/presence/layout; CSS for hover and `:active` | Exit animations, height-to-auto and the segmented control's sliding indicator all need a JS animator. Pointer feedback stays in CSS — no React render, runs on the compositor. Presets in `src/lib/motion.ts` |
| Hosting | **IIS** on a new company server, ASP.NET Core Module in-process | Windows shop; no external hosting, no per-request cost |
| Auth | **Entra ID** (Microsoft Entra) via Microsoft.Identity.Web | Same credentials as their devices; offboarding is automatic. Local login ships first — see Section 6 |
| Database | **New dedicated DB on the existing SQL Server instance**, low-privilege login | No new database technology, no new licence, already backed up |
| ORM | **EF Core 10** (`Microsoft.EntityFrameworkCore.SqlServer`), repositories in the DAL | Code-first migrations; repositories keep EF types out of Core |
| Rate limiting | **Derived from `Generations`**, no counter table | Cannot drift, no midnight reset job to fail silently |
| AI calls | **`Anthropic`** official C# SDK, server-side only, **streamed** | Model default `claude-sonnet-5` ($2/$10 per MTok) |
| Docx export | **`DocumentFormat.OpenXml`**, server-side | Exports hit the audit log; generation sits next to the Markdown |
| Email | **Microsoft Graph** `sendMail`, delegated | Sends as the user, appears in their Sent Items |
| Source control | **TFS** | This shop does not use Git |
| Deploys | TFS get → build → publish → recycle the IIS app pool | No CI/CD platform for v1; automate once the manual step is a bottleneck |

**Swap points:**
- If the server can only run **.NET 8**, nothing in the design changes — retarget the
  `.csproj` files.
- If EF Core's generated SQL disappoints on the history or audit queries, the DAL's
  repository interfaces let those two drop to Dapper or a stored proc without touching Core.

---

## 5. Source: hr-skills repo

Repo: `github.com/tuanductran/hr-skills` — MIT licensed, ~130 skill folders, each with
a `SKILL.md` (~800–1,100 words) plus `content/`, `examples/`, and `prompts/` subfolders.
Each `SKILL.md` is small enough to inject directly into a system prompt — no RAG or
vector search needed for a scoped tool like this.

**v1 mapping — vendor these into `HrDraft.Service/Content/Skills/` (don't fetch live):**

| App feature | Source file(s) |
|---|---|
| Job description generator / rewriter | `skills/hr-job-description/SKILL.md` |
| Interview question generator | `skills/hr-interviewing/SKILL.md`, `skills/hr-recruiting/prompts/writing-competency-based-interview-questions.md` |
| Scorecard builder | `skills/hr-interviewing/SKILL.md` |
| 30/60/90-day plan generator | `skills/hr-onboarding/SKILL.md`, `skills/hr-onboarding/examples/create-30-60-90-day-onboarding-plan.md` |
| Onboarding checklist generator | `skills/hr-onboarding/SKILL.md`, `skills/hr-onboarding/prompts/employee-onboarding.md` |
| Welcome email drafter | `skills/hr-onboarding/SKILL.md` (no dedicated file — light custom prompt) |

`Tools.SkillFileNames` in the database maps each tool to its files, so the mapping is data
rather than a `switch`.

**Update process:** the repo is versioned (currently v1.0.2) with a CHANGELOG. Periodically
diff your vendored copies against new upstream releases before pulling in changes — don't
auto-sync, since a prompt change upstream could alter output quality without warning.

---

## 6. Authentication **[revised — resolved]**

**Decision: Entra ID.** The company runs Microsoft 365, so a tenant already exists. This
was the best of the three options the original spec listed, and it is the *only* one that
also delivers the email feature — Graph `sendMail` needs a delegated user token, which
ADFS-only or LDAP-bind auth never produces.

### Phased rollout

**Phase 2 — local login.** Email + password against `Users.PasswordHash`, hashed with
ASP.NET Core's built-in `PasswordHasher<T>`. Lets the whole app be built and tested before
the admin finishes the app registration.

**Phase 3 — Entra swap.** `IIdentityProvider` has two implementations:

| Implementation | When |
|---|---|
| `LocalPasswordIdentityProvider` | Phase 2 |
| `EntraIdIdentityProvider` | Phase 3, via Microsoft.Identity.Web |

The login controller validates through the interface and issues the **same cookie** either
way, so the swap touches no controller, no authorization rule, and no session code.
`Users.EntraObjectId` exists from the first migration, so linking an existing local user to
their Entra identity on first SSO login is an `UPDATE`, not a migration.

The design's "Continue with Microsoft 365" button ships **disabled with a "coming soon"
hint** in Phase 2 rather than hidden — it's in the design, it tells HR where this is going,
and it goes live with a one-line change.

### Full stack

| Layer | Approach |
|---|---|
| Identity | Entra ID (local password until the registration is ready) |
| Sessions | **ASP.NET Core cookie auth** — HttpOnly, Secure, SameSite=Lax. Not JWT: the SPA is same-origin, so cookies are simpler and keep no token in JS |
| Authorization | The `Users` table **is** the allowlist. `Role` = HrUser \| HrAdmin |
| Cost/abuse protection | Per-user daily generation cap, derived from `Generations` |
| Audit trail | `AuditLog` — who did what, when, from which IP |
| Transport | HTTPS at IIS. Internal CA cert if intranet-only, public cert if reachable outside |

### Email consequence — worth stating plainly

Graph delegated `sendMail` needs a token for the signed-in user, and that token only exists
once Entra login is in. **v1 cannot actually send mail**, no matter how the code is
arranged. So `IEmailSender` and the entire UI path ship in Phase 2 behind a
`NoOpEmailSender` that reports "email not configured yet"; `GraphEmailSender` lands in
Phase 3. That is the honest sequence — the alternative (an SMTP relay with a service
account spoofing the From address) produces mail that never appears in the sender's Sent
Items, which is worse than waiting.

---

## 7. Things easy to miss — checklist before launch

- [ ] **Human review step** — job descriptions and offer-related content should get a
      quick human check before external use (compensation transparency laws, EEO
      language vary by jurisdiction). The tool drafts; a person still signs off.
      *The design makes this a persistent banner plus a "Mark reviewed" action —
      `Generations.IsReviewed`.*
- [ ] **Data retention policy** — decide how long generation history is kept, especially
      if any onboarding fields touch personal data of new hires. Check this against
      company data-retention policy / GDPR if there are EU employees.
      *`AppSettings.GenerationHistoryRetentionDays`, default 730.*
- [ ] **Error handling UX** — what the user sees if the Anthropic API call fails or
      times out (retry button, not a blank screen).
- [ ] **Streaming, not a spinner [revised]** — generations run ~20 seconds. The design
      specifies a skeleton "while streaming" and an elapsed-time progress bar, so the
      generate endpoint streams over SSE from day one. Decide this in Phase 2: retrofitting
      streaming onto a request/response endpoint means rewriting both ends.
- [ ] **Cost monitoring** — set a budget alert in the Anthropic console, not just the
      per-user rate limit, so a bug can't run up a silent bill.
- [ ] **Verify prompt caching actually caches [revised]** — the minimum cacheable prefix is
      ~1024 tokens. Check `Usage.CacheReadInputTokens` on a second identical run rather
      than assuming; if a short `SKILL.md` misses the floor, fold it and the company
      profile under one cache breakpoint.
- [ ] **A staging/test path** — a second IIS site on a different port against a separate
      SQL Server database, so changes can be checked before they hit the HR team.
      No git-push preview environments here, so this needs to be set up deliberately.
- [ ] **Secrets management** — `ANTHROPIC_API_KEY`, the SQL Server connection string, and
      the Entra client secret as environment variables / IIS app settings, excluded via
      `.tfignore`, never committed, never in client-side code.
- [ ] **Server-side backups** — confirm the SQL Server instance is already covered by
      whatever backup routine the company runs; if not, this new database needs one too.
- [ ] **Max output length** — set a sensible `MaxTokens` per feature so a generation
      can't run unexpectedly long (and cost more than expected). *`Tools.MaxOutputTokens`.*
- [ ] **Prompt injection awareness** — if any user-supplied text (e.g. a pasted JD to
      rewrite) is long or copied from an external source, keep it clearly scoped as
      "content to rewrite" in the prompt structure, not free-floating instructions.
- [ ] **Attribution** — not legally required under MIT, but worth a line in your own
      README crediting the source repo.
- [ ] **Basic accessibility** — form labels, keyboard navigation; low effort, easy to
      forget on an internal tool. *The design mandates 44px touch targets and a 2px
      focus-visible ring, which covers a good part of this.*

---

## 8. Questions for the admin **[revised — narrowed to what's unresolved]**

Server and hosting are settled: a new Windows server is being provisioned, the database
goes on it, so there are no hosting costs. What remains:

**Entra ID (blocks the email feature and Phase 3):**
1. Register an app in Entra ID for this tool — client ID, tenant ID, client secret.
2. Grant it **`Mail.Send` delegated** permission (needed to send as the signed-in user).
3. Confirm the redirect URI once the server hostname is known.

**Database:**
4. New dedicated database on the SQL Server instance, plus a low-privilege SQL login
   scoped to just that database.
5. Is that instance already in the backup routine, or does this database need one added?
6. Any naming convention or approval process for new databases on the instance?

**Network and certs:**
7. Open outbound HTTPS to `api.anthropic.com` through the firewall.
8. TLS cert for the new server — internal CA, or public if it's reachable from outside?
9. Install the **ASP.NET Core 10 runtime** (Hosting Bundle) on the server. If only .NET 8
   is permitted, say so before the build starts — it's a one-line retarget then, a
   rework later.

**Ops:**
10. Is there a company policy on secrets management (a vault already in use) rather than
    environment variables?
11. Any data retention policy to apply to generation history, especially anything touching
    new-hire personal data?

---

## 9. Suggested build order **[revised]**

**Phase 1 — UI, static, on mock data**
1. Plan docs into `docs/HR_Tools_App/` *(done)*.
2. Scaffold Vite + React + TS; port the token and component sheets; wire the design's
   own oxlint adherence config.
3. Build the component library from the design's UI kit — every state.
4. Layouts, then the six screens at all three widths (1280 / 834 / 390).
5. Tool registry + all seven tool forms.

**Phase 2 — Backend**
6. Solution + five projects; DbContext, entities, first migration.
7. Cookie auth + local login + user seeding.
8. Company profile CRUD (versioned).
9. Anthropic integration — streaming, prompt caching, JD generator end-to-end.
10. Remaining six tools.
11. History, audit log, rate limiting.
12. `.docx` export.
13. Point the SPA off mocks at the real API.

**Phase 3 — Entra + email**
14. Entra ID auth swap.
15. Graph `sendMail`.

**Phase 4 — Deploy**
16. IIS site, staging site, secrets, backup confirmation, Anthropic budget alert.

Then: ship to the HR team, gather feedback, and only then consider the next skill domain.
