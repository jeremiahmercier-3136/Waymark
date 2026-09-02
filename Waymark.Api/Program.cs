var startedAt = DateTimeOffset.UtcNow;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();
builder.Services.AddSingleton<Waymark.Api.MarkerStore>();

var app = builder.Build();
if (app.Environment.IsDevelopment()) app.MapOpenApi("/api/openapi/{documentName}.json");
app.UseDefaultFiles();
app.UseStaticFiles();

var api = app.MapGroup("/api");
api.MapGet("/health", () => Results.Ok(new { status = "ok", application = "Waymark.Api", startedAt }));
api.MapGet("/markers", (Waymark.Api.MarkerStore store) => Results.Ok(store.List()));
api.MapGet("/markers/{id}", (string id, Waymark.Api.MarkerStore store) =>
    store.Find(id) is { } marker ? Results.Ok(marker) : Results.NotFound());

app.MapFallbackToFile("index.html");
app.Run();

public partial class Program { }
