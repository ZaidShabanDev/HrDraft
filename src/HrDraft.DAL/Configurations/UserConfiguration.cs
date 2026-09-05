using HrDraft.Model.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HrDraft.DAL.Configurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");
        builder.HasKey(u => u.UserId);

        builder.Property(u => u.Email)
            .HasMaxLength(256)
            .IsRequired()
            // Pinned case-insensitive so "A.Meyer@" and "a.meyer@" are the same account
            // whatever collation the database was created with, and so the lookup still
            // uses the index instead of a ToLower() scan.
            .UseCollation("SQL_Latin1_General_CP1_CI_AS");

        builder.Property(u => u.DisplayName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(u => u.EntraObjectId).HasMaxLength(64);
        builder.Property(u => u.PasswordHash).HasMaxLength(500);

        builder.Property(u => u.AuthSource).HasConversion<byte>().IsRequired();
        builder.Property(u => u.Role).HasConversion<byte>().IsRequired();

        builder.Property(u => u.IsActive).HasDefaultValue(true);

        builder.HasIndex(u => u.Email).IsUnique();

        builder.HasIndex(u => u.EntraObjectId)
            .IsUnique()
            .HasFilter("[EntraObjectId] IS NOT NULL");
    }
}
