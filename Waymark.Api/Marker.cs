namespace Waymark.Api;

public sealed record Marker(
    string Id,
    string Title,
    string Category,
    string Summary,
    string Symptoms,
    string RootCause,
    string Resolution,
    string[] Tags);
