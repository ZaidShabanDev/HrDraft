using HrDraft.Core.Abstractions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace HrDraft.Api.Infrastructure;

/// <summary>
/// Re-checks the signed-in user against the database on every request, and drops the cookie
/// if the account has gone.
///
/// The alternative is trusting the cookie for its full lifetime, which would leave someone
/// who was deactivated this morning still working in the tool this afternoon. Offboarding
/// taking effect immediately is one of the reasons for putting the allowlist in the database,
/// so it has to be checked. One indexed primary-key lookup per request against a SQL Server
/// on the same box is not the cost worth optimising away here.
/// </summary>
public static class SessionValidator
{
    public static async Task ValidateAsync(CookieValidatePrincipalContext context)
    {
        var userId = context.Principal?.GetUserId();
        if (userId is null)
        {
            await RejectAsync(context);
            return;
        }

        var users = context.HttpContext.RequestServices.GetRequiredService<IUserRepository>();
        var user = await users.GetByIdAsync(userId.Value, context.HttpContext.RequestAborted);

        if (user is null || !user.IsActive)
        {
            await RejectAsync(context);
            return;
        }

        // A role change also has to take effect without waiting for the cookie to expire, so
        // the ticket is reissued when the claim no longer matches the row.
        if (!context.Principal!.IsInRole(user.Role.ToString()))
        {
            context.ReplacePrincipal(SessionPrincipal.Create(user));
            context.ShouldRenew = true;
        }
    }

    private static async Task RejectAsync(CookieValidatePrincipalContext context)
    {
        context.RejectPrincipal();
        await context.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    }
}
