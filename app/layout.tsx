import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-serif", weight: ["300", "400", "600"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Texas Contractor Watch | Real Stories. Real Accountability.",
  description:
    "A Texas documentation and accountability platform for homeowners, subcontractors, and vendors dealing with contractor disputes and non-payment.",
  robots: "index, follow",
};

const nav = [
  ["/companies", "Companies"],
  ["/homeowners", "Homeowners"],
  ["/subcontractors", "Subcontractors"],
  ["/rights", "Know Your Rights"],
  ["/records", "Public Records"],
  ["/about", "About"],
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${plexMono.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <header className="site-nav">
          <div className="nav-shell">
            <Link href="/" className="brand" aria-label="Texas Contractor Watch home">
              <span className="brand-mark" aria-hidden="true">TX</span>
              <span className="brand-copy"><b>Texas Contractor</b><span>Watch</span></span>
            </Link>

            <nav className="desktop-nav" aria-label="Primary navigation">
              {nav.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
            </nav>

            <div className="nav-actions">
              <Link href="/companies" className="nav-search">Search</Link>
              <Link href="/submit" className="nav-cta">Submit Complaint</Link>
            </div>

            <details className="mobile-menu">
              <summary aria-label="Open navigation menu"><span></span><span></span><span></span></summary>
              <nav aria-label="Mobile navigation">
                {nav.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
                <Link href="/submit/homeowner">Report a Contractor</Link>
                <Link href="/submit/subcontractor">Report Non-Payment</Link>
              </nav>
            </details>
          </div>
        </header>

        <div id="main-content">{children}</div>

        <footer className="site-footer">
          <div className="footer-grid">
            <div>
              <Link href="/" className="footer-brand">Texas Contractor Watch</Link>
              <p>Real people. Real stories. Real accountability.</p>
            </div>
            <div>
              <h2>Take action</h2>
              <Link href="/submit/homeowner">Report a contractor</Link>
              <Link href="/submit/subcontractor">Report non-payment</Link>
              <Link href="/companies">Search companies</Link>
            </div>
            <div>
              <h2>Important notice</h2>
              <p>Texas Contractor Watch documents submitted complaints and public records. It is not a court, regulator, law firm, or legal finding.</p>
            </div>
          </div>
          <div className="footer-legal">
            Companies may submit a documented response or correction request for publication. Consumers may also file formal complaints with the{" "}
            <a href="https://www.texasattorneygeneral.gov/consumer-protection/file-consumer-complaint" target="_blank" rel="noreferrer">Texas Attorney General</a>.
          </div>
        </footer>
      </body>
    </html>
  );
}
