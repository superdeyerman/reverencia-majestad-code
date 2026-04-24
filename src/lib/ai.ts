import { ServiceCategory } from "@prisma/client";

export type HairType = "STRAIGHT" | "WAVY" | "CURLY" | "COILY";
export type SkinTone = "LIGHT" | "MEDIUM" | "OLIVE" | "DARK";
export type FaceShape = "OVAL" | "ROUND" | "SQUARE" | "HEART" | "DIAMOND";
export type PreferredStyle = "ELEGANT" | "URBAN" | "EXECUTIVE" | "CASUAL" | "AVANT_GARDE";

export type StyleInput = {
  hairType: HairType;
  skinTone: SkinTone;
  faceShape: FaceShape;
  preferredStyle: PreferredStyle;
  age: number;
  serviceHistory: string[];
};

export type StyleSuggestion = {
  recommendedServices: Array<{
    slug: string;
    name: string;
    category: ServiceCategory;
    basePrice: number;
    reasoning: string;
  }>;
  suggestedProfessional: {
    name: string;
    specialty: string;
    rationale: string;
  };
  styleDescription: string;
  colorPalette: string[];
  toneDescription: string;
  bookingSuggestion: {
    serviceSlug: string;
    hairMetrics: boolean;
    notes: string;
    preferredModality: "HOME" | "HOTEL" | "STUDIO";
  };
};

const CATALOG = [
  {
    slug: "signature-color",
    name: "Color Signature + Brushing Couture",
    category: ServiceCategory.BEAUTY,
    basePrice: 79000,
    tags: ["editorial", "executive", "elegant", "color"],
  },
  {
    slug: "extensions-luxe",
    name: "Extensiones Luxe Match",
    category: ServiceCategory.BEAUTY,
    basePrice: 119000,
    tags: ["volume", "avant-garde", "elegant"],
  },
  {
    slug: "hair-restore-ritual",
    name: "Ritual de Restauración Capilar",
    category: ServiceCategory.BEAUTY,
    basePrice: 59000,
    tags: ["repair", "natural", "casual", "urban"],
  },
  {
    slug: "deep-tissue-massage",
    name: "Masaje Deep Relief",
    category: ServiceCategory.WELLNESS,
    basePrice: 65000,
    tags: ["wellness", "executive", "stress"],
  },
  {
    slug: "facial-glow-ritual",
    name: "Facial Glow Ritual",
    category: ServiceCategory.SKINCARE,
    basePrice: 54000,
    tags: ["glow", "elegant", "executive"],
  },
  {
    slug: "hotel-spa-experience",
    name: "Hotel Spa Experience",
    category: ServiceCategory.WELLNESS,
    basePrice: 129000,
    tags: ["hotel", "executive", "premium", "stress"],
  },
] as const;

const STYLE_KEYS: Record<PreferredStyle, string[]> = {
  ELEGANT: ["elegant", "glow", "editorial"],
  URBAN: ["urban", "repair", "color"],
  EXECUTIVE: ["executive", "hotel", "stress"],
  CASUAL: ["natural", "repair", "wellness"],
  AVANT_GARDE: ["avant-garde", "volume", "editorial"],
};

const SKIN_PALETTES: Record<SkinTone, string[]> = {
  LIGHT: ["#F4E4D4", "#D8B78E", "#A77A4F", "#8C5A33"],
  MEDIUM: ["#E6C59D", "#C28B53", "#8B5A2B", "#6A3E1C"],
  OLIVE: ["#D8BC95", "#A07A4B", "#6E4D28", "#4F3418"],
  DARK: ["#C69A74", "#9C6A44", "#6B4326", "#3F2311"],
};

const TONE_DESCRIPTIONS: Record<SkinTone, string> = {
  LIGHT: "Los dorados suaves, beige editoriales y cobres ligeros iluminan sin endurecer.",
  MEDIUM: "Los miel, canela y caramelo trabajan muy bien para mantener lujo y dimensión.",
  OLIVE: "Los chocolates, avellana y reflejos tierra ayudan a reforzar profundidad elegante.",
  DARK: "Los caoba, café profundo y destellos cálidos controlados realzan brillo y presencia.",
};

