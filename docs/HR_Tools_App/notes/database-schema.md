# Database Schema — HrDraft

SQL Server, EF Core code-first with migrations. One dedicated database on the existing
company instance, accessed by a low-privilege login scoped to it.

Naming follows the .NET side: PascalCase tables and columns, `<Entity>Id` primary keys,
`*Utc` on every timestamp (store UTC, format in the UI).

---

## Entity overview

```
Users ──────────┬──< Generations >──── Tools
                │         │  │
                │         │  └──< GenerationRevisions
                │         │
                │         └──> CompanyProfiles ──< CompBands
                │
                ├──< EmailMessages
                └──< AuditLog

LookupOptions   Teams   AppSettings        (reference data, no FKs)
```

---

## Identity and access

### `Users`

| Column | Type | Notes |
|---|---|---|
| `UserId` | `int` IDENTITY | PK |
| `Email` | `nvarchar(256)` | NOT NULL, unique index. Collation pinned to `SQL_Latin1_General_CP1_CI_AS` |
| `DisplayName` | `nvarchar(200)` | NOT NULL |
| `EntraObjectId` | `nvarchar(64)` | NULL. Filtered unique index `WHERE EntraObjectId IS NOT NULL` |
| `PasswordHash` | `nvarchar(500)` | NULL — local login only; stays NULL for Entra users |
| `AuthSource` | `tinyint` | `1 = Local`, `2 = EntraId`, `3 = Ldap` |
| `Role` | `tinyint` | `1 = HrUser`, `2 = HrAdmin` |
| `IsActive` | `bit` | NOT NULL, default 1 |
| `DailyGenerationLimit` | `int` | NULL → fall back to `AppSettings` |
| `CreatedUtc` | `datetime2` | NOT NULL |
| `LastLoginUtc` | `datetime2` | NULL |

**This table is the allowlist.** The spec called for a separate allowlist; a row here with
`IsActive = 1` is the same thing with one less object to keep in sync. An HR admin
provisions users through the "Team access" screen in the account menu.

`Email` carries an explicit case-insensitive collation rather than relying on the database
default. Two reasons: nobody types their own address the same way twice, and comparing on
`LOWER(Email)` instead would turn every sign-in into an index scan.

`AuthSource` gained `3 = Ldap` during implementation — the front end already ships an LDAP
sign-in option, and an LDAP user has their password checked by the domain controller, so
they need a source that is neither Local nor EntraId.

`EntraObjectId` exists from day one even though nothing writes it until Phase 3 — linking
an existing local user to their Entra identity on first SSO login is then an `UPDATE`
rather than a schema migration.

---

## Company profile

### `CompanyProfiles`

| Column | Type | Notes |
|---|---|---|
| `CompanyProfileId` | `int` IDENTITY | PK |
| `CompanyName` | `nvarchar(200)` | NOT NULL |
| `BenefitsBlurb` | `nvarchar(max)` | NULL |
| `DeiStatement` | `nvarchar(max)` | NULL |
| `CultureDescription` | `nvarchar(max)` | NULL |
| `IsCurrent` | `bit` | NOT NULL. Filtered unique index `WHERE IsCurrent = 1` |
| `UpdatedByUserId` | `int` | FK → `Users` |
| `UpdatedUtc` | `datetime2` | NOT NULL |

**Versioned, not updated in place.** Saving inserts a new row and flips `IsCurrent`. The
reason: `Generations.CompanyProfileId` pins each draft to the exact boilerplate that fed
it, so an audit six months later can show what the JD actually said about benefits at the
time. This table gets a handful of rows a year — the storage cost is nil and the
alternative (mutating in place) makes the audit trail a lie.

### `CompBands`

| Column | Type | Notes |
|---|---|---|
| `CompBandId` | `int` IDENTITY | PK |
| `CompanyProfileId` | `int` | FK → `CompanyProfiles`, cascade delete |
| `LevelCode` | `nvarchar(20)` | `L3`, `L4`, `L5` |
| `MinAmount` | `decimal(18,2)` | NULL |
| `MaxAmount` | `decimal(18,2)` | NULL |
| `CurrencyCode` | `nvarchar(3)` | NULL — `EUR` |
| `BonusPercent` | `decimal(5,2)` | NULL |
| `DisplayOverride` | `nvarchar(100)` | NULL |
| `SortOrder` | `int` | NOT NULL |

