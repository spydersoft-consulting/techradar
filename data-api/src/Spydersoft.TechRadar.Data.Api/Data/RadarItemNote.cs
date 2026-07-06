using System;

namespace Spydersoft.TechRadar.Data.Api.Data;

/// <summary>
/// Class RadarItemNote.
/// Implements the <see cref="Spydersoft.TechRadar.Data.Api.Data.IRadarDataItem" />
/// </summary>
/// <seealso cref="Spydersoft.TechRadar.Data.Api.Data.IRadarDataItem" />
public class RadarItemNote : IRadarDataItem
{
    /// <summary>
    /// Gets or sets the identifier.
    /// </summary>
    /// <value>The identifier.</value>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the radar item identifier.
    /// </summary>
    /// <value>The radar item identifier.</value>
    public int RadarItemId { get; set; }

    /// <summary>
    /// Gets or sets the notes.
    /// </summary>
    /// <value>The notes.</value>
    public string? Notes { get; set; }

    /// <summary>
    /// Gets or sets the user identifier.
    /// </summary>
    /// <value>The user identifier.</value>
    public string? UserId { get; set; }

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
}
