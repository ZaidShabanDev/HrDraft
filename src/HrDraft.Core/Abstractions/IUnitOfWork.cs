namespace HrDraft.Core.Abstractions;

/// <summary>
/// Repositories stage changes; this commits them. Kept separate so one request can write a
/// generation and its audit entry in a single round trip, and so a partial write cannot
/// leave the audit trail disagreeing with what happened.
/// </summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Runs <paramref name="operation"/> inside a database transaction. Only needed where a
    /// second write depends on the first one's generated key.
    /// </summary>
    Task<TResult> InTransactionAsync<TResult>(
        Func<CancellationToken, Task<TResult>> operation,
        CancellationToken cancellationToken = default);
}
