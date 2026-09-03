using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Waymark.Api.Operations;

namespace Waymark.Api.Tests;

file sealed class FakeWebHostEnvironment : IWebHostEnvironment
{
    public string ContentRootPath { get; set; } = Path.GetTempPath();
    public string WebRootPath { get; set; } = Path.GetTempPath();
    public string EnvironmentName { get; set; } = "Test";
    public string ApplicationName { get; set; } = "Waymark.Api.Tests";
    public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    public IFileProvider WebRootFileProvider { get; set; } = new NullFileProvider();
}

public class ProductionLogExportServiceTests
{
    private static (ProductionLogExportService Service, RSA Rsa) CreateAuthorizedService()
    {
        var rsa = RSA.Create(2048);
        var parameters = rsa.ExportParameters(false);
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Operations:LogReaderPublicKey:Modulus"] = Convert.ToBase64String(parameters.Modulus!),
                ["Operations:LogReaderPublicKey:Exponent"] = Convert.ToBase64String(parameters.Exponent!),
                ["Operations:SignatureMaxAgeSeconds"] = "300",
            })
            .Build();
        return (new ProductionLogExportService(new FakeWebHostEnvironment(), config), rsa);
    }

    private static string Sign(RSA rsa, string date, string? correlationId, string timestamp)
    {
        var payload = Encoding.UTF8.GetBytes($"GET\n/api/operations/logs/{date}\n{correlationId ?? string.Empty}\n{timestamp}");
        return Convert.ToBase64String(rsa.SignData(payload, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1));
    }

    [Fact]
    public void IsAuthorized_accepts_a_correctly_signed_request()
    {
        var (service, rsa) = CreateAuthorizedService();
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
        var signature = Sign(rsa, "2026-09-03", null, timestamp);

        Assert.True(service.IsAuthorized("2026-09-03", null, timestamp, signature));
    }

    [Fact]
    public void IsAuthorized_rejects_a_tampered_date()
    {
        var (service, rsa) = CreateAuthorizedService();
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
        var signature = Sign(rsa, "2026-09-03", null, timestamp);

        Assert.False(service.IsAuthorized("2026-09-04", null, timestamp, signature));
    }

    [Fact]
    public void IsAuthorized_rejects_an_expired_timestamp()
    {
        var (service, rsa) = CreateAuthorizedService();
        var timestamp = DateTimeOffset.UtcNow.AddMinutes(-10).ToUnixTimeSeconds().ToString();
        var signature = Sign(rsa, "2026-09-03", null, timestamp);

        Assert.False(service.IsAuthorized("2026-09-03", null, timestamp, signature));
    }

    [Theory]
    [InlineData(null, "not-empty")]
    [InlineData("1234", null)]
    public void IsAuthorized_rejects_missing_timestamp_or_signature(string? timestamp, string? signature)
    {
        var (service, _) = CreateAuthorizedService();

        Assert.False(service.IsAuthorized("2026-09-03", null, timestamp, signature));
    }

    [Fact]
    public void IsAuthorized_rejects_when_no_key_is_configured()
    {
        var config = new ConfigurationBuilder().Build();
        var service = new ProductionLogExportService(new FakeWebHostEnvironment(), config);
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();

        Assert.False(service.IsAuthorized("2026-09-03", null, timestamp, "any-signature"));
    }
}
