import Link from "next/link";

export default function AboutPage() {
  return (
    <main>
      <section className="about-hero">
        <video className="hero-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true"><source src="/watch.mp4" type="video/mp4" /></video>
        <div className="about-overlay" />
        <div className="about-hero-copy">
          <p className="hero-kicker">About Texas Contractor Watch</p>
          <h1>Why we exist.</h1>
          <p>Because a signed contract should mean something, completed work should be paid for, and Texans deserve a place where documented stories do not vanish.</p>
        </div>
      </section>

      <section className="about-welcome">
        <div>
          <p className="section-kicker">Meet your watchdog</p>
          <h2>Howdy. I&apos;m Rexy.</h2>
          <p>I&apos;m here to help Texans ask better questions, preserve the paper trail, and speak up when a contractor dispute leaves a home unfinished or a hardworking subcontractor unpaid.</p>
          <p>This is not a rumor board and it is not a courtroom. It is a documentation platform built around evidence, public records, fair labeling, and a company&apos;s right to respond.</p>
        </div>
        <blockquote>“Honest contractors deserve trust. Homeowners deserve transparency. Subcontractors deserve to be paid.”</blockquote>
      </section>

      <section className="home-section">
        <div className="section-heading"><p className="section-kicker">Our mission</p><h2>Make the truth easier to find.</h2><p>We organize complaints, evidence, responses, and public records into clear company case files.</p></div>
        <div className="pillar-grid about-pillars">
          <article><span>01</span><h3>Protect homeowners</h3><p>Help families document contracts, payments, unfinished work, permit concerns, and communication history.</p></article>
          <article><span>02</span><h3>Protect subcontractors</h3><p>Help tradespeople and vendors preserve invoices, delivery records, balances due, and payment demands.</p></article>
          <article><span>03</span><h3>Publish responsibly</h3><p>Clearly distinguish allegations, reviewed evidence, and confirmed court or agency records.</p></article>
          <article><span>04</span><h3>Keep it fair</h3><p>Invite company responses, correction requests, proof of payment, and documented resolutions.</p></article>
        </div>
      </section>

      <section className="process-section">
        <div className="section-heading"><p className="section-kicker">How it works</p><h2>From report to public case file.</h2></div>
        <ol className="process-list"><li><strong>Submit.</strong><span>A homeowner, subcontractor, or vendor files a structured report.</span></li><li><strong>Document.</strong><span>Contracts, invoices, messages, photos, and public records may support the report.</span></li><li><strong>Review.</strong><span>The verification label reflects what has actually been received and reviewed.</span></li><li><strong>Respond.</strong><span>The company may publish its position, corrections, payment records, or proof of resolution.</span></li></ol>
      </section>

      <section className="about-disclaimer"><h2>A documentation platform, not a verdict.</h2><p>Texas Contractor Watch is not a court, government agency, collection agency, or law firm. A submitted complaint is an allegation. Only linked official records support labels involving litigation or judgments. Nothing on this site replaces legal advice or filing deadlines.</p><div className="hero-actions"><Link href="/submit" className="btn btn-primary">Submit a Complaint</Link><Link href="/rights" className="btn btn-ghost">Know Your Rights</Link></div></section>
    </main>
  );
}