const FACE_NOTES: Record<FaceShape, string> = {
  OVAL: "Tu rostro ovalado permite trabajar volumen y textura con mucha libertad editorial.",
  ROUND: "Las líneas verticales y la altura en corona ayudan a estilizar visualmente el rostro.",
  SQUARE: "Capas suaves y movimiento lateral equilibran la estructura mandibular.",
  HEART: "El volumen controlado en medios y puntas aporta balance y sofisticación.",
  DIAMOND: "Los contornos suaves y el trabajo lateral realzan pómulos sin endurecer el look.",
};

const PROFESSIONAL_MATCH: Record<PreferredStyle, StyleSuggestion["suggestedProfessional"]> = {
  ELEGANT: {
    name: "Isidora Véliz",
    specialty: "Color premium y styling de acabado editorial",
    rationale: "Ideal para looks de alta sofisticación con ejecución impecable.",
  },
  URBAN: {
    name: "Isidora Véliz",
    specialty: "Color contemporáneo y restauración capilar",
    rationale: "Excelente combinando modernidad con naturalidad de alto nivel.",
  },
  EXECUTIVE: {
    name: "Amelia Durán",
    specialty: "Wellness corporativo y experiencia in-room",
    rationale: "Aporta discreción, precisión operativa y experiencia premium en hotel.",
  },
  CASUAL: {
    name: "Amelia Durán",
    specialty: "Rituales de bienestar y glow natural",
    rationale: "Su enfoque prioriza confort, naturalidad y recuperación.",
  },
  AVANT_GARDE: {
    name: "Isidora Véliz",
    specialty: "Transformación visual y técnica de alto impacto",
    rationale: "Domina cambios expresivos sin perder lujo ni coherencia estética.",
  },
};

export function generateStyleSuggestion(input: StyleInput): StyleSuggestion {
  const keys = new Set(STYLE_KEYS[input.preferredStyle]);
  const history = new Set(input.serviceHistory);

  const recommendedServices = CATALOG.map((service) => {
    let score = 0;

    for (const tag of service.tags) {
      if (keys.has(tag)) score += 2;
    }

    if ((input.hairType === "CURLY" || input.hairType === "COILY") && service.slug === "hair-restore-ritual") {
      score += 3;
    }

    if (input.age >= 35 && service.category === ServiceCategory.SKINCARE) {
      score += 1;
    }

    if (history.has(service.slug)) {
      score -= 1;
    }

    return {
      ...service,
      score,
      reasoning: `${FACE_NOTES[input.faceShape]} Recomendado para un perfil ${input.preferredStyle.toLowerCase().replace("_", " ")}.`,
    };
  })
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(({ slug, name, category, basePrice, reasoning }) => ({
      slug,
      name,
      category,
      basePrice,
      reasoning,
    }));

  const primary = recommendedServices[0] ?? recommendedServices[1];
  const preferredModality =
    input.preferredStyle === "EXECUTIVE" ? "HOTEL" : input.preferredStyle === "CASUAL" ? "HOME" : "STUDIO";

  return {
    recommendedServices,
    suggestedProfessional: PROFESSIONAL_MATCH[input.preferredStyle],
    styleDescription: `${FACE_NOTES[input.faceShape]} La propuesta combina un lenguaje ${input.preferredStyle.toLowerCase().replace("_", " ")} con una paleta pensada para tu subtono.`,
    colorPalette: SKIN_PALETTES[input.skinTone],
    toneDescription: TONE_DESCRIPTIONS[input.skinTone],
    bookingSuggestion: {
      serviceSlug: primary?.slug ?? "hair-restore-ritual",
      hairMetrics: primary?.category === ServiceCategory.BEAUTY,
      notes: `${FACE_NOTES[input.faceShape]} Priorizar diagnóstico inicial y propuesta personalizada de mantenimiento.`,
      preferredModality,
    },
  };
}