The design shows these as free text (`€85–105k`). Stored structured instead so the JD
generator can inject a real band and the UI formats consistently. `DisplayOverride` is the
escape hatch for when HR wants exact wording that doesn't come out of a formatter.

---

## Tools

### `Tools`

| Column | Type | Notes |
|---|---|---|
| `ToolId` | `int` | PK, **explicit seeded values, not IDENTITY** |
| `ToolKey` | `varchar(64)` | NOT NULL, unique — `job-description` |
| `Category` | `nvarchar(50)` | `Recruiting` \| `Onboarding` |
| `DisplayName` | `nvarchar(100)` | NOT NULL |
| `DisplayNumber` | `varchar(4)` | `01`…`07` as shown on the cards |
| `Description` | `nvarchar(400)` | the card blurb |
| `ShortDescription` | `nvarchar(200)` | the trimmed blurb the phone list rows use |
| `SkillFileNames` | `nvarchar(500)` | `;`-separated relative paths to vendored `SKILL.md` files |
| `MaxOutputTokens` | `int` | the per-feature cap the spec's checklist requires |
| `RequiresHumanReview` | `bit` | NOT NULL — drives the "needs a human read" flag |
| `EstimatedSeconds` | `int` | NOT NULL — the form's "~20 seconds" and the progress bar target |
| `IsActive` | `bit` | NOT NULL |
| `SortOrder` | `int` | NOT NULL |

A table rather than a C# enum because three things read from it at runtime — the home grid,
the max-tokens cap, and request validation — and because it lets a misbehaving tool be
switched off with an `UPDATE` instead of a deploy. `ToolId` values are explicit so
`Generations.ToolId` stays stable across environments.

**Three columns were added during implementation** — `ShortDescription`,
`RequiresHumanReview` and `EstimatedSeconds`. All three were living in the front end's tool
registry, and moving them here sharpens the split the frontend doc describes: the database
owns everything the home grid *displays*, the registry owns only the form and result
components. `RequiresHumanReview` in particular has to be data — which documents carry
legal risk differs by company, and HrDraft is deployed by companies that never talk to us.

### Seed data

| Id | Key | Category | # | Name |
|---|---|---|---|---|
| 1 | `job-description` | Recruiting | 01 | Job description |
| 2 | `jd-rewriter` | Recruiting | 02 | JD rewriter |
| 3 | `interview-questions` | Recruiting | 03 | Interview questions |
| 4 | `scorecard` | Recruiting | 04 | Scorecard |
| 5 | `plan-30-60-90` | Onboarding | 05 | 30/60/90 plan |
| 6 | `onboarding-checklist` | Onboarding | 06 | Onboarding checklist |
| 7 | `welcome-email` | Onboarding | 07 | Welcome email |

---

## Generations

### `Generations`

| Column | Type | Notes |
|---|---|---|
| `GenerationId` | `bigint` IDENTITY | PK |
| `UserId` | `int` | FK → `Users` |
| `ToolId` | `int` | FK → `Tools` |
| `Title` | `nvarchar(300)` | `Senior Backend Engineer` — the history list label |
| `InputJson` | `nvarchar(max)` | form inputs exactly as submitted |
| `CompanyProfileId` | `int` | NULL, FK — which profile version fed it |
| `OutputMarkdown` | `nvarchar(max)` | NULL — what the model returned |
| `EditedMarkdown` | `nvarchar(max)` | NULL — the user's edits |
| `Status` | `tinyint` | `1 = Pending`, `2 = Succeeded`, `3 = Failed` |
| `ErrorMessage` | `nvarchar(1000)` | NULL |
| `ModelId` | `nvarchar(100)` | `claude-sonnet-5` — for reproducibility |
| `InputTokens` | `int` | NULL |
| `OutputTokens` | `int` | NULL |
| `CacheReadInputTokens` | `int` | NULL — proves prompt caching is working |
| `DurationMs` | `int` | NULL |
| `ParentGenerationId` | `bigint` | NULL, self FK |
| `IsReviewed` | `bit` | NOT NULL default 0 |
| `ReviewedByUserId` | `int` | NULL, FK → `Users` |
| `ReviewedUtc` | `datetime2` | NULL |
| `IsDeleted` | `bit` | NOT NULL default 0 |
| `CreatedUtc` | `datetime2` | NOT NULL |

