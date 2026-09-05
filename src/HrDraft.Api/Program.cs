using System.Threading.RateLimiting;
using HrDraft.Api.Infrastructure;
using HrDraft.Core;
using HrDraft.Core.Options;
using HrDraft.DAL;
using HrDraft.Model;
using HrDraft.Service;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Local overrides — the connection string, the bootstrap admin, anything machine-specific.
// Gitignored, so it is the one place a real password can sit without reaching the repo, and
// loaded in every environment rather than only Development: `dotnet ef` does not read
// launchSettings.json, so an environment-specific file would leave migrations with no
// connection string.
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

builder.Services.Configure<HrDraftOptions>(
    builder.Configuration.GetSection(HrDraftOptions.SectionName));

var connectionString = builder.Configuration.GetConnectionString("HrDraft")
    ?? throw new InvalidOperationException(
        "No connection string named 'HrDraft'. Copy appsettings.Local.example.json to "
        + "appsettings.Local.json and fill it in. It is deliberately absent from appsettings.json, "
        + "which is committed.");

builder.Services
    .AddHrDraftCore()
    .AddHrDraftServices()
    .AddHrDraftDataAccess(connectionString);

builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

var authOptions = builder.Configuration
    .GetSection($"{HrDraftOptions.SectionName}:Auth")
    .Get<AuthOptions>() ?? new AuthOptions();

builder.Services
    .AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(cookie =>
    {
        cookie.Cookie.Name = "hrdraft.session";
        cookie.Cookie.HttpOnly = true;

        // Lax is also the CSRF defence: the browser withholds the cookie on a cross-site POST,
        // which is what a forged request would be. The SPA is same-origin, so nothing legitimate
        // needs it sent cross-site.
        cookie.Cookie.SameSite = SameSiteMode.Lax;

        cookie.Cookie.SecurePolicy = builder.Environment.IsDevelopment()
            ? CookieSecurePolicy.SameAsRequest
            : CookieSecurePolicy.Always;

        cookie.ExpireTimeSpan = TimeSpan.FromHours(Math.Clamp(authOptions.SessionHours, 1, 168));
        cookie.SlidingExpiration = true;

        cookie.Events.OnValidatePrincipal = SessionValidator.ValidateAsync;

        // An API answers with a status code. The default 302 to a login page arrives in
        // fetch() as a 200 with an HTML body, which is indistinguishable from success.
        cookie.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };

        cookie.Events.OnRedirectToAccessDenied = context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });

// Authenticated by default, so a new endpoint is protected unless it opts out with
// [AllowAnonymous]. The other way round, one forgotten attribute exposes data.
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build())
    .AddPolicy(AuthorizationPolicies.HrAdmin, policy => policy.RequireRole(nameof(UserRole.HrAdmin)));

builder.Services.AddRateLimiter(limiter =>
{
    limiter.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Password guessing, not cost control — the generation quota is a separate thing and
    // lives in the database.
    limiter.AddPolicy(RateLimitPolicies.SignIn, context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(5),
                QueueLimit = 0,
            }));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler();
    app.UseHsts();
}

app.UseHttpsRedirection();

// The SPA is built into wwwroot by Vite. Before that first build the folder is empty, and
// wiring static files to nothing would answer every unmatched path with a confusing 404
// instead of letting the API be used on its own.
var spaIsBuilt = app.Environment.WebRootPath is { } webRoot
                 && File.Exists(Path.Combine(webRoot, "index.html"));

if (spaIsBuilt)
{
    app.UseDefaultFiles();
    app.UseStaticFiles(new StaticFileOptions
    {
        OnPrepareResponse = context =>
        {
            // index.html carries the hashed asset filenames, so a cached copy sends the
            // browser after files the last deploy deleted.
            if (context.File.Name.Equals("index.html", StringComparison.OrdinalIgnoreCase))
            {
                context.Context.Response.Headers.CacheControl = "no-cache, no-store, must-revalidate";
            }
        },
    });
}

app.UseRouting();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/api/health").AllowAnonymous();

if (spaIsBuilt)
{
    app.MapFallbackToFile("/index.html").AllowAnonymous();
}

try
{
    await AdminBootstrapper.RunAsync(app.Services);
}
catch (Exception ex)
{
    // Starting anyway: /api/config still serves, so the sign-in screen renders and reports a
    // real error instead of the whole site refusing to come up.
    app.Logger.LogError(ex, "Could not check for a bootstrap administrator. Is the database reachable and migrated?");
}

await app.RunAsync();
