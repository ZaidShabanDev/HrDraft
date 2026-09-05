using HrDraft.Api.Contracts;
using HrDraft.Core.Abstractions;
using HrDraft.Core.Options;
using HrDraft.Model.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace HrDraft.Api.Controllers;

[ApiController]
[Route("api/config")]
[AllowAnonymous]
public sealed class ConfigController(
    IOptions<HrDraftOptions> options,
    IAppSettingRepository settings,
    ILogger<ConfigController> logger) : ControllerBase
{
    [HttpGet]
    [ResponseCache(Duration = 60, Location = ResponseCacheLocation.Client)]
    public async Task<ActionResult<AppConfigResponse>> Get(CancellationToken cancellationToken)
    {
        var configured = options.Value;
        var dailyLimit = configured.Generation.DefaultDailyGenerationLimit;

        try
        {
            var stored = await settings.GetValueAsync(
                AppSettingKeys.DefaultDailyGenerationLimit,
                cancellationToken);

            if (int.TryParse(stored, out var limit) && limit > 0)
            {
                dailyLimit = limit;
            }
        }
        catch (Exception ex)
        {
            // Serving branding from configuration is better than failing: the login screen
            // then renders properly and the sign-in attempt reports the real problem, rather
            // than the whole app looking broken because one number could not be read.
            logger.LogWarning(ex, "Could not read the daily generation limit; using the configured default.");
        }

        return AppConfigResponse.From(configured, dailyLimit);
    }
}
