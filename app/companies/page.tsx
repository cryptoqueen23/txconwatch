"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STATUS_META: Record<string, { label: string; dot: string }> = {
  receiving: { label: "Receiving Complaints", dot: "🟢" },
  reviewing: { label: "Documents Under Review", dot: "🟡" },
  multiple: { label: "Multiple Independent Complaints", dot: "🟠" },
  litigation: { label: "Litigation Confirmed", dot: "🔴" },
  judgment: { label: "Judgment Entered", dot: "⚫" },
};

type CompanyRow = { id: string; slug: string; name: string; city: string; zip: string; phone: string; status: string };

export default function CompaniesPage() {
  const [q, setQ] = useState("");
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handle = setTimeout(() => {
      setLoading(true);
      fetch(`/api/companies?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => setCompanies(d.companies || []))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(handle);
  }, [q]);

  return (
    <main>
      <section className="hero" style={{ paddingBottom: 32 }}>
        <div className="wrap">
          <div className="eyebrow">Companies</div>
          <h1 style={{ fontSize: 34, maxWidth: "22ch" }}>Search Texas contractor case files.</h1>
          <p className="lede">Every company with a filed complaint gets a case file. Search by name or city.</p>
        </div>
      </section>

      <section className="section" style={{ borderBottom: "none" }}>
        <div className="wrap">
          <div className="search-row">
            <input
              placeholder="Search by company name, city, or ZIP code (e.g. 76522)…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {loading && <div className="empty-state">Searching…</div>}
          {!loading && companies.length === 0 && (
            <div className="empty-state">
              No companies found. Don't see the one you're looking for?{" "}
              <Link href="/submit" style={{ color: "var(--steel)" }}>File a complaint</Link> and add it.
            </div>
          )}
          <div className="company-list">
            {companies.map((c) => {
              const meta = STATUS_META[c.status] || STATUS_META.receiving;
              return (
                <Link href={`/companies/${c.slug}`} className="company-card" key={c.id}>
                  <div>
                    <div className="company-card-name">{c.name}</div>
                    <div className="company-card-meta">{c.city}{c.zip ? ` ${c.zip}` : ""}{c.phone ? ` · ${c.phone}` : ""}</div>
                  </div>
                  <div className="status-badge">{meta.dot} {meta.label}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
