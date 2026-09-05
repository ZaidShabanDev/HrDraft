using HrDraft.Model.Entities;

namespace HrDraft.DAL.Seed;

internal static class AppSettingSeed
{
    internal static AppSetting[] Rows =>
    [
        new()
        {
            SettingKey = AppSettingKeys.DefaultDailyGenerationLimit,
            SettingValue = "20",
            Description = "Runs per person per day when the user row does not override it.",
            UpdatedUtc = SeedConstants.Timestamp,
        },
        new()
        {
            SettingKey = AppSettingKeys.ClaudeModelId,
            SettingValue = "claude-sonnet-5",
            Description = "Model used for every generation. Changing it needs no deploy.",
            UpdatedUtc = SeedConstants.Timestamp,
        },
        new()
        {
            SettingKey = AppSettingKeys.GenerationHistoryRetentionDays,
            SettingValue = "730",
            Description =
                "Age at which a draft's text is nulled. The row and its audit entries stay.",
            UpdatedUtc = SeedConstants.Timestamp,
        },
    ];
}
