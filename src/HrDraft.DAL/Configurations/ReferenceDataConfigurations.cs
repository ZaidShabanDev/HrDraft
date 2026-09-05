using HrDraft.DAL.Seed;
using HrDraft.Model.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrDraft.DAL.Configurations;

public sealed class LookupOptionConfiguration : IEntityTypeConfiguration<LookupOption>
{
    public void Configure(EntityTypeBuilder<LookupOption> builder)
    {
        builder.ToTable("LookupOptions");
        builder.HasKey(o => o.LookupOptionId);

        builder.Property(o => o.Category).HasMaxLength(50).IsUnicode(false).IsRequired();
        builder.Property(o => o.Value).HasMaxLength(64).IsUnicode(false).IsRequired();
        builder.Property(o => o.Label).HasMaxLength(200).IsRequired();
        builder.Property(o => o.ShortLabel).HasMaxLength(20);
        builder.Property(o => o.GroupLabel).HasMaxLength(100);
        builder.Property(o => o.IsEnabled).HasDefaultValue(true);

        builder.HasIndex(o => new { o.Category, o.Value }).IsUnique();

        builder.HasData(LookupOptionSeed.Rows);
    }
}

public sealed class TeamConfiguration : IEntityTypeConfiguration<Team>
{
    public void Configure(EntityTypeBuilder<Team> builder)
    {
        builder.ToTable("Teams");
        builder.HasKey(t => t.TeamId);

        builder.Property(t => t.Name).HasMaxLength(150).IsRequired();
        builder.Property(t => t.IsActive).HasDefaultValue(true);

        builder.HasIndex(t => t.Name).IsUnique();
    }
}

public sealed class AppSettingConfiguration : IEntityTypeConfiguration<AppSetting>
{
    public void Configure(EntityTypeBuilder<AppSetting> builder)
    {
        builder.ToTable("AppSettings");
        builder.HasKey(s => s.SettingKey);

        builder.Property(s => s.SettingKey).HasMaxLength(100).IsUnicode(false);
        builder.Property(s => s.SettingValue).IsRequired();
        builder.Property(s => s.Description).HasMaxLength(400);

        builder.HasData(AppSettingSeed.Rows);
    }
}

public sealed class EmailMessageConfiguration : IEntityTypeConfiguration<EmailMessage>
{
    public void Configure(EntityTypeBuilder<EmailMessage> builder)
    {
        builder.ToTable("EmailMessages");
        builder.HasKey(m => m.EmailMessageId);

        builder.Property(m => m.FromAddress).HasMaxLength(256).IsRequired();
        builder.Property(m => m.ToAddresses).IsRequired();
        builder.Property(m => m.Subject).HasMaxLength(500).IsRequired();
        builder.Property(m => m.BodyHtml).IsRequired();
        builder.Property(m => m.Status).HasConversion<byte>().IsRequired();
        builder.Property(m => m.GraphMessageId).HasMaxLength(200);
        builder.Property(m => m.ErrorMessage).HasMaxLength(1000);

        builder.HasOne(m => m.Generation)
            .WithMany()
            .HasForeignKey(m => m.GenerationId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(m => m.SentByUser)
            .WithMany()
            .HasForeignKey(m => m.SentByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(m => m.CreatedUtc).IsDescending();
    }
}

public sealed class AuditEntryConfiguration : IEntityTypeConfiguration<AuditEntry>
{
    public void Configure(EntityTypeBuilder<AuditEntry> builder)
    {
        // Class name is AuditEntry, table name is AuditLog — the table reads as a log,
        // the class reads as one line of it.
        builder.ToTable("AuditLog");
        builder.HasKey(a => a.AuditId);

        builder.Property(a => a.Action).HasMaxLength(64).IsUnicode(false).IsRequired();
        builder.Property(a => a.EntityType).HasMaxLength(64).IsUnicode(false);
        builder.Property(a => a.EntityId).HasMaxLength(64);
        builder.Property(a => a.IpAddress).HasMaxLength(64);

        builder.HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasIndex(a => a.CreatedUtc)
            .IsDescending()
            .HasDatabaseName("IX_AuditLog_CreatedUtc");

        builder.HasIndex(a => new { a.UserId, a.CreatedUtc })
            .IsDescending(false, true)
            .HasDatabaseName("IX_AuditLog_UserId_CreatedUtc");
    }
}
