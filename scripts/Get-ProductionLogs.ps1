[CmdletBinding()]
param(
    [string] $BaseUrl,
    [datetime] $Date = (Get-Date),
    [string] $CorrelationId
)

if ([string]::IsNullOrWhiteSpace($BaseUrl)) { throw 'Pass -BaseUrl for this site (its myasp.net URL - see the myasp-deploy marker).' }

$certificate = Get-ChildItem Cert:\CurrentUser\My | Where-Object {
    $_.Subject -eq 'CN=Waymark Production Log Reader' -and $_.HasPrivateKey -and $_.NotAfter -gt (Get-Date)
} | Sort-Object NotAfter -Descending | Select-Object -First 1
if ($null -eq $certificate) { throw 'Waymark production-log reader certificate is not installed for this Windows user.' }

$dateText = $Date.ToUniversalTime().ToString('yyyy-MM-dd')
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds().ToString()
$payload = "GET`n/api/operations/logs/$dateText`n$CorrelationId`n$timestamp"
$rsa = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($certificate)
try {
    $signature = [Convert]::ToBase64String($rsa.SignData([Text.Encoding]::UTF8.GetBytes($payload), [Security.Cryptography.HashAlgorithmName]::SHA256, [Security.Cryptography.RSASignaturePadding]::Pkcs1))
}
finally { $rsa.Dispose() }

$uri = '{0}/api/operations/logs/{1}' -f $BaseUrl.TrimEnd('/'), $dateText
if (-not [string]::IsNullOrWhiteSpace($CorrelationId)) { $uri += '?correlationId=' + [uri]::EscapeDataString($CorrelationId) }
$outFile = "waymark-{0}.ndjson" -f $dateText.Replace('-', '')
Invoke-WebRequest -Uri $uri -Headers @{ 'X-Waymark-Operator-Timestamp' = $timestamp; 'X-Waymark-Operator-Signature' = $signature } -OutFile $outFile
$outFile
