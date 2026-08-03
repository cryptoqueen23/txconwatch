import { NextRequest, NextResponse } from "next/server";
import { addEvidence, EvidenceFile } from "@/lib/kv";
import { uploadEvidence } from "@/lib/blob";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const form = await req.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided." }, { status: 400 });
    }
    if (files.length > 8) {
      return NextResponse.json({ error: "Please upload 8 files or fewer at a time." }, { status: 400 });
    }
    const saved: EvidenceFile[] = [];
    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        return NextResponse.json({ error: `${file.name} is over 20MB.` }, { status: 400 });
      }
      const url = await uploadEvidence(file, params.id);
      const record: EvidenceFile = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        complaintId: params.id,
        filename: file.name,
        url,
        uploadedAt: new Date().toISOString(),
        published: false,
      };
      await addEvidence(record);
      saved.push(record);
    }
    return NextResponse.json({ ok: true, count: saved.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed." }, { status: 500 });
  }
}
