import Link from "next/link";

export default function SubcontractorsPage() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 32 }}>
        <div className="wrap">
          <div className="eyebrow">For Subcontractors & Vendors</div>
          <h1 style={{ fontSize: 34, maxWidth: "20ch" }}>If you weren't paid for completed work.</h1>
          <p className="lede">
            Non-payment complaints carry the most weight here when they're specific about the money and the
            paper trail behind it.
          </p>
          <Link href="/submit/subcontractor" className="btn btn-primary">Report Non-Payment</Link>
        </div>
      </section>

      <section className="section" style={{ borderBottom: "none" }}>
        <div className="wrap">
          <div className="mission-grid">
            <div>
              <strong>Texas has real lien rights.</strong> If you supplied labor or materials, you may be
              entitled to file a mechanic's lien &mdash; but there are strict deadlines (often tied to when
              you last worked or delivered). Don't wait to look into this.
            </div>
            <div>
              <strong>Send a written demand letter first.</strong> A dated, specific demand letter (amount
              owed, invoice numbers, due date) both gives the contractor a fair chance to pay and becomes
              evidence if this goes further.
            </div>
            <div>
              <strong>Small claims and Justice Court.</strong> Texas Justice Courts handle claims up to
              $20,000 without requiring an attorney &mdash; often the fastest path for a straightforward
              unpaid invoice.
            </div>
            <div>
              <strong>Document everything before filing here.</strong> Signed purchase orders or agreements,
              proof of delivery/completion, and the demand letter make your complaint far harder to dismiss
              as a misunderstanding.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
