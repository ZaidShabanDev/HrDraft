using System.ComponentModel.DataAnnotations;
using HrDraft.Core.Services;
using HrDraft.Model.Entities;

namespace HrDraft.Api.Contracts;

public sealed record LoginRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; init; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Password { get; init; } = string.Empty;
}

/// <summary>Matches <c>CurrentUser</c> in the front end's <c>types/domain.ts</c>.</summary>
public sealed record CurrentUserResponse(
    int UserId,
    string Email,
    string DisplayName,
    string Initials,
    string Role,
    int GenerationsToday,
    int DailyGenerationLimit)
{
    public static CurrentUserResponse From(User user, QuotaStatus quota) =>
        new(
            user.UserId,
            user.Email,
            user.DisplayName,
            Initials: DeriveInitials(user.DisplayName),
            Role: user.Role.ToString(),
            GenerationsToday: quota.Used,
            DailyGenerationLimit: quota.Limit);

    /// <summary>
    /// First and last word, so "Anna Meyer" gives AM and "Anna Sofia Meyer" still gives AM
    /// rather than ASM — the avatar is a fixed 40px square with room for two characters.
    /// </summary>
    private static string DeriveInitials(string displayName)
    {
        var words = displayName.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        return words.Length switch
        {
            0 => "?",
            1 => words[0][..1].ToUpperInvariant(),
            _ => $"{words[0][0]}{words[^1][0]}".ToUpperInvariant(),
        };
    }
}
