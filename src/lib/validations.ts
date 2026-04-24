import { BookingModality, HairDensity, HairLength } from "@prisma/client";
import { z } from "zod";

export const serviceFiltersSchema = z.object({
  category: z.string().trim().optional(),
  q: z.string().trim().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(24).default(12),
});

export const bookingRequestSchema = z
  .object({
    customerName: z.string().trim().min(3),
    email: z.string().email(),
    phone: z.string().trim().min(8),
    serviceId: z.string().trim().min(1),
    modality: z.nativeEnum(BookingModality),
    date: z.string().date(),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    address: z.string().trim().min(4).optional().nullable(),
    district: z.string().trim().min(2).optional().nullable(),
    hotelPartnerId: z.string().trim().optional().nullable(),
    hotelName: z.string().trim().optional().nullable(),
    roomNumber: z.string().trim().optional().nullable(),
    hairLength: z.nativeEnum(HairLength).optional().nullable(),
    hairDensity: z.nativeEnum(HairDensity).optional().nullable(),
    notes: z.string().trim().max(1200).optional().nullable(),
    latitude: z.number().optional().nullable(),
    longitude: z.number().optional().nullable(),
  })
  .superRefine((value, ctx) => {
    const needsLocation = value.modality === BookingModality.HOME || value.modality === BookingModality.HOTEL;
    if (needsLocation && !value.address) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message: "La dirección es obligatoria para domicilio u hotel.",
      });
    }
    if (needsLocation && !value.district) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["district"],
        message: "La comuna es obligatoria para domicilio u hotel.",
      });
    }
    if (value.modality === BookingModality.HOTEL && !value.roomNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["roomNumber"],
        message: "La habitación es obligatoria para modalidad hotel.",
      });
    }
  });

export const createPreferenceSchema = z.object({
  bookingId: z.string().trim().min(1),
});

export const hotelLeadSchema = z.object({
  hotelName: z.string().trim().min(2),
  contactName: z.string().trim().min(2),
  email: z.string().email(),
  phone: z.string().trim().min(8).optional().or(z.literal("")),
  message: z.string().trim().max(1200).optional().or(z.literal("")),
});

export const styleSuggestionSchema = z.object({
  hairType: z.enum(["STRAIGHT", "WAVY", "CURLY", "COILY"]),
  skinTone: z.enum(["LIGHT", "MEDIUM", "OLIVE", "DARK"]),
  faceShape: z.enum(["OVAL", "ROUND", "SQUARE", "HEART", "DIAMOND"]),
  preferredStyle: z.enum(["ELEGANT", "URBAN", "EXECUTIVE", "CASUAL", "AVANT_GARDE"]),
  age: z.number().int().min(15).max(100),
  serviceHistory: z.array(z.string()).default([]),
});

export type BookingRequest = z.infer<typeof bookingRequestSchema>;
