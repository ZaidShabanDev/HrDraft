# Backend — Layout and Runbook

.NET 10, five projects, SQL Server through EF Core. This is the "how do I get it running"
document; the *why* of each table is in [database-schema.md](database-schema.md) and the
overall decisions are in [hr-tools-app-spec.md](hr-tools-app-spec.md).

---

## Projects

```
HrDraft.sln
├── src/HrDraft.Model      entities, enums, column-value constants. References nothing.
├── src/HrDraft.Core       interfaces + business logic. No EF Core reference, on purpose.
├── src/HrDraft.DAL        DbContext, entity configs, seed data, migrations, repositories.
├── src/HrDraft.Service    outbound integrations: password hashing, mail, later Anthropic.
└── src/HrDraft.Api        the only executable. Controllers, DI, middleware, wwwroot.
```

Reference direction is one way: `Api → Service, DAL, Core, Model` · `DAL → Core, Model` ·
`Service → Core, Model` · `Core → Model`.

**Core declares, DAL and Service implement.** Repository interfaces in Core return entities
rather than `IQueryable`, so nothing outside the DAL can accidentally depend on EF Core.
That is what makes the spec's escape hatch real: if EF's generated SQL disappoints on the
history or audit queries, those repositories can drop to Dapper or a stored procedure with
no change above them.

`Directory.Build.props` at the solution root holds `TargetFramework`. Retargeting to .NET 8,
if the server turns out not to have the .NET 10 hosting bundle, is that one line.

---

## Where each secret lives

**`appsettings.json` is committed, so nothing sensitive goes in it.** Real values live in
`src/HrDraft.Api/appsettings.Local.json`, which is gitignored and excluded from publish
output. Copy `appsettings.Local.example.json` and fill it in.

