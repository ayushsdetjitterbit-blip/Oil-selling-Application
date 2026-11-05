import "server-only";
import { NextResponse } from "next/server";
import { DbNotConfiguredError } from "./db";

export function errorResponse(e: unknown) {
  if (e instanceof DbNotConfiguredError) return NextResponse.json({ error: e.message }, { status: 503 });
  console.error("[api]", e);
  return NextResponse.json({ error: "We couldn't reach the store database. Please try again in a moment." }, { status: 500 });
}
