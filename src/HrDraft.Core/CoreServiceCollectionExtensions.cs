using HrDraft.Core.Abstractions;
using HrDraft.Core.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace HrDraft.Core;

public static class CoreServiceCollectionExtensions
{
    public static IServiceCollection AddHrDraftCore(this IServiceCollection services)
    {
        // TimeProvider rather than a hand-rolled clock interface: it is in the framework, and
        // tests get FakeTimeProvider without another abstraction to maintain.
        services.TryAddSingleton(TimeProvider.System);

        services.AddScoped<IAuditService, AuditService>();
        services.AddScoped<SignInService>();
        services.AddScoped<QuotaService>();

        return services;
    }
}
