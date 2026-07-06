using System.ComponentModel.DataAnnotations;

namespace Spydersoft.TechRadar.Data.Api.Data;

/// <summary>
/// Class Radar.
/// </summary>
public class Radar : IRadarDataItem
{
    /// <summary>
    /// Gets or sets the identifier.
    /// </summary>
    /// <value>The identifier.</value>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the title.
    /// </summary>
    /// <value>The title.</value>
    [Required]
    [StringLength(maximumLength: 50, MinimumLength = 5)]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the description.
    /// </summary>
    /// <value>The description.</value>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the color of the background.
    /// </summary>
    /// <value>The color of the background.</value>
    public string BackgroundColor { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the color of the gridline.
    /// </summary>
    /// <value>The color of the gridline.</value>
    public string GridlineColor { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the color of the inactive.
    /// </summary>
    /// <value>The color of the inactive.</value>
    public string InactiveColor { get; set; } = string.Empty;
}