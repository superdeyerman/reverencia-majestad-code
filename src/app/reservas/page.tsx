import { prisma } from "@/lib/prisma";
import { BookingWizard } from "@/components/booking/BookingWizard";

export const dynamic = "force-dynamic";

export default async function ReservasPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { category: "asc" }],
    select: {
      id: true,
      name: true,
      category: true,
      description: true,
      basePrice: true,
      durationMinutes: true,
      supportsHome: true,
      supportsHotel: true,
      supportsHairMetrics: true,
      isFeatured: true,
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
          Reverencia Majestad
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
          Reserva tu experiencia
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-600">
          Agenda tu servicio premium y confirma tu reserva con el abono
          correspondiente.
        </p>
      </div>

      <BookingWizard services={services.map((service) => ({ id: service.id, name: service.name }))} />
    </main>
  );
}