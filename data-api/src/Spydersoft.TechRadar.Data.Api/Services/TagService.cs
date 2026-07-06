using Microsoft.EntityFrameworkCore;
using Spydersoft.TechRadar.Data.Api.Data;
using Spydersoft.TechRadar.Data.Api.Models.Dto;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace Spydersoft.TechRadar.Data.Api.Services;

/// <summary>
/// Class TagService.
/// Implements the <see cref="Spydersoft.TechRadar.Data.Api.Services.ITagService" />
/// </summary>
/// <seealso cref="Spydersoft.TechRadar.Data.Api.Services.ITagService" />
/// <remarks>
/// Initializes a new instance of the <see cref="TagService"/> class.
/// </remarks>
/// <param name="context">The context.</param>
public class TagService(TechRadarContext context) : ITagService
{
    private readonly TechRadarContext _context = context;

    #region ITagService Functions

    /// <summary>
    /// Gets the tags for radar.
    /// </summary>
    /// <param name="radarId">The radar identifier.</param>
    /// <returns>List&lt;SimpleTag&gt;.</returns>
    public List<ItemTag> GetAllRadarTags(int radarId)
    {
        var tags = new List<ItemTag>();

        foreach (var tag in _context.Tags
            .Where(t => t.RadarId == radarId))
        {
            if (tags.All(t => t.TagId != tag.Id))
            {
                tags.Add(new ItemTag
                {
                    Name = tag.Name,
                    TagId = tag.Id
                });
            }
        }

        return tags.OrderBy(t => t.Name).ToList();
    }

    /// <summary>
    /// Gets the radar tags for item.
    /// </summary>
    /// <param name="radarItemId">The radar item identifier.</param>
    /// <returns>List&lt;RadarItemTag&gt;.</returns>
    public List<RadarItemTag> GetRadarTagsForItem(int radarItemId)
    {
        return _context.RadarItemTags.Where(rit => rit.RadarItemId == radarItemId).ToList();
    }

    /// <summary>
    /// Saves the tag.
    /// </summary>
    /// <param name="radarItemId">The radar item identifier.</param>
    /// <param name="tag">The tag.</param>
    /// <param name="userPrincipal">The user principal.</param>
    public void SaveRadarItemTag(int radarItemId, ItemTag tag, ClaimsPrincipal userPrincipal)
    {
        var item = _context.RadarItems
            .Include(radarItem => radarItem.Tags)
            .FirstOrDefault(ri => ri.Id == radarItemId);

        if (item == null)
        {
            return;
        }

        if (tag.TagId != 0)
        {
            // if the tag id passed in does not match a tag in the system
            if (_context.Tags.All(t => t.RadarId == item.RadarId && t.Id == tag.TagId))
            {
                // TODO: Log error and potentially return false or unsuccessful result;
                return;
            }


            // verify the desired tag doesn't already exist on the item
            var dataTag = item.Tags?.FirstOrDefault(t => t.TagId == tag.TagId);
            if (dataTag != null)
            {
                // TODO: Log error and potentially return false or unsuccessful result;
                return;
            }
        }
        else
        {
            // The incoming tag needs added to the radar
            var newTag = new Tag { Name = tag.Name, Description = tag.Name, RadarId = item.RadarId };
            _context.Tags.Add(newTag);
            _context.SaveChangesWithAudit(userPrincipal?.Identity?.Name);
            tag.TagId = newTag.Id;
        }

        var radarItemTag = new RadarItemTag { TagId = tag.TagId, RadarItemId = radarItemId };
        _context.RadarItemTags.Add(radarItemTag);
        _context.SaveChangesWithAudit(userPrincipal?.Identity?.Name);
    }

    /// <summary>
    /// Removes the radar item tag.
    /// </summary>
    /// <param name="id">The identifier.</param>
    /// <param name="tagId">The tag identifier.</param>
    /// <param name="user">The user.</param>
    public void RemoveRadarItemTag(int id, int tagId, ClaimsPrincipal user)
    {
        var item = _context.RadarItems
            .Include(radarItem => radarItem.Tags)
            .FirstOrDefault(ri => ri.Id == id);

        var tag = item?.Tags?.FirstOrDefault(t => t.TagId == tagId);
        if (tag == null)
        {
            return;
        }
        _context.RadarItemTags.Remove(tag);
        _context.SaveChangesWithAudit(user.Identity?.Name);
    }

    #endregion Tag Functions
}
