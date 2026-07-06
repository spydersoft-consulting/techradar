namespace Spydersoft.TechRadar.Data.Api.Models;

/// <summary>
/// Class FilterParameters.
/// </summary>
public class FilterParameters
{
    /// <summary>
    /// Gets or sets the tags.
    /// </summary>
    /// <value>The tags.</value>
    public int[]? Tags { get; set; } = null;

    /// <summary>
    /// Gets or sets the updated within days.
    /// </summary>
    /// <value>The updated within days.</value>
    public int UpdatedWithinDays { get; set; }
}