import { NextRequest, NextResponse } from "next/server";
import { addComplaint, findOrCreateCompany, getAllComplaints, Complaint, SubmitterType } from "@/lib/kv";

export async function GET(req: NextRequest) {
  try {
    const companyId = req.nextUrl.searchParams.get("companyId");
    const all = await getAllComplaints();
    let published = all.filter((c) => c.status === "published");
    if (companyId) published = published.filter((c) => c.companyId === companyId);
    published = published
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map(({ email, phone, ...rest }) => rest) as Complaint[];
    return NextResponse.json({ complaints: published });
  } catch (err: any) {
    return NextResponse.json({ complaints: [], error: err.message }, { status: 200 });
  }
}

function num(v: any): number | null {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const {
    submitterType, companyId, companyName, companyCity, companyZip, companyPhone, companyLicense,
    name, email, phone, city, county, category, amount, summary, details, certify,
    hasContract, hasPaymentProof, hasPhotos, hasPermits, hasPoliceReport, hasAgComplaint, hasLawsuit,
    trade, invoiceAmount, amountPaid, balanceDue, lienStatus, hasDemandLetter, hasProofOfDelivery, hasPurchaseOrders,
  } = body || {};

  const type: SubmitterType = submitterType === "subcontractor" ? "subcontractor" : "homeowner";

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "A full name is required." }, { status: 400 });
  }
  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    return NextResponse.json({ error: "A valid email is required (private)." }, { status: 400 });
  }
  if (!phone || typeof phone !== "string" || phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ error: "A valid phone number is required (private)." }, { status: 400 });
  }
  if (!city || typeof city !== "string" || city.trim().length < 2) {
    return NextResponse.json({ error: "City is required." }, { status: 400 });
  }
  if (!county || typeof county !== "string" || county.trim().length < 2) {
    return NextResponse.json({ error: "County is required." }, { status: 400 });
  }
  if (!category || typeof category !== "string") {
    return NextResponse.json({ error: "Please select a category." }, { status: 400 });
  }
  if (!summary || typeof summary !== "string" || summary.trim().length < 5 || summary.length > 140) {
    return NextResponse.json({ error: "Summary must be 5–140 characters." }, { status: 400 });
  }
  if (!details || typeof details !== "string" || details.trim().length < 30) {
    return NextResponse.json({ error: "Please provide at least a few sentences of detail (30+ characters)." }, { status: 400 });
  }
  if (!certify) {
    return NextResponse.json({ error: "You must certify the statement is true to the best of your knowledge." }, { status: 400 });
  }

  let resolvedCompanyId = companyId as string | undefined;
  if (!resolvedCompanyId) {
    if (!companyName || typeof companyName !== "string" || companyName.trim().length < 2) {
      return NextResponse.json({ error: "Select an existing company or provide a company name." }, { status: 400 });
    }
    try {
      const company = await findOrCreateCompany({
        name: companyName.trim(),
        city: (companyCity || "").trim(),
        zip: (companyZip || "").trim(),
        phone: (companyPhone || "").trim(),
        license: (companyLicense || "").trim(),
      });
      resolvedCompanyId = company.id;
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Could not resolve company." }, { status: 500 });
    }
  }

  let existingCount = 0;
  try {
    existingCount = (await getAllComplaints()).length;
  } catch {
    // defaults to 0
  }

  const now = new Date();
  const complaint: Complaint = {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    caseNumber: String(existingCount + 1).padStart(4, "0"),
    companyId: resolvedCompanyId!,
    submitterType: type,
    createdAt: now.toISOString(),
    status: "published",
    verificationLevel: "unverified",
    name: name.trim().slice(0, 100),
    email: email.trim().slice(0, 200),
    phone: phone.trim().slice(0, 30),
    city: city.trim().slice(0, 100),
    county: county.trim().slice(0, 100),
    category: category.trim().slice(0, 60),
    amount: num(amount),
    summary: summary.trim().slice(0, 140),
    details: details.trim().slice(0, 4000),
    timeline: [{ date: now.toISOString(), event: "Complaint submitted" }],
  };

  if (type === "homeowner") {
    Object.assign(complaint, {
      hasContract: !!hasContract,
      hasPaymentProof: !!hasPaymentProof,
      hasPhotos: !!hasPhotos,
      hasPermits: !!hasPermits,
      hasPoliceReport: !!hasPoliceReport,
      hasAgComplaint: !!hasAgComplaint,
      hasLawsuit: !!hasLawsuit,
    });
  } else {
    Object.assign(complaint, {
      trade: (trade || "").trim().slice(0, 60),
      invoiceAmount: num(invoiceAmount),
      amountPaid: num(amountPaid),
      balanceDue: num(balanceDue),
      lienStatus: (lienStatus || "").trim().slice(0, 60),
      hasDemandLetter: !!hasDemandLetter,
      hasProofOfDelivery: !!hasProofOfDelivery,
      hasPurchaseOrders: !!hasPurchaseOrders,
    });
  }

  try {
    await addComplaint(complaint);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Could not save. Try again shortly." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: complaint.id, caseNumber: complaint.caseNumber, companyId: resolvedCompanyId });
}
