import { NextRequest, NextResponse } from "next/server";
import { getAllCompanies, getAllComplaints } from "@/lib/kv";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  try {
    const companies = (await getAllCompanies()).sort((a, b) => a.name.localeCompare(b.name));
    const complaints = (await getAllComplaints()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return NextResponse.json({ companies, complaints });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
