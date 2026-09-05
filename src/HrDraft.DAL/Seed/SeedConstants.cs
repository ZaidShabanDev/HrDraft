namespace HrDraft.DAL.Seed;

internal static class SeedConstants
{
    /// <summary>
    /// Fixed, never <c>DateTime.UtcNow</c>. Seed values end up baked into the migration, so
    /// a moving timestamp would make every <c>migrations add</c> produce a spurious update.
    /// </summary>
    internal static readonly DateTime Timestamp = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
}
