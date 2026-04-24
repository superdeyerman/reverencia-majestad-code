export type HairProfile = {
  length: "SHORT" | "MEDIUM" | "LONG" | "EXTRA_LONG";
  abundance: "THIN" | "NORMAL" | "ABUNDANT" | "VERY_ABUNDANT";
};

export type Modalidad = "STUDIO" | "HOME" | "HOTEL";

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
  length: { SHORT: 0, MEDIUM: 3000, LONG: 6000, EXTRA_LONG: 10000 },
  abundance: { THIN: 0, NORMAL: 0, ABUNDANT: 4000, VERY_ABUNDANT: 8000 },
  domicile: { STUDIO: 0, HOME: 8000, HOTEL: 12000 },
} as const;

export function calculatePrice(
  basePrice: number,
  hair: HairProfile,
  modalidad: Modalidad,
  depositRate = 0.3,
): PricingResult {
  if (basePrice <= 0) {
    throw new Error("Base price must be greater than 0");
  }

  if (depositRate <= 0 || depositRate >= 1) {
    throw new Error("Deposit rate must be between 0 and 1");
  }

  const surchargeLength = SURCHARGES.length[hair.length];
  const surchargeAbundance = SURCHARGES.abundance[hair.abundance];
  const surchargeDomicile = SURCHARGES.domicile[modalidad];

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

// Backward compatibility for the existing booking endpoint.
export function calculateBookingPricing({
  basePrice,
  hairLength,
  hairDensity,
  modality,
}: {
  basePrice: number;
  hairLength?: "SHORT" | "MEDIUM" | "LONG" | "XL" | null;
  hairDensity?: "LIGHT" | "NORMAL" | "ABUNDANT" | null;
  modality?: "PRIVATE_STUDIO" | "HOME" | "HOTEL";
}) {
  const mappedLength: HairProfile["length"] =
    hairLength === "XL" ? "EXTRA_LONG" : (hairLength ?? "SHORT");

  const mappedAbundance: HairProfile["abundance"] =
    hairDensity === "LIGHT"
      ? "THIN"
      : hairDensity === "ABUNDANT"
        ? "ABUNDANT"
        : "NORMAL";

  const mappedModality: Modalidad =
    modality === "PRIVATE_STUDIO" ? "STUDIO" : (modality ?? "STUDIO");

  const result = calculatePrice(
    basePrice,
    { length: mappedLength, abundance: mappedAbundance },
    mappedModality,
    0.3,
  );

  return {
    subtotal: result.subtotal,
    distanceFee: result.surchargeDomicile,
    totalAmount: result.total,
    depositAmount: result.deposit,
  };
}

export function calculateDistanceFee(
  latitude?: number | null,
  longitude?: number | null,
): number {
  if (!latitude || !longitude) return 0;
  return SURCHARGES.domicile.HOME;
}
