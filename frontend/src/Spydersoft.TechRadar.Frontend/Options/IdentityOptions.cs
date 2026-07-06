namespace Spydersoft.TechRadar.Frontend.Options;

/// <summary>
/// Class IdentityOptions.
/// </summary>
public class IdentityOptions
{
    /// <summary>
    /// The section name
    /// </summary>
    public const string SectionName = "Identity";

    public string Scheme { get; set; } = "Duende";

    /// <summary>
    /// Gets or sets the authority.
    /// </summary>
    /// <value>The authority.</value>
    public string? Authority { get; set; } = null;

    /// <summary>
    /// Gets or sets the name of the application.
    /// </summary>
    /// <value>The name of the application.</value>
    public string? ClientId { get; set; } = null;

    public string? ClientSecret { get; set; } = null;

    public string? Audience { get; set; } = null;
}
