using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Spydersoft.TechRadar.Data.Api.Data;

/// <summary>
/// Class Tag.
/// </summary>
public class Tag : IRadarDataItem
{
    /// <summary>
    /// Gets or sets the identifier.
    /// </summary>
    /// <value>The identifier.</value>
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
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
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the description.
    /// </summary>
    /// <value>The description.</value>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the tags.
    /// </summary>
    /// <value>The tags.</value>
    [JsonIgnore]
    public ICollection<RadarItemTag>? Tags { get; set; }
}