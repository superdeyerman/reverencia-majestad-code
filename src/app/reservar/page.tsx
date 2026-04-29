import { prisma } from "@/lib/prisma";
import MultiServiceSelector from "@/components/reservas/MultiServiceSelector";

export const dynamic = "force-dynamic";

export default async function ReservarPage() {
  const services = await prisma.service.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      {
        isFeatured: "desc",
      },
      {
        category: "asc",
      },
      {
        basePrice: "asc",
      },
    ],
  });

  return (
    <main className="min-h-screen bg-cream px-6 py-16">
      <section className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-gold">
            Reverencia Majestad
          </p>

          <h1 className="mb-4 font-serif text-5xl leading-tight text-char">
            Reserva tu experiencia
          </h1>

          <p className="max-w-2xl font-sans text-sm leading-relaxed text-gray">
            Selecciona uno o varios servicios. Desde 4 servicios se aplica
            descuento automático del 10%.
          </p>
        </div>

        {services.length === 0 ? (
          <div className="rounded-[32px] border border-stone-200 bg-white p-10 shadow-sm">
            <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-gold">
              Catálogo
            </p>

            <h2 className="mb-3 font-serif text-3xl text-char">
              No hay servicios disponibles
            </h2>

            <p className="max-w-xl text-sm leading-relaxed text-gray">
              En este momento no hay servicios activos para reservar. Activa los
              servicios desde el panel administrativo o revisa la base de datos.
            </p>
          </div>
        ) : (
          <MultiServiceSelector services={services} />
        )}
      </section>
    </main>
  );
}