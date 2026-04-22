import { NextResponse } from "next/server";
import { calculateDistanceFee } from "@/lib/pricing";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address || !process.env.MAPBOX_ACCESS_TOKEN) {
    return NextResponse.json({ latitude: null, longitude: null, distanceFee: 0 });
  }

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${process.env.MAPBOX_ACCESS_TOKEN}&limit=1`,
  );

  if (!response.ok) {
    return NextResponse.json({ latitude: null, longitude: null, distanceFee: 0 });
  }

  const data = await response.json();
  const feature = data.features?.[0];
  const longitude = feature?.center?.[0] ?? null;
  const latitude = feature?.center?.[1] ?? null;

  return NextResponse.json({
    latitude,
    longitude,
    distanceFee: calculateDistanceFee(latitude, longitude),
  });
}
