namespace HrDraft.Model.Entities;

/// <summary>
/// A draft sent by mail from inside the tool. Rows are written from Phase 2, but nothing
/// reaches <see cref="EmailStatus.Sent"/> until Entra sign-in lands: Graph's delegated
/// sendMail needs a token for the signed-in user, and that token does not exist before then.
/// </summary>
public class EmailMessage
{
    public long EmailMessageId { get; set; }

    public long? GenerationId { get; set; }

    public int SentByUserId { get; set; }

    public string FromAddress { get; set; } = string.Empty;

    /// <summary>Semicolon-separated.</summary>
    public string ToAddresses { get; set; } = string.Empty;

    public string? CcAddresses { get; set; }

    public string Subject { get; set; } = string.Empty;

    public string BodyHtml { get; set; } = string.Empty;

    public EmailStatus Status { get; set; } = EmailStatus.Queued;

    /// <summary>Graph's own id, so a message can be traced back to the sender's mailbox.</summary>
    public string? GraphMessageId { get; set; }

    public string? ErrorMessage { get; set; }

    public DateTime? SentUtc { get; set; }

    public DateTime CreatedUtc { get; set; }

    public Generation? Generation { get; set; }

    public User? SentByUser { get; set; }
}
