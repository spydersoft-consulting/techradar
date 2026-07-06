using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Spydersoft.TechRadar.Data.Api.Data;

/// <summary>
/// Class RadarItem.
/// </summary>
public class RadarItem : IRadarDataItem
{
    /// <summary>
    /// Gets or sets the identifier.
    /// </summary>
    /// <value>The identifier.</value>
    public int Id { get; set; }

    /// <summary>
    /// Befores the item save.
    /// </summary>
    /// <param name="newItem">The new item.</param>
    /// <exception cref="NotImplementedException"></exception>
    public void ProcessUpdates(IRadarDataItem newItem)
    {
        throw new NotImplementedException();
    }

    /// <summary>
    /// Gets or sets the quadrant identifier.
    /// </summary>
    /// <value>The quadrant identifier.</value>
    public int QuadrantId { get; set; }

    /// <summary>
    /// Gets or sets the radar identifier.
    /// </summary>
    /// <value>The radar identifier.</value>
    public int RadarId { get; set; }

    /// <summary>
    /// Gets or sets the arc identifier.
    /// </summary>
    /// <value>The arc identifier.</value>
    public int ArcId { get; set; }

    /// <summary>
    /// Gets or sets the name.
    /// </summary>
    /// <value>The name.</value>
    [StringLength(maximumLength: 500, MinimumLength = 5)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the URL.
    /// </summary>
    /// <value>The URL.</value>
    public string? Url { get; set; }

    /// <summary>
    /// Gets or sets the rank.
    /// </summary>
    /// <value>The rank.</value>
    public int Rank { get; set; }

    /// <summary>
    /// Gets or sets the legend key.
    /// </summary>
    /// <value>The legend key.</value>
    [DisplayName("Legend Key")]
    [StringLength(maximumLength: 15, MinimumLength = 2)]
    public string LegendKey { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the movement direction.
    /// </summary>
    /// <value>The movement direction.</value>
    public int MovementDirection { get; set; }

    /// <summary>
    /// Gets or sets the date created.
    /// </summary>
    /// <value>The date created.</value>
    public DateTime DateCreated { get; set; }

    /// <summary>
    /// Gets or sets the date updated.
    /// </summary>
    /// <value>The date updated.</value>
    public DateTime DateUpdated { get; set; }

    /// <summary>
    /// Gets or sets the tags.
    /// </summary>
    /// <value>The tags.</value>
    public virtual IList<RadarItemTag> Tags { get; set; } = new List<RadarItemTag>();

    /// <summary>
    /// Gets or sets the note field.
    /// </summary>
    /// <remarks>
    ///  This field is not stored against the radar item and is not populated on a get, but when populated as part of a
    /// post or put, will add a note along with the save.
    /// </remarks>
    /// <value>The note.</value>
    public string? Note { get; set; }
}