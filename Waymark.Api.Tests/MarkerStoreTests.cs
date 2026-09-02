namespace Waymark.Api.Tests;

public class MarkerStoreTests
{
    [Fact]
    public void List_returns_markers_with_unique_ids()
    {
        var store = new MarkerStore();

        var ids = store.List().Select(m => m.Id).ToList();

        Assert.Equal(ids.Distinct().Count(), ids.Count);
    }

    [Fact]
    public void Find_is_case_insensitive()
    {
        var store = new MarkerStore();

        var marker = store.Find("VITE-PROXY-COLD-START-404");

        Assert.NotNull(marker);
    }

    [Fact]
    public void Find_returns_null_for_unknown_id()
    {
        var store = new MarkerStore();

        Assert.Null(store.Find("nope"));
    }
}
