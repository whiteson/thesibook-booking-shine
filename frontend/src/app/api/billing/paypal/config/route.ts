import { NextResponse } from "next/server";
import { getPublicPayPalConfig } from "@/lib/booking/paypal";

export async function GET() {
  return NextResponse.json(getPublicPayPalConfig());
}
