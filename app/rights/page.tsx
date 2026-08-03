export default function RightsPage() {
  return (
    <main>
      <section className="hero" style={{ paddingBottom: 32 }}>
        <div className="wrap">
          <div className="eyebrow">Know Your Rights</div>
          <h1 style={{ fontSize: 34, maxWidth: "20ch" }}>What Texas law actually gives you.</h1>
          <p className="lede">General information, not legal advice. Rules change and every situation is different — confirm specifics with an attorney or the linked agency.</p>
        </div>
      </section>

      <section className="section" style={{ borderBottom: "none" }}>
        <div className="wrap">
          <div className="mission-grid">
            <div>
              <strong>Deceptive Trade Practices Act (DTPA).</strong> Texas consumers have a statutory right
              of action against false, misleading, or deceptive business practices — this covers a lot of
              bad-contractor behavior (bait-and-switch pricing, unlicensed work claimed as licensed,
              knowingly defective work misrepresented as sound).
            </div>
            <div>
              <strong>Right to a written contract.</strong> Get everything in writing: scope, price,
              timeline, change-order process. Verbal promises are far harder to enforce.
            </div>
            <div>
              <strong>Mechanic's and materialman's liens (for subs/vendors).</strong> Texas Property Code
              Chapter 53 gives unpaid subcontractors and suppliers the right to place a lien on the property
              — but the notice and filing deadlines are strict and trade-dependent. Don't assume you have
              more time than you do.
            </div>
            <div>
              <strong>Residential Construction Liability Act.</strong> Before suing a contractor over
              construction defects, Texas law generally requires sending a formal notice and giving the
              contractor a chance to inspect and offer repair. Skipping this step can limit your later
              claims — so don't skip it, even if it feels like a formality.
            </div>
            <div>
              <strong>Licensing isn't universal.</strong> General contracting isn't state-licensed in Texas,
              but many trades within it are (electrical, plumbing, HVAC). Check{" "}
              <a href="https://www.tdlr.texas.gov/" target="_blank" rel="noreferrer" style={{ color: "var(--steel)" }}>TDLR</a>{" "}
              for whether your specific trade requires one, and whether the person who worked on your home
              actually held it.
            </div>
            <div>
              <strong>Insurance fraud is a separate track.</strong> If a contractor inflated an insurance
              estimate, told you to lie to your insurer, or paid your deductible (illegal in Texas), that's
              reportable to your insurer's special investigations unit and potentially the{" "}
              <a href="https://www.tdi.texas.gov/fraud/index.html" target="_blank" rel="noreferrer" style={{ color: "var(--steel)" }}>Texas Department of Insurance</a>.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
