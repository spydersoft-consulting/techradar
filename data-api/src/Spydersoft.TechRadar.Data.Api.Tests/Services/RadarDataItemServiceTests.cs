using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Spydersoft.TechRadar.Data.Api.Data;
using Spydersoft.TechRadar.Data.Api.Models;
using Spydersoft.TechRadar.Data.Api.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Spydersoft.TechRadar.Data.Api.Tests.Services;

public class RadarDataItemServiceTests
{
    private const string ExistingRadarName = "Existing Radar";
    private SqliteConnection _connection = null!;
    private DbContextOptions<TechRadarContext> _contextOptions = null!;
    private ClaimsPrincipal _claimsPrincipal = null!;

    [OneTimeSetUp]
    public void OneTimeSetup()
    {
        // Create and open a connection. This creates the SQLite in-memory database, which will persist until the connection is closed
        // at the end of the test (see Dispose below).
        _connection = new SqliteConnection("Filename=:memory:");
        _connection.Open();

        // These options will be used by the context instances in this test suite, including the connection opened above.
        _contextOptions = new DbContextOptionsBuilder<TechRadarContext>()
            .UseSqlite(_connection)
            .Options;

        // Create the schema and seed some data
        using var context = new TechRadarContext(_contextOptions);

        if (context.Database.EnsureCreated())
        {
        }

        context.AddRange(
            new Radar { Title = ExistingRadarName, Description = "First Radar" });

        context.SaveChanges();

        var claims = new List<Claim>()
        {
            new(ClaimTypes.Name, "username"),
            new(ClaimTypes.NameIdentifier, "userId"),
            new("name", "John Doe"),
        };
        var identity = new ClaimsIdentity(claims, "TestAuthType");
        _claimsPrincipal = new ClaimsPrincipal(identity);
    }

    private TechRadarContext CreateContext() => new(_contextOptions);

    [OneTimeTearDown]
    public void OneTimeTearDown()
    {
        // Close the connection to the in-memory database.
        _connection.Close();
        _connection.Dispose();
    }

    [Test]
    public async Task NewRadarItem_GetsQuadrantsAndArcs()
    {
        string newTitle = "Quadrant Create Test";
        using var context = CreateContext();
        var radarService = new RadarDataItemService(context);

        // Act
        radarService.SaveRadarDataItem(new Radar
        {
            Title = newTitle,
            Description = "This is a new radar",
        }, _claimsPrincipal);

        // Assert
        var radar = await context.Radars.FirstOrDefaultAsync(r => r.Title == newTitle);
        Assert.That(radar, Is.Not.Null);
        var quadrants = await context.Quadrants
            .Where(q => q.RadarId == radar.Id)
            .ToListAsync();

        Assert.That(quadrants, Is.Not.Null);
        Assert.That(quadrants, Has.Count.EqualTo(4), "Expected 4 quadrants to be created for a new radar item.");

        var arcs = await context.RadarArcs
            .Where(ra => ra.RadarId == radar.Id)
            .ToListAsync();

        Assert.That(arcs, Is.Not.Null);
        Assert.That(arcs, Has.Count.EqualTo(4), "Expected 4 arcs to be created for a new radar item.");
    }

    [Test]
    public async Task ExistingRadarItem_NoQuadrantsOrArcs()
    {
        using var context = CreateContext();
        var radarService = new RadarDataItemService(context);

        Radar radar = await context.Radars.FirstAsync(r => r.Title == ExistingRadarName);

        // Act
        radarService.SaveRadarDataItem(radar, _claimsPrincipal);

        // Assert
        var quadrants = await context.Quadrants
            .Where(q => q.RadarId == radar.Id)
            .ToListAsync();

        Assert.That(quadrants, Is.Not.Null);
        Assert.That(quadrants, Has.Count.EqualTo(0), "Expected 0 quadrants to be created for an existing radar item in the DB.");

        var arcs = await context.RadarArcs
            .Where(ra => ra.RadarId == radar.Id)
            .ToListAsync();

        Assert.That(arcs, Is.Not.Null);
        Assert.That(arcs, Has.Count.EqualTo(0), "Expected 0 arcs to be created for an existing radar item in the DB.");
    }

    [Test]
    public void GetRadarDataItem_ExistingRadar_ReturnsRadar()
    {
        using var context = CreateContext();
        var service = new RadarDataItemService(context);

        // Arrange
        var radar = context.Radars.First(r => r.Title == ExistingRadarName);

        // Act
        var result = service.GetRadarDataItem<Radar>(radar.Id);

        // Assert
        using (Assert.EnterMultipleScope())
        {
            Assert.That(result, Is.Not.Null);
            Assert.That(result?.Title, Is.EqualTo(ExistingRadarName));
            Assert.That(result?.Id, Is.EqualTo(radar.Id));
        }
    }

