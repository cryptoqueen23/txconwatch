import Link from "next/link";
import { getAllCompanies, getAllComplaints } from "@/lib/kv";

export const dynamic = "force-dynamic";

export default async function Home() {
  let companies: Awaited<ReturnType<typeof getAllCompanies>> = [];
  let complaints: Awaited<ReturnType<typeof getAllComplaints>> = [];
  try {
    [companies, complaints] = await Promise.all([getAllCompanies(), getAllComplaints()]);
  } catch {}

  const published = complaints.filter((c) => c.status === "published");
  const documentsReviewed = companies.reduce((sum, c) => sum + c.publicDocuments.length, 0);
  const homeowners = published.filter((c) => c.submitterType === "homeowner").length;
  const subcontractors = published.filter((c) => c.submitterType === "subcontractor").length;
  const outstandingClaims = published.filter((c) => c.submitterType === "subcontractor" && (c.balanceDue || 0) > 0).length;
  const counters = [
    { num: companies.length, label: "Companies documented" },
    { num: published.length, label: "Published complaints" },
    { num: documentsReviewed, label: "Public documents" },
    { num: homeowners, label: "Homeowner reports" },
    { num: subcontractors, label: "Trade reports" },
    { num: outstandingClaims, label: "Outstanding claims" },
  ];
  const recent = published.slice(0, 4);

  return (
    <main>
      <section className="video-hero" aria-labelledby="home-title">
        <video className="hero-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true">
          <source src="/watch.mp4" type="video/mp4" />
        </video>
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-content">
          <p className="hero-kicker">Texas homeowner and subcontractor accountability</p>
          <h1 id="home-title">Know before you hire.<br/><span>Speak up when you&apos;ve been wronged.</span></h1>
          <p className="hero-lede">Document complaints, preserve evidence, search company case files, and help other Texans make informed decisions.</p>
          <div className="hero-actions">
            <Link href="/submit/homeowner" className="btn btn-primary">Report a Contractor</Link>
            <Link href="/submit/subcontractor" className="btn btn-gold">Report Non-Payment</Link>
            <Link href="/companies" className="btn btn-ghost">Search Companies</Link>
          </div>
          <p className="hero-note">Complaints are allegations, not legal findings. Companies may respond.</p>
        </div>
        <a href="#mission" className="hero-scroll" aria-label="Scroll to learn how Texas Contractor Watch works">Explore ↓</a>
      </section>

      <section className="impact-strip" aria-label="Platform activity">
        <div className="impact-grid">
          {counters.map((c) => <div className="impact-item" key={c.label}><strong>{c.num}</strong><span>{c.label}</span></div>)}
        </div>
      </section>

      <section className="home-section intro-section" id="mission">
        <div className="section-heading">
          <p className="section-kicker">Our purpose</p>
          <h2>Truth deserves a permanent record.</h2>
          <p>Construction complaints often disappear into private messages, buried reviews, and disconnected court or permit systems. We organize documented reports by company so patterns are easier to see and harder to ignore.</p>
        </div>
        <div className="pillar-grid">
          <article><span>01</span><h3>Protect homeowners</h3><p>Help Texans research companies, document unfinished work, and preserve contracts, payment records, photos, and timelines.</p></article>
          <article><span>02</span><h3>Protect subcontractors</h3><p>Give tradespeople and vendors a structured place to report non-payment and document invoices, delivery records, and demands.</p></article>
          <article><span>03</span><h3>Document the truth</h3><p>Separate submitted claims from reviewed evidence and confirmed public records with clear verification labels.</p></article>
          <article><span>04</span><h3>Demand accountability</h3><p>Give every profiled company a fair opportunity to respond, correct information, and show proof of resolution.</p></article>
        </div>
      </section>

      <section className="rexy-band">
        <div className="rexy-copy">
          <p className="section-kicker">A word from Rexy</p>
          <h2>“Howdy, Texas. I&apos;m here to sniff out the facts.”</h2>
          <p>I&apos;m Rexy, your contractor watchdog. Honest contractors deserve trust. Homeowners deserve transparency. Subcontractors deserve to be paid. This site gives Texans one place to document what happened and help the next person ask better questions before signing.</p>
          <Link href="/about" className="text-link">Meet Rexy and learn why we exist →</Link>
        </div>
        <div className="rexy-rule"><strong>Rexy&apos;s rule:</strong> Get the scope, payment schedule, permits, change orders, and completion date in writing.</div>
      </section>

      {recent.length > 0 && (
        <section className="home-section recent-section">
          <div className="section-heading split-heading"><div><p className="section-kicker">Public docket</p><h2>Recently filed</h2></div><Link href="/companies" className="text-link">View all companies →</Link></div>
          <div className="docket">
            {recent.map((c) => {
              const company = companies.find((co) => co.id === c.companyId);
              return <article className="complaint-card" key={c.id}><div className="complaint-fields"><div>Case<b>{c.caseNumber}</b></div><div>Category<b>{c.category}</b></div><div>County<b>{c.county}</b></div><div>Filed<b>{new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</b></div></div><p className="complaint-summary">{c.summary}</p>{company && <Link href={`/companies/${company.slug}`}>View {company.name}&apos;s case file →</Link>}</article>;
            })}
          </div>
        </section>
      )}

      <section className="action-panel">
        <p className="section-kicker">Your story matters</p>
        <h2>Do not let the paperwork disappear.</h2>
        <p>Preserve what happened while dates, messages, invoices, photos, and witnesses are still available.</p>
        <div className="hero-actions"><Link href="/submit/homeowner" className="btn btn-primary">File a Homeowner Report</Link><Link href="/submit/subcontractor" className="btn btn-ghost">File a Non-Payment Report</Link></div>
      </section>
    </main>
  );
}
