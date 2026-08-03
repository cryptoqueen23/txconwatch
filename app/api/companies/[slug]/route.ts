import { NextRequest, NextResponse } from "next/server";
import { getAllCompanies, getAllComplaints } from "@/lib/kv";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const companies = await getAllCompanies();
    const company = companies.find((c) => c.slug === params.slug);
    if (!company) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    const complaints = (await getAllComplaints())
      .filter((c) => c.companyId === company.id && c.status === "published")
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map(({ email, phone, ...rest }) => rest);
    return NextResponse.json({ company, complaints });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
