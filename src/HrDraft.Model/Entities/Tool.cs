namespace HrDraft.Model.Entities;

/// <summary>
/// One document type HrDraft can produce. Reference data rather than a C# enum because
/// three things read it at runtime — the home grid, the output-token cap and request
/// validation — and because a misbehaving tool can then be switched off with an UPDATE
/// instead of a deploy.
/// </summary>
public class Tool
{
    /// <summary>Assigned explicitly, not IDENTITY, so values match across environments.</summary>
    public int ToolId { get; set; }

    /// <summary>Matches <c>toolKey</c> in the front end's tool registry.</summary>
    public string ToolKey { get; set; } = string.Empty;

    public ToolCategory Category { get; set; }

    public string DisplayName { get; set; } = string.Empty;

    /// <summary>The <c>01</c>…<c>07</c> shown on the cards.</summary>
    public string DisplayNumber { get; set; } = string.Empty;

    public string? Description { get; set; }

    /// <summary>The trimmed blurb the phone list rows use in place of <see cref="Description"/>.</summary>
    public string? ShortDescription { get; set; }

    /// <summary>
    /// Semicolon-separated paths, relative to the vendored skill library root, of the
    /// <c>SKILL.md</c> files that make up this tool's system prompt.
    /// </summary>
    public string? SkillFileNames { get; set; }

    public int MaxOutputTokens { get; set; }

    /// <summary>
    /// Whether a draft from this tool carries the "needs a human read" flag. Data, not a
    /// hard-coded list, because which documents carry legal risk differs by company.
    /// </summary>
    public bool RequiresHumanReview { get; set; }

    /// <summary>Drives the form's "~20 seconds" copy and the progress bar's target.</summary>
    public int EstimatedSeconds { get; set; }

    public bool IsActive { get; set; } = true;

    public int SortOrder { get; set; }
}
