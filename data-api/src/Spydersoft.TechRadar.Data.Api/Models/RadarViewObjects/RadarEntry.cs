namespace Spydersoft.TechRadar.Data.Api.Models.RadarViewObjects;

/// <summary>
/// Class RadarEntry.
/// </summary>
public class RadarEntry
{
    /// <summary>
    /// Gets or sets the quadrant.
    /// </summary>
    /// <value>The quadrant.</value>
    public int Quadrant { get; set; }

    /// <summary>
    /// Gets or sets the ring.
    /// </summary>
    /// <value>The ring.</value>
    public int Ring { get; set; }

    /// <summary>
    /// Gets or sets the label.
    /// </summary>
    /// <value>The label.</value>
    public string? Label { get; set; }

    /// <summary>
    /// Gets or sets the Legend Key for the item
    /// </summary>
    public string? LegendKey { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this <see cref="RadarEntry"/> is active.
    /// </summary>
    /// <value><c>true</c> if active; otherwise, <c>false</c>.</value>
    public bool Active { get; set; }

    /// <summary>
    /// Gets or sets the link.
    /// </summary>
    /// <value>The link.</value>
    public string? Link { get; set; }

    /// <summary>
    /// Gets or sets the moved.
    /// </summary>
    /// <value>The moved.</value>
    public int Moved { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this instance is new.
    /// </summary>
    /// <value><c>true</c> if this instance is new; otherwise, <c>false</c>.</value>
    public bool IsNew { get; set; }
}