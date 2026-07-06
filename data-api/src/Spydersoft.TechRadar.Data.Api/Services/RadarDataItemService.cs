using Microsoft.EntityFrameworkCore;
using Spydersoft.TechRadar.Data.Api.Data;
using Spydersoft.TechRadar.Data.Api.Models;
using System;
using System.Linq;
using System.Security.Claims;

namespace Spydersoft.TechRadar.Data.Api.Services;


/// <summary>
/// Class RadarDataService.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="RadarDataItemService" /> class.
/// </remarks>
/// <param name="context">The context.</param>
public class RadarDataItemService(TechRadarContext context) : IRadarDataItemService
{
    #region Private Properties

    /// <summary>
    /// The context
    /// </summary>
    private readonly TechRadarContext _context = context;

    #endregion Private Properties
    #region Constructor

    #endregion Constructor

    #region IRadarDataItemService Implementation

    /// <summary>
    /// Loads the radar data item.
    /// </summary>
    /// <typeparam name="TRadarDataItem">The type of the t radar data item.</typeparam>
    /// <param name="id">The identifier.</param>
    /// <returns>TRadarDataItem.</returns>
    public TRadarDataItem? GetRadarDataItem<TRadarDataItem>(int id) where TRadarDataItem : class, IRadarDataItem
    {
        return _context.Set<TRadarDataItem>().FirstOrDefault(rdi => rdi.Id == id);
    }

    /// <summary>
    /// Saves the radar data item.
    /// </summary>
    /// <typeparam name="TRadarDataItem">The type of the t radar data item.</typeparam>
    /// <param name="item">The item.</param>
    /// <param name="userPrincipal">The user principal.</param>
    public void SaveRadarDataItem<TRadarDataItem>(TRadarDataItem item, ClaimsPrincipal userPrincipal) where TRadarDataItem : class, IRadarDataItem
    {
        var existing = GetRadarDataItem<TRadarDataItem>(item.Id);
        if (existing != null)
        {
            if (existing is RadarItem existingRadarItem)
            {
                var newRadarItem = item as RadarItem;
                existingRadarItem.MovementDirection =
                    GetMovementDirection(existingRadarItem.ArcId, newRadarItem?.ArcId ?? 0);
            }
            foreach (var property in typeof(TRadarDataItem).GetProperties().Where(p => p.CanWrite))
            {
                if (property.Name == nameof(item.Id)
                    || property.Name == nameof(RadarItem.DateCreated)
                    || property.Name == nameof(RadarItem.MovementDirection))
                {
                    continue;
                }

                if (property.Name == nameof(RadarItem.DateUpdated))
                {
                    property.SetValue(existing, DateTime.UtcNow, null);
                }
                else
                {
                    property.SetValue(existing, property.GetValue(item, null), null);
                }
            }

            _context.Set<TRadarDataItem>().Update(existing);
        }
        else
        {
            foreach (var property in typeof(TRadarDataItem).GetProperties().Where(p => p.CanWrite))
            {
                if (property.Name == nameof(RadarItem.DateUpdated) || property.Name == nameof(RadarItem.DateCreated))
                {
                    property.SetValue(item, DateTime.UtcNow, null);
                }
            }
            _context.Set<TRadarDataItem>().Add(item);
        }

        _context.SaveChangesWithAudit(userPrincipal?.Identity?.Name);

        if (item is Radar radar && existing == null)
        {
            AddDefaultRingsAndQuadrants(radar);
            _context.SaveChangesWithAudit(userPrincipal?.Identity?.Name);
        }

        if (item is RadarItem radarItem && !string.IsNullOrWhiteSpace(radarItem.Note))
        {
            AddNote(radarItem.Id, radarItem.Note, userPrincipal?.Identity?.Name);
            _context.SaveChangesWithAudit(userPrincipal?.Identity?.Name);
        }
    }

    /// <summary>
    /// Deletes the radar data item.
    /// </summary>
    /// <typeparam name="TRadarDataItem">The type of the t radar data item.</typeparam>
    /// <param name="id">The identifier.</param>
    /// <param name="userPrincipal">The user principal.</param>
    public void DeleteRadarDataItem<TRadarDataItem>(int id, ClaimsPrincipal userPrincipal) where TRadarDataItem : class, IRadarDataItem
    {
        var existing = GetQueryableForDelete<TRadarDataItem>()?.FirstOrDefault(a => a.Id == id);
        if (existing == null)
        {
            return;
        }

        _context.Set<TRadarDataItem>().Remove(existing);
        _context.SaveChangesWithAudit(userPrincipal?.Identity?.Name);
    }

    #endregion Generic Methods



    #region Note Functions

    /// <summary>
    /// Gets the notes.
    /// </summary>
    /// <param name="radarItemId">The radar item identifier.</param>
    /// <param name="parameters">The parameters.</param>
    /// <returns>PagedList&lt;RadarItemNote&gt;.</returns>
    public PagedList<RadarItemNote> GetNotes(int radarItemId, QueryParameters parameters)
    {
        return PagedList<RadarItemNote>.ToPagedList(
            _context.RadarItemNotes.Where(note => note.RadarItemId == radarItemId)
                .OrderByDescending(note => note.DateUpdated), parameters.Page, parameters.PageSize);
    }

    #endregion

    #region Private Support Functions

    private IQueryable<TRadarDataItem>? GetQueryableForDelete<TRadarDataItem>() where TRadarDataItem : class, IRadarDataItem
    {
        if (typeof(TRadarDataItem) == typeof(RadarItem))
        {
            return _context.RadarItems.Include(ri => ri.Tags) as IQueryable<TRadarDataItem>;
        }

        return _context.Set<TRadarDataItem>();
    }


    private int GetMovementDirection(int previousArcId, int newArcId)
    {
        if (previousArcId == newArcId)
        {
            return 0;
        }

        var prevArc = _context.RadarArcs.FirstOrDefault(arc => arc.Id == previousArcId);
        var newArc = _context.RadarArcs.FirstOrDefault(arc => arc.Id == newArcId);

        if (prevArc == null || newArc == null)
        {
            return 0;
        }

        // Negative numbers move towards the center, positive numbers move outside
        return (newArc.Position - prevArc.Position);
    }

    private void AddDefaultRingsAndQuadrants(Radar radar)
    {
        for (int quadIndex = 1; quadIndex <= 4; ++quadIndex)
        {
            var quad = new Quadrant()
            {
                Name = $"Quadrant {quadIndex}",
                Position = quadIndex,
                RadarId = radar.Id,
                Color = "#000000"
            };
            _context.Quadrants.Add(quad);
        }

        for (int arcIndex = 1; arcIndex <= 4; ++arcIndex)
        {
            var arc = new RadarArc()
            {
                Name = $"Ring {arcIndex}",
                Position = arcIndex,
                RadarId = radar.Id,
                Radius = 15,
                Color = "#000000"
            };
            _context.RadarArcs.Add(arc);
        }
    }

    private void AddNote(int radarItemId, string radarItemNote, string? identityName)
    {
        var note = new RadarItemNote
        {
            DateCreated = DateTime.UtcNow,
            DateUpdated = DateTime.UtcNow,
            RadarItemId = radarItemId,
            Notes = radarItemNote,
            UserId = identityName ?? "UnknownUser"
        };
        _context.RadarItemNotes.Add(note);
    }

    #endregion Private Support Functions
}