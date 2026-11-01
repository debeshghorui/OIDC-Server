"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Fingerprint, LockKeyhole, ShieldCheck } from "lucide-react";

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

function Brand() {
  return <Link className="wordmark auth-wordmark" href="/" aria-label="Northstar home"><span className="wordmark-icon"><Fingerprint size={18} /></span><span>northstar<span className="wordmark-period">.</span></span></Link>;
}

function AuthFrame({ children, title, description, error, mode = "signin" }: { children: ReactNode; title: string; description: string; error: string; mode?: "signin" | "signup" | "consent" }) {
  return (
    <main className={`auth-page auth-page-${mode}`}>
      <header className="auth-header"><Brand /><span className="auth-header-secure"><LockKeyhole size={14} /> Secure connection</span></header>
      <div className="auth-layout">
        <aside className="auth-aside">
          <div className="aside-orb" />
          <div className="aside-content"><div className="aside-badge"><ShieldCheck size={15} /> YOUR IDENTITY, PROTECTED</div><h2>Good to have<br />you <span>here.</span></h2><p>One trusted account for the services that matter to you. Your information stays yours.</p>
            <div className="aside-points"><div><span><Check size={13} /></span> Secure sign-in at every step</div><div><span><Check size={13} /></span> You choose what to share</div></div>
          </div>
          <div className="aside-caption"><span className="aside-caption-dot" /> Built on OpenID Connect</div>
        </aside>
        <section className="auth-panel">
          <div className="auth-panel-inner">
            <Link href="/" className="auth-back"><ArrowLeft size={14} /> Back to home</Link>
            <div className="auth-heading"><div className="auth-heading-icon">{mode === "consent" ? <ShieldCheck size={21} /> : <Fingerprint size={22} />}</div><div className="auth-overline">{mode === "consent" ? "ACCOUNT PERMISSIONS" : mode === "signup" ? "CREATE YOUR ACCOUNT" : "YOUR ACCOUNT"}</div><h1>{title}</h1><p className="auth-description">{description}</p></div>
            {error && <p className="notice" role="alert"><span className="notice-mark">!</span>{error}</p>}
            {children}
            <div className="security-note"><LockKeyhole size={14} /><span>Your connection is private and encrypted</span></div>
          </div>
        </section>
      </div>
      <footer className="auth-page-footer"><span>© {new Date().getFullYear()} Northstar Identity</span><span className="footer-status"><span /> All systems secure</span><span>OpenID Connect</span></footer>
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

  return <AuthFrame title="Welcome back" description="Enter your details to securely sign in." error={error}>
    <form className="auth-form" onSubmit={submit}>
      <label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="username" placeholder="name@example.com" required />
      <div className="password-label-row"><label htmlFor="password">Password</label><span>Protected with encryption</span></div><input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
      <button className="primary-button" type="submit" disabled={busy}>{busy ? <><span className="button-spinner" /> Signing in…</> : <>Continue securely <ArrowRight size={16} /></>}</button>
    </form>
    <p className="form-footnote">Your credentials are only used to verify your identity. They are never shared with connected apps.</p>
    <div className="auth-switch"><span>New to Northstar?</span><Link href={oauthQuery ? `/sign-up?${oauthQuery}` : "/sign-up"}>Create an account <ArrowRight size={13} /></Link></div>
    <div className="auth-help"><span>Having trouble signing in? Contact your administrator.</span></div>
  </AuthFrame>;
}

export function SignUpForm({ oauthQuery, initialError }: { oauthQuery: string; initialError?: string }) {
  const router = useRouter();
  const [error, setError] = useState(initialError ?? "");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const data = new FormData(event.currentTarget);
    try {
      await postAuth("sign-up/email", {
        name: data.get("name"),
        email: data.get("email"),
        password: data.get("password"),
        oauth_query: oauthQuery,
      });

      if (oauthQuery) {
        const result = await postAuth("oauth2/continue", { created: true, oauth_query: oauthQuery });
        if (!result.url) throw new Error("Your account was created, but the sign-in flow could not continue.");
        window.location.assign(result.url);
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create your account.");
      setBusy(false);
    }
  }

  return <AuthFrame title="Create your account" description="Start with one secure account for all your connected apps." error={error} mode="signup">
    <form className="auth-form signup-form" onSubmit={submit}>
      <label htmlFor="name">Full name</label><input id="name" name="name" type="text" autoComplete="name" placeholder="Your name" required />
      <label className="signup-label-spaced" htmlFor="signup-email">Email address</label><input id="signup-email" name="email" type="email" autoComplete="email" placeholder="name@example.com" required />
      <div className="password-label-row signup-password-row"><label htmlFor="signup-password">Password</label><span>At least 8 characters</span></div><input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={8} placeholder="Create a password" required />
      <button className="primary-button" type="submit" disabled={busy}>{busy ? <><span className="button-spinner" /> Creating account…</> : <>Create account <ArrowRight size={16} /></>}</button>
    </form>
    <p className="form-footnote">By creating an account, you agree to use your credentials only for your own account.</p>
    <div className="auth-switch"><span>Already have an account?</span><Link href={oauthQuery ? `/sign-in?${oauthQuery}` : "/sign-in"}>Sign in <ArrowRight size={13} /></Link></div>
  </AuthFrame>;
}

const descriptions: Record<string, string> = { openid: "Verify your identity", profile: "View your name and basic profile", email: "View your email address", offline_access: "Keep access until you revoke it" };

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

  return <AuthFrame title="Review access" description="Choose what this application can access." error={error} mode="consent">
    <div className="requesting-app"><span className="app-icon">{clientId.slice(0, 1).toUpperCase()}</span><div className="requesting-app-copy"><span className="label-muted">REQUESTED ACCESS</span><strong>{clientId}</strong><small>Wants to connect to your Northstar account</small></div><span className="verified" title="OAuth application"><Check size={13} /></span></div>
    <form className="consent-form" onSubmit={(event) => { event.preventDefault(); void decide(event.currentTarget, true); }}>
      <div className="scope-heading"><div><p className="scope-title">Requested permissions</p><span>Review each item before continuing</span></div><span className="scope-count">{scopes.length} {scopes.length === 1 ? "permission" : "permissions"}</span></div>
      <div className="scope-list">{scopes.length ? scopes.map((scope) => <label className="scope-item" key={scope}><input type="checkbox" name="scope" value={scope} defaultChecked /><span className="scope-check"><Check size={12} /></span><span className="scope-copy"><strong>{scope}</strong><small>{descriptions[scope] ?? `Permission to access ${scope}`}</small></span></label>) : <p className="empty-scopes">No additional permissions requested.</p>}</div>
      <div className="consent-actions"><button className="primary-button" type="submit" disabled={busy}>{busy ? <><span className="button-spinner" /> Saving…</> : <>Approve access <ArrowRight size={16} /></>}</button><button className="secondary-button" type="button" disabled={busy} onClick={(event) => { const form = event.currentTarget.form; if (form) void decide(form, false); }}>Deny request</button></div>
    </form>
    <p className="form-footnote consent-footnote">You can disconnect this application anytime from your account settings.</p>
  </AuthFrame>;
}
