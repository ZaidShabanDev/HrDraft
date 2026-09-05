using HrDraft.Core;
using HrDraft.Core.Abstractions;
using HrDraft.Model.Entities;
using Microsoft.EntityFrameworkCore;

namespace HrDraft.DAL.Repositories;

public sealed class LookupOptionRepository(HrDraftDbContext context) : ILookupOptionRepository
{
    public async Task<IReadOnlyList<LookupOption>> GetByCategoryAsync(
        string category,
        CancellationToken cancellationToken = default) =>
        await context.LookupOptions
            .AsNoTracking()
            .Where(o => o.Category == category)
            .OrderBy(o => o.SortOrder)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<LookupOption>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await context.LookupOptions
            .AsNoTracking()
            .OrderBy(o => o.Category)
            .ThenBy(o => o.SortOrder)
            .ToListAsync(cancellationToken);

    public Task<bool> IsSelectableAsync(
        string category,
        string value,
        CancellationToken cancellationToken = default) =>
        context.LookupOptions
            .AnyAsync(o => o.Category == category && o.Value == value && o.IsEnabled, cancellationToken);
}

public sealed class TeamRepository(HrDraftDbContext context) : ITeamRepository
{
    public async Task<IReadOnlyList<Team>> GetActiveAsync(CancellationToken cancellationToken = default) =>
        await context.Teams
            .AsNoTracking()
            .Where(t => t.IsActive)
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);

    public void Add(Team team) => context.Teams.Add(team);
}

public sealed class AppSettingRepository(HrDraftDbContext context, TimeProvider timeProvider) : IAppSettingRepository
{
    public async Task<string?> GetValueAsync(string key, CancellationToken cancellationToken = default) =>
        await context.AppSettings
            .AsNoTracking()
            .Where(s => s.SettingKey == key)
            .Select(s => s.SettingValue)
            .FirstOrDefaultAsync(cancellationToken);

    public async Task<IReadOnlyList<AppSetting>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await context.AppSettings
            .AsNoTracking()
            .OrderBy(s => s.SettingKey)
            .ToListAsync(cancellationToken);

    public async Task SetValueAsync(string key, string value, CancellationToken cancellationToken = default)
    {
        var setting = await context.AppSettings.FirstOrDefaultAsync(s => s.SettingKey == key, cancellationToken);

        if (setting is null)
        {
            context.AppSettings.Add(new AppSetting
            {
                SettingKey = key,
                SettingValue = value,
                UpdatedUtc = timeProvider.GetUtcNow().UtcDateTime,
            });
            return;
        }

        setting.SettingValue = value;
        setting.UpdatedUtc = timeProvider.GetUtcNow().UtcDateTime;
    }
}

public sealed class AuditLogRepository(HrDraftDbContext context) : IAuditLogRepository
{
    public void Add(AuditEntry entry) => context.AuditLog.Add(entry);

    public async Task<PagedResult<AuditEntry>> SearchAsync(
        int? userId,
        string? action,
        PageRequest page,
        CancellationToken cancellationToken = default)
    {
        var filtered = context.AuditLog.AsNoTracking();

        if (userId is { } id)
        {
            filtered = filtered.Where(a => a.UserId == id);
        }

        if (!string.IsNullOrWhiteSpace(action))
        {
            filtered = filtered.Where(a => a.Action == action);
        }

        var total = await filtered.CountAsync(cancellationToken);
        if (total == 0)
        {
            return PagedResult<AuditEntry>.Empty(page.PageSize);
        }

        var items = await filtered
            .OrderByDescending(a => a.CreatedUtc)
            .Include(a => a.User)
            .Skip(page.Skip)
            .Take(page.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<AuditEntry>(items, total, page.Page, page.PageSize);
    }
}

public sealed class EmailMessageRepository(HrDraftDbContext context) : IEmailMessageRepository
{
    public Task<EmailMessage?> GetByIdAsync(long emailMessageId, CancellationToken cancellationToken = default) =>
        context.EmailMessages
            .FirstOrDefaultAsync(m => m.EmailMessageId == emailMessageId, cancellationToken);

    public void Add(EmailMessage message) => context.EmailMessages.Add(message);
}
