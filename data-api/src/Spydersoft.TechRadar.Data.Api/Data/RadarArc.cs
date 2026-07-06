using System.ComponentModel.DataAnnotations;

namespace Spydersoft.TechRadar.Data.Api.Data;

/// <summary>
/// Class RadarArc.
/// </summary>
public class RadarArc : IRadarDataItem
{
    /// <summary>
    /// Gets or sets the identifier.
    /// </summary>
    /// <value>The identifier.</value>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the radar identifier.
    /// </summary>
    /// <value>The radar identifier.</value>
    public int RadarId { get; set; }

    /// <summary>
    /// Gets or sets the name.
    /// </summary>
    /// <value>The name.</value>
    [Required]
    [StringLength(50, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the radius.
    /// </summary>
    /// <value>The radius.</value>
    [Required]
    public int Radius { get; set; }

    /// <summary>
    /// Gets or sets the color.
    /// </summary>
    /// <value>The color.</value>
    [Required]
    public string Color { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the position.
    /// </summary>
    /// <value>The position.</value>
    [Required]
    public int Position { get; set; }
}