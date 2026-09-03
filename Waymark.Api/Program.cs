var startedAt = DateTimeOffset.UtcNow;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();

var app = builder.Build();
if (app.Environment.IsDevelopment()) app.MapOpenApi("/api/openapi/{documentName}.json");

var staticFileOptions = new StaticFileOptions
{
    OnPrepareResponse = context =>
    {
        var isHashedAsset = context.File.PhysicalPath?.Replace('\\', '/').Contains("/assets/") == true;
        context.Context.Response.Headers.CacheControl = isHashedAsset
            ? "public,max-age=31536000,immutable"
            : "no-cache";
    }
};

app.UseDefaultFiles();
app.UseStaticFiles(staticFileOptions);

var api = app.MapGroup("/api");
api.MapGet("/health", () => Results.Ok(new { status = "ok", application = "Waymark.Api", startedAt }));

app.MapFallbackToFile("index.html", staticFileOptions);
app.Run();

public partial class Program { }
