using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Logging;
using Spydersoft.Platform.Hosting.Options;
using Spydersoft.Platform.Hosting.StartupExtensions;
using Spydersoft.TechRadar.Data.Api.Configuration;
using Spydersoft.TechRadar.Data.Api.Data;
using Spydersoft.TechRadar.Data.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.AddSpydersoftTelemetry(typeof(Program).Assembly);
builder.AddSpydersoftSerilog(true);
AppHealthCheckOptions healthCheckOptions = builder.AddSpydersoftHealthChecks();

builder.Services.AddControllers();

var authInstalled = builder.AddSpydersoftIdentity();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddDbContext<TechRadarContext>(
    options => options.UseNpgsql(builder.Configuration.GetConnectionString("TechRadarDatabase"),
                                 x => x.MigrationsHistoryTable("ef_migrations_history"))
);

builder.Services.AddScoped<IRadarService, RadarService>();
builder.Services.AddScoped<IRadarDataItemService, RadarDataItemService>();
builder.Services.AddScoped<ITagService, TagService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

// Configure NSwag
builder.Services.AddOpenApiDocument(configure =>
{
    configure.Title = "Tech Radar API";
    configure.Version = "v1";
    configure.Description = "API for managing technology radar data";

    // Configure post-processing for additional metadata
    configure.PostProcess = document =>
    {
        document.Info.Title = "Tech Radar API";
        document.Info.Description = "A comprehensive API for managing technology radar data including radars, items, tags, and notes.";

        // Set contact information
        document.Info.Contact = new NSwag.OpenApiContact
        {
            Name = "Tech Radar API",
            Email = "support@techradar.com"
        };
    };

    // Configure authentication if enabled
    if (authInstalled)
    {
        configure.AddSecurity("Bearer", new NSwag.OpenApiSecurityScheme
        {
            Type = NSwag.OpenApiSecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "Input a valid JWT token to access this API"
        });

        configure.OperationProcessors.Add(new NSwag.Generation.Processors.Security.AspNetCoreOperationSecurityScopeProcessor("Bearer"));
    }
});

var app = builder.Build();

app.InitializeDatabase();

if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowAll");
}

app.UseSpydersoftHealthChecks(healthCheckOptions)
    .UseAuthentication(authInstalled)
    .UseRouting()
    .UseAuthorization(authInstalled)
    .UseEndpoints(endpoints => endpoints.MapControllers())
    .UseDefaultFiles()
    .UseStaticFiles();

// Enable NSwag middleware
app.UseOpenApi(); // Serves the OpenAPI specification at /swagger/v1/swagger.json
app.UseSwaggerUi(); // Serves the Swagger UI at /swagger

IdentityModelEventSource.ShowPII = app.Environment.IsDevelopment();
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseHsts();
}

await app.RunAsync();