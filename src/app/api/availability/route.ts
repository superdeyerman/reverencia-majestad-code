import { NextResponse } from "next/server";
import { getAvailabilityForDate } from "@/lib/availability";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");

  if (!serviceId || !date) {
    return NextResponse.json({ slots: [] }, { status: 400 });
  }

  const slots = await getAvailabilityForDate(serviceId, new Date(date));
  return NextResponse.json({ slots });
}
