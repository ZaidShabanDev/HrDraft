namespace HrDraft.Core;

/// <summary>One page of results plus the total, which the history screen's count line needs.</summary>
public sealed record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize)
{
    public static PagedResult<T> Empty(int pageSize) => new([], 0, 1, pageSize);
}

/// <summary>
/// Page request. Clamped rather than validated: an out-of-range page size from a caller is
/// not worth a 400, and an unbounded one is a denial-of-service on the history query.
/// </summary>
public sealed record PageRequest
{
    public const int MaxPageSize = 100;

    public PageRequest(int page = 1, int pageSize = 25)
    {
        Page = page < 1 ? 1 : page;
        PageSize = pageSize is < 1 or > MaxPageSize ? Math.Clamp(pageSize, 1, MaxPageSize) : pageSize;
    }

    public int Page { get; }

    public int PageSize { get; }

    public int Skip => (Page - 1) * PageSize;
}
