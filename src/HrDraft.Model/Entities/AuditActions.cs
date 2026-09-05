namespace HrDraft.Model.Entities;

/// <summary>
/// The closed set of values written to <c>AuditLog.Action</c>. Constants rather than an
/// enum because the column is read directly by whoever audits the tool, and a string reads
/// better in that context than a number they have to look up.
/// </summary>
public static class AuditActions
{
    public const string Login = "Login";
    public const string LoginFailed = "LoginFailed";
    public const string Logout = "Logout";
    public const string Generate = "Generate";
    public const string GenerateFailed = "GenerateFailed";
    public const string MarkReviewed = "MarkReviewed";
    public const string RenameDraft = "RenameDraft";
    public const string DeleteDraft = "DeleteDraft";
    public const string Export = "Export";
    public const string EmailSend = "EmailSend";
    public const string ProfileUpdate = "ProfileUpdate";
    public const string UserCreated = "UserCreated";
    public const string UserDeactivated = "UserDeactivated";
}

/// <summary>Values written to <c>AuditLog.EntityType</c>.</summary>
public static class AuditEntityTypes
{
    public const string Generation = "Generation";
    public const string CompanyProfile = "CompanyProfile";
    public const string User = "User";
    public const string EmailMessage = "EmailMessage";
}
