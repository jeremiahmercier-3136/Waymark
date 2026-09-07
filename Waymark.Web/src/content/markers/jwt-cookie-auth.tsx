import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'jwt-cookie-auth',
  title: 'A decodable JWT in an HttpOnly cookie, with server-side revocation',
  category: 'Security',
  summary:
    'DMGPT, Cadence, MedServ, ModelMosaic, and Avantra independently ended up with four different auth mechanisms - a JWT in localStorage, a hand-rolled DB-checked bearer token, and two flavors of ASP.NET Core Identity cookie - with no written-down standard and no comparison of which was actually secure.',
  tags: ['auth', 'jwt', 'cookies', 'xss', 'agents-md'],
  isIllustrative: false,
}

export default function JwtCookieAuthPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          Asked to compare DMGPT's auth against a few other projects in this workspace turned up
          four unrelated mechanisms. DMGPT issued a self-signed JWT and stored it in{' '}
          <code>localStorage</code>, reading it back out to attach as an{' '}
          <code>Authorization: Bearer</code> header on every request. Cadence checked a random
          opaque token directly against a <code>UserSessions</code> table - no JWT at all.
          MedServ, ModelMosaic, and Avantra used ASP.NET Core Identity's cookie authentication,
          two of them persisting the Data Protection key ring to their database and one leaving
          it on local defaults. Nothing in the workspace said which of these was the standard, or
          why they'd diverged.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          Each project's auth got built in isolation by whoever needed login first, and every
          approach quietly optimized for a different single concern instead of the whole picture:
          DMGPT optimized for "the token is easy to read for debugging" and got that by storing a
          plain JWT in <code>localStorage</code> - which is also exactly the storage location
          modern guidance (OWASP included) singles out as the JWT anti-pattern, because any XSS
          anywhere in the app can read <code>localStorage</code> and exfiltrate a working token.
          Worse, DMGPT's logout only ever removed the token client-side; a stolen token stayed
          valid for its full lifetime regardless. ASP.NET Core Identity's default cookie
          optimized for "safe from XSS" correctly - an <code>HttpOnly</code> cookie's value is
          withheld from <code>document.cookie</code> and every other JS-facing API by the browser
          itself, not by encrypting it - but Identity layers its own Data Protection encryption on
          top, which throws away the ability to just decode the payload for debugging the way a
          plain JWT allows (paste it into jwt.io; an Identity cookie needs the actual Data
          Protection key ring and .NET code to unprotect). Cadence sidestepped the whole question
          by not using a bearer credential's cryptography at all.
        </p>
        <p>
          None of these are wrong in isolation. The actual problem was that nobody had written
          down that <code>HttpOnly</code> already solves the real threat (script-based token
          theft) without requiring the payload to be unreadable, so there was no reason DMGPT's
          debuggable-JWT goal and Identity's XSS-safety goal had to trade off against each other.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Issue the same signed JWT as before (HS256, one shared <code>SigningKey</code>), but
          deliver it via <code>Set-Cookie</code> instead of the response body, with{' '}
          <code>HttpOnly</code>, <code>Secure</code> (disabled only in Development, since local
          dev runs over plain HTTP), and <code>SameSite=Strict</code>. The browser attaches the
          cookie automatically to every request - including the SignalR/WebSocket handshake, which
          used to need its own query-string carve-out - and page JavaScript can never read the
          cookie's value under any circumstances, XSS included. The token itself is still a plain
          JWT: copy its value out of DevTools' Application tab (or the raw <code>Set-Cookie</code>{' '}
          header in the Network tab) and decode it in jwt.io or any JWT library exactly as before -
          nothing about the payload is encrypted or hidden from the person debugging it, only from
          a page script.
        </p>
        <p>
          <code>HttpOnly</code> only stops <em>script</em>-based theft of the cookie's value, not
          the browser from sending it - so this also closes the "logout doesn't actually log
          anyone out" gap DMGPT had. Every issued token carries a <code>jti</code> claim; a{' '}
          <code>RevokedTokens</code> table records which ones have been explicitly killed, checked
          in <code>OnTokenValidated</code> on every request. Logout revokes the current token's{' '}
          <code>jti</code> and clears the cookie, so a token stolen through some other channel
          (a compromised machine, a leaked log line) can actually be invalidated before it expires
          - something none of DMGPT, MedServ's, ModelMosaic's, or Avantra's previous setups did on
          their own logout path.
        </p>
        <p>
          <code>SameSite=Strict</code> is doing real work here too: because it's about the
          registrable domain, not the origin, <code>localhost:5180</code> and{' '}
          <code>localhost:5121</code> are still "same site" for cookie purposes even though
          they're different origins for CORS - so this works in local dev without loosening
          anything. And because a JSON API's own SPA never needs a cross-site form or top-level
          navigation to carry the cookie, <code>Strict</code> is adequate CSRF defense on its own
          here without a separate anti-forgery token scheme.
        </p>
        <p className="note">
          This is the one standardized auth pattern for every project in this workspace going
          forward, not a menu - DMGPT, MedServ, ModelMosaic, Avantra, and Cadence's mismatched
          approaches are exactly the problem this marker exists to end. A signing key is not
          optional or specific to any one project's setup: an HMAC-signed, humanly-decodable JWT
          is only possible with a shared secret to sign it, so every project on this pattern needs
          its own <code>SigningKey</code> - that is the one inherent cost of choosing decodability,
          not a gap the pattern failed to close. MedServ, ModelMosaic, and Avantra are migrated
          project by project rather than in one sweep only because each has real users depending
          on its current session behavior mid-migration, not because their existing mechanisms are
          an acceptable alternative to keep.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Signing key storage: honest about the ceiling</h2>
        <p>
          No managed certificate or HSM-backed key store is available on the shared myasp.net
          hosting DMGPT, MedServ, and ModelMosaic deploy to - confirmed, not assumed. ModelMosaic's
          own <code>docs/data-protection-keys.md</code> records two separate production attempts
          (2026-09-01/02) to encrypt Data Protection's key ring with a certificate, both failing
          with the identical <code>CryptographicException</code> from the host's locked-down IIS
          App Pool blocking native PKCS12 import - two structurally different loading strategies,
          the same wall both times.
        </p>
        <p>
          Given that ceiling, provisioning <code>SigningKey</code> as a GitHub Actions secret and
          merging it into <code>appsettings.Production.json</code> at deploy time gives it no
          at-rest protection beyond what an unmanaged, auto-generated key - the shape something
          like IdentityServer's <code>AddDeveloperSigningCredential()</code> produces - would have
          on the same host. Once deployed, it's plaintext on the server either way: readable to
          anyone with server-level access, no HSM, no envelope encryption. Calling this pattern
          more secure than that on this hosting would be exactly the kind of overstatement this
          marker exists to correct, not repeat.
        </p>
        <p>
          What genuinely differs, and is worth keeping despite that ceiling: the key never passes
          through git history, a pull request diff, or a CI log during provisioning - GitHub
          redacts secret values from logs and never exposes a set value back to anyone, including
          whoever set it. And rotating it is one clean, known step (update the secret, redeploy)
          instead of an auto-generated file with no designed rotation path at all.
        </p>
        <p className="note">
          This is the accepted approach for now specifically because a real certificate/HSM/
          secrets-manager option isn't available on this hosting - not a claim that it's secure
          against a compromised host. Revisit when a project's infrastructure actually supports
          it. Avantra is the one candidate today: a self-hosted box with root access, not shared
          IIS, so a real secrets manager or an encrypted key ring is achievable there in a way it
          structurally isn't for DMGPT, MedServ, or ModelMosaic.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">
          Trimmed from DMGPT's implementation to the reusable shape.
        </p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Program.cs - read the JWT from the cookie, check revocation on every request',
              language: 'csharp',
              code: `.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = "MyApp",
        ValidAudience = "MyApp",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString))
    };
    options.Events = new JwtBearerEvents
    {
        // The browser attaches this cookie automatically to every request - API calls and
        // the SignalR/WebSocket handshake alike - so there's no separate query-string path
        // to maintain for either. See Waymark's jwt-cookie-auth marker.
        OnMessageReceived = context =>
        {
            if (context.Request.Cookies.TryGetValue(AuthCookie.Name, out var token)
                && !string.IsNullOrEmpty(token))
            {
                context.Token = token;
            }
            return Task.CompletedTask;
        },
        OnTokenValidated = async context =>
        {
            var jti = context.Principal?.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
            if (string.IsNullOrEmpty(jti))
            {
                context.Fail("Token has no jti claim.");
                return;
            }
            var db = context.HttpContext.RequestServices.GetRequiredService<MyAppContext>();
            if (await db.RevokedTokens.AnyAsync(t => t.Jti == jti))
            {
                context.Fail("Token has been revoked.");
            }
        }
    };
});`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Login - set the cookie instead of returning the token in the body',
              language: 'csharp',
              code: `var expires = DateTime.UtcNow.AddHours(8);
var claims = new[]
{
    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
    new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
};
var token = new JwtSecurityToken(issuer: "MyApp", audience: "MyApp", claims: claims,
    expires: expires, signingCredentials: creds);

Response.Cookies.Append(AuthCookie.Name, new JwtSecurityTokenHandler().WriteToken(token), new CookieOptions
{
    HttpOnly = true,
    Secure = !environment.IsDevelopment(), // plain HTTP in local dev
    SameSite = SameSiteMode.Strict,
    Expires = expires,
    Path = "/"
});

return Ok(currentUserDto); // no token in the response body - the cookie carries it`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Logout - revoke the jti, then clear the cookie',
              language: 'csharp',
              code: `var jti = User.FindFirst(JwtRegisteredClaimNames.Jti)?.Value;
if (!string.IsNullOrEmpty(jti))
{
    db.RevokedTokens.Add(new RevokedToken { Jti = jti, ExpiresAtUtc = /* from the exp claim */ });
    await db.SaveChangesAsync();
}
Response.Cookies.Delete(AuthCookie.Name, new CookieOptions { Path = "/" });`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Client - the cookie travels automatically, nothing to attach by hand',
              language: 'javascript',
              code: `// No more localStorage, no more Authorization header - the browser sends the
// HttpOnly cookie on its own as long as the request opts in to credentials.
await fetch('/api/games', { credentials: 'include' });

// Same story for SignalR - withCredentials replaces accessTokenFactory entirely.
const connection = new signalR.HubConnectionBuilder()
  .withUrl('/hubs/session', { withCredentials: true })
  .build();`,
            }}
          />
        </div>
      </section>

      <section className="marker-page-section">
        <h2>Outside of code</h2>
        <p>
          Debugging a live session: open DevTools → Application → Cookies, copy the cookie's
          value, and paste it into jwt.io (or any JWT decoder) exactly as you would a token that
          came back in a response body.
        </p>
      </section>
    </article>
  )
}
