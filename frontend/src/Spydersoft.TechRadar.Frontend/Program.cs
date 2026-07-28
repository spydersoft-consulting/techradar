using Microsoft.IdentityModel.Logging;
using OidcProxy.Net.ModuleInitializers;
using OidcProxy.Net.OpenIdConnect;
using Spydersoft.Platform.Hosting.Options;
using Spydersoft.Platform.Hosting.StartupExtensions;
using Spydersoft.Platform.Hosting.Telemetry;
using Spydersoft.TechRadar.Frontend.Configuration;


var builder = WebApplication.CreateBuilder(args);

builder.AddSpydersoftTelemetry(typeof(Program).Assembly,
    new ConfigurationFunctions
    {
        // Kubernetes probes hit these every few seconds; they add nothing but noise to traces.
        AspNetFilterFunction = context => !IsHealthCheckPath(context.Request.Path.Value)
    });
builder.AddSpydersoftSerilog(true);
AppHealthCheckOptions healthCheckOptions = builder.AddSpydersoftHealthChecks();

var config = builder.Configuration
    .GetSection("OidcProxySettings")
    .Get<OidcProxyConfig>();

if (config != null)
{
    builder.Services.AddOidcProxy(config);
}
else
{
    throw new InvalidOperationException("OidcProxySettings configuration section is missing or invalid.");
}

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("RequireAuthenticatedUserPolicy", policy =>
    {
        policy.RequireAuthenticatedUser();
    });

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
                      });
});

builder.Services.AddControllers();

// Add NSwag services
builder.Services.AddOpenApiDocument(configure =>
{
    configure.Title = "Tech Radar Frontend API";
    configure.Version = "v1";
    configure.Description = "API for Tech Radar Frontend";
});

var app = builder.Build();

app.UseRouting();
app.UseSpydersoftRequestLogging();

app.UseDefaultFiles();
app.UseStaticFiles();

// Use NSwag middleware
app.UseOpenApi();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwaggerUi();
    IdentityModelEventSource.ShowPII = true;
    IdentityModelEventSource.LogCompleteSecurityArtifact = true;
}

app.MapControllers();
app.UseCustomForwardedHeaders();
app.UseSpydersoftHealthChecks(healthCheckOptions)
    .UseCors(MyAllowSpecificOrigins);

app.MapFallbackToFile("/index.html");

app.UseOidcProxy();

await app.RunAsync();

static bool IsHealthCheckPath(string? path) =>
    string.Equals(path, "/livez", StringComparison.OrdinalIgnoreCase) ||
    string.Equals(path, "/readyz", StringComparison.OrdinalIgnoreCase);
