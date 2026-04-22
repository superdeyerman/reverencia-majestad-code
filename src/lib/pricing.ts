import { HairDensity, HairLength } from "@prisma/client";

const HQ = {
  latitude: Number(process.env.HQ_LATITUDE ?? -33.4372),
  longitude: Number(process.env.HQ_LONGITUDE ?? -70.6506),
};

const HAIR_LENGTH_MULTIPLIER: Record<HairLength, number> = {
  SHORT: 1,
  MEDIUM: 1.12,
  LONG: 1.28,
  XL: 1.45,
};

const HAIR_DENSITY_MULTIPLIER: Record<HairDensity, number> = {
  LIGHT: 1,
  NORMAL: 1.08,
  ABUNDANT: 1.2,
};

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateDistanceFee(latitude?: number | null, longitude?: number | null) {
  if (!latitude || !longitude) return 0;
  const km = haversineKm(HQ.latitude, HQ.longitude, latitude, longitude);
  if (km <= 5) return 0;
  const base = 2500;
  const variable = Math.max(0, km - 5) * 900;
  return Math.round(base + variable);
}

export function calculateBookingPricing({
  basePrice,
  hairLength,
  hairDensity,
  latitude,
  longitude,
}: {
  basePrice: number;
  hairLength?: HairLength | null;
  hairDensity?: HairDensity | null;
  latitude?: number | null;
  longitude?: number | null;
}) {
  const lengthMultiplier = hairLength ? HAIR_LENGTH_MULTIPLIER[hairLength] : 1;
  const densityMultiplier = hairDensity ? HAIR_DENSITY_MULTIPLIER[hairDensity] : 1;
  const subtotal = Math.round(basePrice * lengthMultiplier * densityMultiplier);
  const distanceFee = calculateDistanceFee(latitude, longitude);
  const totalAmount = subtotal + distanceFee;
  const depositAmount = Math.max(5000, Math.round(totalAmount * 0.2));

  return {
    subtotal,
    distanceFee,
    totalAmount,
    depositAmount,
  };
}
