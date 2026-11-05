import { NextResponse } from "next/server";
import { subscribe } from "@/lib/stats";
import { errorResponse } from "@/lib/api";
import { subscribeSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const parsed = subscribeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Enter a valid email" }, { status: 400 });
  try {
    const added = await subscribe(parsed.data.email);
    return NextResponse.json({ ok: true, message: added ? "You're on the list. We'll tell you when a fresh batch is pressed." : "You're already subscribed." });
  } catch (e) {
    return errorResponse(e);
  }
}
