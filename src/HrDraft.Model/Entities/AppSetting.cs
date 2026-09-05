namespace HrDraft.Model.Entities;

/// <summary>
/// Runtime settings an admin can change without a deploy. Anything secret — the API key,
/// the connection string, the client secret — stays in environment variables instead.
/// </summary>
public class AppSetting
{
    public string SettingKey { get; set; } = string.Empty;

    public string SettingValue { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime UpdatedUtc { get; set; }
}

/// <summary>The seeded keys. Reading one that is missing is a bug, not a default.</summary>
public static class AppSettingKeys
{
    public const string DefaultDailyGenerationLimit = "DefaultDailyGenerationLimit";
    public const string ClaudeModelId = "ClaudeModelId";
    public const string GenerationHistoryRetentionDays = "GenerationHistoryRetentionDays";
}
