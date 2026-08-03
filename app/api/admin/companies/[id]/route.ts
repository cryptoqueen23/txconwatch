import { NextRequest, NextResponse } from "next/server";
import { getAllCompanies, saveAllCompanies } from "@/lib/kv";
import { isAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const list = await getAllCompanies();
  const idx = list.findIndex((c) => c.id === params.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const editableTop = ["status", "overview", "companyResponse", "name", "city", "zip", "phone", "license"] as const;
  for (const key of editableTop) {
    if (key in body) (list[idx] as any)[key] = body[key];
  }
  if (body.publicRecordLinks) {
    list[idx].publicRecordLinks = { ...list[idx].publicRecordLinks, ...body.publicRecordLinks };
  }
  if (body.scorecard) {
    list[idx].scorecard = { ...list[idx].scorecard, ...body.scorecard };
  }
  if (body.addTimelineEvent) {
    list[idx].timeline.push({ date: new Date().toISOString(), event: String(body.addTimelineEvent).slice(0, 300) });
  }
  if (body.addPublicDocument) {
    list[idx].publicDocuments.push({
      title: String(body.addPublicDocument.title || "Document").slice(0, 200),
      url: String(body.addPublicDocument.url || ""),
      addedAt: new Date().toISOString(),
    });
  }

  await saveAllCompanies(list);
  return NextResponse.json({ ok: true, company: list[idx] });
}
