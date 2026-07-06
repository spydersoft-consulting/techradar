using System.Collections.Generic;

namespace Spydersoft.TechRadar.Data.Api.Models.RadarViewObjects;

/// <summary>
/// Class RadarData.
/// </summary>
public class RadarData
{
    /// <summary>
    /// Initializes a new instance of the <see cref="RadarData"/> class.
    /// </summary>
    public RadarData()
    {
        Quadrants = new List<RadarQuadrant>();
        Rings = new List<RadarRing>();
        Entries = new List<RadarEntry>();
    }

    /// <summary>
    /// Gets or sets the title.
    /// </summary>
    /// <value>The title.</value>
    public string? Title { get; set; }

    /// <summary>
    /// Gets or sets the height.
    /// </summary>
    /// <value>The height.</value>
    public int Height { get; set; }

    /// <summary>
    /// Gets or sets the width.
    /// </summary>
    /// <value>The width.</value>
    public int Width { get; set; }

    /// <summary>
    /// Gets or sets the colors.
    /// </summary>
    /// <value>The colors.</value>
    public ColorSettings? Colors { get; set; }

    /// <summary>
    /// Gets or sets the quadrants.
    /// </summary>
    /// <value>The quadrants.</value>
    public List<RadarQuadrant> Quadrants { get; set; }

    /// <summary>
    /// Gets or sets the rings.
    /// </summary>
    /// <value>The rings.</value>
    public List<RadarRing> Rings { get; set; }

    /// <summary>
    /// Gets or sets the entries.
    /// </summary>
    /// <value>The entries.</value>
    public List<RadarEntry> Entries { get; set; }
}