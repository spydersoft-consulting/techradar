using Spydersoft.TechRadar.Data.Api.Data;
using Spydersoft.TechRadar.Data.Api.Models.Dto;
using System.Collections.Generic;
using System.Security.Claims;

namespace Spydersoft.TechRadar.Data.Api.Services;

/// <summary>
/// Interface ITagService
/// </summary>
public interface ITagService
{
    /// <summary>
    /// Gets the tags for radar.
    /// </summary>
    /// <param name="radarId">The radar identifier.</param>
    /// <returns>List&lt;SimpleTag&gt;.</returns>
    List<ItemTag> GetAllRadarTags(int radarId);

    /// <summary>
    /// Gets the radar tags for item.
    /// </summary>
    /// <param name="radarItemId">The radar item identifier.</param>
    /// <returns>List&lt;RadarItemTag&gt;.</returns>
    List<RadarItemTag> GetRadarTagsForItem(int radarItemId);

    /// <summary>
    /// Saves the tag.
    /// </summary>
    /// <param name="radarItemId">The radar item identifier.</param>
    /// <param name="tag">The tag.</param>
    /// <param name="userPrincipal">The user principal.</param>
    void SaveRadarItemTag(int radarItemId, ItemTag tag, ClaimsPrincipal userPrincipal);

    /// <summary>
    /// Removes the radar item tag.
    /// </summary>
    /// <param name="id">The identifier.</param>
    /// <param name="tagId">The tag identifier.</param>
    /// <param name="user">The user.</param>
    void RemoveRadarItemTag(int id, int tagId, ClaimsPrincipal user);
}
