import { BookingStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export default async function AdminOverviewPage() {
  const [totalRevenue, confirmedBookings, totalBookings, activeCustomers] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: PaymentStatus.APPROVED },
      _sum: { amount: true },
    }),
    prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
    prisma.booking.count(),
    prisma.customerProfile.count({ where: { visitCount: { gt: 0 } } }),
  ]);

  const conversionRate = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0;

  const cards = [
    { title: "Ingresos aprobados", value: `$${(totalRevenue._sum.amount ?? 0).toLocaleString("es-CL")}` },
    { title: "Reservas confirmadas", value: confirmedBookings.toString() },
    { title: "Clientes activos", value: activeCustomers.toString() },
    { title: "Conversión", value: `${conversionRate.toFixed(1)}%` },
  ];

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-8 text-white">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Admin</p>
        <h1 className="text-3xl font-semibold">Overview operativo</h1>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-white/10 bg-neutral-950/70 p-5">
            <h2 className="text-sm text-neutral-300">{card.title}</h2>
            <p className="mt-3 text-3xl font-semibold">{card.value}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
