"use client";

import { useState } from "react";
import Link from "next/link";
import emailjs from "@emailjs/browser";
import CompanyPicker, { CompanySelection } from "@/components/CompanyPicker";

const CATEGORIES = [
  "Roofing",
  "Kitchen/Bath Remodel",
  "Water/Mold/Fire Restoration",
  "Foundation",
  "Flooring",
  "Windows/Doors",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Painting",
  "Fencing",
  "Room Addition",
  "General Contracting",
  "Other",
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
    hasContract: false,
    hasPaymentProof: false,
    hasPhotos: false,
    hasPermits: false,
    hasPoliceReport: false,
    hasAgComplaint: false,
    hasLawsuit: false,
  });
  const [certify, setCertify] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const toggle = (key: keyof typeof docs) => {
    setDocs((current) => ({ ...current, [key]: !current[key] }));
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!company) {
      setResult({ ok: false, msg: "Select or add the company first." });
      return;
    }

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setResult({
        ok: false,
        msg: "Email service is not configured yet. Please contact the site operator.",
      });
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const companyCity =
        company.mode === "new" && company.city
          ? company.city
          : "Not provided";

      const companyZip =
        company.mode === "new" && company.zip
          ? company.zip
          : "Not provided";

      const templateParams = {
        company_name: company.name || "Not provided",
        company_city: companyCity,
        company_zip: companyZip,

        from_name: name,
        email,
        phone,
        city,
        county,
        category,
        amount: amount || "Not provided",
        summary,
        details,

        has_contract: docs.hasContract ? "Yes" : "No",
        has_payment_proof: docs.hasPaymentProof ? "Yes" : "No",
        has_photos: docs.hasPhotos ? "Yes" : "No",
        has_permits: docs.hasPermits ? "Yes" : "No",
        has_police_report: docs.hasPoliceReport ? "Yes" : "No",
        has_ag_complaint: docs.hasAgComplaint ? "Yes" : "No",
        has_lawsuit: docs.hasLawsuit ? "Yes" : "No",
        certify: certify ? "Yes" : "No",
      };

      await emailjs.send(serviceId, templateId, templateParams, {
        publicKey,
      });

      setResult({
        ok: true,
        msg: "Your complaint was sent privately to Texas Contractor Watch for review.",
      });
    } catch (error) {
      console.error("EmailJS homeowner submission failed:", error);
      setResult({
        ok: false,
        msg: "Your complaint could not be sent. Please check your connection and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.ok) {
    return (
      <main>
        <section className="hero" style={{ paddingBottom: 32 }}>
          <div className="wrap">
            <div className="eyebrow">Complaint Received</div>
            <h1 style={{ fontSize: 30 }}>Thank you for speaking up.</h1>
            <p className="lede">{result.msg}</p>
          </div>
        </section>

        <section className="section" style={{ borderBottom: "none" }}>
          <div className="wrap" style={{ maxWidth: 620 }}>
            <div className="disclaimer">
              Your submission is not published automatically. It will be reviewed first. Keep your
              contracts, invoices, payment records, photos, permits, text messages, and other evidence.
              Texas Contractor Watch may reply to the email address you provided to request documentation.
            </div>

            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href="https://script.google.com/macros/s/AKfycbyQPLrKiEZ4UmI2Vl7BNL7W1q-NQIn2lRsVA-SrZMJHvHNAAZdUZ5jXPE5CjAhvJdtT/exec"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                Upload Supporting Documents
              </a>

              <Link href="/companies" className="btn btn-secondary">
                Back to Companies
              </Link>
            </div>
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
            Be specific about dates, dollar amounts, what was promised, and what actually happened.
            Your submission will be emailed privately to Texas Contractor Watch for review.
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
              <span className="hint">
                Used to verify and follow up on your submission.
              </span>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Rivera"
                autoComplete="name"
              />
            </div>

            <div className="field">
              <label htmlFor="email">Your email</label>
              <span className="hint">Private and used for follow-up only.</span>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="phone">Your phone</label>
              <span className="hint">Private and used for follow-up only.</span>
              <input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>

            <div className="field">
              <label htmlFor="city">Your city</label>
              <input
                id="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Copperas Cove, TX"
              />
            </div>

            <div className="field">
              <label htmlFor="county">County</label>
              <input
                id="county"
                required
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                placeholder="Coryell"
              />
            </div>

            <div className="field">
              <label htmlFor="category">Type of work</label>
              <select
                id="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" disabled>
                  Select one
                </option>
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="amount">Amount in dispute (USD)</label>
              <input
                id="amount"
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="14000"
              />
            </div>

            <div className="field">
              <label htmlFor="summary">One-line summary</label>
              <input
                id="summary"
                required
                maxLength={140}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Paid a $14,000 deposit for a roof that was never started"
              />
            </div>

            <div className="field">
              <label htmlFor="details">What happened</label>
              <textarea
                id="details"
                required
                minLength={30}
                maxLength={4000}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="In March 2025, I signed a contract for..."
              />
            </div>

            <div className="field">
              <label>Documentation you have</label>
              <span className="hint">
                Check everything you currently have. Keep these records available for follow-up.
              </span>

              {(
                [
                  ["hasContract", "Signed contract"],
                  ["hasPaymentProof", "Proof of payment"],
                  ["hasPhotos", "Photos of the work"],
                  ["hasPermits", "Permits pulled or evidence that permits were not pulled"],
                  ["hasPoliceReport", "Police report filed"],
                  ["hasAgComplaint", "Attorney General complaint filed"],
                  ["hasLawsuit", "Lawsuit filed"],
                ] as [keyof typeof docs, string][]
              ).map(([key, label]) => (
                <label className="checkbox-row" key={key}>
                  <input
                    type="checkbox"
                    checked={docs[key]}
                    onChange={() => toggle(key)}
                  />
                  {label}
                </label>
              ))}
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                required
                checked={certify}
                onChange={(e) => setCertify(e.target.checked)}
              />
              I certify that this account is true to the best of my knowledge and is based on my
              firsthand experience. I understand that Texas Contractor Watch may contact me to verify
              the submission before any information is published.
            </label>

            {result && !result.ok && <div className="form-msg err">{result.msg}</div>}

            <div>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Sending…" : "Send Complaint"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
