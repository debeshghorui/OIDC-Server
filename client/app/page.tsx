import Link from "next/link";
import { ArrowRight, Check, Fingerprint, LockKeyhole, ShieldCheck } from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "Built for trust", copy: "Modern OpenID Connect keeps every sign-in secure and standards based." },
  { icon: Fingerprint, title: "One identity", copy: "A simpler way to access the apps and services you already use." },
  { icon: LockKeyhole, title: "You stay in control", copy: "Review what each connected app can access before you approve." },
];

export default function Home() {
  return (
    <main className="landing">
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="Northstar home"><span className="wordmark-icon"><Fingerprint size={19} strokeWidth={2.1} /></span><span>northstar<span className="wordmark-period">.</span></span></Link>
        <nav className="header-nav" aria-label="Main navigation">
          <a className="nav-link" href="#how-it-works">How it works</a>
          <Link className="nav-text-link" href="/sign-in">Sign in</Link>
          <Link className="nav-signin" href="/sign-up">Create account <ArrowRight size={15} /></Link>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <div className="trust-pill"><span className="trust-pulse" /> YOUR IDENTITY, CONNECTED</div>
          <h1>One secure sign in.<br /><span>Every app in reach.</span></h1>
          <p className="hero-description">A calmer, safer way to access the services you trust. Sign in once and stay in control of where your information goes.</p>
          <div className="hero-actions">
            <Link className="hero-cta" href="/sign-up">Create your account <ArrowRight size={17} /></Link>
            <a className="hero-secondary" href="#how-it-works">See how it works</a>
          </div>
          <div className="hero-assurance"><span className="assurance-icon"><Check size={13} /></span> Private by design <span className="assurance-divider">·</span> Open standards</div>
        </div>

        <div className="hero-visual" aria-label="A preview of a secure sign-in">
          <div className="visual-glow" />
          <div className="auth-preview">
            <div className="preview-topline"><span className="preview-lock"><LockKeyhole size={14} /></span><span>SECURE SIGN IN</span><span className="preview-menu">•••</span></div>
            <div className="preview-brand"><span className="preview-mark"><Fingerprint size={23} /></span><div><strong>Welcome back</strong><small>Sign in to your account</small></div></div>
            <div className="preview-label">EMAIL ADDRESS</div>
            <div className="preview-input">you@example.com</div>
            <div className="preview-label preview-label-spaced">PASSWORD</div>
            <div className="preview-input preview-password">••••••••••••</div>
            <div className="preview-button">Continue <ArrowRight size={15} /></div>
            <div className="preview-foot"><ShieldCheck size={14} /> Your account stays yours</div>
          </div>
          <div className="connected-card"><span className="connected-check"><Check size={13} /></span><div><strong>Identity verified</strong><small>Connection is encrypted</small></div><span className="connected-dot" /></div>
          <span className="visual-orbit orbit-one" /><span className="visual-orbit orbit-two" />
        </div>
      </section>

      <section className="feature-section" id="how-it-works">
        <div className="section-heading"><span>CONFIDENCE IN EVERY CONNECTION</span><h2>Access that feels effortless.</h2></div>
        <div className="feature-grid">{features.map(({ icon: Icon, title, copy }, index) => <article className="feature-card" key={title}><span className="feature-icon"><Icon size={19} strokeWidth={1.8} /></span><span className="feature-index">0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      </section>

      <footer className="site-footer"><Link className="wordmark footer-wordmark" href="/"><span className="wordmark-icon"><Fingerprint size={17} /></span><span>northstar<span className="wordmark-period">.</span></span></Link><span>Identity that puts you first.</span><span className="footer-protocol"><span /> Protected with OpenID Connect</span></footer>
    </main>
  );
}
