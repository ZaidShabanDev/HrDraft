using HrDraft.Model.Entities;

namespace HrDraft.Core.Abstractions;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int userId, CancellationToken cancellationToken = default);

    /// <summary>Case-insensitive, because nobody types their own address consistently.</summary>
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    Task<User?> GetByEntraObjectIdAsync(string entraObjectId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>Whether any row exists at all — the first-run admin bootstrap turns on this.</summary>
    Task<bool> AnyAsync(CancellationToken cancellationToken = default);

    void Add(User user);
}