    [Test]
    public void GetRadarDataItem_NonExistingId_ReturnsNull()
    {
        using var context = CreateContext();
        var service = new RadarDataItemService(context);

        // Act
        var result = service.GetRadarDataItem<Radar>(999);

        // Assert
        Assert.That(result, Is.Null);
    }

    [Test]
    public void SaveRadarDataItem_NewQuadrant_CreatesQuadrant()
    {
        using var context = CreateContext();
        var service = new RadarDataItemService(context);
        var radar = context.Radars.First();

        // Arrange
        var quadrant = new Quadrant
        {
            Name = "Test Quadrant",
            Color = "#FF0000",
            Position = 1,
            RadarId = radar.Id
        };

        // Act
        service.SaveRadarDataItem(quadrant, _claimsPrincipal);

        // Assert
        var savedQuadrant = context.Quadrants.FirstOrDefault(q => q.Name == "Test Quadrant");
        Assert.That(savedQuadrant, Is.Not.Null);
        using (Assert.EnterMultipleScope())
        {
            Assert.That(savedQuadrant.Color, Is.EqualTo("#FF0000"));
            Assert.That(savedQuadrant.Position, Is.EqualTo(1));
            Assert.That(savedQuadrant.RadarId, Is.EqualTo(radar.Id));
        }
    }

    [Test]
    public void SaveRadarDataItem_UpdateExistingQuadrant_UpdatesProperties()
    {
        using var context = CreateContext();
        var service = new RadarDataItemService(context);
        var radar = context.Radars.First();

        // Arrange - Create initial quadrant
        var quadrant = new Quadrant
        {
            Name = "Original Quadrant",
            Color = "#FF0000",
            Position = 1,
            RadarId = radar.Id
        };
        service.SaveRadarDataItem(quadrant, _claimsPrincipal);

        // Act - Update the quadrant
        var updatedQuadrant = new Quadrant
        {
            Id = quadrant.Id,
            Name = "Updated Quadrant",
            Color = "#00FF00",
            Position = 2,
            RadarId = radar.Id
        };
        service.SaveRadarDataItem(updatedQuadrant, _claimsPrincipal);

        // Assert
        var savedQuadrant = context.Quadrants.First(q => q.Id == quadrant.Id);
        using (Assert.EnterMultipleScope())
        {
            Assert.That(savedQuadrant, Is.Not.Null);
            Assert.That(savedQuadrant.Name, Is.EqualTo("Updated Quadrant"));
            Assert.That(savedQuadrant.Color, Is.EqualTo("#00FF00"));
            Assert.That(savedQuadrant.Position, Is.EqualTo(2));
        }
    }

    [Test]
    public void SaveRadarDataItem_NewRadarItem_CreatesRadarItem()
    {
        using var context = CreateContext();
        var service = new RadarDataItemService(context);
        var radar = context.Radars.First();

        // Arrange
        var radarItem = new RadarItem
        {
            Name = "Test Item",
            LegendKey = "TI",
            Rank = 1,
            RadarId = radar.Id,
            QuadrantId = 1,
            ArcId = 1,
            Url = "https://example.com"
        };

        // Act
        service.SaveRadarDataItem(radarItem, _claimsPrincipal);

        // Assert
        var savedItem = context.RadarItems.FirstOrDefault(ri => ri.Name == "Test Item");
        Assert.That(savedItem, Is.Not.Null);
        using (Assert.EnterMultipleScope())
        {
            Assert.That(savedItem.LegendKey, Is.EqualTo("TI"));
            Assert.That(savedItem.Rank, Is.EqualTo(1));
            Assert.That(savedItem.DateCreated, Is.GreaterThan(DateTime.MinValue));
            Assert.That(savedItem.DateUpdated, Is.GreaterThan(DateTime.MinValue));
        }
    }

    [Test]
    public void SaveRadarDataItem_RadarItemWithNote_CreatesNote()
    {
        using var context = CreateContext();
        var service = new RadarDataItemService(context);
        var radar = context.Radars.First();

        // Arrange
        var radarItem = new RadarItem
        {
            Name = "Test Item With Note",
            LegendKey = "TIWN",
            Rank = 1,
            RadarId = radar.Id,
            QuadrantId = 1,
            ArcId = 1,
            Note = "This is a test note"
        };

        // Act
        service.SaveRadarDataItem(radarItem, _claimsPrincipal);

        // Assert
        var savedItem = context.RadarItems.FirstOrDefault(ri => ri.Name == "Test Item With Note");
        Assert.That(savedItem, Is.Not.Null);

        var notes = context.RadarItemNotes.Where(n => n.RadarItemId == savedItem.Id).ToList();
        Assert.That(notes, Has.Count.EqualTo(1));
        using (Assert.EnterMultipleScope())
        {
            Assert.That(notes.First().Notes, Is.EqualTo("This is a test note"));
            Assert.That(notes.First().UserId, Is.EqualTo("username"));
        }   
    }

