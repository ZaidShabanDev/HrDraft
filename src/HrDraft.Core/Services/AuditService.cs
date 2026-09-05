using System.Text.Json;
using HrDraft.Core.Abstractions;
using HrDraft.Model.Entities;

namespace HrDraft.Core.Services;

public sealed class AuditService(IAuditLogRepository repository, TimeProvider timeProvider) : IAuditService
{
    private static readonly JsonSerializerOptions DetailJsonOptions = new() { WriteIndented = false };

    public void Record(
        string action,
        int? userId = null,
        string? entityType = null,
        string? entityId = null,
        object? detail = null,
        string? ipAddress = null)
    {
        repository.Add(new AuditEntry
        {
            Action = action,
            UserId = userId,
            EntityType = entityType,
            EntityId = entityId,
            DetailJson = detail is null ? null : JsonSerializer.Serialize(detail, DetailJsonOptions),
            IpAddress = ipAddress,
            CreatedUtc = timeProvider.GetUtcNow().UtcDateTime,
        });
    }
}
