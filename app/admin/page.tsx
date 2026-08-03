"use client";

import { useState } from "react";
import type { Company, Complaint, EvidenceFile, InvestigationStatus, VerificationLevel } from "@/lib/kv";

const STATUS_OPTIONS: InvestigationStatus[] = ["receiving", "reviewing", "multiple", "litigation", "judgment"];
const STATUS_LABEL: Record<InvestigationStatus, string> = {
  receiving: "🟢 Receiving Complaints",
  reviewing: "🟡 Documents Under Review",
  multiple: "🟠 Multiple Independent Complaints",
  litigation: "🔴 Litigation Confirmed",
  judgment: "⚫ Judgment Entered",
};
const VERIFICATION_OPTIONS: VerificationLevel[] = ["unverified", "documented", "verified"];

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTab] = useState<"companies" | "complaints">("complaints");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [evidenceFor, setEvidenceFor] = useState<string | null>(null);
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);

  async function load(pw: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin", { headers: { "x-admin-password": pw } });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load.");
      } else {
        setCompanies(data.companies);
        setComplaints(data.complaints);
        setUnlocked(true);
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function patchComplaint(id: string, body: any) {
    const res = await fetch(`/api/admin/complaints/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) setComplaints((list) => list.map((c) => (c.id === id ? data.complaint : c)));
  }

  async function deleteComplaint(id: string) {
    if (!confirm("Permanently delete this complaint? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/complaints/${id}`, { method: "DELETE", headers: { "x-admin-password": password } });
    if (res.ok) setComplaints((list) => list.filter((c) => c.id !== id));
  }

  async function patchCompany(id: string, body: any) {
    const res = await fetch(`/api/admin/companies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) setCompanies((list) => list.map((c) => (c.id === id ? data.company : c)));
  }

  async function openEvidence(complaintId: string) {
    setEvidenceFor(complaintId);
    const res = await fetch(`/api/admin/evidence/${complaintId}`, { headers: { "x-admin-password": password } });
    const data = await res.json();
    setEvidenceFiles(data.files || []);
  }

  async function publishEvidence(evidenceId: string, complaintId: string, title: string) {
    await fetch(`/api/admin/evidence/${complaintId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ evidenceId, title }),
    });
    setEvidenceFiles((list) => list.map((f) => (f.id === evidenceId ? { ...f, published: true } : f)));
  }

  if (!unlocked) {
    return (
      <main>
        <section className="hero">
          <div className="wrap">
            <div className="eyebrow">Admin</div>
            <h1 style={{ fontSize: 30 }}>Sign in</h1>
            <form className="filing" style={{ maxWidth: 360 }} onSubmit={(e) => { e.preventDefault(); load(password); }}>
              <div className="field">
                <label htmlFor="pw">Password</label>
                <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && <div className="form-msg err">{error}</div>}
              <div><button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Checking…" : "Sign in"}</button></div>
            </form>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="hero" style={{ paddingBottom: 24 }}>
        <div className="wrap">
          <div className="eyebrow">Admin</div>
          <h1 style={{ fontSize: 30 }}>Texas Contractor Watch</h1>
          <div className="hero-actions" style={{ marginTop: 16 }}>
            <button className={`btn ${tab === "complaints" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab("complaints")}>
              Complaints ({complaints.length})
            </button>
            <button className={`btn ${tab === "companies" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab("companies")}>
              Companies ({companies.length})
            </button>
          </div>
        </div>
      </section>

      {tab === "complaints" && (
        <section className="section" style={{ borderBottom: "none" }}>
          <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {complaints.map((c) => {
              const company = companies.find((co) => co.id === c.companyId);
              return (
                <div key={c.id} className="admin-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div className="admin-row-info">
                      <span className="case-no">CASE {c.caseNumber}</span> &middot; {company?.name || "Unknown company"} &middot; {c.name} &middot; {c.submitterType}
                      <br />
                      <span style={{ color: "var(--ink-text-dim)" }}>{c.email} &middot; {c.phone}</span>
                    </div>
                    <div className="admin-actions" style={{ flexWrap: "wrap" }}>
                      <select value={c.status} onChange={(e) => patchComplaint(c.id, { status: e.target.value })}>
                        <option value="published">Published</option>
                        <option value="removed">Removed</option>
                      </select>
                      <select value={c.verificationLevel} onChange={(e) => patchComplaint(c.id, { verificationLevel: e.target.value })}>
                        {VERIFICATION_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                      <button className="btn-small" onClick={() => openEvidence(c.id)}>Evidence</button>
                      <button className="btn-small danger" onClick={() => deleteComplaint(c.id)}>Delete</button>
                    </div>
                  </div>
                  <p style={{ fontSize: 13.5, color: "var(--ink-text-dim)", marginTop: 10 }}>{c.summary}</p>

                  {evidenceFor === c.id && (
                    <div style={{ marginTop: 12, borderTop: "1px solid var(--ink-3)", paddingTop: 12 }}>
                      {evidenceFiles.length === 0 && <p style={{ fontSize: 13, color: "var(--ink-text-dim)" }}>No evidence uploaded for this complaint.</p>}
                      {evidenceFiles.map((f) => (
                        <div key={f.id} className="doc-row" style={{ marginBottom: 6 }}>
                          <a href={f.url} target="_blank" rel="noreferrer">{f.filename}</a>
                          {f.published ? (
                            <span style={{ color: "var(--steel)" }}>Published</span>
                          ) : (
                            <button className="btn-small" onClick={() => publishEvidence(f.id, c.id, f.filename)}>Publish to company Documents</button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {tab === "companies" && (
        <section className="section" style={{ borderBottom: "none" }}>
          <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {companies.map((co) => (
              <CompanyEditor key={co.id} company={co} onSave={(body) => patchCompany(co.id, body)} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function CompanyEditor({ company, onSave }: { company: Company; onSave: (body: any) => void }) {
  const [status, setStatus] = useState(company.status);
  const [zip, setZip] = useState(company.zip);
  const [overview, setOverview] = useState(company.overview);
  const [companyResponse, setCompanyResponse] = useState(company.companyResponse);
  const [records, setRecords] = useState(company.publicRecordLinks);
  const [scorecard, setScorecard] = useState(company.scorecard);
  const [timelineNote, setTimelineNote] = useState("");
  const [dirty, setDirty] = useState(false);

  function markDirty<T>(setter: (v: T) => void) {
    return (v: T) => { setter(v); setDirty(true); };
  }

  function save() {
    onSave({ status, zip, overview, companyResponse, publicRecordLinks: records, scorecard });
    setDirty(false);
  }

  function addTimeline() {
    if (!timelineNote.trim()) return;
    onSave({ addTimelineEvent: timelineNote.trim() });
    setTimelineNote("");
  }

  return (
    <div className="admin-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div className="admin-row-info">
          <strong style={{ fontFamily: "var(--serif)", fontSize: 16 }}>{company.name}</strong> — {company.city}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input placeholder="ZIP" value={zip} onChange={(e) => markDirty(setZip)(e.target.value)} style={{ width: 90 }} />
          <select value={status} onChange={(e) => markDirty(setStatus)(e.target.value as InvestigationStatus)}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
      </div>

      <div className="field">
        <label>Overview</label>
        <textarea value={overview} onChange={(e) => markDirty(setOverview)(e.target.value)} style={{ minHeight: 80 }} />
      </div>

      <div className="field">
        <label>Company Response</label>
        <textarea value={companyResponse} onChange={(e) => markDirty(setCompanyResponse)(e.target.value)} style={{ minHeight: 80 }} />
      </div>

      <div className="field">
        <label>Public record links</label>
        {(Object.keys(records) as (keyof typeof records)[]).map((k) => (
          <input
            key={k}
            placeholder={k}
            value={records[k]}
            onChange={(e) => markDirty(setRecords)({ ...records, [k]: e.target.value })}
          />
        ))}
      </div>

      <div className="field">
        <label>Scorecard</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {(Object.keys(scorecard) as (keyof typeof scorecard)[]).map((k) => (
            <input
              key={k}
              type="number"
              placeholder={k}
              value={scorecard[k] ?? ""}
              onChange={(e) => markDirty(setScorecard)({ ...scorecard, [k]: e.target.value === "" ? null : Number(e.target.value) })}
            />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input placeholder="Add timeline event…" value={timelineNote} onChange={(e) => setTimelineNote(e.target.value)} />
        <button className="btn-small" onClick={addTimeline}>Add</button>
      </div>

      {dirty && <button className="btn btn-secondary" onClick={save} style={{ alignSelf: "flex-start" }}>Save Changes</button>}
    </div>
  );
}
