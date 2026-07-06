using Microsoft.EntityFrameworkCore;
using Spydersoft.TechRadar.Data.Api.Data;
using Spydersoft.TechRadar.Data.Api.Models;
using Spydersoft.TechRadar.Data.Api.Models.RadarViewObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Spydersoft.TechRadar.Data.Api.Services;

/// <summary>
/// Class RadarService.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="RadarService"/> class.
/// </remarks>
/// <param name="context">The context.</param>
public class RadarService(TechRadarContext context) : IRadarService
{
    /// <summary>
    /// The context
    /// </summary>
    private readonly TechRadarContext _context = context;

    /// <summary>
    /// Gets the radar list.
    /// </summary>
    /// <returns>List&lt;Radar&gt;.</returns>
    public async Task<List<Radar>> GetRadarList()
    {
        return await _context.Radars.ToListAsync();
    }

    /// <summary>
    /// Loads the radar data.
    /// </summary>
    /// <param name="id">The identifier.</param>
    /// <param name="filterParameters">The filter parameters.</param>
    /// <returns>RadarData.</returns>
    public RadarData? LoadRadarData(int id, FilterParameters filterParameters)
    {
        var radar = _context.Radars.FirstOrDefault(r => r.Id == id);

        if (radar == null)
        {
            return null;
        }

        var data = new RadarData
        {
            Height = 1400,
            Width = 1400,
            Title = radar.Title,
            Colors = new ColorSettings
            {
                Background = radar.BackgroundColor,
                Grid = radar.GridlineColor,
                Inactive = radar.InactiveColor
            }
        };

        var ringIndex = new Dictionary<int, int>();
        var index = 0;
        foreach (var arc in _context.RadarArcs.Where(ra => ra.RadarId == id).OrderBy(ra => ra.Position))
        {
            data.Rings.Add(new RadarRing { Name = arc.Name, Color = arc.Color, Radius = arc.Radius });
            ringIndex[arc.Id] = index++;
        }

        var quadrantIndex = new Dictionary<int, int>();
        index = 0;
        foreach (var quad in _context.Quadrants.Where(qd => qd.RadarId == id).OrderBy(qd => qd.Position))
        {
            data.Quadrants.Add(new RadarQuadrant { Name = quad.Name, Color = quad.Color });
            quadrantIndex[quad.Id] = index++;
        }

        var cutoffDate = DateTime.MinValue;
        if (filterParameters.UpdatedWithinDays > 0)
        {
            cutoffDate = DateTime.UtcNow.AddDays(-1 * filterParameters.UpdatedWithinDays);
        }

        foreach (var radarItem in _context.RadarItems
            .Include(radarItem => radarItem.Tags)
            .Where(ri => ri.RadarId == id && (filterParameters.Tags == null || ri.Tags.Any(t => filterParameters.Tags.Contains(t.TagId)))
                         && (ri.DateCreated > cutoffDate || ri.DateUpdated > cutoffDate)))
        {
            data.Entries.Add(new RadarEntry
            {
                Active = true,
                LegendKey = string.IsNullOrWhiteSpace(radarItem.LegendKey) ? (radarItem.Name.Length > 15 ? radarItem.Name.Substring(0, 15) : radarItem.Name) : radarItem.LegendKey,
                Label = radarItem.Name,
                Link = radarItem.Url,
                Moved = radarItem.DateUpdated > DateTime.UtcNow.AddDays(-90) ? radarItem.MovementDirection : 0,
                Quadrant = quadrantIndex[radarItem.QuadrantId],
                Ring = ringIndex[radarItem.ArcId],
                IsNew = radarItem.DateCreated > DateTime.UtcNow.AddDays(-90)
            });
        }

        return data;
    }

    /// <summary>
    /// Gets the items.
    /// </summary>
    /// <param name="id">The identifier.</param>
    /// <param name="parameters">The parameters.</param>
    /// <returns>ActionResult&lt;List&lt;RadarItem&gt;&gt;.</returns>
    public List<RadarItem> GetItems(int id, RadarQueryParameters parameters)
    {
        var query = _context.RadarItems.Where(ri => ri.RadarId == id);

        if (parameters.ArcId.HasValue && parameters.ArcId > 0)
        {
            query = query.Where(q => q.ArcId == parameters.ArcId);
        }

        if (parameters.QuadrantId.HasValue && parameters.QuadrantId > 0)
        {
            query = query.Where(q => q.QuadrantId == parameters.QuadrantId);
        }

        if (parameters.TagId.HasValue && parameters.TagId > 0)
        {
            query = query.Where(ri => ri.Tags.Any(t => t.TagId == parameters.TagId));
        }

        return query.OrderBy(ri => ri.Name).ToList();
    }

    /// <summary>
    /// Gets the arcs.
    /// </summary>
    /// <param name="id">The identifier.</param>
    /// <returns>List&lt;RadarArc&gt;.</returns>
    public List<RadarArc> GetArcs(int id)
    {
        return _context.RadarArcs.Where(ra => ra.RadarId == id).OrderBy(ra => ra.Position).ToList();
    }

    /// <summary>
    /// Gets the quadrants.
    /// </summary>
    /// <param name="id">The identifier.</param>
    /// <returns>List&lt;Quadrant&gt;.</returns>
    public List<Quadrant> GetQuadrants(int id)
    {
        return _context.Quadrants.Where(q => q.RadarId == id).OrderBy(q => q.Position).ToList();
    }
}
