namespace HrDraft.Model.Entities;

/// <summary>
/// A team a role can be opened for. Backs the generator form's typeahead and its
/// "2 of 14 teams" footer. Deliberately not seeded — team names are company-specific.
/// </summary>
public class Team
{
    public int TeamId { get; set; }

    public string Name { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}
