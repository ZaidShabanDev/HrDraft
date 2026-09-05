using HrDraft.Core.Abstractions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;

namespace HrDraft.Service.Security;

/// <summary>
/// PBKDF2 through ASP.NET Core's own hasher, so the stored format is the well-reviewed one
/// rather than something written here.
/// </summary>
public sealed class AspNetCorePasswordHasher : IPasswordHasher
{
    /// <summary>
    /// OWASP's current figure for PBKDF2-HMAC-SHA512, which is what the V3 format uses. Set
    /// explicitly so raising it later is a visible change; accounts upgrade through the
    /// rehash path as people sign in.
    /// </summary>
    private const int IterationCount = 210_000;

    private readonly PasswordHasher<object> hasher = new(
        new OptionsWrapper<PasswordHasherOptions>(new PasswordHasherOptions
        {
            IterationCount = IterationCount,
        }));

    private static readonly object HashSubject = new();

    public string Hash(string password) => hasher.HashPassword(HashSubject, password);

    public PasswordCheck Verify(string storedHash, string password)
    {
        PasswordVerificationResult result;
        try
        {
            result = hasher.VerifyHashedPassword(HashSubject, storedHash, password);
        }
        catch (FormatException)
        {
            // A hash that is not valid base64 means a corrupted or hand-edited row, not a
            // wrong password. Treated the same way from outside, but it must not throw.
            return PasswordCheck.Failed;
        }

        return result switch
        {
            PasswordVerificationResult.Success => PasswordCheck.Succeeded,
            PasswordVerificationResult.SuccessRehashNeeded => PasswordCheck.SucceededNeedsRehash,
            _ => PasswordCheck.Failed,
        };
    }
}
