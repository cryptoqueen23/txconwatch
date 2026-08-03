"use client";

import { useState } from "react";
import Link from "next/link";
import CompanyPicker, { CompanySelection } from "@/components/CompanyPicker";

const CATEGORIES = [
  "Roofing", "Kitchen/Bath Remodel", "Water/Mold/Fire Restoration", "Foundation",
  "Flooring", "Windows/Doors", "Electrical", "Plumbing", "HVAC", "Painting",
  "Fencing", "Room Addition", "General Contracting", "Other",
];

export default function HomeownerSubmitPage() {
  const [company, setCompany] = useState<CompanySelection | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [docs, setDocs] = useState({
    hasContract: false, hasPaymentProof: false, hasPhotos: false, hasPermits: false,
    hasPoliceReport: false, hasAgComplaint: false, hasLawsuit: false,
  });
  const [certify, setCertify] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string; complaintId?: string } | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company) {
      setResult({ ok: false, msg: "Select or add the company first." });
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const payload: any = {
        submitterType: "homeowner",
        name, email, phone, city, county, category, amount, summary, details, certify,
        ...docs,
      };
      if (company.mode === "existing") payload.companyId = company.id;
      else {
        payload.companyName = company.name;
        payload.companyCity = company.city;
        payload.companyZip = company.zip;
        payload.companyPhone = company.phone;
        payload.companyLicense = company.license;
      }

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ ok: false, msg: data.error || "Something went wrong." });
      } else {
        setResult({ ok: true, msg: `Filed as Case No. ${data.caseNumber}. It's now live on the company's case file.`, complaintId: data.id });
      }
    } catch {
      setResult({ ok: false, msg: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  async function uploadEvidence() {
    if (!result?.complaintId || !files || files.length === 0) return;
    setUploadStatus("Uploading…");
    const form = new FormData();
    Array.from(files).forEach((f) => form.append("files", f));
    try {
      const res = await fetch(`/api/complaints/${result.complaintId}/evidence`, { method: "POST", body: form });
      const data = await res.json();
      setUploadStatus(res.ok ? `${data.count} file(s) uploaded privately for review.` : data.error || "Upload failed.");
    } catch {
      setUploadStatus("Upload failed. Please try again.");
    }
  }

  const toggle = (key: keyof typeof docs) => setDocs((d) => ({ ...d, [key]: !d[key] }));

  if (result?.ok) {
    return (
      <main>
        <section className="hero" style={{ paddingBottom: 32 }}>
          <div className="wrap">
            <div className="eyebrow">Filed</div>
            <h1 style={{ fontSize: 30 }}>Case No. {result.msg.match(/Case No\. (\d+)/)?.[1]} filed.</h1>
            <p className="lede">{result.msg}</p>
          </div>
        </section>
        <section className="section" style={{ borderBottom: "none" }}>
          <div className="wrap" style={{ maxWidth: 560 }}>
            <div className="subhead">Optional — add private evidence</div>
            <p style={{ color: "var(--ink-text-dim)", fontSize: 13.5, marginBottom: 16 }}>
              Contract, receipts, texts, photos, permits &mdash; these are sent privately for review and are
              never public until the site operator specifically chooses to publish one.
            </p>
            <input type="file" multiple onChange={(e) => setFiles(e.target.files)} style={{ marginBottom: 12 }} />
            <div>
              <button className="btn btn-secondary" onClick={uploadEvidence} disabled={!files}>Upload Evidence</button>
            </div>
            {uploadStatus && <p style={{ marginTop: 12, fontSize: 13, color: "var(--steel)" }}>{uploadStatus}</p>}
            <p style={{ marginTop: 32 }}>
              <Link href="/companies" style={{ color: "var(--steel)" }}>← Back to Companies</Link>
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="hero" style={{ paddingBottom: 32 }}>
        <div className="wrap">
          <div className="eyebrow">Homeowner Complaint</div>
          <h1 style={{ fontSize: 34, maxWidth: "22ch" }}>Report a contractor.</h1>
          <p className="lede">
            Be specific &mdash; dates, dollar amounts, what was promised versus what happened. You'll be
            able to add supporting documents privately after filing.
          </p>
        </div>
      </section>

      <section className="section" style={{ borderBottom: "none" }}>
        <div className="wrap">
          <form className="filing" onSubmit={onSubmit}>
            <div className="field">
              <label>Company</label>
              <CompanyPicker value={company} onChange={setCompany} />
            </div>

            <div className="field">
              <label htmlFor="name">Your full name</label>
              <span className="hint">Published under your real name &mdash; no anonymous filings.</span>
              <input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Rivera" />
            </div>
            <div className="field">
              <label htmlFor="email">Your email</label>
              <span className="hint">Private &mdash; kept for follow-up only.</span>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="phone">Your phone</label>
              <span className="hint">Private &mdash; kept for follow-up only.</span>
              <input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="city">Your city</label>
              <input id="city" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Copperas Cove, TX" />
            </div>
            <div className="field">
              <label htmlFor="county">County</label>
              <input id="county" required value={county} onChange={(e) => setCounty(e.target.value)} placeholder="Coryell" />
            </div>
            <div className="field">
              <label htmlFor="category">Type of work</label>
              <select id="category" required value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="" disabled>Select one</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="amount">Amount in dispute (USD)</label>
              <input id="amount" type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="14000" />
            </div>
            <div className="field">
              <label htmlFor="summary">One-line summary</label>
              <input id="summary" required maxLength={140} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Paid $14,000 deposit for a roof that was never started" />
            </div>
            <div className="field">
              <label htmlFor="details">What happened</label>
              <textarea id="details" required minLength={30} maxLength={4000} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="In March 2025 I signed a contract for..." />
            </div>

            <div className="field">
              <label>Documentation you have</label>
              <span className="hint">Check what you have &mdash; you'll upload it privately after filing.</span>
              {([
                ["hasContract", "Signed contract"],
                ["hasPaymentProof", "Proof of payment"],
                ["hasPhotos", "Photos of the work"],
                ["hasPermits", "Permits pulled (or not pulled)"],
                ["hasPoliceReport", "Police report filed"],
                ["hasAgComplaint", "Attorney General complaint filed"],
                ["hasLawsuit", "Lawsuit filed"],
              ] as [keyof typeof docs, string][]).map(([key, label]) => (
                <label className="checkbox-row" key={key}>
                  <input type="checkbox" checked={docs[key]} onChange={() => toggle(key)} />
                  {label}
                </label>
              ))}
            </div>

            <label className="checkbox-row">
              <input type="checkbox" required checked={certify} onChange={(e) => setCertify(e.target.checked)} />
              I certify this account is true to the best of my knowledge, is based on my own firsthand
              experience, and I understand it will be published publicly under my name.
            </label>

            {result && !result.ok && <div className="form-msg err">{result.msg}</div>}

            <div>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Filing…" : "File Complaint"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
