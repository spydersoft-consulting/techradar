using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Spydersoft.TechRadar.Data.Api.Data;

/// <summary>
/// Class DatabaseInitializer.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="DatabaseInitializer"/> class.
/// </remarks>
/// <param name="app">The application.</param>
public class DatabaseInitializer(IApplicationBuilder app)
{
    /// <summary>
    /// The application
    /// </summary>
    private readonly IApplicationBuilder _app = app;
    /// <summary>
    /// The log
    /// </summary>
    private ILogger? _log;

    /// <summary>
    /// Initializes the database.
    /// </summary>
    /// <exception cref="System.NullReferenceException">Unable to get IServiceScopeFactory</exception>
    public void InitializeDatabase()
    {
        var scopeFactory = _app.ApplicationServices.GetService<IServiceScopeFactory>() ?? throw new NullReferenceException("Unable to get IServiceScopeFactory");
        using IServiceScope serviceScope = scopeFactory.CreateScope();
        _log = serviceScope.ServiceProvider.GetRequiredService<ILogger<DatabaseInitializer>>();

        PerformDatabaseMigrations(serviceScope);
        SeedDatabase(serviceScope);
    }

    #region Database Migration Methods

    /// <summary>
    /// Performs the database migrations.
    /// </summary>
    /// <param name="serviceScope">The service scope.</param>
    private void PerformDatabaseMigrations(IServiceScope serviceScope)
    {
        Task techRadarTask =
            DoMigrationIfNeeded(serviceScope.ServiceProvider.GetRequiredService<TechRadarContext>(), "Tech Radar Database");

        techRadarTask.Wait();
    }

    /// <summary>
    /// Does the migration if needed.
    /// </summary>
    /// <param name="context">The context.</param>
    /// <param name="databaseName">Name of the database.</param>
    private async Task DoMigrationIfNeeded(DbContext context, string databaseName)
    {
        _log?.LogDebug("Checking {Database} for pending migrations.", databaseName);
        try
        {
            var hasMigrations = (await context.Database.GetPendingMigrationsAsync()).Any();
            if (hasMigrations)
            {
                _log?.LogInformation("Migrating {Database}.", databaseName);
                await context.Database.MigrateAsync();
            }
        }
        catch (Exception ex)
        {
            _log?.LogCritical(ex, "Error migrating {Database}.", databaseName);
            throw;
        }

    }

    #endregion Database Migration Methods

    #region Seeding Functions

    /// <summary>
    /// Seeds the database.
    /// </summary>
    /// <param name="serviceScope">The service scope.</param>
    private void SeedDatabase(IServiceScope serviceScope)
    {

    }
    #endregion Seeding Functions
}
