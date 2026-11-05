import { NextResponse } from "next/server";
import { payOrder } from "@/lib/orders";
import { errorResponse } from "@/lib/api";
import { paySchema } from "@/lib/validation";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const parsed = paySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payment details" }, { status: 400 });
  }
  try {
    const result = await payOrder(id, parsed.data);
    return result.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: result.error }, { status: result.status });
  } catch (e) {
    return errorResponse(e);
  }
}
