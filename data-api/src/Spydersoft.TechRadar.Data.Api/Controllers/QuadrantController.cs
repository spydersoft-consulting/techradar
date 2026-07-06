using Spydersoft.TechRadar.Data.Api.Data;
using Spydersoft.TechRadar.Data.Api.Services;

namespace Spydersoft.TechRadar.Data.Api.Controllers;

/// <summary>
/// Class QuadrantController.
/// Implements the <see cref="Spydersoft.TechRadar.Data.Api.Controllers.DataControllerBase" /></summary>
/// <seealso cref="Spydersoft.TechRadar.Data.Api.Controllers.DataControllerBase" />
/// <remarks>
/// Initializes a new instance of the <see cref="QuadrantController" /> class.
/// </remarks>
/// <param name="radarDataItemService">The radar data item service.</param>
public class QuadrantController(IRadarDataItemService radarDataItemService) : EditControllerBase<Quadrant>(radarDataItemService)
{
}