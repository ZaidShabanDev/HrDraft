using HrDraft.Model.Entities;

namespace HrDraft.Core.Abstractions;

public interface ILookupOptionRepository
{
    /// <summary>
    /// Includes disabled options, because the design renders them greyed out rather than
    /// hiding them — a blocked choice HR can see is less confusing than one that vanished.
    /// </summary>
    Task<IReadOnlyList<LookupOption>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LookupOption>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>Guards against a form submitting a value that is disabled or does not exist.</summary>
    Task<bool> IsSelectableAsync(string category, string value, CancellationToken cancellationToken = default);
}

public interface ITeamRepository
{
    Task<IReadOnlyList<Team>> GetActiveAsync(CancellationToken cancellationToken = default);

    void Add(Team team);
}

public interface IAppSettingRepository
{
    Task<string?> GetValueAsync(string key, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<AppSetting>> GetAllAsync(CancellationToken cancellationToken = default);

    Task SetValueAsync(string key, string value, CancellationToken cancellationToken = default);
}

public interface IAuditLogRepository
{
    /// <summary>Append only. There is no update and no delete, by design.</summary>
    void Add(AuditEntry entry);

    Task<PagedResult<AuditEntry>> SearchAsync(
        int? userId,
        string? action,
        PageRequest page,
        CancellationToken cancellationToken = default);
}

public interface IEmailMessageRepository
{
    Task<EmailMessage?> GetByIdAsync(long emailMessageId, CancellationToken cancellationToken = default);

    void Add(EmailMessage message);
}
