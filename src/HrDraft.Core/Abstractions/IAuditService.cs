namespace HrDraft.Core.Abstractions;

/// <summary>
/// Writes the audit trail. Stages the entry only — the caller's
/// <see cref="IUnitOfWork.SaveChangesAsync"/> commits it, so an action and its audit line
/// land together or not at all.
/// </summary>
public interface IAuditService
{
    void Record(
        string action,
        int? userId = null,
        string? entityType = null,
        string? entityId = null,
        object? detail = null,
        string? ipAddress = null);
}
