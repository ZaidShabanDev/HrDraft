using HrDraft.Core.Abstractions;
using Microsoft.Extensions.Logging;

namespace HrDraft.Service.Email;

/// <summary>
/// Stands in until Entra sign-in lands and Graph can send as the signed-in user. Reports
/// <see cref="CanSend"/> as false so the UI never offers the action, and refuses rather than
/// pretending to succeed if something calls it anyway.
/// </summary>
public sealed class NoOpEmailSender(ILogger<NoOpEmailSender> logger) : IEmailSender
{
    public bool CanSend => false;

    public Task<EmailSendResult> SendAsync(EmailRequest request, CancellationToken cancellationToken = default)
    {
        logger.LogWarning(
            "Mail was requested for generation {GenerationId} but sending is not configured yet.",
            request.GenerationId);

        return Task.FromResult(EmailSendResult.Failure(
            "Sending mail from HrDraft needs Microsoft sign-in, which is not configured on this deployment yet."));
    }
}
