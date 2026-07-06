namespace Spydersoft.TechRadar.Data.Api.Models.Dto;

/// <summary>
/// Class SimpleTag.
/// </summary>
public class ItemTag
{
    /// <summary>
    /// Gets or sets the tag identifier.
    /// </summary>
    /// <value>The tag identifier.</value>
    public int TagId { get; set; }

    /// <summary>
    /// Gets or sets the name.
    /// </summary>
    /// <value>The name.</value>
    public string Name { get; set; } = string.Empty;
}