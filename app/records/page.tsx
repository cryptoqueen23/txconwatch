export default function RecordsPage() {
  const links = [
    { label: "Texas Secretary of State — Business Entity Search", url: "https://mycpa.cpa.state.tx.us/coa/" },
    { label: "Better Business Bureau — Business Profiles", url: "https://www.bbb.org/" },
    { label: "Texas Attorney General — File a Consumer Complaint", url: "https://www.texasattorneygeneral.gov/consumer-protection/file-consumer-complaint" },
    { label: "TDLR — Verify a License / Trade Board", url: "https://www.tdlr.texas.gov/" },
    { label: "Texas Judicial Branch — Court Records Portal", url: "https://www.txcourts.gov/" },
    { label: "Texas Department of Insurance — Report Fraud", url: "https://www.tdi.texas.gov/fraud/index.html" },
  ];

  return (
    <main>
      <section className="hero" style={{ paddingBottom: 32 }}>
        <div className="wrap">
          <div className="eyebrow">Public Records</div>
          <h1 style={{ fontSize: 34, maxWidth: "20ch" }}>Go straight to the source.</h1>
          <p className="lede">
            This site doesn't host or fabricate court, permit, or licensing data — every company case file
            links out to the real records. County-level court and permit records live with each county, not
            a single statewide database, so check the specific county where the work happened.
          </p>
        </div>
      </section>

      <section className="section" style={{ borderBottom: "none" }}>
        <div className="wrap">
          <div className="records-grid">
            {links.map((l) => (
              <a key={l.label} href={l.url} target="_blank" rel="noreferrer" className="record-link">
                <span>{l.label}</span>
                <span>→</span>
              </a>
            ))}
          </div>
          <p style={{ marginTop: 28, fontSize: 13, color: "var(--ink-text-dim)", maxWidth: "65ch" }}>
            Looking for a specific county's court or permit records? Search "[county name] Texas district
            clerk records search" or "[city name] building permit search" — most Central Texas counties and
            cities now publish these online.
          </p>
        </div>
      </section>
    </main>
  );
}
