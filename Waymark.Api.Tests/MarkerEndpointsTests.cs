using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Waymark.Api;

namespace Waymark.Api.Tests;

public class MarkerEndpointsTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task Health_returns_ok()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Markers_returns_seeded_list()
    {
        var client = factory.CreateClient();

        var markers = await client.GetFromJsonAsync<List<Marker>>("/api/markers");

        Assert.NotNull(markers);
        Assert.NotEmpty(markers);
        Assert.All(markers, m =>
        {
            Assert.False(string.IsNullOrWhiteSpace(m.Id));
            Assert.False(string.IsNullOrWhiteSpace(m.Resolution));
        });
    }

    [Fact]
    public async Task Marker_by_id_returns_matching_detail()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/markers/vite-proxy-cold-start-404");
        var marker = await response.Content.ReadFromJsonAsync<Marker>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("vite-proxy-cold-start-404", marker!.Id);
    }

    [Fact]
    public async Task Marker_by_unknown_id_returns_not_found()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/markers/does-not-exist");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
