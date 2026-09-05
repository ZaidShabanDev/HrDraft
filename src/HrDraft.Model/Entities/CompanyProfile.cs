namespace HrDraft.Model.Entities;

/// <summary>
/// The boilerplate every generation reads from — benefits, DEI statement, culture, comp
/// bands. Versioned rather than updated in place: saving inserts a new row and flips
/// <see cref="IsCurrent"/>, so a draft written six months ago still points at the exact
/// text that fed it.
/// </summary>
public class CompanyProfile
{
    public int CompanyProfileId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string? BenefitsBlurb { get; set; }

    public string? DeiStatement { get; set; }

    public string? CultureDescription { get; set; }

    /// <summary>Exactly one row may have this set — enforced by a filtered unique index.</summary>
    public bool IsCurrent { get; set; }

    public int UpdatedByUserId { get; set; }

    public DateTime UpdatedUtc { get; set; }

    public User? UpdatedByUser { get; set; }

    public ICollection<CompBand> CompBands { get; set; } = new List<CompBand>();
}
