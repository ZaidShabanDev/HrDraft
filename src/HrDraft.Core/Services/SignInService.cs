using HrDraft.Core.Abstractions;
using HrDraft.Model;
using HrDraft.Model.Entities;
using Microsoft.Extensions.Logging;

namespace HrDraft.Core.Services;

public enum SignInFailure
{
    /// <summary>Unknown address, or wrong password. Kept indistinguishable to the caller's caller.</summary>
    InvalidCredentials,

    /// <summary>The row exists but <c>IsActive</c> is 0 — an offboarded user.</summary>
    AccountDisabled,

    /// <summary>No verifier is registered for this user's authentication source.</summary>
    MethodNotAvailable,
}

public sealed record SignInOutcome
{
    public bool Succeeded => User is not null;

    public User? User { get; private init; }

    public SignInFailure? Failure { get; private init; }

    public static SignInOutcome Success(User user) => new() { User = user };

    public static SignInOutcome Denied(SignInFailure failure) => new() { Failure = failure };
}

/// <summary>
/// The single entry point for signing in, whichever method was used. Records the audit
/// entry, stamps <c>LastLoginUtc</c> and hands back the user; building the cookie is the
/// API layer's job, so this stays free of any ASP.NET reference.
/// </summary>
public sealed class SignInService(
    IUserRepository users,
    IEnumerable<ICredentialVerifier> verifiers,
    IPasswordHasher passwordHasher,
    IAuditService audit,
    IUnitOfWork unitOfWork,
    TimeProvider timeProvider,
    ILogger<SignInService> logger)
{
    /// <summary>
    /// Compared against when the address is unknown, so a missing account and a wrong
    /// password take the same time. Without it, response timing enumerates who has an account.
    /// </summary>
    private const string TimingEqualiserPassword = "hrdraft-timing-equaliser";

    public async Task<SignInOutcome> SignInWithPasswordAsync(
        string email,
        string password,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        var user = await users.GetByEmailAsync(email, cancellationToken);

        if (user is null)
        {
            passwordHasher.Verify(passwordHasher.Hash(TimingEqualiserPassword), password);
            return await DenyAsync(SignInFailure.InvalidCredentials, null, email, ipAddress, cancellationToken);
        }

        if (!user.IsActive)
        {
            return await DenyAsync(SignInFailure.AccountDisabled, user.UserId, email, ipAddress, cancellationToken);
        }

        var verifier = verifiers.FirstOrDefault(v => v.Source == user.AuthSource);
        if (verifier is null)
        {
            logger.LogWarning(
                "No credential verifier registered for {AuthSource}; user {UserId} cannot sign in with a password.",
                user.AuthSource,
                user.UserId);

            return await DenyAsync(SignInFailure.MethodNotAvailable, user.UserId, email, ipAddress, cancellationToken);
        }

        var verification = await verifier.VerifyAsync(user, password, cancellationToken);
        if (!verification.Succeeded)
        {
            return await DenyAsync(SignInFailure.InvalidCredentials, user.UserId, email, ipAddress, cancellationToken);
        }

        if (verification.RehashRequired)
        {
            user.PasswordHash = passwordHasher.Hash(password);
        }

        return await GrantAsync(user, user.AuthSource, ipAddress, cancellationToken);
    }

    /// <summary>
    /// The Entra path (Phase 3). Matches on the object id first and falls back to the email
    /// address, which is how an existing local user gets linked to their Entra identity on
    /// first SSO sign-in without a migration.
    /// </summary>
    public async Task<SignInOutcome> SignInExternalAsync(
        string entraObjectId,
        string email,
        string displayName,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        var user = await users.GetByEntraObjectIdAsync(entraObjectId, cancellationToken)
                   ?? await users.GetByEmailAsync(email, cancellationToken);

        if (user is null)
        {
            // Authenticating with the tenant is not authorisation: the Users table is the
            // allowlist, so an unprovisioned colleague is turned away rather than created.
            return await DenyAsync(SignInFailure.InvalidCredentials, null, email, ipAddress, cancellationToken);
        }

        if (!user.IsActive)
        {
            return await DenyAsync(SignInFailure.AccountDisabled, user.UserId, email, ipAddress, cancellationToken);
        }

        user.EntraObjectId = entraObjectId;
        user.AuthSource = AuthSource.EntraId;
        if (!string.IsNullOrWhiteSpace(displayName))
        {
            user.DisplayName = displayName;
        }

        return await GrantAsync(user, AuthSource.EntraId, ipAddress, cancellationToken);
    }

    private async Task<SignInOutcome> GrantAsync(
        User user,
        AuthSource via,
        string? ipAddress,
        CancellationToken cancellationToken)
    {
        user.LastLoginUtc = timeProvider.GetUtcNow().UtcDateTime;

        audit.Record(
            AuditActions.Login,
            user.UserId,
            AuditEntityTypes.User,
            user.UserId.ToString(),
            new { via = via.ToString() },
            ipAddress);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return SignInOutcome.Success(user);
    }

    private async Task<SignInOutcome> DenyAsync(
        SignInFailure failure,
        int? userId,
        string attemptedEmail,
        string? ipAddress,
        CancellationToken cancellationToken)
    {
        // The reason is recorded but never returned to the browser — see the API's login
        // endpoint, which collapses every failure into one message.
        audit.Record(
            AuditActions.LoginFailed,
            userId,
            AuditEntityTypes.User,
            userId?.ToString(),
            new { reason = failure.ToString(), email = attemptedEmail },
            ipAddress);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return SignInOutcome.Denied(failure);
    }
}
