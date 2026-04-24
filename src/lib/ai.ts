import { prisma } from "@/lib/prisma";

export type StyleInput = {
  hairType: "STRAIGHT" | "WAVY" | "CURLY" | "COILY";
  skinTone: "LIGHT" | "MEDIUM" | "OLIVE" | "DARK";
  faceShape: "OVAL" | "ROUND" | "SQUARE" | "HEART";
  preferredStyle: "ELEGANT" | "URBAN" | "EXECUTIVE" | "CASUAL" | "AVANT_GARDE";
  age: number;
  serviceHistory: string[];
};

export type StyleSuggestion = {
  recommendedServices: {
    id: string;
    name: string;
    category: string;
    basePrice: number;
  }[];
  suggestedProfessional: {
    id: string;
    name: string;
    rating: number;
  } | null;
  styleDescription: string;
  colorPalette: string[];
  bookingSuggestion: {
    modalidad: "STUDIO" | "HOME" | "HOTEL";
  };
};

function decidePalette(input: StyleInput): string[] {
  if (input.preferredStyle === "AVANT_GARDE") return ["#0F172A", "#A21CAF", "#F43F5E"];
  if (input.preferredStyle === "EXECUTIVE") return ["#111827", "#9CA3AF", "#E5E7EB"];
  if (input.skinTone === "OLIVE" || input.skinTone === "DARK") return ["#7C2D12", "#B45309", "#F59E0B"];
  return ["#1F2937", "#92400E", "#FDE68A"];
}

export async function suggestStyle(input: StyleInput): Promise<StyleSuggestion> {
  const category =
    input.preferredStyle === "ELEGANT"
      ? "BEAUTY"
      : input.preferredStyle === "CASUAL"
        ? "WELLNESS"
        : undefined;

  const recommendedServices = await prisma.service.findMany({
    where: {
      isActive: true,
      ...(category ? { category } : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { basePrice: "asc" }],
    take: 3,
    select: { id: true, name: true, category: true, basePrice: true },
  });

  const suggestedProfessional = await prisma.professionalProfile.findFirst({
    where: { isActive: true },
    orderBy: [{ commissionRate: "asc" }],
    select: {
      id: true,
      user: { select: { name: true } },
    },
  });

  const styleDescription =
    input.preferredStyle === "EXECUTIVE"
      ? "Look limpio, elegante y de bajo mantenimiento para agenda ejecutiva."
      : input.preferredStyle === "AVANT_GARDE"
        ? "Propuesta editorial con contraste, textura y terminación de alto impacto."
        : "Propuesta premium balanceada para resaltar tus facciones y tono de piel.";

  return {
    recommendedServices,
    suggestedProfessional: suggestedProfessional
      ? { id: suggestedProfessional.id, name: suggestedProfessional.user.name, rating: 4.8 }
      : null,
    styleDescription,
    colorPalette: decidePalette(input),
    bookingSuggestion: {
      modalidad: input.preferredStyle === "EXECUTIVE" ? "HOME" : "STUDIO",
    },
  };
}
