import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFound(resource = "Resource") {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 });
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, ...(details ? { details } : {}) }, { status: 400 });
}

export function serverError(error?: unknown) {
  console.error("Server error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
