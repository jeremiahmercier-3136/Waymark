using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Waymark.Api;

namespace Waymark.Api.Tests;

public class OperationsEndpointTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task Logs_without_a_signature_are_not_found()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/operations/logs/2026-09-03");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Logs_with_a_bogus_signature_are_not_found()
    {
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Waymark-Operator-Timestamp", DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString());
        client.DefaultRequestHeaders.Add("X-Waymark-Operator-Signature", "not-a-real-signature");

        var response = await client.GetAsync("/api/operations/logs/2026-09-03");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Every_response_carries_a_correlation_id()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/health");

        Assert.True(response.Headers.Contains("X-Correlation-Id"));
    }
}
