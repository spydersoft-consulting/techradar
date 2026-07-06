using Microsoft.AspNetCore.Authorization;
using Spydersoft.TechRadar.Data.Api.Data;
using Spydersoft.TechRadar.Data.Api.Services;

namespace Spydersoft.TechRadar.Data.Api.Controllers;

/// <summary>
/// Class TagController.
/// Implements the <see cref="Spydersoft.TechRadar.Data.Api.Controllers.DataControllerBase" />
/// </summary>
/// <seealso cref="Spydersoft.TechRadar.Data.Api.Controllers.DataControllerBase" />
/// <remarks>
/// Initializes a new instance of the <see cref="TagController" /> class.
/// </remarks>
/// <param name="radarDataItemService">The radar data item service.</param>
[Authorize()]
public class TagController(IRadarDataItemService radarDataItemService) : EditControllerBase<Tag>(radarDataItemService)
{
}