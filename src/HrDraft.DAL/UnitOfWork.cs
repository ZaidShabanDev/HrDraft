using HrDraft.Core.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace HrDraft.DAL;

public sealed class UnitOfWork(HrDraftDbContext context) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
        context.SaveChangesAsync(cancellationToken);

    public async Task<TResult> InTransactionAsync<TResult>(
        Func<CancellationToken, Task<TResult>> operation,
        CancellationToken cancellationToken = default)
    {
        if (context.Database.CurrentTransaction is not null)
        {
            return await operation(cancellationToken);
        }

        // Retry-on-failure wraps the whole transaction, not individual statements, so the
        // work has to go through the execution strategy or a transient fault retries half of it.
        var strategy = context.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync(
            async token =>
            {
                await using var transaction = await context.Database.BeginTransactionAsync(token);
                var result = await operation(token);
                await transaction.CommitAsync(token);
                return result;
            },
            cancellationToken);
    }
}
