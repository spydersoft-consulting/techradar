using Microsoft.AspNetCore.Mvc;
using Spydersoft.TechRadar.Data.Api.Services;
using RadarArc = Spydersoft.TechRadar.Data.Api.Data.RadarArc;

namespace Spydersoft.TechRadar.Data.Api.Controllers;

/// <summary>
/// Class ArcController.
/// Implements the <see cref="Spydersoft.TechRadar.Data.Api.Controllers.DataControllerBase" />
/// </summary>
/// <seealso cref="Spydersoft.TechRadar.Data.Api.Controllers.DataControllerBase" />
/// <remarks>
/// Initializes a new instance of the <see cref="ArcController" /> class.
/// </remarks>
/// <param name="radarDataItemService">The radar data item service.</param>
public class ArcController(IRadarDataItemService radarDataItemService) : EditControllerBase<RadarArc>(radarDataItemService)
{

    /// <summary>
    /// Deletes an Arc
    /// </summary>
    /// <param name="id">The identifier.</param>
    [HttpDelete("{id}")]
    public void Delete(int id)
    {
        RadarDataItemService.DeleteRadarDataItem<RadarArc>(id, User);
    }
}