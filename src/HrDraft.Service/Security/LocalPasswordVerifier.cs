using HrDraft.Core.Abstractions;
using HrDraft.Model;
using HrDraft.Model.Entities;

namespace HrDraft.Service.Security;

public sealed class LocalPasswordVerifier(IPasswordHasher passwordHasher) : ICredentialVerifier
{
    public AuthSource Source => AuthSource.Local;

    public Task<CredentialVerification> VerifyAsync(
        User user,
        string password,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(user.PasswordHash))
        {
            // An account provisioned for SSO has no local password. Nothing to compare, and
            // nothing to explain to the caller beyond "no".
            return Task.FromResult(CredentialVerification.Failed);
        }

        var outcome = passwordHasher.Verify(user.PasswordHash, password) switch
        {
            PasswordCheck.Succeeded => CredentialVerification.Success(),
            PasswordCheck.SucceededNeedsRehash => CredentialVerification.Success(rehashRequired: true),
            _ => CredentialVerification.Failed,
        };

        return Task.FromResult(outcome);
    }
}
