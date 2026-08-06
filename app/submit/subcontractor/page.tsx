"use client";

import { useState } from "react";
import Link from "next/link";
import emailjs from "@emailjs/browser";
import CompanyPicker, { CompanySelection } from "@/components/CompanyPicker";

const LIEN_STATUSES = [
  "Not filed",
  "Notice sent",
  "Lien filed",
  "Lien released",
  "Not applicable",
];

export default function SubcontractorSubmitPage() {
  const [company, setCompany] = useState<CompanySelection | null>(null);
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [trade, setTrade] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [balanceDue, setBalanceDue] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [lienStatus, setLienStatus] = useState("");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [docs, setDocs] = useState({
    hasContract: false,
    hasInvoice: false,
    hasProofOfDelivery: false,
    hasDemandLetter: false,
    hasLien: false,
    hasPhotos: false,
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
      setResult({ ok: false, msg: "Select or add the contractor or company first." });
      return;
    }

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId =
      process.env.NEXT_PUBLIC_EMAILJS_SUBCONTRACTOR_TEMPLATE_ID;
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
        business_name: businessName || "Not provided",
        email,
        phone,
        trade,
        city,
        county,

        invoice_amount: invoiceAmount || "Not provided",
        amount_paid: amountPaid || "0",
        balance_due: balanceDue || "Not provided",
        completion_date: completionDate || "Not provided",
        due_date: dueDate || "Not provided",
        lien_status: lienStatus || "Not provided",

        summary,
        details,

        has_contract: docs.hasContract ? "Yes" : "No",
        has_invoice: docs.hasInvoice ? "Yes" : "No",
        has_delivery_proof: docs.hasProofOfDelivery ? "Yes" : "No",
        has_demand_letter: docs.hasDemandLetter ? "Yes" : "No",
        has_lien: docs.hasLien ? "Yes" : "No",
        has_photos: docs.hasPhotos ? "Yes" : "No",

        certify: certify ? "Yes" : "No",
      };

      await emailjs.send(serviceId, templateId, templateParams, {
        publicKey,
      });

      setResult({
        ok: true,
        msg: "Your non-payment complaint was sent privately to Texas Contractor Watch for review.",
      });
    } catch (error) {
      console.error("EmailJS subcontractor submission failed:", error);
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
            <h1 style={{ fontSize: 30 }}>Your report has been received.</h1>
            <p className="lede">{result.msg}</p>
          </div>
        </section>

        <section className="section" style={{ borderBottom: "none" }}>
          <div className="wrap" style={{ maxWidth: 620 }}>
            <div className="disclaimer">
              Your submission is not published automatically. It will be reviewed
              first. Keep your invoices, purchase orders, contracts, delivery
              records, demand letters, lien notices, photographs, text messages,
              and other evidence. Texas Contractor Watch may reply to the email
              address you provided to request documentation.
            </div>

            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href={`https://script.google.com/macros/s/AKfycbyQPLrKiEZ4UmI2Vl7BNL7W1q-NQIn2lRsVA-SrZMJHvHNAAZdUZ5jXPE5CjAhvJdtT/exec#${new URLSearchParams({
                  name,
                  email,
                  company: company?.name || "",
                  complaintType: "Subcontractor / Vendor Complaint",
                }).toString()}`}
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
          <div className="eyebrow">Subcontractor / Vendor Complaint</div>
          <h1 style={{ fontSize: 34, maxWidth: "22ch" }}>
            Report non-payment.
          </h1>
          <p className="lede">
            Tell us who hired you, what work or materials you provided, how much
            remains unpaid, and what documentation you have. Your submission
            will be emailed privately to Texas Contractor Watch for review.
          </p>
        </div>
      </section>

      <section className="section" style={{ borderBottom: "none" }}>
        <div className="wrap">
          <form className="filing" onSubmit={onSubmit}>
            <div className="field">
              <label>Contractor or company that owes you</label>
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
                placeholder="Maria Rivera"
                autoComplete="name"
              />
            </div>

            <div className="field">
              <label htmlFor="businessName">Your business name</label>
              <span className="hint">
                Optional if you worked as an individual.
              </span>
              <input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Rivera Custom Cabinets LLC"
                autoComplete="organization"
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
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
              <label htmlFor="phone">Phone</label>
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
              <label htmlFor="city">Project city</label>
              <input
                id="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Copperas Cove, TX"
              />
            </div>

            <div className="field">
              <label htmlFor="county">Project county</label>
              <input
                id="county"
                required
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                placeholder="Coryell"
              />
            </div>

            <div className="field">
              <label htmlFor="trade">Trade or service provided</label>
              <input
                id="trade"
                required
                value={trade}
                onChange={(e) => setTrade(e.target.value)}
                placeholder="Cabinets, roofing, framing, electrical, materials supplier..."
              />
            </div>

            <div className="field">
              <label htmlFor="invoiceAmount">Invoice amount (USD)</label>
              <input
                id="invoiceAmount"
                type="number"
                min={0}
                step="0.01"
                required
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
                placeholder="10000"
              />
            </div>

            <div className="field">
              <label htmlFor="amountPaid">Amount paid so far (USD)</label>
              <input
                id="amountPaid"
                type="number"
                min={0}
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="1500"
              />
            </div>

            <div className="field">
              <label htmlFor="balanceDue">Balance due (USD)</label>
              <input
                id="balanceDue"
                type="number"
                min={0}
                step="0.01"
                required
                value={balanceDue}
                onChange={(e) => setBalanceDue(e.target.value)}
                placeholder="8500"
              />
            </div>

            <div className="field">
              <label htmlFor="completionDate">
                Work completed or materials delivered
              </label>
              <input
                id="completionDate"
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="dueDate">Payment due date</label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="lienStatus">Lien status</label>
              <select
                id="lienStatus"
                required
                value={lienStatus}
                onChange={(e) => setLienStatus(e.target.value)}
              >
                <option value="" disabled>
                  Select one
                </option>
                {LIEN_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="summary">One-line summary</label>
              <input
                id="summary"
                required
                maxLength={140}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Owed $8,500 for custom cabinets delivered and installed"
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
                placeholder="Describe who hired you, the agreement, the work or materials provided, invoices sent, payment promises, and attempts to collect."
              />
            </div>

            <div className="field">
              <label>Documentation you have</label>
              <span className="hint">
                Check everything you currently have. Keep these records available
                for follow-up.
              </span>

              {(
                [
                  ["hasContract", "Contract or purchase order"],
                  ["hasInvoice", "Invoice"],
                  ["hasProofOfDelivery", "Proof of delivery or completion"],
                  ["hasDemandLetter", "Demand letter or payment request"],
                  ["hasLien", "Lien notice or recorded lien"],
                  ["hasPhotos", "Photos, emails, or text messages"],
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
              I certify that this account is true to the best of my knowledge
              and is based on my firsthand experience. I understand that Texas
              Contractor Watch may contact me to verify the submission before
              any information is published.
            </label>

            {result && !result.ok && (
              <div className="form-msg err">{result.msg}</div>
            )}

            <div>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Sending…" : "Send Non-Payment Complaint"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
