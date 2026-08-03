import { NextRequest, NextResponse } from "next/server";
import { getAllComplaints, saveAllComplaints } from "@/lib/kv";
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

  const list = await getAllComplaints();
  const idx = list.findIndex((c) => c.id === params.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const editable = ["status", "verificationLevel", "summary", "details", "category", "amount"] as const;
  for (const key of editable) {
    if (key in body) (list[idx] as any)[key] = body[key];
  }
  if (body.addTimelineEvent) {
    list[idx].timeline.push({ date: new Date().toISOString(), event: String(body.addTimelineEvent).slice(0, 300) });
  }

  await saveAllComplaints(list);
  return NextResponse.json({ ok: true, complaint: list[idx] });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  const list = await getAllComplaints();
  const next = list.filter((c) => c.id !== params.id);
  if (next.length === list.length) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await saveAllComplaints(next);
  return NextResponse.json({ ok: true });
}
