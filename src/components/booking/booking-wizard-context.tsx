"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { HairProfile, Modalidad } from "@/lib/pricing";

type BookingWizardState = {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  serviceId: string;
  hair: HairProfile;
  modalidad: Modalidad;
  date: string;
  time: string;
  customerName: string;
  email: string;
  phone: string;
  notes: string;
};

type BookingWizardContextValue = {
  state: BookingWizardState;
  setField: <K extends keyof BookingWizardState>(key: K, value: BookingWizardState[K]) => void;
  nextStep: () => void;
  prevStep: () => void;
};

const BookingWizardContext = createContext<BookingWizardContextValue | null>(null);

const initialState: BookingWizardState = {
  step: 1,
  serviceId: "",
  hair: { length: "SHORT", abundance: "NORMAL" },
  modalidad: "STUDIO",
  date: "",
  time: "",
  customerName: "",
  email: "",
  phone: "",
  notes: "",
};

export function BookingWizardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingWizardState>(initialState);

  const value = useMemo<BookingWizardContextValue>(
    () => ({
      state,
      setField: (key, value) => setState((prev) => ({ ...prev, [key]: value })),
      nextStep: () => setState((prev) => ({ ...prev, step: Math.min(6, prev.step + 1) as BookingWizardState["step"] })),
      prevStep: () => setState((prev) => ({ ...prev, step: Math.max(1, prev.step - 1) as BookingWizardState["step"] })),
    }),
    [state],
  );

  return <BookingWizardContext.Provider value={value}>{children}</BookingWizardContext.Provider>;
}

export function useBookingWizardContext() {
  const context = useContext(BookingWizardContext);
  if (!context) {
    throw new Error("useBookingWizardContext must be used within BookingWizardProvider");
  }
  return context;
}
