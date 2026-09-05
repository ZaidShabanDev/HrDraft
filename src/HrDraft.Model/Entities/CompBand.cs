namespace HrDraft.Model.Entities;

/// <summary>
/// One salary band on a company profile version. Stored structured rather than as the
/// design's free text so the generator can inject a real range and the UI formats it
/// consistently.
/// </summary>
public class CompBand
{
    public int CompBandId { get; set; }

    public int CompanyProfileId { get; set; }

    /// <summary>The company's own level label — <c>L3</c>, <c>Senior</c>, <c>IC4</c>.</summary>
    public string LevelCode { get; set; } = string.Empty;

    public decimal? MinAmount { get; set; }

    public decimal? MaxAmount { get; set; }

    /// <summary>ISO 4217, e.g. <c>EUR</c>.</summary>
    public string? CurrencyCode { get; set; }

    public decimal? BonusPercent { get; set; }

    /// <summary>Exact wording that a formatter would not produce. Wins over the amounts.</summary>
    public string? DisplayOverride { get; set; }

    public int SortOrder { get; set; }

    public CompanyProfile? CompanyProfile { get; set; }
}
