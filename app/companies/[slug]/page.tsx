import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCompanies, getAllComplaints, STATUS_META, VERIFICATION_META } from "@/lib/kv";

export const dynamic = "force-dynamic";

function fmtMoney(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return `$${n.toLocaleString("en-US")}`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default async function CompanyProfile({ params }: { params: { slug: string } }) {
  const companies = await getAllCompanies();
  const company = companies.find((c) => c.slug === params.slug);
  if (!company) notFound();

  const complaints = (await getAllComplaints())
    .filter((c) => c.companyId === company.id && c.status === "published")
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const meta = STATUS_META[company.status];
  const records = company.publicRecordLinks;
  const recordItems: { label: string; url: string }[] = [
    { label: "Texas Secretary of State / Comptroller", url: records.secretaryOfState },
    { label: "Better Business Bureau", url: records.bbb },
    { label: "County Court Records", url: records.countyCourt },
    { label: "Building Permits", url: records.permits },
    { label: "Attorney General Complaint Filing", url: records.attorneyGeneral },
    { label: "Licensing Board (TDLR)", url: records.licensingBoard },
  ];

  const sc = company.scorecard;
  const scorecardItems = [
    { label: "BBB Complaints", num: sc.bbbComplaints },
    { label: "Civil Cases", num: sc.civilCases },
    { label: "Permits on Record", num: sc.permits },
    { label: "Public Responses", num: sc.publicResponses },
    { label: "Documents Submitted", num: sc.documentsSubmitted },
    { label: "Consumer Complaints", num: sc.consumerComplaints },
    { label: "Vendor Complaints", num: sc.vendorComplaints },
    { label: "Avg. Response Time (days)", num: sc.avgResponseTimeDays },
  ];

  return (
    <main>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <div className="eyebrow">Company Case File</div>
          <div className="profile-header">
            <div>
              <h1 style={{ fontSize: 36, maxWidth: "none" }}>{company.name}</h1>
              <p className="lede" style={{ marginBottom: 0 }}>
                {company.city}{company.zip ? ` ${company.zip}` : ""}{company.phone ? ` · ${company.phone}` : ""}{company.license ? ` · License: ${company.license}` : ""}
              </p>
            </div>
            <div className="status-badge" style={{ fontSize: 13, padding: "8px 14px" }}>
              {meta.dot} {meta.label}
            </div>
          </div>

          <nav className="profile-nav">
            <a href="#overview">Overview</a>
            <a href="#timeline">Timeline</a>
            <a href="#complaints">Complaints ({complaints.length})</a>
            <a href="#scorecard">Scorecard</a>
            <a href="#records">Public Records</a>
            <a href="#documents">Documents ({company.publicDocuments.length})</a>
            <a href="#response">Company Response</a>
          </nav>
        </div>
      </section>

      <section className="profile-section" id="overview">
        <div className="wrap">
          <h3>Overview</h3>
          <p style={{ color: "var(--ink-text-dim)", lineHeight: 1.7, maxWidth: "70ch" }}>
            {company.overview || "No overview has been written for this company yet."}
          </p>
        </div>
      </section>

      <section className="profile-section" id="timeline">
        <div className="wrap">
          <h3>Timeline</h3>
          <div className="tl-list">
            {company.timeline
              .slice()
              .sort((a, b) => (a.date < b.date ? 1 : -1))
              .map((t, i) => (
                <div className="tl-item" key={i}>
                  <div className="tl-date">{fmtDate(t.date)}</div>
                  <div className="tl-event">{t.event}</div>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="profile-section" id="complaints">
        <div className="wrap">
          <h3>Complaint Summary</h3>
          {complaints.length === 0 ? (
            <div className="empty-state">No complaints filed against this company yet.</div>
          ) : (
            <div className="docket">
              {complaints.map((c) => {
                const vClass = c.verificationLevel === "verified" ? "verified" : c.verificationLevel === "documented" ? "documented" : "";
                return (
                  <article className="complaint-card" key={c.id}>
                    <div className="complaint-fields">
                      <div>Case<b>{c.caseNumber}</b></div>
                      <div>Type<b>{c.submitterType === "homeowner" ? "Homeowner" : "Subcontractor"}</b></div>
                      <div>Category<b>{c.category}</b></div>
                      <div>County<b>{c.county}</b></div>
                      <div>Amount<b>{fmtMoney(c.amount ?? c.balanceDue)}</b></div>
                      <div>Filed<b>{fmtDate(c.createdAt)}</b></div>
                      <div>Status<b>{c.status === "published" ? "Published" : "Removed"}</b></div>
                      <div>
                        Verification
                        <div style={{ marginTop: 3 }}>
                          <span className={`verification-badge ${vClass}`} title={VERIFICATION_META[c.verificationLevel]}>
                            {c.verificationLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="case-summary" style={{ fontSize: 17 }}>{c.summary}</p>
                    <p className="case-details">{c.details}</p>
                    <div className="case-meta">
                      <span>Filed by <strong>{c.name}</strong> &middot; {c.city}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="profile-section" id="scorecard">
        <div className="wrap">
          <h3>Company Scorecard</h3>
          <p style={{ color: "var(--ink-text-dim)", fontSize: 13, marginBottom: 16 }}>
            Objective counts only, entered by the site operator from public sources. A blank field means it
            hasn't been researched yet, not that the count is zero.
          </p>
          <div className="scorecard-grid">
            {scorecardItems.map((s) => (
              <div className="scorecard-cell" key={s.label}>
                <div className="scorecard-num">{s.num ?? "—"}</div>
                <div className="scorecard-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="profile-section" id="records">
        <div className="wrap">
          <h3>Public Records</h3>
          <p style={{ color: "var(--ink-text-dim)", fontSize: 13, marginBottom: 16 }}>
            Links to official, independent sources. This site does not host or fabricate court, permit, or
            licensing data &mdash; verify everything at the source.
          </p>
          <div className="records-grid">
            {recordItems.map((r) => (
              <a
                key={r.label}
                href={r.url || "#"}
                target="_blank"
                rel="noreferrer"
                className={`record-link ${r.url ? "" : "disabled"}`}
              >
                <span>{r.label}</span>
                <span>{r.url ? "→" : "Not yet added"}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="profile-section" id="documents">
        <div className="wrap">
          <h3>Documents</h3>
          <p style={{ color: "var(--ink-text-dim)", fontSize: 13, marginBottom: 16 }}>
            Evidence reviewed and published by the site operator. Raw submissions are reviewed privately
            before anything appears here.
          </p>
          {company.publicDocuments.length === 0 ? (
            <div className="empty-state">No documents published yet.</div>
          ) : (
            <div className="doc-list">
              {company.publicDocuments.map((d, i) => (
                <div className="doc-row" key={i}>
                  <a href={d.url} target="_blank" rel="noreferrer">{d.title}</a>
                  <span style={{ color: "var(--ink-text-dim)" }}>{fmtDate(d.addedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="profile-section" style={{ borderBottom: "none" }} id="response">
        <div className="wrap">
          <h3>Company Response</h3>
          {company.companyResponse ? (
            <div className="case-card">
              <p className="case-details" style={{ whiteSpace: "pre-wrap" }}>{company.companyResponse}</p>
            </div>
          ) : (
            <div className="empty-state">
              {company.name} has not submitted a response. Companies can request to publish a statement by
              contacting the site operator &mdash; it will be posted here, verbatim.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