| Value | Where |
|---|---|
| SQL connection string | `ConnectionStrings:HrDraft` in `appsettings.Local.json` |
| First admin's password | `HrDraft:BootstrapAdmin:Password`, only until the account exists |
| Anthropic API key | `ANTHROPIC_API_KEY` environment variable (used from Phase 2's generation work) |
| Entra client secret | Phase 3 |

Two details about that file, both deliberate:

**It is loaded in every environment**, not only Development. `dotnet ef` does not read
`launchSettings.json`, so an environment-specific file would leave migrations with no
connection string and a confusing failure. Being last in the chain, it also wins over
everything else — which is what you want from a local override, and harmless in production
where the file does not exist.

**`CopyToPublishDirectory="Never"`** in the csproj. It reaches `bin` so local runs and the EF
tooling find it, but never a publish artifact. On a server the same values come from
environment variables or the IIS app settings.

Startup **throws** if the connection string is missing, rather than falling back to a
default. A silent fallback to LocalDB is how you end up writing test data into the wrong
database for a week without noticing.

Two things the connection string needs that are easy to leave out:

- **`TrustServerCertificate=True`** unless the SQL Server has a certificate from a CA the
  machine trusts. `Microsoft.Data.SqlClient` encrypts by default now and refuses the
  connection otherwise — the error names the certificate chain, not the setting.
- **`Initial Catalog=HrDraft`**. It does not have to exist yet; see below.

---

## First run

```powershell
# 1. The EF tooling, pinned to the same version as the packages
dotnet tool restore

# 2. Create the first migration (from the solution root)
dotnet ef migrations add InitialSchema --project src/HrDraft.DAL --startup-project src/HrDraft.Api

# 3. Apply it
dotnet ef database update --project src/HrDraft.DAL --startup-project src/HrDraft.Api
```

**You do not create the database by hand.** `database update` issues `CREATE DATABASE` when
the catalog named in the connection string is absent, then applies the schema and the seed
rows. The login needs `CREATE DATABASE` rights for that one step — which is the honest
argument for running the first migration as an administrator and pointing the *application*
at a low-privilege login afterwards, rather than giving the app DDL rights permanently.

`--startup-project` is not optional: it is where the connection string is read from. There
is deliberately no `IDesignTimeDbContextFactory`, because one would take priority over the
API's configuration and quietly give you a second place a connection string can hide.

**Migrations are never applied at startup.** The app's SQL login is meant to be
low-privilege, `Database.Migrate()` needs DDL rights, and two IIS worker processes racing to
migrate the same database is a bad afternoon. Applying a migration is a deliberate step in
the deploy.

The migration carries the seed data — the seven tools, the form dropdown options and three
app settings. Team names are deliberately **not** seeded; they are company-specific and
belong to whoever deploys it.

### The first administrator

On startup, if `Users` is empty and `HrDraft:BootstrapAdmin` is configured, one HrAdmin is
created and the fact is written to the audit log. If `Users` is empty and nothing is
configured, it logs a warning saying nobody can sign in and carries on.

It only ever runs against an empty table. Anything else would reset a password on every
restart and would resurrect an account someone had deliberately deactivated. Clear the
bootstrap settings once you can sign in.

---

## Running both halves in development

Two processes:

```powershell
dotnet run --project src/HrDraft.Api      # https://localhost:7001
```
```powershell
cd src/HrDraft.Web ; npm run dev          # http://localhost:5173
```

Vite proxies `/api` to `https://localhost:7001` (`vite.config.ts`), so the browser sees one
origin and the session cookie behaves the way it will in production. Use the Vite URL, not
the API's.

In production there is one process: `npm run build` writes into `HrDraft.Api/wwwroot` and
the API serves it with a SPA fallback. If `wwwroot/index.html` is absent the static-file
middleware is skipped entirely, so the API still starts and answers — useful before the
first front-end build, and it keeps a missing build from looking like a routing bug.

---

## Authentication

Cookie auth, `HttpOnly` + `Secure` + `SameSite=Lax`. Not JWT: the SPA is same-origin, so a
cookie is simpler and keeps no token in reachable JavaScript. `SameSite=Lax` is also the
CSRF defence — the browser withholds the cookie on the cross-site POST a forged request
would have to be.

Three things in the pipeline are worth knowing about:

**The default policy is "authenticated".** `SetFallbackPolicy` means a new endpoint is
protected unless it says `[AllowAnonymous]`. The other way round, one forgotten attribute
publishes data. `GET /api/config`, `POST /api/auth/login`, `/api/health` and the SPA
fallback are the deliberate exceptions.

**401 and 403, never a redirect.** Cookie auth's default is a 302 to a login page, which
arrives in `fetch()` as a 200 with an HTML body — indistinguishable from success. Both
redirect events are replaced with status codes.

**The session is re-checked on every request.** `OnValidatePrincipal` loads the user row
and drops the cookie if the account is gone or deactivated, and reissues the ticket if the
role changed. The alternative is trusting a 12-hour cookie, which would leave someone
deactivated this morning still working in the tool this afternoon. One primary-key lookup
per request against a SQL Server on the same box is not the cost to optimise away.

Sign-in failures return **one** message whatever went wrong. Which of "no such address",
"wrong password" and "account disabled" it was goes to the audit log; telling an anonymous
caller would hand them a way to enumerate accounts. For the same reason a missing address
still gets a password hashed, so the response time does not give it away.

`POST /api/auth/login` is rate-limited to 10 attempts per 5 minutes per IP. That is about
password guessing and is separate from the daily generation quota, which is about cost.

### Swapping in Entra later

`ICredentialVerifier` covers the password-based methods — local now, LDAP if it is ever
wanted. Entra is a browser redirect and never gives the app a password, so it enters
through `SignInService.SignInExternalAsync` instead. Both paths end at the same
`SessionPrincipal.Create`, so the swap touches no controller and no authorization rule.

Authenticating with the tenant is **not** authorisation: `SignInExternalAsync` matches on
object id, falls back to email, and turns away anyone with no row. The `Users` table stays
the allowlist.

---

## Endpoints so far

| Method | Route | Auth | Notes |
|---|---|---|---|
| `GET` | `/api/config` | anonymous | Branding, enabled sign-in methods, daily limit. Shape matches the front end's `appConfig.ts`. |
| `POST` | `/api/auth/login` | anonymous | Rate-limited. Sets the session cookie. |
| `POST` | `/api/auth/logout` | signed in | |
| `GET` | `/api/auth/me` | signed in | Reads the live row, so a role or quota change shows up on the next request. |
| `GET` | `/api/health` | anonymous | Liveness for IIS. |

`/api/config` reads the daily limit from the database but falls back to configuration if
that read fails, so a database problem still leaves a sign-in screen that renders properly
and reports the real error — instead of a blank page.

---

## Two invariants enforced in code

**The audit log is append-only.** `HrDraftDbContext.SaveChanges` throws if anything tries to
update or delete an `AuditEntry`. The rule was documented; now it is enforced, because a
documented rule survives exactly as long as everyone remembers it.

**One current company profile.** A filtered unique index on `IsCurrent = 1` makes two
current versions impossible. `AddAsNewCurrentAsync` therefore has to clear the old flag
*before* inserting — which is immediate, not deferred to `SaveChanges` — so it must be
called inside `IUnitOfWork.InTransactionAsync`. That is stated on the interface.

---

## Still to build

In the order the spec's build plan puts them:

- Company profile read/write endpoints
- Tools, lookups and teams endpoints, so the SPA can drop `mocks/mockData.ts`
- Vendor the `SKILL.md` files into `HrDraft.Service/Content/Skills/`
- Anthropic integration: prompt assembly with cache breakpoints, streamed over SSE
- The seven tool prompts, then history, rate limiting and `.docx` export
- Team access admin endpoints (`AuthorizationPolicies.HrAdmin` is already wired)
