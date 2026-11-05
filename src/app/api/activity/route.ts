import { NextResponse } from "next/server";
import { recentActivity } from "@/lib/orders";
import { dbConfigured } from "@/lib/db";

export async function GET() {
  if (!dbConfigured()) return NextResponse.json([]);
  try {
    return NextResponse.json(await recentActivity(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json([]);
  }
}
