import { BookingStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCLP } from "@/lib/utils";

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_25px_70px_rgba(28,25,23,0.05)]">
      <p className="text-xs uppercase tracking-[0.32em] text-[#9e7a3f]">{label}</p>
      <p className="mt-4 font-serif text-4xl text-stone-950">{value}</p>
      <p className="mt-3 text-sm text-stone-500">{helper}</p>
    </div>
  );
}

export default async function AdminPage() {
  const [revenue, approvedCount, totalBookings, activeCustomers, upcomingBookings, recentPayments] =
    await Promise.all([
      prisma.payment.aggregate({
        where: { status: PaymentStatus.APPROVED },
        _sum: { amount: true },
      }),
      prisma.payment.count({ where: { status: PaymentStatus.APPROVED } }),
      prisma.booking.count(),
      prisma.customerProfile.count({ where: { visits: { gt: 0 } } }),
      prisma.booking.findMany({
        where: {
          status: {
            in: [BookingStatus.PENDING_PAYMENT, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS],
          },
        },
        orderBy: { appointmentAt: "asc" },
        take: 5,
        include: {
          customer: { select: { name: true } },
          service: { select: { name: true } },
        },
      }),
      prisma.payment.findMany({
        where: { status: PaymentStatus.APPROVED },
        orderBy: { paidAt: "desc" },
        take: 5,
        include: {
          booking: {
            include: {
              customer: { select: { name: true } },
            },
          },
        },
      }),
    ]);

  const totalRevenue = revenue._sum.amount ?? 0;
  const conversionRate = totalBookings > 0 ? Math.round((approvedCount / totalBookings) * 100) : 0;

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
      <div className="mb-10 flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.35em] text-[#9e7a3f]">Admin overview</p>
        <h1 className="font-serif text-5xl text-stone-950">Operación Reverencia Majestad</h1>
        <p className="max-w-3xl text-sm leading-7 text-stone-500">
          KPIs vivos construidos con agregaciones Prisma sobre reservas, clientes y pagos aprobados. Esta vista ya está preparada para crecer hacia módulos por dominio sin perder trazabilidad.
        </p>
      </div>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Ingresos" value={formatCLP(totalRevenue)} helper="Pagos aprobados" />
        <MetricCard label="Reservas" value={String(totalBookings)} helper="Total acumulado" />
        <MetricCard label="Clientes activos" value={String(activeCustomers)} helper="Con al menos una visita" />
        <MetricCard label="Conversión" value={`${conversionRate}%`} helper="Pagos aprobados sobre reservas" />
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6">
          <h2 className="font-serif text-3xl text-stone-950">Próximas reservas</h2>
          <div className="mt-6 space-y-4">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="rounded-3xl border border-stone-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-stone-950">{booking.customer.name}</p>
                    <p className="text-sm text-stone-500">{booking.service.name}</p>
                  </div>
                  <span className="text-sm text-stone-500">
                    {booking.appointmentAt.toLocaleDateString("es-CL")} · {booking.appointmentAt.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
            {upcomingBookings.length === 0 ? <p className="text-sm text-stone-500">No hay reservas activas.</p> : null}
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-6">
          <h2 className="font-serif text-3xl text-stone-950">Últimos pagos aprobados</h2>
          <div className="mt-6 space-y-4">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="rounded-3xl border border-stone-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-stone-950">{payment.booking.customer.name}</p>
                    <p className="text-sm text-stone-500">{payment.booking.code}</p>
                  </div>
                  <span className="text-sm text-[#9e7a3f]">{formatCLP(payment.amount)}</span>
                </div>
              </div>
            ))}
            {recentPayments.length === 0 ? <p className="text-sm text-stone-500">Todavía no hay pagos aprobados.</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
