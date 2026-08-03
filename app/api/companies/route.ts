import { NextRequest, NextResponse } from "next/server";
import { getAllCompanies } from "@/lib/kv";

export async function GET(req: NextRequest) {
  try {
    const q = (req.nextUrl.searchParams.get("q") || "").trim().toLowerCase();
    const all = await getAllCompanies();
    const filtered = q
      ? all.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.city.toLowerCase().includes(q) ||
            (c.zip || "").startsWith(q)
        )
      : all;
    // Public view: no need to expose internal fields beyond what's shown
    const list = filtered
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => ({ id: c.id, slug: c.slug, name: c.name, city: c.city, zip: c.zip, phone: c.phone, status: c.status }));
    return NextResponse.json({ companies: list });
  } catch (err: any) {
    return NextResponse.json({ companies: [], error: err.message }, { status: 200 });
  }
}
