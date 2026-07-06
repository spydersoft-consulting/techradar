using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Spydersoft.TechRadar.Data.Api.Data;

/// <summary>
/// Class TechRadarContext.
/// Implements the <see cref="Microsoft.EntityFrameworkCore.DbContext" />
/// </summary>
/// <seealso cref="Microsoft.EntityFrameworkCore.DbContext" />
/// <remarks>
/// Initializes a new instance of the <see cref="TechRadarContext"/> class.
/// </remarks>
/// <param name="options">The options for this context.</param>
public class TechRadarContext(DbContextOptions options) : DbContext(options)
{
    /// <summary>
    /// Gets or sets the radar arcs.
    /// </summary>
    /// <value>The radar arcs.</value>
    public virtual DbSet<RadarArc> RadarArcs { get; set; }

    /// <summary>
    /// Gets or sets the quadrants.
    /// </summary>
    /// <value>The quadrants.</value>
    public virtual DbSet<Quadrant> Quadrants { get; set; }

    /// <summary>
    /// Gets or sets the radar items.
    /// </summary>
    /// <value>The radar items.</value>
    public virtual DbSet<RadarItem> RadarItems { get; set; }

    /// <summary>
    /// Gets or sets the radars.
    /// </summary>
    /// <value>The radars.</value>
    public virtual DbSet<Radar> Radars { get; set; }

    /// <summary>
    /// Gets or sets the tags.
    /// </summary>
    /// <value>The tags.</value>
    public virtual DbSet<Tag> Tags { get; set; }

    /// <summary>
    /// Gets or sets the radar item tags.
    /// </summary>
    /// <value>The radar item tags.</value>
    public virtual DbSet<RadarItemTag> RadarItemTags { get; set; }

    /// <summary>
    /// Gets or sets the radar item notes.
    /// </summary>
    /// <value>The radar item notes.</value>
    public virtual DbSet<RadarItemNote> RadarItemNotes { get; set; }

    /// <summary>
    /// Gets or sets the audits.
    /// </summary>
    /// <value>The audits.</value>
    public virtual DbSet<Audit> Audits { get; set; }

    /// <summary>
    /// DbContext configuration.
    /// </summary>
    /// <remarks>Overriden to add the SnakeCaseNamingConvention for PostgreSQL.</remarks>
    /// <param name="optionsBuilder"></param>
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder.UseSnakeCaseNamingConvention();
    }

    /// <summary>
    /// Override this method to further configure the model that was discovered by convention from the entity types
    /// exposed in <see cref="T:Microsoft.EntityFrameworkCore.DbSet`1" /> properties on your derived context. The resulting model may be cached
    /// and re-used for subsequent instances of your derived context.
    /// </summary>
    /// <param name="modelBuilder">The builder being used to construct the model for this context. Databases (and other extensions) typically
    /// define extension methods on this object that allow you to configure aspects of the model that are specific
    /// to a given database.</param>
    /// <remarks>If a model is explicitly set on the options for this context (via <see cref="M:Microsoft.EntityFrameworkCore.DbContextOptionsBuilder.UseModel(Microsoft.EntityFrameworkCore.Metadata.IModel)" />)
    /// then this method will not be run.</remarks>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure PostgreSQL to use snake_case naming convention
        modelBuilder.HasPostgresExtension("uuid-ossp");

        modelBuilder.Entity<Radar>(entity =>
        {
            entity.Property(e => e.Title).IsRequired();
        });

        modelBuilder.Entity<RadarItem>(entity => { entity.Ignore(e => e.Note); });

        modelBuilder.Entity<Tag>().HasKey(t => t.Id);

        // Configure RadarItemTag with composite key
        modelBuilder.Entity<RadarItemTag>()
            .HasKey(rit => new { rit.RadarItemId, rit.TagId });

        modelBuilder.Entity<RadarItemTag>()
            .HasOne(rit => rit.RadarItem)
            .WithMany(ri => ri.Tags)
            .HasForeignKey(rit => rit.RadarItemId);

        modelBuilder.Entity<RadarItemTag>()
            .HasOne(rit => rit.Tag)
            .WithMany(t => t.Tags)
            .HasForeignKey(rit => rit.TagId);
    }

    /// <summary>
    /// Saves the changes with audit.
    /// </summary>
    /// <param name="userId">The user identifier.</param>
    /// <returns>System.Int32.</returns>
    public int SaveChangesWithAudit(string? userId)
    {
        if (userId is null)
        {
            return base.SaveChanges();
        }

        var auditEntries = OnBeforeSaveChanges(userId);
        var result = base.SaveChanges();
        OnAfterSaveChanges(auditEntries).Wait();
        return result;
    }

    private List<AuditEntry> OnBeforeSaveChanges(string userId)
    {
        ChangeTracker.DetectChanges();
        var auditEntries = new List<AuditEntry>();
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is Audit || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
            {
                continue;
            }

            var auditEntry = new AuditEntry(entry)
            {
                TableName = entry.Metadata.GetDefaultTableName(),
                UserId = userId
            };
            auditEntries.Add(auditEntry);

            foreach (var property in entry.Properties)
            {
                if (property.IsTemporary)
                {
                    // value will be generated by the database, get the value after saving
                    auditEntry.TemporaryProperties.Add(property);
                    continue;
                }

                string propertyName = property.Metadata.Name;
                if (property.Metadata.IsPrimaryKey())
                {
                    auditEntry.KeyValues[propertyName] = property.CurrentValue;
                    continue;
                }

                switch (entry.State)
                {
                    case EntityState.Added:
                        auditEntry.NewValues[propertyName] = property.CurrentValue;
                        break;

                    case EntityState.Deleted:
                        auditEntry.OldValues[propertyName] = property.OriginalValue;
                        break;

                    case EntityState.Modified:
                        if (property.IsModified && !Equals(property.CurrentValue, property.OriginalValue))
                        {
                            auditEntry.OldValues[propertyName] = property.OriginalValue;
                            auditEntry.NewValues[propertyName] = property.CurrentValue;
                        }
                        break;
                }
            }
        }

        // Save audit entities that have all the modifications
        foreach (var auditEntry in auditEntries.Where(_ => !_.HasTemporaryProperties))
        {
            Audits.Add(auditEntry.ToAudit());
        }

        // keep a list of entries where the value of some properties are unknown at this step
        return auditEntries.Where(_ => _.HasTemporaryProperties).ToList();
    }

    private Task OnAfterSaveChanges(List<AuditEntry> auditEntries)
    {
        if (auditEntries == null || auditEntries.Count == 0)
        {
            return Task.CompletedTask;
        }

        foreach (var auditEntry in auditEntries)
        {
            // Get the final value of the temporary properties
            foreach (var prop in auditEntry.TemporaryProperties)
            {
                if (prop.Metadata.IsPrimaryKey())
                {
                    auditEntry.KeyValues[prop.Metadata.Name] = prop.CurrentValue;
                }
                else
                {
                    auditEntry.NewValues[prop.Metadata.Name] = prop.CurrentValue;
                }
            }

            // Save the Audit entry
            Audits.Add(auditEntry.ToAudit());
        }

        return SaveChangesAsync();
    }
}

