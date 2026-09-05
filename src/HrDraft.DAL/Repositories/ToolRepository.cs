using HrDraft.Core.Abstractions;
using HrDraft.Model.Entities;
using Microsoft.EntityFrameworkCore;

namespace HrDraft.DAL.Repositories;

public sealed class ToolRepository(HrDraftDbContext context) : IToolRepository
{
    public async Task<IReadOnlyList<Tool>> GetActiveAsync(CancellationToken cancellationToken = default) =>
        await context.Tools
            .Where(t => t.IsActive)
            .OrderBy(t => t.SortOrder)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

    public Task<Tool?> GetByKeyAsync(string toolKey, CancellationToken cancellationToken = default) =>
        context.Tools
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.ToolKey == toolKey, cancellationToken);

    public Task<Tool?> GetByIdAsync(int toolId, CancellationToken cancellationToken = default) =>
        context.Tools
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.ToolId == toolId, cancellationToken);
}
