using HrDraft.Model;
using HrDraft.Model.Entities;

namespace HrDraft.Core.Abstractions;

/// <summary>
/// Checks a password for one authentication source. Local passwords ship first; an LDAP
/// bind is the second implementation.
///
/// Entra ID deliberately does not implement this: it is a browser redirect flow, not a
/// password the app ever sees, so it enters through
/// <see cref="Services.SignInService.SignInExternalAsync"/> instead. Both paths end in the
/// same cookie, which is what keeps the swap free of controller changes.
/// </summary>
public interface ICredentialVerifier
{
    AuthSource Source { get; }

    Task<CredentialVerification> VerifyAsync(
        User user,
        string password,
        CancellationToken cancellationToken = default);
}

public sealed record CredentialVerification(bool Succeeded, bool RehashRequired = false)
{
    public static readonly CredentialVerification Failed = new(false);

    public static CredentialVerification Success(bool rehashRequired = false) => new(true, rehashRequired);
}
