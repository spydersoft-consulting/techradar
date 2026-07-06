using Spydersoft.TechRadar.Data.Api.Data;
using Spydersoft.TechRadar.Data.Api.Models;
using Spydersoft.TechRadar.Data.Api.Models.RadarViewObjects;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Spydersoft.TechRadar.Data.Api.Services;

/// <summary>
/// Interface IRadarService
/// </summary>
public interface IRadarService
{
    /// <summary>
    /// Gets the radar list.
    /// </summary>
    /// <returns>List&lt;Radar&gt;.</returns>
    Task<List<Radar>> GetRadarList();

    /// <summary>
    /// Loads the radar data.
    /// </summary>
    /// <param name="id">The identifier.</param>
    /// <param name="filterParameters">The filter parameters.</param>
    /// <returns>RadarData.</returns>
    RadarData? LoadRadarData(int id, FilterParameters filterParameters);

    /// <summary>
    /// Gets the items.
    /// </summary>
    /// <param name="id">The identifier.</param>
    /// <param name="parameters">The parameters.</param>
    /// <returns>ActionResult&lt;List&lt;RadarItem&gt;&gt;.</returns>
    List<RadarItem> GetItems(int id, RadarQueryParameters parameters);

    /// <summary>
    /// Gets the arcs.
    /// </summary>
    /// <param name="id">The identifier.</param>
    /// <returns>List&lt;RadarArc&gt;.</returns>
    List<RadarArc> GetArcs(int id);

    /// <summary>
    /// Gets the quadrants.
    /// </summary>
    /// <param name="id">The identifier.</param>
    /// <returns>List&lt;Quadrant&gt;.</returns>
    List<Quadrant> GetQuadrants(int id);
}
