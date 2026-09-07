import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'jwt-cookie-auth',
  title: 'A decodable JWT in an HttpOnly cookie, with server-side revocation',
  category: 'Security',
  summary:
    'A JWT stored in localStorage and read back into an Authorization header is the textbook XSS anti-pattern - any script running on the page can read localStorage and exfiltrate a working token. An HttpOnly cookie fixes that without giving up what a plain JWT is good for: a token you can still paste into jwt.io and read.',
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
          A JWT gets issued, stored in <code>localStorage</code>, and read back out to attach as an{' '}
          <code>Authorization: Bearer</code> header on every request - because a plain JWT is easy
          to paste into jwt.io and debug. But <code>localStorage</code> is readable by any script
          running on the page, so an XSS anywhere in the app can exfiltrate a working token; and if
          logout only clears the token client-side, a stolen token stays valid for its full lifetime
          regardless.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          The debuggable-JWT goal and the safe-from-XSS goal don't actually have to trade off
          against each other. An <code>HttpOnly</code> cookie's value is withheld from{' '}
          <code>document.cookie</code> and every other JS-facing API by the browser itself, not by
          encrypting it - so it closes the real threat (script-based token theft) while the token
          itself stays a plain, decodable JWT.
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
          the browser from sending it - so a stolen token still needs a way to be invalidated on
          logout, not just deleted client-side. Every issued token carries a <code>jti</code> claim;
          a <code>RevokedTokens</code> table records which ones have been explicitly killed, checked
          in <code>OnTokenValidated</code> on every request. Logout revokes the current token's{' '}
          <code>jti</code> and clears the cookie, so a token stolen through some other channel (a
          compromised machine, a leaked log line) can actually be invalidated before it expires.
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
          A signing key is not optional or specific to any one project's setup: an HMAC-signed,
          humanly-decodable JWT is only possible with a shared secret to sign it, so every project
          on this pattern needs its own <code>SigningKey</code> - that's the one inherent cost of
          choosing decodability, not a gap in the pattern.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Signing key storage: honest about the ceiling</h2>
        <p>
          On shared hosting with no managed certificate or HSM-backed key store available,
          provisioning <code>SigningKey</code> as a GitHub Actions secret and merging it into{' '}
          <code>appsettings.Production.json</code> at deploy time gives it no at-rest protection
          beyond what an unmanaged, auto-generated key would have on the same host - once deployed,
          it's plaintext on the server either way, readable to anyone with server-level access.
          Don't oversell this pattern as more secure than that on hosting like this.
        </p>
        <p>
          What genuinely differs: the key never passes through git history, a pull request diff, or
          a CI log during provisioning - GitHub redacts secret values from logs and never exposes a
          set value back to anyone, including whoever set it. And rotating it is one clean, known
          step (update the secret, redeploy) instead of an auto-generated file with no designed
          rotation path at all.
        </p>
        <p className="note">
          This is the accepted approach specifically because a real certificate/HSM/secrets-manager
          option isn't available on hosting like this - not a claim that it's secure against a
          compromised host. Revisit when a project's infrastructure (e.g. a self-hosted box with
          root access) actually supports something stronger.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Native mobile clients: the cookie and the header are both valid transports</h2>
        <p>
          A project with native mobile apps alongside its web client (Cadence, with a MAUI and a
          React Native app) doesn't have to choose between this pattern and mobile's existing
          <code>Authorization: Bearer</code> header - both can carry the identical JWT. A genuine
          native app already stores its token in real OS-backed secure storage (iOS Keychain,
          Android Keystore) and treats it as an opaque string it never parses, which is a
          fundamentally different threat model than a browser page's <code>localStorage</code>:
          there's no script-injection surface to close, so there's nothing to migrate on the
          mobile side. Forcing mobile onto a cookie it has no use for would be change for its own
          sake.
        </p>
        <p>
          <code>OnMessageReceived</code> only falls back to reading the cookie when the request
          has no <code>Authorization</code> header at all, so a mobile request is never touched and
          a browser request (which never sends that header) always resolves through the cookie:
        </p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Program.cs - accept either transport on the same token',
              language: 'csharp',
              code: `OnMessageReceived = context =>
{
    if (string.IsNullOrEmpty(context.Token) && !context.Request.Headers.ContainsKey("Authorization")
        && context.Request.Cookies.TryGetValue(AuthCookie.Name, out var cookieToken) && !string.IsNullOrEmpty(cookieToken))
    {
        context.Token = cookieToken;
    }
    return Task.CompletedTask;
}`,
            }}
          />
        </div>
        <p>
          The server still sets the cookie on every login/register response (mobile clients simply
          ignore it and read the token from the response body instead), so one login endpoint
          serves both clients without a platform-specific branch.
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
