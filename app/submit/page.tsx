import Link from "next/link";

export default function SubmitChooser() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 32 }}>
        <div className="wrap">
          <div className="eyebrow">Submit a Complaint</div>
          <h1 style={{ fontSize: 34, maxWidth: "20ch" }}>Which best describes your situation?</h1>
          <p className="lede">Each form asks for the documentation relevant to your situation.</p>

          <div className="type-toggle">
            <Link href="/submit/homeowner">
              <strong>I'm a Homeowner</strong>
              <span>Report a contractor for poor work, delays, damage, or a project gone wrong.</span>
            </Link>
            <Link href="/submit/subcontractor">
              <strong>I'm a Subcontractor / Vendor</strong>
              <span>Report non-payment, an unpaid invoice, or a lien dispute with a contractor.</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
