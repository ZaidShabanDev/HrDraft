namespace HrDraft.Model.Entities;

/// <summary>
/// One run of one tool: the inputs, what the model returned, and what it cost.
/// See docs/HR_Tools_App/notes/database-schema.md § Generations.
/// </summary>
public class Generation
{
    public long GenerationId { get; set; }

    public int UserId { get; set; }

    public int ToolId { get; set; }

    /// <summary>The history list's label, derived from the inputs by the tool registry.</summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>Form inputs exactly as submitted, so a run can be replayed or duplicated.</summary>
    public string InputJson { get; set; } = "{}";

    /// <summary>Which company profile version fed this draft.</summary>
    public int? CompanyProfileId { get; set; }

    /// <summary>
    /// What the model returned. Written once and never updated — the audit trail has to be
    /// able to show what the tool produced, not what someone edited it into.
    /// </summary>
    public string? OutputMarkdown { get; set; }

    /// <summary>The user's edits. Null until someone saves a change.</summary>
    public string? EditedMarkdown { get; set; }

    public GenerationStatus Status { get; set; } = GenerationStatus.Pending;

    public string? ErrorMessage { get; set; }

    /// <summary>Recorded per run, so output stays reproducible after a model swap.</summary>
    public string? ModelId { get; set; }

    public int? InputTokens { get; set; }

    public int? OutputTokens { get; set; }

    /// <summary>Non-zero on a repeat run proves the prompt cache is actually being hit.</summary>
    public int? CacheReadInputTokens { get; set; }

    public int? DurationMs { get; set; }

    /// <summary>
    /// Set when this run came from another draft — the design's "Interview questions from
    /// this JD", "Regenerate with changes" and "Duplicate &amp; riff" buttons.
    /// </summary>
    public long? ParentGenerationId { get; set; }

    public bool IsReviewed { get; set; }

    public int? ReviewedByUserId { get; set; }

    public DateTime? ReviewedUtc { get; set; }

    /// <summary>
    /// Soft delete. Deleting also nulls both markdown columns and keeps every audit entry:
    /// the record of who generated it survives, the text does not.
    /// </summary>
    public bool IsDeleted { get; set; }

    public DateTime CreatedUtc { get; set; }

    public User? User { get; set; }

    public Tool? Tool { get; set; }

    public CompanyProfile? CompanyProfile { get; set; }

    public Generation? ParentGeneration { get; set; }

    public ICollection<GenerationRevision> Revisions { get; set; } = new List<GenerationRevision>();
}
