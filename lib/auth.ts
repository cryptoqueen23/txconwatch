import { NextRequest } from "next/server";

export function isAdmin(req: NextRequest): boolean {
  const provided = req.headers.get("x-admin-password") || "";
  const actual = process.env.ADMIN_PASSWORD || "";
  return actual.length > 0 && provided === actual;
}
