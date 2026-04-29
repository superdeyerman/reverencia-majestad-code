import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  BookingModality,
  BookingStatus,
  PaymentProvider,
  Role,
  Segment,
} from "@prisma/client";

function getString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(value: FormDataEntryValue | null): number {
  const rawValue = typeof value === "string" ? value.trim() : "";
  const number = Number(rawValue);

  return Number.isFinite(number) ? number : 0;
}

function generateBookingCode(): string {
  const datePart = new Date()
    .toISOString()
    .slice(0, 10)
    .replaceAll("-", "");

  const randomPart = Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase();

  return `RM-${datePart}-${randomPart}`;
}

function mapModality(value: string): BookingModality | null {
  if (value === "HOME") return BookingModality.HOME;
  if (value === "HOTEL") return BookingModality.HOTEL;
  if (value === "PRIVATE_STUDIO") return BookingModality.PRIVATE_STUDIO;
  if (value === "STUDIO") return BookingModality.STUDIO;

  return null;
}

function buildAddress({
  region,
  city,
  commune,
  street,
  streetNumber,
  unit,
}: {
  region: string;
  city: string;
  commune: string;
  street: string;
  streetNumber: string;
  unit: string;
}): string {
  return [street, streetNumber, unit, commune, city, region]
    .filter(Boolean)
    .join(", ");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const serviceIdsRaw = getString(formData.get("serviceIds"));
    const modalityRaw = getString(formData.get("modality"));
    const date = getString(formData.get("date"));
    const time = getString(formData.get("time"));

    const firstName = getString(formData.get("firstName"));
    const lastName = getString(formData.get("lastName"));
    const phone = getString(formData.get("phone"));
    const email = getString(formData.get("email")).toLowerCase();

    const region = getString(formData.get("region"));
    const city = getString(formData.get("city"));
    const commune = getString(formData.get("commune"));
    const street = getString(formData.get("street"));
    const streetNumber = getString(formData.get("streetNumber"));
    const unit = getString(formData.get("unit"));

    const hotelName = getString(formData.get("hotelName"));
    const roomNumber = getString(formData.get("roomNumber"));
    const notes = getString(formData.get("notes"));

    const subtotalFromForm = getNumber(formData.get("subtotal"));
    const discountFromForm = getNumber(formData.get("discount"));
    const totalFromForm = getNumber(formData.get("total"));

    if (
      !serviceIdsRaw ||
      !modalityRaw ||
      !date ||
      !time ||
      !firstName ||
      !lastName ||
      !phone ||
      !email
    ) {
      return NextResponse.json(
        {
          error: "Faltan datos obligatorios para crear la reserva.",
        },
        { status: 400 }
      );
    }

    const modality = mapModality(modalityRaw);

    if (!modality) {
      return NextResponse.json(
        {
          error: "La modalidad seleccionada no es válida.",
        },
        { status: 400 }
      );
    }

    const serviceIds = serviceIdsRaw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (serviceIds.length === 0) {
      return NextResponse.json(
        {
          error: "Debes seleccionar al menos un servicio.",
        },
        { status: 400 }
      );
    }

    const appointmentAt = new Date(`${date}T${time}:00`);

    if (Number.isNaN(appointmentAt.getTime())) {
      return NextResponse.json(
        {
          error: "La fecha u hora no es válida.",
        },
        { status: 400 }
      );
    }

    const services = await prisma.service.findMany({
      where: {
        id: {
          in: serviceIds,
        },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        basePrice: true,
        durationMinutes: true,
      },
    });

    if (services.length === 0) {
      return NextResponse.json(
        {
          error: "No se encontraron servicios activos para esta reserva.",
        },
        { status: 400 }
      );
    }

    if (services.length !== serviceIds.length) {
      return NextResponse.json(
        {
          error: "Uno o más servicios seleccionados no existen o no están activos.",
        },
        { status: 400 }
      );
    }

    const subtotal = services.reduce(
      (sum, service) => sum + service.basePrice,
      0
    );

    const discount =
      services.length >= 4 ? Math.round(subtotal * 0.1) : discountFromForm;

    const totalAmount = Math.max(subtotal - discount, 0);

    const safeSubtotal = subtotalFromForm > 0 ? subtotalFromForm : subtotal;
    const safeTotal = totalFromForm > 0 ? totalFromForm : totalAmount;
    
    const depositAmount = 5000;
    const balanceAmount = Math.max(safeTotal - depositAmount, 0);

    const mainService = services[0];

    const address = buildAddress({
      region,
      city,
      commune,
      street,
      streetNumber,
      unit,
    });

    const customerName = `${firstName} ${lastName}`.trim();

    const booking = await prisma.$transaction(async (tx) => {
      const customer = await tx.user.upsert({
        where: {
          email,
        },
        update: {
          name: customerName,
          phone,
          role: Role.CUSTOMER,
        },
        create: {
          name: customerName,
          email,
          phone,
          role: Role.CUSTOMER,
          customer: {
            create: {
              phone,
              segment: Segment.NEW,
            },
          },
        },
        include: {
          customer: true,
        },
      });

      if (!customer.customer) {
        await tx.customerProfile.create({
          data: {
            userId: customer.id,
            phone,
            segment: Segment.NEW,
          },
        });
      }

      const createdBooking = await tx.booking.create({
        data: {
          code: generateBookingCode(),

          customerId: customer.id,
          serviceId: mainService.id,

          status: BookingStatus.PENDING_PAYMENT,
          modality,

          appointmentAt,

          address: address || null,
          region: region || null,
          city: city || null,
          commune: commune || null,
          district: commune || null,
          street: street || null,
          streetNumber: streetNumber || null,
          unit: unit || null,

          hotelName: hotelName || null,
          roomNumber: roomNumber || null,

          notes: notes || null,

          subtotal: safeSubtotal,
          discount,
          totalAmount: safeTotal,
          depositAmount,
          balanceAmount,

          paymentProvider: PaymentProvider.MERCADO_PAGO,

          items: {
            create: services.map((service) => ({
              serviceId: service.id,
              nameSnapshot: service.name,
              priceSnapshot: service.basePrice,
              durationSnapshot: service.durationMinutes,
            })),
          },
        },
      });

      return createdBooking;
    });

    return NextResponse.redirect(
     new URL(`/checkout?reserva=${booking.id}`, req.url),
     303
    );
  } catch (error) {
    console.error("ERROR_CREANDO_RESERVA:", error);

    return NextResponse.json(
      {
        error: "Error interno al crear la reserva.",
      },
      { status: 500 }
    );
  }
}