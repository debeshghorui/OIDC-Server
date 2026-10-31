import { Hono } from "hono";
import {
    oauthProviderAuthServerMetadata,
    oauthProviderOpenIdConfigMetadata,
} from "@better-auth/oauth-provider";
import { auth } from "./auth.js";

const app = new Hono();
const openIdConfigMetadata = oauthProviderOpenIdConfigMetadata(auth as never);
const authServerMetadata = oauthProviderAuthServerMetadata(auth as never);

app.get("/.well-known/openid-configuration", (c) =>
    openIdConfigMetadata(c.req.raw),
);
app.get("/.well-known/oauth-authorization-server", (c) =>
    authServerMetadata(c.req.raw),
);

const escapeHtml = (value: string): string =>
    value.replace(/[&<>"']/g, (character) => {
        const entities: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };
        return entities[character] ?? character;
    });

const page = (title: string, content: string, error?: string) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font: 16px/1.5 system-ui, sans-serif; margin: 0; background: #f5f6f8; color: #18202b; }
    main { box-sizing: border-box; width: min(100% - 2rem, 28rem); margin: 10vh auto; padding: 2rem; background: white; border: 1px solid #dfe3e8; border-radius: 12px; }
    h1 { margin-top: 0; font-size: 1.5rem; }
    label { display: block; margin: 1rem 0 .35rem; font-weight: 600; }
    input[type=email], input[type=password] { box-sizing: border-box; width: 100%; padding: .7rem; border: 1px solid #aeb7c2; border-radius: 6px; }
    button { margin: 1rem .5rem 0 0; padding: .65rem 1rem; border: 0; border-radius: 6px; background: #174ea6; color: white; font: inherit; cursor: pointer; }
    button[name=decision][value=deny] { background: #5e6875; }
    .error { padding: .75rem; background: #fff0f0; color: #9c2020; border-radius: 6px; }
    .muted { color: #596574; }
  </style>
</head>
<body><main>
  <h1>${escapeHtml(title)}</h1>
  ${error ? `<p class="error" role="alert">${escapeHtml(error)}</p>` : ""}
  ${content}
  <p class="error" id="form-error" role="alert" hidden></p>
</main></body>
</html>`;

app.get("/sign-in", (c) => {
    const error = c.req.query("error_description") ?? c.req.query("error");
    const content = `<p class="muted">Sign in to continue.</p>
<form id="sign-in-form">
  <label for="email">Email</label><input id="email" name="email" type="email" autocomplete="username" required>
  <label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required>
  <button type="submit">Sign in</button>
</form>
<script>
document.getElementById("sign-in-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const error = document.getElementById("form-error");
  error.hidden = true;
  try {
    const response = await fetch("/api/auth/sign-in/email", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: form.email.value, password: form.password.value, oauth_query: location.search.slice(1) })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || result.error || "Unable to sign in.");
    if (result.url) location.assign(result.url);
    else if (result.redirect) location.reload();
    else location.assign("/");
  } catch (reason) { error.textContent = reason.message; error.hidden = false; }
});
</script>`;
    return c.html(page("Sign in", content, error));
});

app.get("/consent", (c) => {
    const query = c.req.query();
    const clientId = query.client_id ?? "Unknown application";
    const scopes = (query.scope ?? "").split(/\s+/).filter(Boolean);
    const scopeOptions = scopes.length
        ? scopes
              .map(
                  (scope) =>
                      `<li><label><input type="checkbox" name="scope" value="${escapeHtml(scope)}" checked> ${escapeHtml(scope)}</label></li>`,
              )
              .join("")
        : "<li>No specific scopes requested</li>";
    const error = query.error_description ?? query.error;
    const content = `<p><strong>Application:</strong> ${escapeHtml(clientId)}</p>
<p>This application is requesting access to:</p>
<form id="consent-form">
  <ul>${scopeOptions}</ul>
  <button type="submit" name="decision" value="approve">Approve</button>
  <button type="submit" name="decision" value="deny">Deny</button>
</form>
<script>
document.getElementById("consent-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const error = document.getElementById("form-error");
  error.hidden = true;
  try {
    const decision = event.submitter.value;
    const scope = Array.from(document.querySelectorAll('input[name="scope"]:checked')).map((input) => input.value).join(" ");
    const response = await fetch("/api/auth/oauth2/consent", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ accept: decision === "approve", scope, oauth_query: location.search.slice(1) })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || result.error || "Unable to save your choice.");
    if (result.url) location.assign(result.url);
    else throw new Error("The authorization server did not return a redirect.");
  } catch (reason) { error.textContent = reason.message; error.hidden = false; }
});
</script>`;
    return c.html(page("Authorize application", content, error));
});

// Mount betterAuth handler at /api/auth/*
app.all("/api/auth/*", (c) => auth.handler(c.req.raw));

// Health check endpoint
app.get("/", (c) => c.text("OIDC Server is running"));

export default app;
