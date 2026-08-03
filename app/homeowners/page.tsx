import Link from "next/link";

export default function HomeownersPage() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 32 }}>
        <div className="wrap">
          <div className="eyebrow">For Homeowners</div>
          <h1 style={{ fontSize: 34, maxWidth: "20ch" }}>If a contractor project went wrong.</h1>
          <p className="lede">
            Before you file, a few things worth doing that make your complaint stronger and give you real
            leverage &mdash; not just a place to vent.
          </p>
          <Link href="/submit/homeowner" className="btn btn-primary">Report a Contractor</Link>
        </div>
      </section>

      <section className="section" style={{ borderBottom: "none" }}>
        <div className="wrap">
          <div className="mission-grid">
            <div>
              <strong>Gather your paper trail first.</strong> Contract, change orders, receipts, texts and
              emails, and dated photos of the work. The more specific and documented your filing, the more
              weight it carries &mdash; both here and if you pursue other action.
            </div>
            <div>
              <strong>File where it actually helps.</strong> A complaint here documents the pattern
              publicly. For binding action, also consider: the{" "}
              <a href="https://www.texasattorneygeneral.gov/consumer-protection/file-consumer-complaint" target="_blank" rel="noreferrer" style={{ color: "var(--steel)" }}>Texas Attorney General</a>,{" "}
              <a href="https://www.bbb.org/" target="_blank" rel="noreferrer" style={{ color: "var(--steel)" }}>BBB</a>, your county's small claims court, and, if licensed work was involved, the relevant{" "}
              <a href="https://www.tdlr.texas.gov/" target="_blank" rel="noreferrer" style={{ color: "var(--steel)" }}>state licensing board</a>.
            </div>
            <div>
              <strong>If it involves insurance.</strong> Contact your insurer's fraud unit if you believe
              claims were misrepresented, and keep a copy of the insurance scope of work versus what was
              actually completed.
            </div>
            <div>
              <strong>This site is not legal advice.</strong> For contract disputes over a few thousand
              dollars, a consultation with a construction attorney or your county's legal aid office is
              worth the hour &mdash; many offer free initial consultations.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
