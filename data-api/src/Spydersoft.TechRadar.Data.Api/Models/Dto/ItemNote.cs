namespace Spydersoft.TechRadar.Data.Api.Models.Dto;

/// <summary>
/// Class SimpleNote.
/// </summary>
public class ItemNote
{
    /// <summary>
    /// Gets or sets the note identifier.
    /// </summary>
    /// <value>The note identifier.</value>
    public int NoteId { get; set; }
    /// <summary>
    /// Gets or sets the notes.
    /// </summary>
    /// <value>The notes.</value>
    public string Notes { get; set; } = string.Empty;
}
