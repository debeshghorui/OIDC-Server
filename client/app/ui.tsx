"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const authUrl = (process.env.NEXT_PUBLIC_AUTH_URL ?? "http://localhost:8080").replace(/\/$/, "");

type AuthResult = { url?: string; redirect?: boolean; message?: string; error?: string };

async function postAuth(path: string, body: Record<string, unknown>): Promise<AuthResult> {
  const response = await fetch(`${authUrl}/api/auth/${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = (await response.json()) as AuthResult;
  if (!response.ok) throw new Error(result.message ?? result.error ?? "Something went wrong. Please try again.");
  return result;
}

function AuthFrame({ children, title, description, error }: { children: React.ReactNode; title: string; description: string; error: string }) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <Link className="brand" href="/" aria-label="Northstar home"><span className="brand-mark small">N</span><span>northstar<span className="brand-dot">.</span></span></Link>
        <div className="auth-heading"><p className="eyebrow">SECURE IDENTITY</p><h1>{title}</h1><p className="auth-description">{description}</p></div>
        {error && <p className="notice" role="alert">{error}</p>}
        {children}
        <div className="security-note"><span aria-hidden="true">◈</span> Your connection is private and encrypted</div>
      </section>
      <p className="auth-footer">Powered by OpenID Connect</p>
    </main>
  );
}

export function SignInForm({ oauthQuery, initialError }: { oauthQuery: string; initialError?: string }) {
  const router = useRouter();
  const [error, setError] = useState(initialError ?? "");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      const result = await postAuth("sign-in/email", { email: data.get("email"), password: data.get("password"), oauth_query: oauthQuery });
      if (result.url) window.location.assign(result.url);
      else if (result.redirect) router.refresh();
      else router.push("/");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to sign in."); setBusy(false); }
  }

  return <AuthFrame title="Welcome back" description="Sign in to continue to your account." error={error}>
    <form className="auth-form" onSubmit={submit}>
      <label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="username" placeholder="you@example.com" required />
      <label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
      <button className="primary-button" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}<span aria-hidden="true">→</span></button>
    </form>
    <p className="form-footnote">Your credentials stay protected and are never shared with connected apps.</p>
  </AuthFrame>;
}

export function ConsentForm({ oauthQuery, clientId, scopes, initialError }: { oauthQuery: string; clientId: string; scopes: string[]; initialError?: string }) {
  const [error, setError] = useState(initialError ?? "");
  const [busy, setBusy] = useState(false);

  async function decide(form: HTMLFormElement, accept: boolean) {
    setError(""); setBusy(true);
    const data = new FormData(form);
    const scope = data.getAll("scope").map(String).join(" ");
    try {
      const result = await postAuth("oauth2/consent", { accept, scope, oauth_query: oauthQuery });
      if (!result.url) throw new Error("The authorization server did not return a redirect.");
      window.location.assign(result.url);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save your choice."); setBusy(false); }
  }

  return <AuthFrame title="Review access" description="Choose what this application can access." error={error}>
    <div className="requesting-app"><span className="app-icon">{clientId.slice(0, 1).toUpperCase()}</span><div><span className="label-muted">REQUESTED BY</span><strong>{clientId}</strong></div><span className="verified" title="OAuth application">✓</span></div>
    <form className="consent-form" onSubmit={(event) => { event.preventDefault(); void decide(event.currentTarget, true); }}>
      <p className="scope-title">This app is requesting</p>
      <div className="scope-list">{scopes.length ? scopes.map((scope) => <label className="scope-item" key={scope}><input type="checkbox" name="scope" value={scope} defaultChecked /><span><strong>{scope}</strong><small>{scope === "openid" ? "Verify your identity" : scope === "profile" ? "View your basic profile information" : scope === "email" ? "View your email address" : `Permission to access ${scope}`}</small></span></label>) : <p className="empty-scopes">No additional permissions requested.</p>}</div>
      <button className="primary-button" type="submit" disabled={busy}>{busy ? "Saving…" : "Allow access"}<span aria-hidden="true">→</span></button>
      <button className="secondary-button" type="button" disabled={busy} onClick={(event) => { const form = event.currentTarget.form; if (form) void decide(form, false); }}>Deny request</button>
    </form>
    <p className="form-footnote">You can revoke this access at any time from your account settings.</p>
  </AuthFrame>;
}
