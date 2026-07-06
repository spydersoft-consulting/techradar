using Spydersoft.TechRadar.Data.Api.Data;
using Spydersoft.TechRadar.Data.Api.Models;
using System.Security.Claims;

namespace Spydersoft.TechRadar.Data.Api.Services;

/// <summary>
/// Interface IRadarDataItemService
/// </summary>
public interface IRadarDataItemService
{
    /// <summary>
    /// Gets the notes.
    /// </summary>
    /// <param name="radarItemId">The radar item identifier.</param>
    /// <param name="parameters">The parameters.</param>
    /// <returns>PagedList&lt;RadarItemNote&gt;.</returns>
    PagedList<RadarItemNote> GetNotes(int radarItemId, QueryParameters parameters);

    /// <summary>
    /// Loads the radar data item.
    /// </summary>
    /// <typeparam name="TRadarDataItem">The type of the t radar data item.</typeparam>
    /// <param name="id">The identifier.</param>
    /// <returns>TRadarDataItem.</returns>
    TRadarDataItem? GetRadarDataItem<TRadarDataItem>(int id) where TRadarDataItem : class, IRadarDataItem;

    /// <summary>
    /// Saves the radar data item.
    /// </summary>
    /// <typeparam name="TRadarDataItem">The type of the t radar data item.</typeparam>
    /// <param name="item">The item.</param>
    /// <param name="userPrincipal">The user principal.</param>
    void SaveRadarDataItem<TRadarDataItem>(TRadarDataItem item, ClaimsPrincipal userPrincipal) where TRadarDataItem : class, IRadarDataItem;

    /// <summary>
    /// Deletes the radar data item.
    /// </summary>
    /// <typeparam name="TRadarDataItem">The type of the t radar data item.</typeparam>
    /// <param name="id">The identifier.</param>
    /// <param name="userPrincipal">The user principal.</param>
    void DeleteRadarDataItem<TRadarDataItem>(int id, ClaimsPrincipal userPrincipal) where TRadarDataItem : class, IRadarDataItem;
}