using Microsoft.AspNetCore.Mvc;
using Spydersoft.TechRadar.Data.Api.Data;
using Spydersoft.TechRadar.Data.Api.Models;
using Spydersoft.TechRadar.Data.Api.Models.Dto;
using Spydersoft.TechRadar.Data.Api.Models.RadarViewObjects;
using Spydersoft.TechRadar.Data.Api.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Spydersoft.TechRadar.Data.Api.Controllers;

/// <summary>
/// Class RadarDataController.
/// Implements the <see cref="Spydersoft.TechRadar.Data.Api.Controllers.DataControllerBase" />
/// </summary>
/// <seealso cref="Spydersoft.TechRadar.Data.Api.Controllers.DataControllerBase" />
/// <remarks>
/// Initializes a new instance of the <see cref="RadarDataController" /> class.
/// </remarks>
/// <param name="radarService">The radar service.</param>
/// <param name="tagService">The tag service.</param>
public class RadarDataController(IRadarService radarService, ITagService tagService) : DataControllerBase()
{
    /// <summary>
    /// The radar service
    /// </summary>
    private readonly IRadarService _radarService = radarService;

    /// <summary>
    /// The tag service
    /// </summary>
    private readonly ITagService _tagService = tagService;

    /// <summary>
    /// Gets this instance.
    /// </summary>
    /// <returns>ActionResult&lt;List&lt;Radar&gt;&gt;.</returns>
    [HttpGet("")]
    public async Task<ActionResult<List<Radar>>> Get()
    {
        return await _radarService.GetRadarList();
    }

    /// <summary>
    /// Gets the specified identifier.
    /// </summary>
    /// <param name="id">The identifier.</param>
    /// <param name="filterParameters">The filter parameters.</param>
    /// <returns>ActionResult&lt;RadarData&gt;.</returns>
    [HttpGet("{id}")]
    public ActionResult<RadarData?> Get(int id, [FromQuery] FilterParameters filterParameters)
    {
        return _radarService.LoadRadarData(id, filterParameters);
    }

    /// <summary>
    /// Gets the tags.
    /// </summary>
    /// <param name="id">The identifier.</param>
    /// <returns>ActionResult&lt;List&lt;SimpleTag&gt;&gt;.</returns>
    [HttpGet("{id}/tags")]
    public ActionResult<List<ItemTag>> GetTags(int id)
    {
        return _tagService.GetAllRadarTags(id);
    }
}