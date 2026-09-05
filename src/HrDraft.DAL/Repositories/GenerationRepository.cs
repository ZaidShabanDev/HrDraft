using HrDraft.Core;
using HrDraft.Core.Abstractions;
using HrDraft.Model;
using HrDraft.Model.Entities;
using Microsoft.EntityFrameworkCore;

namespace HrDraft.DAL.Repositories;

public sealed class GenerationRepository(HrDraftDbContext context) : IGenerationRepository
{
    /// <summary>
    /// Deleted drafts are not returned. Their text is gone by design, so there is nothing
    /// for the draft screen to show — the record of who ran what lives in the audit log.
    /// </summary>
    public Task<Generation?> GetByIdAsync(long generationId, CancellationToken cancellationToken = default) =>
        context.Generations
            .Include(g => g.Tool)
            .Include(g => g.User)
            .Include(g => g.Revisions.OrderBy(r => r.VersionNumber))
            .FirstOrDefaultAsync(g => g.GenerationId == generationId && !g.IsDeleted, cancellationToken);

    public async Task<PagedResult<Generation>> SearchAsync(
        GenerationQuery query,
        PageRequest page,
        CancellationToken cancellationToken = default)
    {
        var filtered = context.Generations
            .AsNoTracking()
            .Where(g => !g.IsDeleted);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim();
            filtered = filtered.Where(g => g.Title.Contains(term));
        }

        if (query.ToolId is { } toolId)
        {
            filtered = filtered.Where(g => g.ToolId == toolId);
        }

        if (query.UserId is { } userId)
        {
            filtered = filtered.Where(g => g.UserId == userId);
        }

        if (query.FromUtc is { } fromUtc)
        {
            filtered = filtered.Where(g => g.CreatedUtc >= fromUtc);
        }

        if (query.ToUtc is { } toUtc)
        {
            filtered = filtered.Where(g => g.CreatedUtc < toUtc);
        }

        var total = await filtered.CountAsync(cancellationToken);
        if (total == 0)
        {
            return PagedResult<Generation>.Empty(page.PageSize);
        }

        var ordered = query.NewestFirst
            ? filtered.OrderByDescending(g => g.CreatedUtc)
            : filtered.OrderBy(g => g.CreatedUtc);

        var items = await ordered
            .Include(g => g.Tool)
            .Include(g => g.User)
            .Skip(page.Skip)
            .Take(page.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Generation>(items, total, page.Page, page.PageSize);
    }

    /// <summary>
    /// Deleted runs still count: the quota is about how much the tool was used, and deleting
    /// a draft afterwards did not un-spend it.
    /// </summary>
    public Task<int> CountSinceAsync(int userId, DateTime dayStartUtc, CancellationToken cancellationToken = default) =>
        context.Generations
            .CountAsync(
                g => g.UserId == userId
                     && g.CreatedUtc >= dayStartUtc
                     && g.Status != GenerationStatus.Failed,
                cancellationToken);

    public async Task<IReadOnlyList<Generation>> GetRecentForToolAsync(
        int userId,
        int toolId,
        int take,
        CancellationToken cancellationToken = default) =>
        await context.Generations
            .AsNoTracking()
            .Where(g => g.UserId == userId
                        && g.ToolId == toolId
                        && !g.IsDeleted
                        && g.Status == GenerationStatus.Succeeded)
            .OrderByDescending(g => g.CreatedUtc)
            .Take(take)
            .ToListAsync(cancellationToken);

    public void Add(Generation generation) => context.Generations.Add(generation);

    public void AddRevision(GenerationRevision revision) => context.GenerationRevisions.Add(revision);
}