Indexes: `(UserId, CreatedUtc DESC)` · `(ToolId, CreatedUtc DESC)`

**Why `OutputMarkdown` and `EditedMarkdown` are separate columns.** The audit log has to
be able to show what the model actually produced. If edits overwrite the output, that
record is gone and "the tool wrote this" becomes unfalsifiable. The model's text is
written once and never updated.

**Why `ParentGenerationId` exists.** It makes the design's next-step buttons a traceable
chain rather than three unrelated documents:

- *"Interview questions from this JD"* → child with `ToolId = 3`
- *"Scorecard from this JD"* → child with `ToolId = 4`
- *"Regenerate with changes"* → child with the same `ToolId`
- *"Duplicate & riff"* (history) → child with the same `ToolId`

**Delete semantics.** The design's own dialog copy sets the rule — *"The audit log keeps
the record of who generated it, but the text is gone."* So delete means: set `IsDeleted = 1`,
set `OutputMarkdown` and `EditedMarkdown` to `NULL`, keep the row, keep every `AuditLog`
entry. Never a hard delete — it would orphan the audit trail and break the parent chain.

### `GenerationRevisions`

Required by the **Versions** tab in artboard 3a, panel 05.

| Column | Type | Notes |
|---|---|---|
| `GenerationRevisionId` | `bigint` IDENTITY | PK |
| `GenerationId` | `bigint` | FK → `Generations`, cascade |
| `VersionNumber` | `int` | 1-based, unique per generation |
| `Markdown` | `nvarchar(max)` | NOT NULL |
| `IsModelOutput` | `bit` | 1 for version 1, 0 for every human save |
| `CreatedByUserId` | `int` | NULL on version 1 — nobody authored it. FK → `Users` |
| `CreatedUtc` | `datetime2` | NOT NULL |

Unique index `(GenerationId, VersionNumber)`. The desktop draft screen's *"draft 1 of 1"*
is `COUNT(*)` over this table.

---

## Reference data

### `LookupOptions`

Required by the Select in artboard 3a, panel 03 — specifically the disabled
*"Remote — global (policy blocked)"* option, which has to be data rather than a hard-coded
special case.

| Column | Type | Notes |
|---|---|---|
| `LookupOptionId` | `int` IDENTITY | PK |
| `Category` | `varchar(50)` | `WorkArrangement`, `SeniorityLevel`, `InterviewType` |
| `Value` | `varchar(64)` | stable code stored in `InputJson` |
| `Label` | `nvarchar(200)` | what HR sees |
| `ShortLabel` | `nvarchar(20)` | NULL — the phone segmented control's `Jr` / `Snr` |
| `GroupLabel` | `nvarchar(100)` | NULL — the dropdown's group header |
| `IsEnabled` | `bit` | 0 → renders greyed out, unselectable |
| `SortOrder` | `int` | NOT NULL |

Unique index `(Category, Value)`. One table for all three lookups — three near-identical
tables would be worse.

`ShortLabel` and `GroupLabel` were added during implementation. The design's phone
segmented control shows abbreviations and its dropdown shows a group header; both were
hard-coded in the mock data, and neither can stay hard-coded once a deployment renames the
options to its own wording.

Seeded values are deliberately location-neutral — `On-site`, `Hybrid`,
`Remote — within region`, `Remote — anywhere` — where the design mock used Munich. A
deployment renames them, and disables the ones its policy forbids, which is what produces
the design's greyed-out "policy blocked" option without it being a special case in code.

### `Teams`

Required by the typeahead's *"2 of 14 teams"* footer.

| Column | Type | Notes |
|---|---|---|
| `TeamId` | `int` IDENTITY | PK |
| `Name` | `nvarchar(150)` | NOT NULL, unique |
| `IsActive` | `bit` | NOT NULL default 1 |

