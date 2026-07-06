using System;

namespace Spydersoft.TechRadar.Data.Api.Data;

/// <summary>
/// Class Audit.
/// </summary>
public class Audit
{
    /// <summary>
    /// Gets or sets the identifier.
    /// </summary>
    /// <value>The identifier.</value>
    public int Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the table.
    /// </summary>
    /// <value>The name of the table.</value>
    public string? TableName { get; set; }

    /// <summary>
    /// Gets or sets the date time.
    /// </summary>
    /// <value>The date time.</value>
    public DateTime AuditDateTime { get; set; }

    /// <summary>
    /// Gets or sets the key values.
    /// </summary>
    /// <value>The key values.</value>
    public string? KeyValues { get; set; }

    /// <summary>
    /// Gets or sets the old values.
    /// </summary>
    /// <value>The old values.</value>
    public string? OldValues { get; set; }

    /// <summary>
    /// Creates new values.
    /// </summary>
    /// <value>The new values.</value>
    public string? NewValues { get; set; }

    /// <summary>
    /// Gets or sets the user identifier.
    /// </summary>
    /// <value>The user identifier.</value>
    public string? UserId { get; set; }
}