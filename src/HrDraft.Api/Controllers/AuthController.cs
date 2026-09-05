using HrDraft.Api.Contracts;
using HrDraft.Api.Infrastructure;
using HrDraft.Core.Abstractions;
using HrDraft.Core.Options;
using HrDraft.Core.Services;
using HrDraft.Model.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;

namespace HrDraft.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    SignInService signIn,
    IUserRepository users,
    QuotaService quota,
    IAuditService audit,
    IUnitOfWork unitOfWork,
    IOptions<HrDraftOptions> options) : ControllerBase
{
    /// <summary>
    /// One message for every kind of failure. Which of "no such address", "wrong password"
    /// and "account disabled" it was goes to the audit log, not to the browser — telling an
    /// anonymous caller which one it was hands them a way to enumerate accounts.
    /// </summary>
    private const string SignInFailedMessage = "That email and password combination did not work.";

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting(RateLimitPolicies.SignIn)]
    public async Task<ActionResult<CurrentUserResponse>> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        if (!options.Value.Auth.Local)
        {
            return Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Password sign-in is switched off",
                detail: "This deployment signs in through its identity provider instead.");
        }

        var outcome = await signIn.SignInWithPasswordAsync(
            request.Email.Trim(),
            request.Password,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            cancellationToken);

        if (!outcome.Succeeded)
        {
            return Problem(statusCode: StatusCodes.Status401Unauthorized, title: SignInFailedMessage);
        }

        var user = outcome.User!;

        await HttpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            SessionPrincipal.Create(user),
            new AuthenticationProperties { IsPersistent = true });

        var status = await quota.GetStatusAsync(user, cancellationToken);
        return CurrentUserResponse.From(user, status);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();

        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

        audit.Record(
            AuditActions.Logout,
            userId,
            AuditEntityTypes.User,
            userId?.ToString(),
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Read on every page load, so it reports the live row rather than what the cookie was
    /// issued with — a role change or a raised daily limit shows up on the next request.
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<CurrentUserResponse>> Me(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
        {
            return Unauthorized();
        }

        var user = await users.GetByIdAsync(userId.Value, cancellationToken);
        if (user is null || !user.IsActive)
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Unauthorized();
        }

        var status = await quota.GetStatusAsync(user, cancellationToken);
        return CurrentUserResponse.From(user, status);
    }
}