**Not seeded.** Team names belong to whoever deploys the tool, and inventing a plausible
set would be worse than an empty typeahead — a fresh install would ship with somebody
else's org chart in it. Populating this needs an admin screen, which is still to build.

### `AppSettings`

| Column | Type | Notes |
|---|---|---|
| `SettingKey` | `varchar(100)` | PK |
| `SettingValue` | `nvarchar(max)` | NOT NULL |
| `Description` | `nvarchar(400)` | NULL |
| `UpdatedUtc` | `datetime2` | NOT NULL |

Seeded:

| Key | Value | Why |
|---|---|---|
| `DefaultDailyGenerationLimit` | `20` | the navbar's `12 / 20` |
| `ClaudeModelId` | `claude-sonnet-5` | swap models without a deploy |
| `GenerationHistoryRetentionDays` | `730` | the spec's retention checklist item |

---

## Email

### `EmailMessages`

| Column | Type | Notes |
|---|---|---|
| `EmailMessageId` | `bigint` IDENTITY | PK |
| `GenerationId` | `bigint` | NULL, FK — the draft that was sent |
| `SentByUserId` | `int` | FK → `Users` |
| `FromAddress` | `nvarchar(256)` | NOT NULL |
| `ToAddresses` | `nvarchar(max)` | NOT NULL, `;`-separated |
| `CcAddresses` | `nvarchar(max)` | NULL |
| `Subject` | `nvarchar(500)` | NOT NULL |
| `BodyHtml` | `nvarchar(max)` | NOT NULL |
| `Status` | `tinyint` | `1 = Queued`, `2 = Sent`, `3 = Failed` |
| `GraphMessageId` | `nvarchar(200)` | NULL — traceability back to the mailbox |
| `ErrorMessage` | `nvarchar(1000)` | NULL |
| `SentUtc` | `datetime2` | NULL |
| `CreatedUtc` | `datetime2` | NOT NULL |

Nothing writes `Status = Sent` until Phase 3 — see the email note in the spec.

---

## Audit

### `AuditLog`

| Column | Type | Notes |
|---|---|---|
| `AuditId` | `bigint` IDENTITY | PK |
| `UserId` | `int` | NULL (a failed login has no user), FK → `Users` |
| `Action` | `varchar(64)` | see below |
| `EntityType` | `varchar(64)` | NULL — `Generation`, `CompanyProfile`, `User` |
| `EntityId` | `nvarchar(64)` | NULL |
| `DetailJson` | `nvarchar(max)` | NULL |
| `IpAddress` | `nvarchar(64)` | NULL |
| `CreatedUtc` | `datetime2` | NOT NULL |

Indexes: `(CreatedUtc DESC)` · `(UserId, CreatedUtc DESC)`

Actions: `Login` · `LoginFailed` · `Logout` · `Generate` · `GenerateFailed` ·
`MarkReviewed` · `RenameDraft` · `DeleteDraft` · `Export` · `EmailSend` ·
`ProfileUpdate` · `UserCreated` · `UserDeactivated`

**Append-only.** No updates, no deletes, not even when a generation is deleted — that is
the whole point of the table.

---

## Rate limiting — no counter table

The spec called for a `generation_counts` table. Deriving it instead:

```sql
SELECT COUNT(*)
FROM   Generations
WHERE  UserId = @UserId
  AND  CreatedUtc >= @DayStartUtc
  AND  Status <> 3;          -- failures don't burn quota
```

Covered by the existing `(UserId, CreatedUtc DESC)` index. Two reasons this is better than
a counter: it cannot drift out of sync with reality, and there is no reset job to schedule
or to fail silently at midnight. `@DayStartUtc` is local midnight converted to UTC, so the
day boundary matches what HR expects.

---

## Retention

`GenerationHistoryRetentionDays` drives a scheduled cleanup that applies the same soft
delete as the UI — null the markdown, keep the row and the audit entries. Onboarding
inputs can contain new-hire personal data, which is what the spec's GDPR checklist item is
about; nulling the text satisfies it while leaving the audit trail intact.
