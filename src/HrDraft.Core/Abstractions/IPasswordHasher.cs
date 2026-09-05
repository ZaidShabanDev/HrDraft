namespace HrDraft.Core.Abstractions;

public interface IPasswordHasher
{
    string Hash(string password);

    PasswordCheck Verify(string storedHash, string password);
}

public enum PasswordCheck
{
    Failed = 0,
    Succeeded = 1,

    /// <summary>
    /// Correct password, but hashed with older parameters. The caller re-hashes and saves,
    /// so raising the work factor upgrades accounts as people sign in.
    /// </summary>
    SucceededNeedsRehash = 2,
}
