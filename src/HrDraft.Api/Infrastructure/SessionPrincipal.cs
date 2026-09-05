using System.Security.Claims;
using HrDraft.Model;
using HrDraft.Model.Entities;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace HrDraft.Api.Infrastructure;

/// <summary>
/// Builds and reads the session cookie's claims. Both sign-in paths — local password now,
/// Entra later — come through here, which is what keeps swapping the identity provider free
/// of controller and authorization changes.
/// </summary>
public static class SessionPrincipal
{
    public const string AuthSourceClaimType = "hrdraft:auth_source";

    public static ClaimsPrincipal Create(User user)
    {
        var identity = new ClaimsIdentity(
            [
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.DisplayName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim(AuthSourceClaimType, user.AuthSource.ToString()),
            ],
            CookieAuthenticationDefaults.AuthenticationScheme);

        return new ClaimsPrincipal(identity);
    }

    /// <summary>Null when the cookie is absent or malformed, never a thrown exception.</summary>
    public static int? GetUserId(this ClaimsPrincipal principal) =>
        int.TryParse(principal.FindFirstValue(ClaimTypes.NameIdentifier), out var userId) ? userId : null;

    public static bool IsHrAdmin(this ClaimsPrincipal principal) =>
        principal.IsInRole(nameof(UserRole.HrAdmin));
}

public static class AuthorizationPolicies
{
    /// <summary>Guards the Team access screen's endpoints.</summary>
    public const string HrAdmin = "HrAdmin";
}

public static class RateLimitPolicies
{
    public const string SignIn = "sign-in";
}
