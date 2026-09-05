namespace HrDraft.Model.Entities;

/// <summary>
/// A person allowed to use HrDraft. This table <em>is</em> the allowlist — an active row
/// here is the only thing that grants access. Managed from the Team access screen.
/// </summary>
public class User
{
    public int UserId { get; set; }

    public string Email { get; set; } = string.Empty;

    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Written on first SSO sign-in. Present from the first migration so that linking an
    /// existing local user to their Entra identity is an UPDATE, not a schema change.
    /// </summary>
    public string? EntraObjectId { get; set; }

    /// <summary>Null for users who only ever sign in through an identity provider.</summary>
    public string? PasswordHash { get; set; }

    public AuthSource AuthSource { get; set; } = AuthSource.Local;

    public UserRole Role { get; set; } = UserRole.HrUser;

    public bool IsActive { get; set; } = true;

    /// <summary>Null falls back to the <c>DefaultDailyGenerationLimit</c> app setting.</summary>
    public int? DailyGenerationLimit { get; set; }

    public DateTime CreatedUtc { get; set; }

    public DateTime? LastLoginUtc { get; set; }
}
