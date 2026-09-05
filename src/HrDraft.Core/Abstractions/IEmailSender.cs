namespace HrDraft.Core.Abstractions;

public sealed record EmailRequest(
    string ToAddresses,
    string? CcAddresses,
    string Subject,
    string BodyHtml,
    long? GenerationId);

public sealed record EmailSendResult(bool Sent, string? ProviderMessageId, string? ErrorMessage)
{
    public static EmailSendResult Success(string? providerMessageId) => new(true, providerMessageId, null);

    public static EmailSendResult Failure(string error) => new(false, null, error);
}

/// <summary>
/// Sends a draft by mail as the signed-in user.
///
/// The real implementation needs a delegated Graph token, which only exists once Entra
/// sign-in is in — so until then this is a no-op. <see cref="CanSend"/> exists so the UI can
/// say the feature is not available yet instead of accepting a click and failing afterwards.
/// Deliberately not an SMTP relay with a spoofed From: mail that never lands in the sender's
/// Sent Items is worse than mail that waits.
/// </summary>
public interface IEmailSender
{
    bool CanSend { get; }

    Task<EmailSendResult> SendAsync(EmailRequest request, CancellationToken cancellationToken = default);
}
