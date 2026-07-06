using Microsoft.AspNetCore.Mvc;
using Spydersoft.TechRadar.Data.Api.Data;
using Spydersoft.TechRadar.Data.Api.Models;
using Spydersoft.TechRadar.Data.Api.Models.Dto;
using Spydersoft.TechRadar.Data.Api.Services;
using System.Collections.Generic;
using RadarItem = Spydersoft.TechRadar.Data.Api.Data.RadarItem;

namespace Spydersoft.TechRadar.Data.Api.Controllers;

/// <summary>
/// Class ItemController.
/// Implements the <see cref="Spydersoft.TechRadar.Data.Api.Controllers.DataControllerBase" />
/// </summary>
/// <seealso cref="Spydersoft.TechRadar.Data.Api.Controllers.DataControllerBase" />
/// <remarks>
/// Initializes a new instance of the <see cref="ItemController" /> class.
/// </remarks>
/// <param name="radarDataItemService">The radar data item service.</param>
/// <param name="tagService">The tag service.</param>
public class ItemController(IRadarDataItemService radarDataItemService, ITagService tagService) : EditControllerBase<RadarItem>(radarDataItemService)
{
    /// <summary>
    /// The tag service
    /// </summary>
    private readonly ITagService _tagService = tagService;

    #region RadarItem Functions

    /// <summary>
    /// Deletes the specified identifier.
    /// </summary>
    /// <param name="id">The identifier.</param>
    [HttpDelete("{id}")]
    public void Delete(int id)
    {
        RadarDataItemService.DeleteRadarDataItem<RadarItem>(id, User);
    }

    #endregion RadarItem Functions

    #region RadarItemTag Functions

    /// <summary>
    /// Gets the tags.
    /// </summary>
    /// <param name="id">The identifier.</param>
    /// <returns>ActionResult&lt;List&lt;RadarItemTag&gt;&gt;.</returns>
    [HttpGet("{id}/tag")]
    public ActionResult<List<RadarItemTag>> GetTags(int id)
    {
        return _tagService.GetRadarTagsForItem(id);
    }

    /// <summary>
    /// Saves the new tag.
    /// </summary>
    /// <param name="id">The identifier.</param>
    /// <param name="tag">The tag.</param>
    [HttpPost("{id}/tag")]
    public void SaveNewTag(int id, [FromBody] ItemTag tag)
    {
        _tagService.SaveRadarItemTag(id, tag, User);
    }

    /// <summary>
    /// Saves the tag.
    /// </summary>
    /// <param name="id">The identifier.</param>
    /// <param name="tag">The tag.</param>
    [HttpPut("{id}/tag")]
    public void SaveTag(int id, [FromBody] ItemTag tag)
    {
        _tagService.SaveRadarItemTag(id, tag, User);
    }

    /// <summary>
    /// Deletes the tag.
    /// </summary>
    /// <param name="id">The identifier.</param>
    /// <param name="tagId">The tag identifier.</param>
    [HttpDelete("{id}/tag/{tagId}")]
    public void DeleteTag(int id, int tagId)
    {
        _tagService.RemoveRadarItemTag(id, tagId, User);
    }

    #endregion RadarItemTag Functions

    #region RadarItemNote Functions

    /// <summary>
    /// Gets the notes for this radar item
    /// </summary>
    /// <param name="id">The identifier.</param>
    /// <param name="parameters">The parameters.</param>
    /// <returns>ActionResult&lt;PagedList&lt;RadarItemNote&gt;&gt;.</returns>
    [HttpGet("{id}/note")]
    public ActionResult<PagedList<RadarItemNote>> GetNotes(int id, [FromQuery] QueryParameters parameters)
    {
        return RadarDataItemService.GetNotes(id, parameters);
    }
    #endregion

}