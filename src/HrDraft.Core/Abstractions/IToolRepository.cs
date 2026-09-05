using HrDraft.Model.Entities;

namespace HrDraft.Core.Abstractions;

public interface IToolRepository
{
    /// <summary>Active tools only, in <c>SortOrder</c> — exactly what the home grid renders.</summary>
    Task<IReadOnlyList<Tool>> GetActiveAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns inactive tools too, so a request for a switched-off tool fails as forbidden
    /// rather than as not found.
    /// </summary>
    Task<Tool?> GetByKeyAsync(string toolKey, CancellationToken cancellationToken = default);

    Task<Tool?> GetByIdAsync(int toolId, CancellationToken cancellationToken = default);
}
