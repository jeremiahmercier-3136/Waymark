using Serilog;
using Serilog.Formatting.Compact;
using Waymark.Api.Operations;

var startedAt = DateTimeOffset.UtcNow;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();
builder.Services.AddSingleton<ProductionLogExportService>();

// Structured logs land here so an authorized operator (or agent holding the signing certificate) can retrieve
// them through GET /api/operations/logs/{date} without server console access - the pattern established by the
// Cadence and ModelMosaic repositories. Wrapped in try/catch so a diagnostics feature can never stop the app
// from starting; on failure it falls back to the framework's default console logging.
try
{
    var logDirectory = Path.Combine(builder.Environment.ContentRootPath, builder.Configuration["Logging:File:Directory"] ?? "App_Data/logs");
    Directory.CreateDirectory(logDirectory);
    Log.Logger = new LoggerConfiguration()
        .MinimumLevel.Information()
        .Enrich.FromLogContext()
        .WriteTo.File(new CompactJsonFormatter(), Path.Combine(logDirectory, "waymark-.ndjson"),
            rollingInterval: RollingInterval.Day,
            retainedFileCountLimit: builder.Configuration.GetValue<int?>("Logging:File:RetentionDays") ?? 14,
            shared: true)
        .CreateLogger();
    builder.Host.UseSerilog();
}
catch (Exception exception)
{
    Console.Error.WriteLine($"Could not configure file-based logging; falling back to default console logging. {exception}");
}

var app = builder.Build();
if (app.Environment.IsDevelopment()) app.MapOpenApi("/api/openapi/{documentName}.json");

// Every response carries a correlation ID, and every request logs one summary line naming it, so a specific
// failed request can be found in the retrieved logs.
app.Use(async (context, next) =>
{
    var stopwatch = System.Diagnostics.Stopwatch.StartNew();
    var correlationId = context.TraceIdentifier;
    context.Response.Headers["X-Correlation-Id"] = correlationId;
    try { await next(); }
    finally
    {
        app.Logger.LogInformation("Request {Method} {Path} completed {StatusCode} in {ElapsedMilliseconds}ms trace {TraceId}",
            context.Request.Method, context.Request.Path, context.Response.StatusCode, stopwatch.ElapsedMilliseconds, correlationId);
    }
});

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

// Secured by an RSA signature from a certificate held by an authorized operator/agent, not by user auth - this
// app has none. An unauthorized or malformed request gets a plain 404, the same as a route that doesn't exist,
// so the endpoint's presence isn't advertised by a 401/403.
api.MapGet("/operations/logs/{date}", async (string date, string? correlationId, HttpRequest request,
    HttpResponse response, ProductionLogExportService logs, CancellationToken cancellationToken) =>
{
    if (!DateOnly.TryParse(date, out var requestedDate)) return Results.BadRequest();
    if (!logs.IsAuthorized(date, correlationId, request.Headers["X-Waymark-Operator-Timestamp"].FirstOrDefault(),
            request.Headers["X-Waymark-Operator-Signature"].FirstOrDefault()))
        return Results.NotFound();
    var contents = await logs.ReadAsync(requestedDate, correlationId, cancellationToken);
    if (contents is null) return Results.NotFound();
    response.Headers.CacheControl = "no-store";
    response.Headers["X-Content-Type-Options"] = "nosniff";
    return Results.Text(contents, "application/x-ndjson");
}).AllowAnonymous().WithName("ExportProductionLogs").ExcludeFromDescription();

app.MapFallbackToFile("index.html", staticFileOptions);
app.Run();

public partial class Program { }