    [Test]
    public void SaveRadarDataItem_UpdateRadarItemWithMovementDirection_CalculatesDirection()
    {
        using var context = CreateContext();
        var service = new RadarDataItemService(context);
        var radar = context.Radars.First();

        // Arrange - Create radar with arcs first
        service.SaveRadarDataItem(new Radar { Title = "Test Radar for Movement", Description = "Test" }, _claimsPrincipal);
        var testRadar = context.Radars.First(r => r.Title == "Test Radar for Movement");

        var arc1 = context.RadarArcs.First(a => a.RadarId == testRadar.Id && a.Position == 1);
        var arc2 = context.RadarArcs.First(a => a.RadarId == testRadar.Id && a.Position == 2);

        // Create initial radar item
        var radarItem = new RadarItem
        {
            Name = "Movement Test Item",
            LegendKey = "MTI",
            Rank = 1,
            RadarId = testRadar.Id,
            QuadrantId = 1,
            ArcId = arc1.Id
        };
        service.SaveRadarDataItem(radarItem, _claimsPrincipal);

        // Act - Update with different arc
        var updatedItem = new RadarItem
        {
            Id = radarItem.Id,
            Name = "Movement Test Item",
            LegendKey = "MTI",
            Rank = 1,
            RadarId = testRadar.Id,
            QuadrantId = 1,
            ArcId = arc2.Id
        };
        service.SaveRadarDataItem(updatedItem, _claimsPrincipal);

        // Assert
        var savedItem = context.RadarItems.First(ri => ri.Id == radarItem.Id);
        Assert.That(savedItem.MovementDirection, Is.EqualTo(1)); // Moving from position 1 to 2
    }

    [Test]
    public void DeleteRadarDataItem_ExistingQuadrant_RemovesQuadrant()
    {
        using var context = CreateContext();
        var service = new RadarDataItemService(context);
        var radar = context.Radars.First();

        // Arrange - Create quadrant to delete
        var quadrant = new Quadrant
        {
            Name = "Quadrant To Delete",
            Color = "#FF0000",
            Position = 1,
            RadarId = radar.Id
        };
        service.SaveRadarDataItem(quadrant, _claimsPrincipal);
        int quadrantId = quadrant.Id;

        // Act
        service.DeleteRadarDataItem<Quadrant>(quadrantId, _claimsPrincipal);

        // Assert
        var deletedQuadrant = context.Quadrants.FirstOrDefault(q => q.Id == quadrantId);
        Assert.That(deletedQuadrant, Is.Null);
    }

    [Test]
    public void DeleteRadarDataItem_ExistingRadarItem_RemovesRadarItemAndTags()
    {
        using var context = CreateContext();
        var service = new RadarDataItemService(context);
        var radar = context.Radars.First();

        // Arrange - Create radar item with tags to delete
        var radarItem = new RadarItem
        {
            Name = "Item To Delete",
            LegendKey = "ITD",
            Rank = 1,
            RadarId = radar.Id,
            QuadrantId = 1,
            ArcId = 1
        };
        service.SaveRadarDataItem(radarItem, _claimsPrincipal);

        // Add a tag
        var tag = new Tag { Name = "Test Tag", RadarId = radar.Id };
        context.Tags.Add(tag);
        context.SaveChanges();

        var radarItemTag = new RadarItemTag { Id = 1000, RadarItemId = radarItem.Id, TagId = tag.Id };
        context.RadarItemTags.Add(radarItemTag);
        context.SaveChanges();

        int itemId = radarItem.Id;

        // Act
        service.DeleteRadarDataItem<RadarItem>(itemId, _claimsPrincipal);

        // Assert
        var deletedItem = context.RadarItems.FirstOrDefault(ri => ri.Id == itemId);
        Assert.That(deletedItem, Is.Null);

        var deletedTags = context.RadarItemTags.Where(rt => rt.RadarItemId == itemId).ToList();
        Assert.That(deletedTags, Has.Count.EqualTo(0));
    }

    [Test]
    public void DeleteRadarDataItem_NonExistingId_DoesNotThrow()
    {
        using var context = CreateContext();
        var service = new RadarDataItemService(context);

        // Act & Assert
        Assert.DoesNotThrow(() => service.DeleteRadarDataItem<Radar>(999, _claimsPrincipal));
    }

