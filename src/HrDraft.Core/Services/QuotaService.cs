using HrDraft.Core.Abstractions;
using HrDraft.Core.Options;
using HrDraft.Model.Entities;
using Microsoft.Extensions.Options;

namespace HrDraft.Core.Services;

public sealed record QuotaStatus(int Used, int Limit)
{
    public int Remaining => Math.Max(0, Limit - Used);

    public bool Exceeded => Used >= Limit;
}

/// <summary>
/// The per-user daily cap behind the chrome's "12 / 20". Counted from
/// <c>Generations</c> rather than kept in a column: a counter can drift out of step with
/// reality and needs a reset job that fails silently at midnight.
/// </summary>
public sealed class QuotaService(
    IGenerationRepository generations,
    IAppSettingRepository settings,
    IOptions<HrDraftOptions> options,
    TimeProvider timeProvider)
{
    public async Task<QuotaStatus> GetStatusAsync(User user, CancellationToken cancellationToken = default)
    {
        var used = await generations.CountSinceAsync(user.UserId, GetDayStartUtc(), cancellationToken);
        var limit = user.DailyGenerationLimit ?? await GetDefaultLimitAsync(cancellationToken);

        return new QuotaStatus(used, limit);
    }

    /// <summary>
    /// Local midnight expressed in UTC, because "today" has to mean what the person looking
    /// at the screen thinks it means, not what UTC says.
    /// </summary>
    public DateTime GetDayStartUtc()
    {
        var localNow = timeProvider.GetLocalNow();

        return new DateTimeOffset(
            localNow.Year,
            localNow.Month,
            localNow.Day,
            0,
            0,
            0,
            localNow.Offset).UtcDateTime;
    }

    private async Task<int> GetDefaultLimitAsync(CancellationToken cancellationToken)
    {
        var configured = await settings.GetValueAsync(
            AppSettingKeys.DefaultDailyGenerationLimit,
            cancellationToken);

        return int.TryParse(configured, out var limit) && limit > 0
            ? limit
            : options.Value.Generation.DefaultDailyGenerationLimit;
    }
}
