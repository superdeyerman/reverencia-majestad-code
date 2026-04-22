import { ServiceCategory } from "@prisma/client";

export const serviceCatalog = [
  {
    slug: "signature-color",
    name: "Color Signature + Brushing Couture",
    category: ServiceCategory.BEAUTY,
    description:
      "Diagnóstico editorial, color premium, sellado y peinado impecable para habitación o domicilio.",
    basePrice: 79000,
    durationMinutes: 150,
    supportsHairMetrics: true,
    supportsHome: true,
    supportsHotel: true,
    isFeatured: true,
  },
  {
    slug: "extensions-luxe",
    name: "Extensiones Luxe Match",
    category: ServiceCategory.BEAUTY,
    description:
      "Instalación de extensiones con adaptación personalizada según largo, abundancia y objetivo de look.",
    basePrice: 119000,
    durationMinutes: 180,
    supportsHairMetrics: true,
    supportsHome: true,
    supportsHotel: true,
    isFeatured: true,
  },
  {
    slug: "hair-restore-ritual",
    name: "Ritual de Restauración Capilar",
    category: ServiceCategory.BEAUTY,
    description:
      "Limpieza profunda, reconstrucción y terapia de brillo con protocolo de recuperación premium.",
    basePrice: 59000,
    durationMinutes: 90,
    supportsHairMetrics: true,
    supportsHome: true,
    supportsHotel: true,
    isFeatured: false,
  },
  {
    slug: "deep-tissue-massage",
    name: "Masaje Deep Relief",
    category: ServiceCategory.WELLNESS,
    description:
      "Masaje descontracturante o relajante con ambientación tipo spa, aromaterapia y ritual de cierre.",
    basePrice: 65000,
    durationMinutes: 75,
    supportsHairMetrics: false,
    supportsHome: true,
    supportsHotel: true,
    isFeatured: true,
  },
  {
    slug: "facial-glow-ritual",
    name: "Facial Glow Ritual",
    category: ServiceCategory.SKINCARE,
    description:
      "Limpieza, exfoliación, activos hidratantes y masaje facial para piel luminosa y descansada.",
    basePrice: 54000,
    durationMinutes: 60,
    supportsHairMetrics: false,
    supportsHome: true,
    supportsHotel: true,
    isFeatured: true,
  },
  {
    slug: "hotel-spa-experience",
    name: "Hotel Spa Experience",
    category: ServiceCategory.WELLNESS,
    description:
      "Pack curado para hoteles: masaje, facial express y styling de terminación premium en habitación.",
    basePrice: 129000,
    durationMinutes: 150,
    supportsHairMetrics: false,
    supportsHome: false,
    supportsHotel: true,
    isFeatured: true,
  },
] as const;
