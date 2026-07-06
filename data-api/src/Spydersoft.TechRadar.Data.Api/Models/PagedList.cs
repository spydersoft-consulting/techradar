using System;
using System.Collections.Generic;
using System.Linq;

namespace Spydersoft.TechRadar.Data.Api.Models;

/// <summary>
/// Class PagedList.
/// Implements the <see cref="System.Collections.Generic.List{T}" />
/// </summary>
/// <typeparam name="T"></typeparam>
/// <seealso cref="System.Collections.Generic.List{T}" />
public class PagedList<T> : List<T>
{
    /// <summary>
    /// Gets the current page.
    /// </summary>
    /// <value>The current page.</value>
    public int CurrentPage { get; }
    /// <summary>
    /// Gets the total pages.
    /// </summary>
    /// <value>The total pages.</value>
    public int TotalPages { get; }
    /// <summary>
    /// Gets the size of the page.
    /// </summary>
    /// <value>The size of the page.</value>
    public int PageSize { get; }
    /// <summary>
    /// Gets the total count.
    /// </summary>
    /// <value>The total count.</value>
    public int TotalCount { get; }

    /// <summary>
    /// Gets a value indicating whether this instance has previous.
    /// </summary>
    /// <value><c>true</c> if this instance has previous; otherwise, <c>false</c>.</value>
    public bool HasPrevious => CurrentPage > 1;
    /// <summary>
    /// Gets a value indicating whether this instance has next.
    /// </summary>
    /// <value><c>true</c> if this instance has next; otherwise, <c>false</c>.</value>
    public bool HasNext => CurrentPage < TotalPages;

    /// <summary>
    /// Initializes a new instance of the <see cref="PagedList{T}"/> class.
    /// </summary>
    /// <param name="items">The items.</param>
    /// <param name="count">The count.</param>
    /// <param name="pageNumber">The page number.</param>
    /// <param name="pageSize">Size of the page.</param>
    public PagedList(List<T> items, int count, int pageNumber, int pageSize)
    {
        TotalCount = count;
        PageSize = pageSize;
        CurrentPage = pageNumber;
        TotalPages = (int)Math.Ceiling(count / (double)pageSize);

        AddRange(items);
    }

    /// <summary>
    /// Converts to PagedList.
    /// </summary>
    /// <param name="source">The source.</param>
    /// <param name="pageNumber">The page number.</param>
    /// <param name="pageSize">Size of the page.</param>
    /// <returns>PagedList&lt;T&gt;.</returns>
    public static PagedList<T> ToPagedList(IQueryable<T> source, int pageNumber, int pageSize)
    {
        var count = source.Count();
        var items = source.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

        return new PagedList<T>(items, count, pageNumber, pageSize);
    }
}
