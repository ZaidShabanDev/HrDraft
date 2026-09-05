namespace HrDraft.Core.Options;

/// <summary>
/// Everything a deployment changes to make HrDraft theirs, bound from the <c>HrDraft</c>
/// section of configuration. Mirrors the front end's <c>appConfig.ts</c>, because the
/// public part of this object is what <c>GET /api/config</c> returns.
///
/// Secrets are not here — the API key, the connection string and the Entra client secret
/// come from environment variables so they never sit in a file that gets committed.
/// </summary>
public sealed class HrDraftOptions
{
    public const string SectionName = "HrDraft";

    public BrandingOptions Branding { get; set; } = new();

    public AuthOptions Auth { get; set; } = new();

    public GenerationOptions Generation { get; set; } = new();

    public BootstrapAdminOptions BootstrapAdmin { get; set; } = new();
}

/// <summary>
/// The first administrator, created at startup only while the <c>Users</c> table is empty.
/// A fresh deployment has no way in otherwise, and seeding a fixed default password would be
/// worse — every clone would ship with the same known credentials.
///
/// Set these through environment variables
/// (<c>HrDraft__BootstrapAdmin__Email</c> / <c>__Password</c>) or user secrets, never in
/// appsettings.json: that file gets committed.
/// </summary>
public sealed class BootstrapAdminOptions
{
    public string? Email { get; set; }

    public string? Password { get; set; }

    public string? DisplayName { get; set; }

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(Email) && !string.IsNullOrWhiteSpace(Password);
}

public sealed class BrandingOptions
{
    /// <summary>The deploying company. Feeds generated documents as well as UI copy.</summary>
    public string CompanyName { get; set; } = "Your Company";

    /// <summary>The tool's own name. Only worth changing in a fork.</summary>
    public string ProductName { get; set; } = "HrDraft";

    public string Tagline { get; set; } = "Recruiting and onboarding documents, drafted";

    public string DepartmentName { get; set; } = "People & Culture";

    public string ConfidentialityNotice { get; set; } =
        "Drafts contain employee and salary data. Do not share outside the company.";

    /// <summary>Pre-fills the sign-in field's placeholder.</summary>
    public string EmailDomain { get; set; } = "example.com";

    public LogoOptions Logo { get; set; } = new();

    public ThemeOptions Theme { get; set; } = new();
}

public sealed class LogoOptions
{
    /// <summary>Path under <c>wwwroot</c>. Null falls back to the text wordmark.</summary>
    public string? OnDark { get; set; }

    public string? OnLight { get; set; }

    public string Wordmark { get; set; } = "HrDraft";
}

public sealed class ThemeOptions
{
    /// <summary>
    /// The one value most deployments change. The whole 100–950 ramp derives from it in
    /// OKLCH at fixed lightness steps, so contrast holds for any hue.
    /// </summary>
    public string Brand { get; set; } = "#0d93ea";

    /// <summary>
    /// Per-step overrides for a brand guideline that specifies exact values. Keys are ramp
    /// steps, <c>"100"</c> through <c>"950"</c>; anything left out stays derived.
    /// </summary>
    public Dictionary<string, string> BrandRamp { get; set; } = [];

    public string? Danger { get; set; }
}

public sealed class AuthOptions
{
    /// <summary>Email and password against the app's own user table.</summary>
    public bool Local { get; set; } = true;

    public EntraOptions Entra { get; set; } = new();

    public LdapOptions Ldap { get; set; } = new();

    /// <summary>How long a session cookie stays valid, sliding on activity.</summary>
    public int SessionHours { get; set; } = 12;
}

public sealed class EntraOptions
{
    public bool Enabled { get; set; }

    public string ButtonLabel { get; set; } = "Continue with Microsoft";

    /// <summary>Not a secret, but not published either — kept out of <c>/api/config</c>.</summary>
    public string? TenantId { get; set; }

    public string? ClientId { get; set; }
}

public sealed class LdapOptions
{
    public bool Enabled { get; set; }

    public string DomainLabel { get; set; } = "Domain username";

    public string? Server { get; set; }

    public string? BaseDn { get; set; }
}

public sealed class GenerationOptions
{
    /// <summary>
    /// Overridden at runtime by the <c>ClaudeModelId</c> app setting, so a model can be
    /// swapped from the database without a deploy.
    /// </summary>
    public string ModelId { get; set; } = "claude-sonnet-5";

    /// <summary>
    /// Where the vendored skill library lives, relative to the app's content root.
    /// Read from disk at startup — never fetched live, because an upstream prompt change
    /// could alter output quality with no warning.
    /// </summary>
    public string SkillLibraryPath { get; set; } = "Content/Skills";

    public int RequestTimeoutSeconds { get; set; } = 120;

    public int DefaultDailyGenerationLimit { get; set; } = 20;
}
