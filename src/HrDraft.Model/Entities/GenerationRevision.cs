namespace HrDraft.Model.Entities;

/// <summary>
/// One saved version of a draft. Version 1 is always the model's own output; every human
/// save appends another. Backs the draft screen's Versions tab and its "draft 1 of 1".
/// </summary>
public class GenerationRevision
{
    public long GenerationRevisionId { get; set; }

    public long GenerationId { get; set; }

    /// <summary>1-based and unique per generation.</summary>
    public int VersionNumber { get; set; }

    public string Markdown { get; set; } = string.Empty;

    public bool IsModelOutput { get; set; }

    /// <summary>Null on version 1 — nobody authored it.</summary>
    public int? CreatedByUserId { get; set; }

    public DateTime CreatedUtc { get; set; }

    public Generation? Generation { get; set; }

    public User? CreatedByUser { get; set; }
}
