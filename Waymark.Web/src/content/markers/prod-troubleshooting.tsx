import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'prod-troubleshooting',
  title: 'Letting an agent diagnose production without console access',
  category: 'Operations',
  summary:
    "myasp.net gives no console, RDP, or FTP access, so debugging a production issue - agent or human - meant nothing to look at beyond what a user happened to report.",
  tags: ['logging', 'security', 'operations', 'serilog'],
  isIllustrative: false,
}

export default function ProdTroubleshootingPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          A user reports something went wrong in production and there's nothing to go on beyond
          their description - no console to attach to, no RDP, no way to tail a log file on the
          host. Diagnosing means guessing, reproducing locally and hoping it's the same bug, or
          asking the user for more detail they usually can't give.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          The hosting environment (see <code>myasp-deploy</code>) never exposed a shell. Two
          sibling projects, Cadence and ModelMosaic, had already solved the logs half of this;
          nothing in this workspace had solved the equivalent for database state.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Write structured logs to a rolling daily file, and expose them through an endpoint
          secured by an RSA signature from a certificate - not by the app's own user auth, which
          this app doesn't have anyway, and which wouldn't be right for an operator or agent
          credential even if it did. The private key never leaves the authorized operator's
          machine, isn't exportable, and isn't a secret this project stores anywhere - it lives
          only in that Windows user's certificate store. Only the public key (which can verify a
          signature but never create one) is committed. An unauthorized or malformed request gets
          a plain <code>404</code>, indistinguishable from a route that doesn't exist, so the
          endpoint's presence isn't advertised by a <code>401</code>/<code>403</code>.
        </p>
        <p>
          Every response also carries an <code>X-Correlation-Id</code>, and every request logs one
          summary line naming it, so a specific failed request a user reports can be found in the
          retrieved logs by that ID alone.
        </p>
        <p>
          The database half of this - endpoints that serve pertinent table state under the same
          signature scheme - has no real precedent yet anywhere in this workspace, and Waymark has
          no database (see <code>postgres-docker</code>) to build one against. The mechanism above
          - certificate-signed, <code>AllowAnonymous</code>, opaque <code>404</code> on failure -
          is the pattern to extend once a project has both a database and an actual troubleshooting
          need, rather than something to fabricate ahead of one.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">
          Taken directly from this project - the pattern Cadence established and ModelMosaic
          mirrored, implemented here for the first time with a real certificate, verified end to
          end with a real signed request against a real published build.
        </p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Waymark.Api/Operations/ProductionLogExportService.cs - signature check',
              language: 'csharp',
              code: `public bool IsAuthorized(string date, string? correlationId, string? timestamp, string? signature)
{
    if (!long.TryParse(timestamp, out var timestampSeconds) || string.IsNullOrWhiteSpace(signature)) return false;
    var maxAgeSeconds = configuration.GetValue<int?>("Operations:SignatureMaxAgeSeconds") ?? 300;
    if (Math.Abs(DateTimeOffset.UtcNow.ToUnixTimeSeconds() - timestampSeconds) > maxAgeSeconds) return false;

    var modulus = configuration["Operations:LogReaderPublicKey:Modulus"];
    var exponent = configuration["Operations:LogReaderPublicKey:Exponent"];
    if (string.IsNullOrWhiteSpace(modulus) || string.IsNullOrWhiteSpace(exponent)) return false;

    using var rsa = RSA.Create();
    rsa.ImportParameters(new RSAParameters { Modulus = Convert.FromBase64String(modulus), Exponent = Convert.FromBase64String(exponent) });
    var payload = Encoding.UTF8.GetBytes($"GET\\n/api/operations/logs/{date}\\n{correlationId ?? string.Empty}\\n{timestamp}");
    return rsa.VerifyData(payload, Convert.FromBase64String(signature), HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
}`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Waymark.Api/Program.cs - the endpoint itself',
              language: 'csharp',
              code: `api.MapGet("/operations/logs/{date}", async (string date, string? correlationId, HttpRequest request,
    HttpResponse response, ProductionLogExportService logs, CancellationToken cancellationToken) =>
{
    if (!DateOnly.TryParse(date, out var requestedDate)) return Results.BadRequest();
    if (!logs.IsAuthorized(date, correlationId, request.Headers["X-Waymark-Operator-Timestamp"].FirstOrDefault(),
            request.Headers["X-Waymark-Operator-Signature"].FirstOrDefault()))
        return Results.NotFound();
    var contents = await logs.ReadAsync(requestedDate, correlationId, cancellationToken);
    if (contents is null) return Results.NotFound();
    response.Headers.CacheControl = "no-store";
    return Results.Text(contents, "application/x-ndjson");
}).AllowAnonymous().WithName("ExportProductionLogs").ExcludeFromDescription();`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Provisioning the certificate (run once per operator/agent machine)',
              language: 'powershell',
              code: `New-SelfSignedCertificate -Subject 'CN=Waymark Production Log Reader' \`
  -CertStoreLocation Cert:\\CurrentUser\\My -KeyAlgorithm RSA -KeyLength 2048 \`
  -KeyExportPolicy NonExportable -KeyUsage DigitalSignature -NotAfter (Get-Date).AddYears(2)

# Extract the public key and commit it to appsettings.Production.json
$cert = Get-ChildItem Cert:\\CurrentUser\\My |
  Where-Object { $_.Subject -eq 'CN=Waymark Production Log Reader' }
$p = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPublicKey($cert).ExportParameters($false)
[Convert]::ToBase64String($p.Modulus)
[Convert]::ToBase64String($p.Exponent)`,
            }}
          />
          <CodeBlock
            example={{
              label: 'scripts/Get-ProductionLogs.ps1 - retrieving logs (run by an operator or an agent)',
              language: 'powershell',
              code: `./scripts/Get-ProductionLogs.ps1 -BaseUrl 'https://<site>.site4now.net' -Date 2026-09-03
# or, once a specific request's ID is known:
./scripts/Get-ProductionLogs.ps1 -BaseUrl 'https://<site>.site4now.net' -CorrelationId '<id-from-X-Correlation-Id>'`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