    [Test]
    public void GetNotes_WithExistingNotes_ReturnsPagedNotes()
    {
        using var context = CreateContext();
        var service = new RadarDataItemService(context);
        var radar = context.Radars.First();

        // Arrange - Create radar item and notes
        var radarItem = new RadarItem
        {
            Name = "Item With Notes",
            LegendKey = "IWN",
            Rank = 1,
            RadarId = radar.Id,
            QuadrantId = 1,
            ArcId = 1
        };
        service.SaveRadarDataItem(radarItem, _claimsPrincipal);

        // Add multiple notes
        for (int i = 1; i <= 5; i++)
        {
            var note = new RadarItemNote
            {
                RadarItemId = radarItem.Id,
                Notes = $"Test Note {i}",
                UserId = "testuser",
                DateCreated = DateTime.UtcNow.AddDays(-i),
                DateUpdated = DateTime.UtcNow.AddDays(-i)
            };
            context.RadarItemNotes.Add(note);
        }
        context.SaveChanges();

        // Act
        var parameters = new QueryParameters { Page = 1, PageSize = 3 };
        var result = service.GetNotes(radarItem.Id, parameters);

        // Assert
        Assert.That(result, Is.Not.Null);
        using (Assert.EnterMultipleScope())
        {
            Assert.That(result, Has.Count.EqualTo(3));
            Assert.That(result.TotalCount, Is.EqualTo(5));
            Assert.That(result.CurrentPage, Is.EqualTo(1));
            Assert.That(result.TotalPages, Is.EqualTo(2));
            Assert.That(result.HasNext, Is.True);
            Assert.That(result.HasPrevious, Is.False);

            // Verify ordering (most recent first)
            Assert.That(result.First().Notes, Is.EqualTo("Test Note 1"));
            Assert.That(result.Last().Notes, Is.EqualTo("Test Note 3"));
        }
    }

    [Test]
    public void GetNotes_WithNoNotes_ReturnsEmptyPagedList()
    {
        using var context = CreateContext();
        var service = new RadarDataItemService(context);
        var radar = context.Radars.First();

        // Arrange - Create radar item without notes
        var radarItem = new RadarItem
        {
            Name = "Item Without Notes",
            LegendKey = "IWON",
            Rank = 1,
            RadarId = radar.Id,
            QuadrantId = 1,
            ArcId = 1
        };
        service.SaveRadarDataItem(radarItem, _claimsPrincipal);

        // Act
        var parameters = new QueryParameters { Page = 1, PageSize = 10 };
        var result = service.GetNotes(radarItem.Id, parameters);

        // Assert
        using (Assert.EnterMultipleScope())
        {
            Assert.That(result, Is.Not.Null);
            Assert.That(result, Has.Count.Zero);
            Assert.That(result.TotalCount, Is.Zero);
            Assert.That(result.HasNext, Is.False);
            Assert.That(result.HasPrevious, Is.False);
        }
    }

    [Test]
    public void GetNotes_SecondPage_ReturnsCorrectPage()
    {
        using var context = CreateContext();
        var service = new RadarDataItemService(context);
        var radar = context.Radars.First();

        // Arrange - Create radar item and notes
        var radarItem = new RadarItem
        {
            Name = "Item For Paging",
            LegendKey = "IFP",
            Rank = 1,
            RadarId = radar.Id,
            QuadrantId = 1,
            ArcId = 1
        };
        service.SaveRadarDataItem(radarItem, _claimsPrincipal);

        // Add notes
        for (int i = 1; i <= 7; i++)
        {
            var note = new RadarItemNote
            {
                RadarItemId = radarItem.Id,
                Notes = $"Paging Note {i}",
                UserId = "testuser",
                DateCreated = DateTime.UtcNow.AddDays(-i),
                DateUpdated = DateTime.UtcNow.AddDays(-i)
            };
            context.RadarItemNotes.Add(note);
        }
        context.SaveChanges();

        // Act
        var parameters = new QueryParameters { Page = 2, PageSize = 3 };
        var result = service.GetNotes(radarItem.Id, parameters);

        // Assert
        Assert.That(result, Is.Not.Null);
        using (Assert.EnterMultipleScope())
        {
            Assert.That(result, Has.Count.EqualTo(3));
            Assert.That(result.CurrentPage, Is.EqualTo(2));
            Assert.That(result.HasNext, Is.True);
            Assert.That(result.HasPrevious, Is.True);

            // Verify we get the second page items
            Assert.That(result.First().Notes, Is.EqualTo("Paging Note 4"));
        }
    }
}
