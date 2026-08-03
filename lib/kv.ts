// Thin wrapper around the Upstash Redis REST API (Vercel "Storage" -> Upstash Redis).
// Auto-injects KV_REST_API_URL / KV_REST_API_TOKEN once connected in the Vercel dashboard.

const URL = process.env.KV_REST_API_URL;
const TOKEN = process.env.KV_REST_API_TOKEN;

function assertConfigured() {
  if (!URL || !TOKEN) {
    throw new Error(
      "Storage isn't connected yet. In Vercel, go to Storage -> Create Database -> Upstash Redis, then connect it to this project."
    );
  }
}

async function redis(command: (string | number)[]) {
  assertConfigured();
  const res = await fetch(`${URL}/${command.map(encodeURIComponent).join("/")}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Storage error (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  return data.result;
}

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await redis(["GET", key]);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
async function setJSON(key: string, value: unknown): Promise<void> {
  await redis(["SET", key, JSON.stringify(value)]);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InvestigationStatus = "receiving" | "reviewing" | "multiple" | "litigation" | "judgment";

export const STATUS_META: Record<InvestigationStatus, { label: string; dot: string }> = {
  receiving: { label: "Receiving Complaints", dot: "🟢" },
  reviewing: { label: "Documents Under Review", dot: "🟡" },
  multiple: { label: "Multiple Independent Complaints", dot: "🟠" },
  litigation: { label: "Litigation Confirmed", dot: "🔴" },
  judgment: { label: "Judgment Entered", dot: "⚫" },
};

export type VerificationLevel = "unverified" | "documented" | "verified";

export const VERIFICATION_META: Record<VerificationLevel, string> = {
  unverified: "Unverified — submitter account only",
  documented: "Documented — submitter provided supporting evidence",
  verified: "Verified — evidence reviewed by site operator",
};

export type Company = {
  id: string;
  slug: string;
  name: string;
  city: string;
  zip: string;
  phone: string;
  license: string;
  createdAt: string;
  status: InvestigationStatus;
  overview: string;
  companyResponse: string;
  publicRecordLinks: {
    secretaryOfState: string;
    bbb: string;
    countyCourt: string;
    permits: string;
    attorneyGeneral: string;
    licensingBoard: string;
  };
  scorecard: {
    bbbComplaints: number | null;
    civilCases: number | null;
    permits: number | null;
    publicResponses: number | null;
    documentsSubmitted: number | null;
    consumerComplaints: number | null;
    vendorComplaints: number | null;
    avgResponseTimeDays: number | null;
  };
  publicDocuments: { title: string; url: string; addedAt: string }[];
  timeline: { date: string; event: string }[];
};

export type SubmitterType = "homeowner" | "subcontractor";

export type Complaint = {
  id: string;
  caseNumber: string;
  companyId: string;
  submitterType: SubmitterType;
  createdAt: string;
  status: "published" | "removed";
  verificationLevel: VerificationLevel;

  name: string;
  email: string;
  phone: string;
  city: string;
  county: string;

  category: string;
  amount: number | null;
  summary: string;
  details: string;

  hasContract?: boolean;
  hasPaymentProof?: boolean;
  hasPhotos?: boolean;
  hasPermits?: boolean;
  hasPoliceReport?: boolean;
  hasAgComplaint?: boolean;
  hasLawsuit?: boolean;

  trade?: string;
  invoiceAmount?: number | null;
  amountPaid?: number | null;
  balanceDue?: number | null;
  lienStatus?: string;
  hasDemandLetter?: boolean;
  hasProofOfDelivery?: boolean;
  hasPurchaseOrders?: boolean;

  timeline: { date: string; event: string }[];
};

export type EvidenceFile = {
  id: string;
  complaintId: string;
  filename: string;
  url: string;
  uploadedAt: string;
  published: boolean;
};

// ---------------------------------------------------------------------------
// Companies
// ---------------------------------------------------------------------------

const COMPANIES_KEY = "tcw:companies";
const COMPLAINTS_KEY = "tcw:complaints";
const EVIDENCE_KEY = "tcw:evidence";

export async function getAllCompanies(): Promise<Company[]> {
  return getJSON<Company[]>(COMPANIES_KEY, []);
}
export async function saveAllCompanies(list: Company[]): Promise<void> {
  await setJSON(COMPANIES_KEY, list);
}
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
export function defaultCompany(input: { name: string; city: string; zip?: string; phone: string; license?: string }): Company {
  const now = new Date().toISOString();
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    slug: slugify(input.name),
    name: input.name,
    city: input.city,
    zip: input.zip || "",
    phone: input.phone,
    license: input.license || "",
    createdAt: now,
    status: "receiving",
    overview: "",
    companyResponse: "",
    publicRecordLinks: {
      secretaryOfState: `https://mycpa.cpa.state.tx.us/coa/Search.do?searchType=organization&searchTerm=${encodeURIComponent(input.name)}`,
      bbb: `https://www.bbb.org/search?find_text=${encodeURIComponent(input.name)}&find_loc=TX`,
      countyCourt: "",
      permits: "",
      attorneyGeneral: "https://www.texasattorneygeneral.gov/consumer-protection/file-consumer-complaint",
      licensingBoard: "https://www.tdlr.texas.gov/",
    },
    scorecard: {
      bbbComplaints: null,
      civilCases: null,
      permits: null,
      publicResponses: null,
      documentsSubmitted: null,
      consumerComplaints: null,
      vendorComplaints: null,
      avgResponseTimeDays: null,
    },
    publicDocuments: [],
    timeline: [{ date: now, event: "Company profile created on Texas Contractor Watch" }],
  };
}
export async function findOrCreateCompany(input: { name: string; city: string; zip?: string; phone: string; license?: string }): Promise<Company> {
  const list = await getAllCompanies();
  const slug = slugify(input.name);
  const existing = list.find((c) => c.slug === slug);
  if (existing) return existing;
  const created = defaultCompany(input);
  list.push(created);
  await saveAllCompanies(list);
  return created;
}

// ---------------------------------------------------------------------------
// Complaints
// ---------------------------------------------------------------------------

export async function getAllComplaints(): Promise<Complaint[]> {
  return getJSON<Complaint[]>(COMPLAINTS_KEY, []);
}
export async function saveAllComplaints(list: Complaint[]): Promise<void> {
  await setJSON(COMPLAINTS_KEY, list);
}
export async function addComplaint(c: Complaint): Promise<void> {
  const list = await getAllComplaints();
  list.push(c);
  await saveAllComplaints(list);
}

// ---------------------------------------------------------------------------
// Private evidence (per complaint) — admin-only until explicitly published
// ---------------------------------------------------------------------------

export async function getAllEvidence(): Promise<EvidenceFile[]> {
  return getJSON<EvidenceFile[]>(EVIDENCE_KEY, []);
}
export async function saveAllEvidence(list: EvidenceFile[]): Promise<void> {
  await setJSON(EVIDENCE_KEY, list);
}
export async function addEvidence(e: EvidenceFile): Promise<void> {
  const list = await getAllEvidence();
  list.push(e);
  await saveAllEvidence(list);
}
export async function evidenceForComplaint(complaintId: string): Promise<EvidenceFile[]> {
  return (await getAllEvidence()).filter((e) => e.complaintId === complaintId);
}
