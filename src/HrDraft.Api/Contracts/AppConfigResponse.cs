using HrDraft.Core.Options;

namespace HrDraft.Api.Contracts;

/// <summary>
/// What <c>GET /api/config</c> returns. Matches the front end's <c>AppConfig</c> in
/// <c>src/config/appConfig.ts</c> field for field — the login screen needs the logo, the
/// product name and the enabled sign-in methods before anyone has signed in.
///
/// Public and pre-auth, so it carries only what is safe to hand an anonymous caller. The
/// Entra tenant and client ids stay behind, even though they are not strictly secret.
/// </summary>
public sealed record AppConfigResponse(
    BrandingResponse Branding,
    AuthMethodsResponse Auth,
    int DailyGenerationLimit)
{
    public static AppConfigResponse From(HrDraftOptions options, int dailyGenerationLimit) =>
        new(
            BrandingResponse.From(options.Branding),
            AuthMethodsResponse.From(options.Auth),
            dailyGenerationLimit);
}

public sealed record BrandingResponse(
    string CompanyName,
    string ProductName,
    string Tagline,
    string DepartmentName,
    string ConfidentialityNotice,
    string EmailDomain,
    LogoResponse Logo,
    ThemeResponse Theme)
{
    public static BrandingResponse From(BrandingOptions branding) =>
        new(
            branding.CompanyName,
            branding.ProductName,
            branding.Tagline,
            branding.DepartmentName,
            branding.ConfidentialityNotice,
            branding.EmailDomain,
            new LogoResponse(branding.Logo.OnDark, branding.Logo.OnLight, branding.Logo.Wordmark),
            new ThemeResponse(
                branding.Theme.Brand,
                branding.Theme.BrandRamp.Count == 0 ? null : branding.Theme.BrandRamp,
                branding.Theme.Danger));
}

public sealed record LogoResponse(string? OnDark, string? OnLight, string Wordmark);

public sealed record ThemeResponse(string Brand, IReadOnlyDictionary<string, string>? BrandRamp, string? Danger);

public sealed record AuthMethodsResponse(bool Local, EntraMethodResponse Entra, LdapMethodResponse Ldap)
{
    public static AuthMethodsResponse From(AuthOptions auth) =>
        new(
            auth.Local,
            // Reported as enabled only when it could actually work. A method that is switched
            // on but not configured would render a button that fails on click, and the front
            // end hides what it cannot use rather than greying it out.
            new EntraMethodResponse(
                auth.Entra.Enabled
                && !string.IsNullOrWhiteSpace(auth.Entra.TenantId)
                && !string.IsNullOrWhiteSpace(auth.Entra.ClientId),
                auth.Entra.ButtonLabel),
            new LdapMethodResponse(
                auth.Ldap.Enabled && !string.IsNullOrWhiteSpace(auth.Ldap.Server),
                auth.Ldap.DomainLabel));
}

public sealed record EntraMethodResponse(bool Enabled, string ButtonLabel);

public sealed record LdapMethodResponse(bool Enabled, string DomainLabel);
