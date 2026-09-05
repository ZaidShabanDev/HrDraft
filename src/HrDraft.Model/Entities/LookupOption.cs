namespace HrDraft.Model.Entities;

/// <summary>
/// One selectable option for a form dropdown or segmented control. One table for every
/// lookup the forms need, keyed by <see cref="Category"/>, because three near-identical
/// tables would be worse.
/// </summary>
public class LookupOption
{
    public int LookupOptionId { get; set; }

    /// <summary>See <see cref="LookupCategories"/>.</summary>
    public string Category { get; set; } = string.Empty;

    /// <summary>The stable code stored in <c>Generations.InputJson</c>. Never renamed.</summary>
    public string Value { get; set; } = string.Empty;

    public string Label { get; set; } = string.Empty;

    /// <summary>The phone segmented control's abbreviation — <c>Snr</c> for Senior.</summary>
    public string? ShortLabel { get; set; }

    /// <summary>Optional group header in the dropdown.</summary>
    public string? GroupLabel { get; set; }

    /// <summary>
    /// Disabled options still render, greyed out and unselectable — the design's
    /// "Remote — anywhere (policy blocked)". Turning one off must not silently change what
    /// past drafts recorded, which is why the row stays.
    /// </summary>
    public bool IsEnabled { get; set; } = true;

    public int SortOrder { get; set; }
}

/// <summary>The values <see cref="LookupOption.Category"/> may take.</summary>
public static class LookupCategories
{
    public const string WorkArrangement = "WorkArrangement";
    public const string SeniorityLevel = "SeniorityLevel";
    public const string InterviewType = "InterviewType";
}
