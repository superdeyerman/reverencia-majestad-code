import { BookingModality, HairDensity, HairLength } from "@prisma/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BookingWizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export type BookingWizardState = {
  step: BookingWizardStep;
  serviceId: string | null;
  modality: BookingModality;
  hairLength: HairLength;
  hairDensity: HairDensity;
  date: string;
  time: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  hotelName: string;
  roomNumber: string;
  notes: string;
  latitude: number | null;
  longitude: number | null;
  hotelPartnerId: string | null;
};

type BookingWizardActions = {
  setStep: (step: BookingWizardStep) => void;
  patch: (data: Partial<BookingWizardState>) => void;
  reset: () => void;
};

export const initialBookingWizardState: BookingWizardState = {
  step: 1,
  serviceId: null,
  modality: BookingModality.STUDIO,
  hairLength: HairLength.MEDIUM,
  hairDensity: HairDensity.NORMAL,
  date: "",
  time: "",
  customerName: "",
  email: "",
  phone: "",
  address: "",
  district: "",
  hotelName: "",
  roomNumber: "",
  notes: "",
  latitude: null,
  longitude: null,
  hotelPartnerId: null,
};

export const useBookingWizardStore = create<BookingWizardState & BookingWizardActions>()(
  persist(
    (set) => ({
      ...initialBookingWizardState,
      setStep: (step) => set({ step }),
      patch: (data) => set((state) => ({ ...state, ...data })),
      reset: () => set(initialBookingWizardState),
    }),
    {
      name: "reverencia-booking-wizard",
      partialize: (state) => ({
        step: state.step,
        serviceId: state.serviceId,
        modality: state.modality,
        hairLength: state.hairLength,
        hairDensity: state.hairDensity,
        date: state.date,
        time: state.time,
        customerName: state.customerName,
        email: state.email,
        phone: state.phone,
        address: state.address,
        district: state.district,
        hotelName: state.hotelName,
        roomNumber: state.roomNumber,
        notes: state.notes,
        latitude: state.latitude,
        longitude: state.longitude,
        hotelPartnerId: state.hotelPartnerId,
      }),
    },
  ),
);
