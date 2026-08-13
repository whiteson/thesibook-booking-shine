import { NextResponse } from "next/server";

/** Viva is implemented but disabled — PayPal only for now. */
export async function GET() {
  return NextResponse.json({ configured: false, mode: "live", disabled: true });
}
