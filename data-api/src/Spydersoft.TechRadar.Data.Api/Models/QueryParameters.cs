namespace Spydersoft.TechRadar.Data.Api.Models;

/// <summary>
/// Class QueryParameters.
/// </summary>
public class QueryParameters
{
    /// <summary>
    /// The maximum page size
    /// </summary>
    private const int MaxPageSize = 50;

    /// <summary>
    /// Gets or sets the page.
    /// </summary>
    /// <value>The page.</value>
    public int Page { get; set; } = 1;

    /// <summary>
    /// The page size
    /// </summary>
    private int _pageSize = 10;

    /// <summary>
    /// Gets or sets the size of the page.
    /// </summary>
    /// <value>The size of the page.</value>
    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = (value > MaxPageSize) ? MaxPageSize : value;
    }
}