/// <summary>
/// Class AuditEntry.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="AuditEntry" /> class.
/// </remarks>
/// <param name="entry">The entry.</param>
public class AuditEntry(EntityEntry entry)
{

    /// <summary>
    /// Gets the entry.
    /// </summary>
    /// <value>The entry.</value>
    public EntityEntry Entry { get; } = entry;

    /// <summary>
    /// Gets or sets the name of the table.
    /// </summary>
    /// <value>The name of the table.</value>
    public string? TableName { get; set; }

    /// <summary>
    /// Gets or sets the user identifier.
    /// </summary>
    /// <value>The user identifier.</value>
    public string? UserId { get; set; }

    /// <summary>
    /// Gets the key values.
    /// </summary>
    /// <value>The key values.</value>
    public Dictionary<string, object?> KeyValues { get; } = new Dictionary<string, object?>();

    /// <summary>
    /// Gets the old values.
    /// </summary>
    /// <value>The old values.</value>
    public Dictionary<string, object?> OldValues { get; } = new Dictionary<string, object?>();

    /// <summary>
    /// Creates new values.
    /// </summary>
    /// <value>The new values.</value>
    public Dictionary<string, object?> NewValues { get; } = new Dictionary<string, object?>();

    /// <summary>
    /// Gets the temporary properties.
    /// </summary>
    /// <value>The temporary properties.</value>
    public List<PropertyEntry> TemporaryProperties { get; } = new List<PropertyEntry>();

    /// <summary>
    /// Gets the has temporary properties.
    /// </summary>
    /// <value>The has temporary properties.</value>
    public bool HasTemporaryProperties => TemporaryProperties.Any();

    /// <summary>
    /// Converts to audit.
    /// </summary>
    /// <returns>Audit.</returns>
    public Audit ToAudit()
    {
        var audit = new Audit
        {
            TableName = TableName ?? "UnknownTable",
            AuditDateTime = DateTime.UtcNow,
            KeyValues = JsonSerializer.Serialize(KeyValues),
            OldValues = OldValues.Count != 0 ? JsonSerializer.Serialize(OldValues) : string.Empty,
            NewValues = NewValues.Count != 0 ? JsonSerializer.Serialize(NewValues) : string.Empty,
            UserId = UserId ?? "UnknownUser"
        };
        return audit;
    }
}