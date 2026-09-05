using HrDraft.Core.Abstractions;
using HrDraft.DAL.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace HrDraft.DAL;

public static class DalServiceCollectionExtensions
{
    public static IServiceCollection AddHrDraftDataAccess(
        this IServiceCollection services,
        string connectionString)
    {
        services.AddDbContext<HrDraftDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
            {
                sql.MigrationsAssembly(typeof(HrDraftDbContext).Assembly.FullName);

                // An on-premises SQL Server still drops connections when it is patched or
                // fails over. Retries pair with UnitOfWork's execution strategy, which is
                // what makes a retried transaction safe rather than half-applied.
                sql.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorNumbersToAdd: null);
            }));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IToolRepository, ToolRepository>();
        services.AddScoped<ICompanyProfileRepository, CompanyProfileRepository>();
        services.AddScoped<IGenerationRepository, GenerationRepository>();
        services.AddScoped<ILookupOptionRepository, LookupOptionRepository>();
        services.AddScoped<ITeamRepository, TeamRepository>();
        services.AddScoped<IAppSettingRepository, AppSettingRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();
        services.AddScoped<IEmailMessageRepository, EmailMessageRepository>();

        return services;
    }
}
