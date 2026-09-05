using HrDraft.Core.Abstractions;
using HrDraft.Core.Options;
using HrDraft.Model;
using HrDraft.Model.Entities;
using Microsoft.Extensions.Options;

namespace HrDraft.Api.Infrastructure;

/// <summary>
/// Creates the first administrator so a fresh deployment has a way in.
///
/// Runs only while the <c>Users</c> table is empty — never as an "ensure this account
/// exists" step, because that would silently reset a password on every restart and would
/// re-create an account someone had deliberately deactivated.
/// </summary>
public static class AdminBootstrapper
{
    public static async Task RunAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        await using var scope = services.CreateAsyncScope();
        var provider = scope.ServiceProvider;

        var logger = provider.GetRequiredService<ILoggerFactory>().CreateLogger(typeof(AdminBootstrapper));
        var settings = provider.GetRequiredService<IOptions<HrDraftOptions>>().Value.BootstrapAdmin;
        var users = provider.GetRequiredService<IUserRepository>();

        if (await users.AnyAsync(cancellationToken))
        {
            return;
        }

        if (!settings.IsConfigured)
        {
            logger.LogWarning(
                "No users exist and no bootstrap administrator is configured, so nobody can sign in. "
                + "Set HrDraft__BootstrapAdmin__Email and HrDraft__BootstrapAdmin__Password and restart.");
            return;
        }

        var hasher = provider.GetRequiredService<IPasswordHasher>();
        var timeProvider = provider.GetRequiredService<TimeProvider>();
        var audit = provider.GetRequiredService<IAuditService>();
        var unitOfWork = provider.GetRequiredService<IUnitOfWork>();

        var email = settings.Email!.Trim();

        users.Add(new User
        {
            Email = email,
            DisplayName = string.IsNullOrWhiteSpace(settings.DisplayName)
                ? email
                : settings.DisplayName!.Trim(),
            PasswordHash = hasher.Hash(settings.Password!),
            AuthSource = AuthSource.Local,
            Role = UserRole.HrAdmin,
            IsActive = true,
            CreatedUtc = timeProvider.GetUtcNow().UtcDateTime,
        });

        audit.Record(AuditActions.UserCreated, detail: new { email, via = "bootstrap" });
        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Created the first administrator ({Email}). Remove the bootstrap settings and change "
            + "the password after signing in.",
            email);
    }
}
