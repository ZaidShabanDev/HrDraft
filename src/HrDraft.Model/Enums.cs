namespace HrDraft.Model;

/// <summary>How a user proves who they are. Stored as tinyint.</summary>
public enum AuthSource : byte
{
    /// <summary>Email and password against <c>Users.PasswordHash</c>.</summary>
    Local = 1,

    /// <summary>Browser redirect to Microsoft Entra ID. No password reaches the app.</summary>
    EntraId = 2,

    /// <summary>
    /// Direct bind against a domain controller. The app handles a real domain password in
    /// transit, so this one is only safe over HTTPS.
    /// </summary>
    Ldap = 3,
}

/// <summary>Stored as tinyint. Only HrAdmin reaches the Team access screen.</summary>
public enum UserRole : byte
{
    HrUser = 1,
    HrAdmin = 2,
}

/// <summary>Stored as tinyint. Failed generations do not count against the daily cap.</summary>
public enum GenerationStatus : byte
{
    Pending = 1,
    Succeeded = 2,
    Failed = 3,
}

/// <summary>
/// Stored as tinyint. Nothing writes <see cref="Sent"/> until Entra sign-in lands and
/// Graph can send as the signed-in user.
/// </summary>
public enum EmailStatus : byte
{
    Queued = 1,
    Sent = 2,
    Failed = 3,
}

/// <summary>Which section of the tools home grid a tool appears in. Stored as text.</summary>
public enum ToolCategory : byte
{
    Recruiting = 1,
    Onboarding = 2,
}
