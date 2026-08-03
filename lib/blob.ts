import { put } from "@vercel/blob";

// Evidence is uploaded here with a random, unlisted pathname. It is never linked
// from any public page — only the admin panel (via evidenceForComplaint) and,
// if the operator chooses to publish a specific file, the company's public
// Documents list. Treat these URLs as "private by obscurity," not access-controlled.
export async function uploadEvidence(file: File, complaintId: string) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `evidence/${complaintId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const blob = await put(path, file, { access: "public" });
  return blob.url;
}
