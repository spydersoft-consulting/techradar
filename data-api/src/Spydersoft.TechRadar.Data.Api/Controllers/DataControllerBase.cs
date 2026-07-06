using Microsoft.AspNetCore.Mvc;

namespace Spydersoft.TechRadar.Data.Api.Controllers;

/// <summary>
/// Class RadarItemControllerBase.
/// Implements the <see cref="Spydersoft.TechRadar.Data.Api.Controllers.DataControllerBase" />
/// </summary>
/// <seealso cref="Spydersoft.TechRadar.Data.Api.Controllers.DataControllerBase" />
[ApiController]
[Route("[controller]")]
public class DataControllerBase : ControllerBase
{
    /// <summary>
    /// Initializes a new instance of the <see cref="DataControllerBase" /> class.
    /// </summary>
    /// <remarks>This class provides easy access to data and services for the TechRadar.</remarks>
    public DataControllerBase()
    {

    }



    /// <summary>
    /// Options implementation for all derivative classes.
    /// </summary>
    [HttpOptions("")]
    public void Options()
    {
    }
}