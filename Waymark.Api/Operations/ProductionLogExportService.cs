using System.Security.Cryptography;
using System.Text;

namespace Waymark.Api.Operations;

/// <summary>Serves structured production logs to an operator who can sign a request with the private half of
/// the certificate whose public key is configured below. This mirrors the equivalent service in the Cadence
/// and ModelMosaic repositories, which established the pattern first.</summary>
public sealed class ProductionLogExportService(IWebHostEnvironment environment, IConfiguration configuration)
{
    public bool IsAuthorized(string date, string? correlationId, string? timestamp, string? signature)
    {
        if (!long.TryParse(timestamp, out var timestampSeconds) || string.IsNullOrWhiteSpace(signature)) return false;
        var maxAgeSeconds = configuration.GetValue<int?>("Operations:SignatureMaxAgeSeconds") ?? 300;
        if (Math.Abs(DateTimeOffset.UtcNow.ToUnixTimeSeconds() - timestampSeconds) > maxAgeSeconds) return false;

        var modulus = configuration["Operations:LogReaderPublicKey:Modulus"];
        var exponent = configuration["Operations:LogReaderPublicKey:Exponent"];
        if (string.IsNullOrWhiteSpace(modulus) || string.IsNullOrWhiteSpace(exponent)) return false;

        try
        {
            using var rsa = RSA.Create();
            rsa.ImportParameters(new RSAParameters { Modulus = Convert.FromBase64String(modulus), Exponent = Convert.FromBase64String(exponent) });
            var payload = Encoding.UTF8.GetBytes($"GET\n/api/operations/logs/{date}\n{correlationId ?? string.Empty}\n{timestamp}");
            return rsa.VerifyData(payload, Convert.FromBase64String(signature), HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
        }
        catch (CryptographicException)
        {
            return false;
        }
        catch (FormatException)
        {
            return false;
        }
    }

    public async Task<string?> ReadAsync(DateOnly date, string? correlationId, CancellationToken cancellationToken)
    {
        var directory = Path.Combine(environment.ContentRootPath, configuration["Logging:File:Directory"] ?? "App_Data/logs");

        // The file sink rolls daily files on the host's local clock, which can put a request's entry a day off
        // from the UTC date callers reason about. A correlation ID is unique, so search every retained file
        // instead of trusting the caller's date to pick the right one.
        if (!string.IsNullOrWhiteSpace(correlationId))
        {
            var matches = new List<string>();
            if (Directory.Exists(directory))
            {
                foreach (var path in Directory.EnumerateFiles(directory, "waymark-*.ndjson").OrderBy(p => p))
                {
                    await using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                    using var reader = new StreamReader(stream);
                    var contents = await reader.ReadToEndAsync(cancellationToken);
                    matches.AddRange(contents.Split('\n', StringSplitOptions.RemoveEmptyEntries)
                        .Where(line => line.Contains(correlationId, StringComparison.Ordinal)));
                }
            }
            return string.Join('\n', matches);
        }

        if (date < DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-13)) || date > DateOnly.FromDateTime(DateTime.UtcNow)) return null;
        var dayPath = Path.Combine(directory, $"waymark-{date:yyyyMMdd}.ndjson");
        if (!File.Exists(dayPath)) return null;

        await using var dayStream = new FileStream(dayPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
        using var dayReader = new StreamReader(dayStream);
        return await dayReader.ReadToEndAsync(cancellationToken);
    }
}
