using Microsoft.IdentityModel.Logging;
using OidcProxy.Net.ModuleInitializers;
using OidcProxy.Net.OpenIdConnect;
using Spydersoft.Platform.Hosting.Options;
using Spydersoft.Platform.Hosting.StartupExtensions;
using Spydersoft.TechRadar.Frontend.Configuration;


var builder = WebApplication.CreateBuilder(args);

builder.AddSpydersoftTelemetry(typeof(Program).Assembly);
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
