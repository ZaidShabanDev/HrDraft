using HrDraft.Model.Entities;

namespace HrDraft.DAL.Seed;

/// <summary>
/// Starting options for the form dropdowns. Deliberately location-neutral — a deployment
/// renames them to its own wording, or disables the ones its policy forbids.
///
/// Ids are numbered in blocks of ten per category so adding an option later never means
/// renumbering an existing one, and <c>Generations.InputJson</c> keeps meaning what it said.
/// </summary>
internal static class LookupOptionSeed
{
    internal static LookupOption[] Rows =>
    [
        new()
        {
            LookupOptionId = 1,
            Category = LookupCategories.WorkArrangement,
            Value = "onsite",
            Label = "On-site",
            GroupLabel = "Arrangement",
            IsEnabled = true,
            SortOrder = 1,
        },
        new()
        {
            LookupOptionId = 2,
            Category = LookupCategories.WorkArrangement,
            Value = "hybrid",
            Label = "Hybrid",
            GroupLabel = "Arrangement",
            IsEnabled = true,
            SortOrder = 2,
        },
        new()
        {
            LookupOptionId = 3,
            Category = LookupCategories.WorkArrangement,
            Value = "remote-regional",
            Label = "Remote — within region",
            GroupLabel = "Arrangement",
            IsEnabled = true,
            SortOrder = 3,
        },
        new()
        {
            LookupOptionId = 4,
            Category = LookupCategories.WorkArrangement,
            Value = "remote-global",
            Label = "Remote — anywhere",
            GroupLabel = "Arrangement",
            IsEnabled = true,
            SortOrder = 4,
        },

        new()
        {
            LookupOptionId = 11,
            Category = LookupCategories.SeniorityLevel,
            Value = "junior",
            Label = "Junior",
            ShortLabel = "Jr",
            IsEnabled = true,
            SortOrder = 1,
        },
        new()
        {
            LookupOptionId = 12,
            Category = LookupCategories.SeniorityLevel,
            Value = "mid",
            Label = "Mid",
            ShortLabel = "Mid",
            IsEnabled = true,
            SortOrder = 2,
        },
        new()
        {
            LookupOptionId = 13,
            Category = LookupCategories.SeniorityLevel,
            Value = "senior",
            Label = "Senior",
            ShortLabel = "Snr",
            IsEnabled = true,
            SortOrder = 3,
        },
        new()
        {
            LookupOptionId = 14,
            Category = LookupCategories.SeniorityLevel,
            Value = "lead",
            Label = "Lead",
            ShortLabel = "Lead",
            IsEnabled = true,
            SortOrder = 4,
        },

        new()
        {
            LookupOptionId = 21,
            Category = LookupCategories.InterviewType,
            Value = "behavioral",
            Label = "Behavioral",
            IsEnabled = true,
            SortOrder = 1,
        },
        new()
        {
            LookupOptionId = 22,
            Category = LookupCategories.InterviewType,
            Value = "technical",
            Label = "Technical",
            IsEnabled = true,
            SortOrder = 2,
        },
        new()
        {
            LookupOptionId = 23,
            Category = LookupCategories.InterviewType,
            Value = "culture",
            Label = "Culture add",
            IsEnabled = true,
            SortOrder = 3,
        },
    ];
}
