using HrDraft.Model.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrDraft.DAL.Configurations;

public sealed class CompanyProfileConfiguration : IEntityTypeConfiguration<CompanyProfile>
{
    public void Configure(EntityTypeBuilder<CompanyProfile> builder)
    {
        builder.ToTable("CompanyProfiles");
        builder.HasKey(p => p.CompanyProfileId);

        builder.Property(p => p.CompanyName).HasMaxLength(200).IsRequired();

        // The filtered unique index is the whole safety net behind versioning: a save that
        // forgets to clear the previous IsCurrent is rejected instead of leaving two.
        builder.HasIndex(p => p.IsCurrent)
            .IsUnique()
            .HasFilter("[IsCurrent] = 1")
            .HasDatabaseName("UX_CompanyProfiles_IsCurrent");

        builder.HasOne(p => p.UpdatedByUser)
            .WithMany()
            .HasForeignKey(p => p.UpdatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.CompBands)
            .WithOne(b => b.CompanyProfile)
            .HasForeignKey(b => b.CompanyProfileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class CompBandConfiguration : IEntityTypeConfiguration<CompBand>
{
    public void Configure(EntityTypeBuilder<CompBand> builder)
    {
        builder.ToTable("CompBands");
        builder.HasKey(b => b.CompBandId);

        builder.Property(b => b.LevelCode).HasMaxLength(20).IsRequired();
        builder.Property(b => b.MinAmount).HasPrecision(18, 2);
        builder.Property(b => b.MaxAmount).HasPrecision(18, 2);
        builder.Property(b => b.CurrencyCode).HasMaxLength(3);
        builder.Property(b => b.BonusPercent).HasPrecision(5, 2);
        builder.Property(b => b.DisplayOverride).HasMaxLength(100);

        builder.HasIndex(b => new { b.CompanyProfileId, b.SortOrder });
    }
}
