namespace HrDraft.Model.Entities;

/// <summary>
/// One line of the audit trail — table <c>AuditLog</c>. Append-only: no updates and no
/// deletes, not even when the generation it refers to is deleted. That is the whole point
/// of the table.
/// </summary>
public class AuditEntry
{
    public long AuditId { get; set; }

    /// <summary>Null on a failed sign-in, where there is no user to attribute it to.</summary>
    public int? UserId { get; set; }

    /// <summary>See <see cref="AuditActions"/>.</summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>See <see cref="AuditEntityTypes"/>.</summary>
    public string? EntityType { get; set; }

    public string? EntityId { get; set; }

    /// <summary>
    /// Context for the action. Must never carry the draft text or a password — the audit
    /// log outlives the soft delete that is supposed to remove that text.
    /// </summary>
    public string? DetailJson { get; set; }

    public string? IpAddress { get; set; }

    public DateTime CreatedUtc { get; set; }

    public User? User { get; set; }
}
