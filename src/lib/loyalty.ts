import { LoyaltyTier, Segment } from "@prisma/client";

export function calculateLoyaltyTier(totalSpent: number, visits: number): LoyaltyTier {
  if (totalSpent >= 500000 || visits >= 20) return LoyaltyTier.PLATINUM;
  if (totalSpent >= 200000 || visits >= 10) return LoyaltyTier.VIP;
  if (totalSpent >= 80000 || visits >= 5) return LoyaltyTier.GOLD;
  if (totalSpent >= 30000 || visits >= 2) return LoyaltyTier.SILVER;
  return LoyaltyTier.STANDARD;
}

export function calculateCustomerSegment(totalSpent: number, visits: number): Segment {
  if (totalSpent >= 200000 || visits >= 10) return Segment.VIP;
  if (visits >= 2) return Segment.RECURRENT;
  return Segment.NEW;
}
