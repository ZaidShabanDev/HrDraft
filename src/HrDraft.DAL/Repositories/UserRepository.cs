using HrDraft.Core.Abstractions;
using HrDraft.Model.Entities;
using Microsoft.EntityFrameworkCore;

namespace HrDraft.DAL.Repositories;

public sealed class UserRepository(HrDraftDbContext context) : IUserRepository
{
    public Task<User?> GetByIdAsync(int userId, CancellationToken cancellationToken = default) =>
        context.Users.FirstOrDefaultAsync(u => u.UserId == userId, cancellationToken);

    /// <summary>
    /// Compared directly rather than through <c>ToLower()</c>: the column carries a
    /// case-insensitive collation, so this stays an index seek.
    /// </summary>
    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default) =>
        context.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

    public Task<User?> GetByEntraObjectIdAsync(string entraObjectId, CancellationToken cancellationToken = default) =>
        context.Users.FirstOrDefaultAsync(u => u.EntraObjectId == entraObjectId, cancellationToken);

    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await context.Users
            .OrderBy(u => u.DisplayName)
            .ToListAsync(cancellationToken);

    public Task<bool> AnyAsync(CancellationToken cancellationToken = default) =>
        context.Users.AnyAsync(cancellationToken);

    public void Add(User user) => context.Users.Add(user);
}
