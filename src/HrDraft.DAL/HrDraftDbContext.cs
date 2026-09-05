using HrDraft.Model.Entities;
using Microsoft.EntityFrameworkCore;

namespace HrDraft.DAL;

public class HrDraftDbContext(DbContextOptions<HrDraftDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();

    public DbSet<CompanyProfile> CompanyProfiles => Set<CompanyProfile>();

    public DbSet<CompBand> CompBands => Set<CompBand>();

    public DbSet<Tool> Tools => Set<Tool>();

    public DbSet<Generation> Generations => Set<Generation>();

    public DbSet<GenerationRevision> GenerationRevisions => Set<GenerationRevision>();

    public DbSet<LookupOption> LookupOptions => Set<LookupOption>();

    public DbSet<Team> Teams => Set<Team>();

    public DbSet<EmailMessage> EmailMessages => Set<EmailMessage>();

    public DbSet<AuditEntry> AuditLog => Set<AuditEntry>();

    public DbSet<AppSetting> AppSettings => Set<AppSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(HrDraftDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        GuardAuditLogIsAppendOnly();
        return base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        GuardAuditLogIsAppendOnly();
        return base.SaveChanges();
    }

    /// <summary>
    /// The audit trail is documented as append-only, so the rule is enforced here rather
    /// than left to everyone remembering it. Retention nulls a generation's text; it never
    /// touches these rows.
    /// </summary>
    private void GuardAuditLogIsAppendOnly()
    {
        var tampered = ChangeTracker
            .Entries<AuditEntry>()
            .Any(e => e.State is EntityState.Modified or EntityState.Deleted);

        if (tampered)
        {
            throw new InvalidOperationException(
                "AuditLog is append-only: audit entries cannot be updated or deleted.");
        }
    }
}
