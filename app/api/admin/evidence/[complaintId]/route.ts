import { NextRequest, NextResponse } from "next/server";
import { evidenceForComplaint, getAllEvidence, saveAllEvidence, getAllComplaints, getAllCompanies, saveAllCompanies } from "@/lib/kv";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { complaintId: string } }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  const files = await evidenceForComplaint(params.complaintId);
  return NextResponse.json({ files });
}

export async function POST(req: NextRequest, { params }: { params: { complaintId: string } }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }
  const { evidenceId, title } = body || {};
  if (!evidenceId) {
    return NextResponse.json({ error: "evidenceId required." }, { status: 400 });
  }

  const evidenceList = await getAllEvidence();
  const ev = evidenceList.find((e) => e.id === evidenceId);
  if (!ev) return NextResponse.json({ error: "Evidence not found." }, { status: 404 });

  const complaints = await getAllComplaints();
  const complaint = complaints.find((c) => c.id === ev.complaintId);
  if (!complaint) return NextResponse.json({ error: "Complaint not found for this evidence." }, { status: 404 });

  const companies = await getAllCompanies();
  const company = companies.find((c) => c.id === complaint.companyId);
  if (!company) return NextResponse.json({ error: "Company not found." }, { status: 404 });

  ev.published = true;
  company.publicDocuments.push({
    title: (title || ev.filename).slice(0, 200),
    url: ev.url,
    addedAt: new Date().toISOString(),
  });

  await saveAllEvidence(evidenceList);
  await saveAllCompanies(companies);

  return NextResponse.json({ ok: true });
}
