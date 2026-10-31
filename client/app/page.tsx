import Link from "next/link";

export default function Home() {
  return (
    <main className="home-shell">
      <div className="brand-mark">ID</div>
      <p className="eyebrow">IDENTITY PLATFORM</p>
      <h1>One secure sign in.<br />Every app you trust.</h1>
      <p className="home-copy">Your account gives you a safe, simple way to connect with applications using OpenID Connect.</p>
      <Link className="primary-link" href="/sign-in">Sign in to your account <span aria-hidden="true">→</span></Link>
      <p className="fine-print">Protected by OpenID Connect</p>
    </main>
  );
}
