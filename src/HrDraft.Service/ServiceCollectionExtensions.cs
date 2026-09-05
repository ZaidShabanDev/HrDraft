using HrDraft.Core.Abstractions;
using HrDraft.Service.Email;
using HrDraft.Service.Security;
using Microsoft.Extensions.DependencyInjection;

namespace HrDraft.Service;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddHrDraftServices(this IServiceCollection services)
    {
        services.AddSingleton<IPasswordHasher, AspNetCorePasswordHasher>();

        // Registered as a collection: SignInService picks the verifier matching the user's
        // AuthSource, so adding an LDAP bind is one more line here and no change anywhere else.
        services.AddScoped<ICredentialVerifier, LocalPasswordVerifier>();

        services.AddScoped<IEmailSender, NoOpEmailSender>();

        return services;
    }
}
