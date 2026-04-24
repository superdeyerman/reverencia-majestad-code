import { BookingModality, HairDensity, HairLength } from "@prisma/client";

export const HQ = {
  latitude: Number(process.env.HQ_LATITUDE ?? -33.4234),
  longitude: Number(process.env.HQ_LONGITUDE ?? -70.6112),
};

export type HairProfile = {
  length: HairLength;
  abundance: HairDensity;
};

export type PricingResult = {
  basePrice: number;
  surchargeLength: number;
  surchargeAbundance: number;
  surchargeDomicile: number;
  subtotal: number;
  total: number;
  deposit: number;
  balance: number;
};

export const SURCHARGES = {
  length: {
    SHORT: 0,
    MEDIUM: 3000,
    LONG: 6000,
    EXTRA_LONG: 10000,
    XL: 10000,
  } satisfies Record<HairLength, number>,
  abundance: {
    THIN: 0,
    LIGHT: 0,
    NORMAL: 0,
    ABUNDANT: 4000,
    VERY_ABUNDANT: 8000,
  } satisfies Record<HairDensity, number>,
  domicile: {
    STUDIO: 0,
    PRIVATE_STUDIO: 0,
    HOME: 8000,
    HOTEL: 12000,
  } satisfies Record<BookingModality, number>,
} as const;

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusKm = 6371;
  const deltaLat = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export function calculateDistanceFee(latitude?: number | null, longitude?: number | null) {
  if (latitude == null || longitude == null) return 0;

  const km = haversineKm(HQ.latitude, HQ.longitude, latitude, longitude);
  if (km <= 5) return 0;

  const base = 2500;
  const variable = Math.max(0, km - 5) * 900;
  return Math.round(base + variable);
}

export function calculatePrice(
  basePrice: number,
  hair: HairProfile,
  modalidad: BookingModality,
  depositRate = 0.3,
): PricingResult {
  const surchargeLength = SURCHARGES.length[hair.length] ?? 0;
  const surchargeAbundance = SURCHARGES.abundance[hair.abundance] ?? 0;
  const surchargeDomicile = SURCHARGES.domicile[modalidad] ?? 0;
  const subtotal = basePrice + surchargeLength + surchargeAbundance;
  const total = subtotal + surchargeDomicile;
  const deposit = Math.round(total * depositRate);
  const balance = total - deposit;

  return {
    basePrice,
    surchargeLength,
    surchargeAbundance,
    surchargeDomicile,
    subtotal,
    total,
    deposit,
    balance,
  };
}

export function calculateBookingPricing({
  basePrice,
  hairLength,
  hairDensity,
  modality = BookingModality.HOME,
  latitude,
  longitude,
  depositRate = 0.3,
}: {
  basePrice: number;
  hairLength?: HairLength | null;
  hairDensity?: HairDensity | null;
  modality?: BookingModality;
  latitude?: number | null;
  longitude?: number | null;
  depositRate?: number;
}) {
  const hair: HairProfile = {
    length: hairLength ?? HairLength.SHORT,
    abundance: hairDensity ?? HairDensity.NORMAL,
  };
  const core = calculatePrice(basePrice, hair, modality, depositRate);
  const distanceFee = modalidadNeedsDistance(modality) ? calculateDistanceFee(latitude, longitude) : 0;
  const totalAmount = core.total + distanceFee;
  const depositAmount = Math.max(5000, core.deposit + distanceFee);

  return {
    ...core,
    distanceFee,
    totalAmount,
    depositAmount,
  };
}

export function modalidadNeedsDistance(modality: BookingModality) {
  return modality === BookingModality.HOME || modality === BookingModality.HOTEL;
}

export const pricingTestCases = [
  {
    name: "studio short hair",
    input: {
      basePrice: 45000,
      hair: { length: HairLength.SHORT, abundance: HairDensity.NORMAL },
      modalidad: BookingModality.STUDIO,
    },
    expected: { total: 45000, deposit: 13500, balance: 31500 },
  },
  {
    name: "hotel extra long abundant",
    input: {
      basePrice: 79000,
      hair: { length: HairLength.EXTRA_LONG, abundance: HairDensity.VERY_ABUNDANT },
      modalidad: BookingModality.HOTEL,
    },
    expected: { total: 109000, deposit: 32700, balance: 76300 },
  },
];
