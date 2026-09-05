using HrDraft.Model.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrDraft.DAL.Configurations;

public sealed class GenerationConfiguration : IEntityTypeConfiguration<Generation>
{
    public void Configure(EntityTypeBuilder<Generation> builder)
    {
        builder.ToTable("Generations");
        builder.HasKey(g => g.GenerationId);

        builder.Property(g => g.Title).HasMaxLength(300).IsRequired();
        builder.Property(g => g.InputJson).IsRequired();
        builder.Property(g => g.Status).HasConversion<byte>().IsRequired();
        builder.Property(g => g.ErrorMessage).HasMaxLength(1000);
        builder.Property(g => g.ModelId).HasMaxLength(100);

        builder.HasOne(g => g.User)
            .WithMany()
            .HasForeignKey(g => g.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(g => g.Tool)
            .WithMany()
            .HasForeignKey(g => g.ToolId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(g => g.CompanyProfile)
            .WithMany()
            .HasForeignKey(g => g.CompanyProfileId)
            .OnDelete(DeleteBehavior.Restrict);

        // NoAction on both of these: a second path from Generations to Users, and the self
        // reference, are each enough for SQL Server to reject a cascade.
        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(g => g.ReviewedByUserId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(g => g.ParentGeneration)
            .WithMany()
            .HasForeignKey(g => g.ParentGenerationId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasMany(g => g.Revisions)
            .WithOne(r => r.Generation)
            .HasForeignKey(r => r.GenerationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(g => new { g.UserId, g.CreatedUtc })
            .IsDescending(false, true)
            .HasDatabaseName("IX_Generations_UserId_CreatedUtc");

        builder.HasIndex(g => new { g.ToolId, g.CreatedUtc })
            .IsDescending(false, true)
            .HasDatabaseName("IX_Generations_ToolId_CreatedUtc");
    }
}

public sealed class GenerationRevisionConfiguration : IEntityTypeConfiguration<GenerationRevision>
{
    public void Configure(EntityTypeBuilder<GenerationRevision> builder)
    {
        builder.ToTable("GenerationRevisions");
        builder.HasKey(r => r.GenerationRevisionId);

        builder.Property(r => r.Markdown).IsRequired();

        builder.HasOne(r => r.CreatedByUser)
            .WithMany()
            .HasForeignKey(r => r.CreatedByUserId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasIndex(r => new { r.GenerationId, r.VersionNumber }).IsUnique();
    }
}
