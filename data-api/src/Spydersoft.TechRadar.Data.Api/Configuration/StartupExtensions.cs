using Microsoft.AspNetCore.Builder;
using Spydersoft.TechRadar.Data.Api.Data;

namespace Spydersoft.TechRadar.Data.Api.Configuration;

/// <summary>
/// Class StartupExtensions.
/// </summary>
public static class StartupExtensions
{
    /// <summary>Initializes the database.</summary>
    /// <param name="app">The application.</param>
    public static void InitializeDatabase(this IApplicationBuilder app)
    {
        var databaseInitializer = new DatabaseInitializer(app);
        databaseInitializer.InitializeDatabase();
    }

}
