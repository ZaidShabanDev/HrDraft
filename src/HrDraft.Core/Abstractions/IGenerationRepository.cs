using HrDraft.Model.Entities;

namespace HrDraft.Core.Abstractions;

/// <summary>History screen filters. Every field optional — the default is "everything, newest first".</summary>
public sealed record GenerationQuery
{
    /// <summary>Matched against <c>Title</c>.</summary>
    public string? Search { get; init; }

    public int? ToolId { get; init; }

    /// <summary>Null means every user's runs — the history screen is shared by the team.</summary>
    public int? UserId { get; init; }

    public DateTime? FromUtc { get; init; }

    public DateTime? ToUtc { get; init; }

    public bool NewestFirst { get; init; } = true;
}

public interface IGenerationRepository
{
    /// <summary>Includes the tool, the author and the revision list — the whole draft screen.</summary>
    Task<Generation?> GetByIdAsync(long generationId, CancellationToken cancellationToken = default);

    Task<PagedResult<Generation>> SearchAsync(
        GenerationQuery query,
        PageRequest page,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Runs by this user since <paramref name="dayStartUtc"/>, excluding failures. This is
    /// the daily cap — derived rather than counted in a column, so it cannot drift and there
    /// is no midnight reset job to fail silently.
    /// </summary>
    Task<int> CountSinceAsync(int userId, DateTime dayStartUtc, CancellationToken cancellationToken = default);

    /// <summary>The generator form's "Reuse a past run" list.</summary>
    Task<IReadOnlyList<Generation>> GetRecentForToolAsync(
        int userId,
        int toolId,
        int take,
        CancellationToken cancellationToken = default);

    void Add(Generation generation);

    void AddRevision(GenerationRevision revision);
}
