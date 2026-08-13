import { NextResponse } from "next/server";

/** Viva is implemented but disabled — PayPal only for now. */
export async function POST() {
  return NextResponse.json(
    { error: "Οι πληρωμές γίνονται μόνο με PayPal προς το παρόν." },
    { status: 503 },
  );
}
