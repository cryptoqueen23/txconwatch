"use client";

import { useEffect, useState } from "react";

type CompanyRow = { id: string; slug: string; name: string; city: string; phone: string };

export type CompanySelection =
  | { mode: "existing"; id: string; name: string }
  | { mode: "new"; name: string; city: string; zip: string; phone: string; license: string };

export default function CompanyPicker({
  value,
  onChange,
}: {
  value: CompanySelection | null;
  onChange: (v: CompanySelection | null) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<CompanyRow[]>([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newZip, setNewZip] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newLicense, setNewLicense] = useState("");

  useEffect(() => {
    if (value || q.trim().length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      fetch(`/api/companies?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => setResults(d.companies || []));
    }, 200);
    return () => clearTimeout(handle);
  }, [q, value]);

  if (value) {
    return (
      <div className="company-picker-selected">
        <span>
          {value.mode === "existing" ? value.name : `${value.name} (new company)`}
        </span>
        <button type="button" className="btn-small" onClick={() => onChange(null)}>Change</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <input
        placeholder="Type the company name to search…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {results.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {results.map((r) => (
            <div
              key={r.id}
              className="company-picker-result"
              onClick={() => onChange({ mode: "existing", id: r.id, name: r.name })}
            >
              <strong>{r.name}</strong> &middot; {r.city}
            </div>
          ))}
        </div>
      )}
      {!showNewForm ? (
        <button type="button" className="btn-small" onClick={() => setShowNewForm(true)} style={{ alignSelf: "flex-start" }}>
          Can't find them? Add a new company
        </button>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, border: "1px solid var(--ink-3)", padding: 14, borderRadius: "var(--radius)" }}>
          <input placeholder="Company name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <input placeholder="City" value={newCity} onChange={(e) => setNewCity(e.target.value)} />
          <input placeholder="ZIP code" value={newZip} onChange={(e) => setNewZip(e.target.value)} maxLength={10} />
          <input placeholder="Phone (if known)" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          <input placeholder="License # (if known)" value={newLicense} onChange={(e) => setNewLicense(e.target.value)} />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (newName.trim().length < 2) return;
              onChange({ mode: "new", name: newName.trim(), city: newCity.trim(), zip: newZip.trim(), phone: newPhone.trim(), license: newLicense.trim() });
            }}
          >
            Use this company
          </button>
        </div>
      )}
    </div>
  );
}
