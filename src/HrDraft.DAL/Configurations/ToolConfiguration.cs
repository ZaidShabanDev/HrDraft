using HrDraft.DAL.Seed;
using HrDraft.Model.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrDraft.DAL.Configurations;

public sealed class ToolConfiguration : IEntityTypeConfiguration<Tool>
{
    public void Configure(EntityTypeBuilder<Tool> builder)
    {
        builder.ToTable("Tools");
        builder.HasKey(t => t.ToolId);

        // Explicit ids, so Generations.ToolId means the same thing in dev, staging and live.
        builder.Property(t => t.ToolId).ValueGeneratedNever();

        builder.Property(t => t.ToolKey).HasMaxLength(64).IsUnicode(false).IsRequired();
        builder.Property(t => t.Category).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(t => t.DisplayName).HasMaxLength(100).IsRequired();
        builder.Property(t => t.DisplayNumber).HasMaxLength(4).IsUnicode(false).IsRequired();
        builder.Property(t => t.Description).HasMaxLength(400);
        builder.Property(t => t.ShortDescription).HasMaxLength(200);
        builder.Property(t => t.SkillFileNames).HasMaxLength(500);

        builder.HasIndex(t => t.ToolKey).IsUnique();

        builder.HasData(ToolSeed.Rows);
    }
}
