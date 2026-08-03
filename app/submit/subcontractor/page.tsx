"use client";

import { useState } from "react";
import Link from "next/link";
import CompanyPicker, { CompanySelection } from "@/components/CompanyPicker";

const LIEN_STATUSES = ["Not filed", "Notice sent", "Lien filed", "Lien released", "N/A"];

export default function SubcontractorSubmitPage() {
  const [company, setCompany] = useState<CompanySelection | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [trade, setTrade] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [balanceDue, setBalanceDue] = useState("");
  const [lienStatus, setLienStatus] = useState("");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [docs, setDocs] = useState({ hasDemandLetter: false, hasProofOfDelivery: false, hasPurchaseOrders: false });
  const [certify, setCertify] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string; complaintId?: string; caseNumber?: string } | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

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
        submitterType: "subcontractor",
        name, email, phone, city, county,
        category: `Non-Payment — ${trade || "General"}`,
        amount: balanceDue,
        summary, details, certify,
        trade, invoiceAmount, amountPaid, balanceDue, lienStatus,
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
        setResult({ ok: true, msg: `Filed as Case No. ${data.caseNumber}.`, complaintId: data.id, caseNumber: data.caseNumber });
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
            <h1 style={{ fontSize: 30 }}>Case No. {result.caseNumber} filed.</h1>
            <p className="lede">It's now live on the company's case file.</p>
          </div>
        </section>
        <section className="section" style={{ borderBottom: "none" }}>
          <div className="wrap" style={{ maxWidth: 560 }}>
            <div className="subhead">Optional — add private evidence</div>
            <p style={{ color: "var(--ink-text-dim)", fontSize: 13.5, marginBottom: 16 }}>
              Invoices, POs, delivery proof, demand letters &mdash; sent privately for review, never public
              until specifically published.
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
          <div className="eyebrow">Subcontractor / Vendor Complaint</div>
          <h1 style={{ fontSize: 34, maxWidth: "22ch" }}>Report non-payment.</h1>
          <p className="lede">Invoice details, what's outstanding, and lien status if applicable.</p>
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
              <label htmlFor="name">Your full name / business name</label>
              <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <span className="hint">Private &mdash; kept for follow-up only.</span>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <span className="hint">Private &mdash; kept for follow-up only.</span>
              <input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="city">Your city</label>
              <input id="city" required value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="county">Job county</label>
              <input id="county" required value={county} onChange={(e) => setCounty(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="trade">Trade</label>
              <input id="trade" required value={trade} onChange={(e) => setTrade(e.target.value)} placeholder="Roofing, framing, electrical, materials supplier…" />
            </div>
            <div className="field">
              <label htmlFor="invoiceAmount">Invoice amount (USD)</label>
              <input id="invoiceAmount" type="number" min={0} required value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="amountPaid">Amount paid so far (USD)</label>
              <input id="amountPaid" type="number" min={0} value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="balanceDue">Balance due (USD)</label>
              <input id="balanceDue" type="number" min={0} required value={balanceDue} onChange={(e) => setBalanceDue(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="lienStatus">Lien status</label>
              <select id="lienStatus" required value={lienStatus} onChange={(e) => setLienStatus(e.target.value)}>
                <option value="" disabled>Select one</option>
                {LIEN_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="summary">One-line summary</label>
              <input id="summary" required maxLength={140} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Owed $8,200 for materials delivered in June, no response since" />
            </div>
            <div className="field">
              <label htmlFor="details">What happened</label>
              <textarea id="details" required minLength={30} maxLength={4000} value={details} onChange={(e) => setDetails(e.target.value)} />
            </div>

            <div className="field">
              <label>Documentation you have</label>
              {([
                ["hasDemandLetter", "Demand letter sent"],
                ["hasProofOfDelivery", "Proof of delivery / completion"],
                ["hasPurchaseOrders", "Purchase orders / signed agreement"],
              ] as [keyof typeof docs, string][]).map(([key, label]) => (
                <label className="checkbox-row" key={key}>
                  <input type="checkbox" checked={docs[key]} onChange={() => toggle(key)} />
                  {label}
                </label>
              ))}
            </div>

            <label className="checkbox-row">
              <input type="checkbox" required checked={certify} onChange={(e) => setCertify(e.target.checked)} />
              I certify this account is true to the best of my knowledge and understand it will be
              published publicly under my name.
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
