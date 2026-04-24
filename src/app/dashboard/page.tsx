import Link from "next/link";
import { addMonths, format } from "date-fns";
import { BookingStatus, Role, Segment } from "@prisma/client";
import { NoteForm } from "@/components/dashboard/note-form";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { getSession, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCLP, formatCommission, formatDateShort, statusLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = (await getSession()) ?? (await requireRole([Role.ADMIN, Role.PROFESSIONAL, Role.CLIENT]));

  const params = await searchParams;
  const from = typeof params.from === "string" ? new Date(params.from) : addMonths(new Date(), -1);
  const to = typeof params.to === "string" ? new Date(params.to) : new Date();
  const serviceId = typeof params.service === "string" ? params.service : undefined;
  const modality = typeof params.modality === "string" ? params.modality : undefined;

  if (session.role === Role.ADMIN) {
    const where = {
      appointmentAt: {
        gte: from,
        lte: to,
      },
      ...(serviceId ? { serviceId } : {}),
      ...(modality ? { modality: modality as "HOME" | "HOTEL" } : {}),
    };

    const [bookings, services, customers, professionals, hotels, hotelLeads] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { appointmentAt: "desc" },
        include: {
          service: true,
          customer: { include: { customer: { include: { notes: true } } } },
          professional: true,
          hotelPartner: true,
        },
      }),
      prisma.service.findMany({ orderBy: { name: "asc" } }),
      prisma.customerProfile.findMany({
        include: { user: true, notes: { include: { author: true }, orderBy: { createdAt: "desc" }, take: 2 } },
        orderBy: [{ totalSpent: "desc" }, { visitCount: "desc" }],
      }),
      prisma.professionalProfile.findMany({ include: { user: true, services: { include: { service: true } } } }),
      prisma.hotelPartner.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.hotelLead.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    ]);

    const revenue = bookings
      .filter((booking) => booking.status !== BookingStatus.CANCELLED)
      .reduce((sum, booking) => sum + booking.totalAmount, 0);

    const byService = bookings.reduce<Record<string, number>>((acc, booking) => {
      acc[booking.service.name] = (acc[booking.service.name] ?? 0) + 1;
      return acc;
    }, {});

    const topServices = Object.entries(byService)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const monthChart = Array.from({ length: 6 }).map((_, index) => {
      const monthDate = addMonths(new Date(), index - 5);
      const key = format(monthDate, "yyyy-MM");
      const value = bookings
        .filter((booking) => format(booking.appointmentAt, "yyyy-MM") === key)
        .reduce((sum, booking) => sum + booking.totalAmount, 0);
      return { label: format(monthDate, "LLL"), value };
    });

    const vipClients = customers.filter((customer) => customer.segment === Segment.VIP || customer.totalSpent > 250000).slice(0, 5);

    return (
      <main className="mx-auto max-w-7xl space-y-10 px-6 py-14 lg:px-10">
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Admin dashboard</p>
            <h1 className="mt-3 font-serif text-5xl text-stone-900">Operación, CRM y B2B en un solo panel</h1>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="rounded-full border border-stone-300 px-5 py-3 text-sm text-stone-700">Cerrar sesión</button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-stone-200 bg-[#faf7f2] p-6">
          <form className="grid gap-4 lg:grid-cols-4">
            <label className="grid gap-2 text-sm text-stone-700">
              Desde
              <input name="from" type="date" defaultValue={format(from, "yyyy-MM-dd")} className="rounded-2xl border border-stone-200 bg-white px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm text-stone-700">
              Hasta
              <input name="to" type="date" defaultValue={format(to, "yyyy-MM-dd")} className="rounded-2xl border border-stone-200 bg-white px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm text-stone-700">
              Servicio
              <select name="service" defaultValue={serviceId ?? ""} className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                <option value="">Todos</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>{service.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm text-stone-700">
              Modalidad
              <select name="modality" defaultValue={modality ?? ""} className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                <option value="">Todas</option>
                <option value="HOME">Domicilio</option>
                <option value="HOTEL">Hotel</option>
              </select>
            </label>
            <div className="lg:col-span-4">
              <button className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white">Aplicar filtros</button>
            </div>
          </form>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Reservas", String(bookings.length)],
            ["Ingresos", formatCLP(revenue)],
            ["Servicios top", topServices.map(([name]) => name).join(" · ") || "Sin datos"],
            ["Clientes VIP", String(vipClients.length)],
          ].map(([label, value]) => (
            <article key={label} className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-stone-500">{label}</p>
              <p className="mt-3 text-3xl font-semibold text-stone-900">{value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Ingresos por mes</p>
                <h2 className="font-serif text-3xl text-stone-900">Visión ejecutiva</h2>
              </div>
              <a href={`/api/export/bookings?from=${format(from, "yyyy-MM-dd")}&to=${format(to, "yyyy-MM-dd")}`} className="rounded-full bg-stone-900 px-4 py-2 text-sm text-white">
                Exportar CSV
              </a>
            </div>
            <div className="mt-6">
              <RevenueChart data={monthChart} />
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[2rem] border border-stone-200 bg-[#faf7f2] p-7">
              <p className="text-sm text-stone-500">Estados de reserva</p>
              <div className="mt-5 grid gap-3">
                {Object.values(BookingStatus).map((status) => (
                  <div key={status} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                    <span className="capitalize text-stone-700">{statusLabel(status)}</span>
                    <strong className="text-stone-900">{bookings.filter((booking) => booking.status === status).length}</strong>
                  </div>
                ))}
              </div>
            </div>
            <NoteForm customers={customers.map((customer) => ({ id: customer.id, label: `${customer.user.name} · ${customer.segment}` }))} />
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-sm">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-stone-500">Reservas</p>
                <h2 className="font-serif text-3xl text-stone-900">Agenda y estados</h2>
              </div>
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-stone-500">
                  <tr>
                    <th className="pb-3">Código</th>
                    <th className="pb-3">Cliente</th>
                    <th className="pb-3">Servicio</th>
                    <th className="pb-3">Modalidad</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 12).map((booking) => (
                    <tr key={booking.id} className="border-t border-stone-100">
                      <td className="py-3 font-medium text-stone-900">{booking.code}</td>
                      <td className="py-3 text-stone-600">{booking.customer.name}</td>
                      <td className="py-3 text-stone-600">{booking.service.name}</td>
                      <td className="py-3 text-stone-600">{booking.modality}</td>
                      <td className="py-3 text-stone-600">{statusLabel(booking.status)}</td>
                      <td className="py-3 text-stone-900">{formatCLP(booking.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-sm">
            <p className="text-sm text-stone-500">CRM</p>
            <h2 className="font-serif text-3xl text-stone-900">Clientes y notas internas</h2>
            <div className="mt-6 grid gap-4">
              {customers.slice(0, 6).map((customer) => (
                <article key={customer.id} className="rounded-[1.5rem] border border-stone-100 bg-[#faf7f2] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-stone-900">{customer.user.name}</p>
                      <p className="text-sm text-stone-500">{customer.user.email}</p>
                    </div>
                    <div className="text-right text-sm text-stone-600">
                      <p>{customer.visitCount} visitas</p>
                      <p>{formatCLP(customer.totalSpent)} acumulado</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-stone-600">
                    <span>Segmento</span>
                    <span>{customer.segment}</span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-stone-600">
                    {customer.notes.length ? customer.notes.map((note) => (
                      <div key={note.id} className="rounded-2xl bg-white px-4 py-3">
                        <p>{note.body}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-stone-400">{note.author.name}</p>
                      </div>
                    )) : <p className="rounded-2xl bg-white px-4 py-3">Sin notas todavía.</p>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-sm">
            <p className="text-sm text-stone-500">Profesionales</p>
            <h2 className="font-serif text-3xl text-stone-900">Disponibilidad, rol y comisión</h2>
            <div className="mt-6 grid gap-4">
              {professionals.map((professional) => (
                <article key={professional.id} className="rounded-[1.5rem] border border-stone-100 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-900">{professional.user.name}</p>
                      <p className="text-sm text-stone-500">{professional.kind}</p>
                    </div>
                    <div className="text-right text-sm text-stone-600">
                      <p>{formatCommission(professional.commissionRate)} comisión</p>
                      <p>{professional.isActive ? "Activo" : "Inactivo"}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-stone-600">{professional.bio}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {professional.services.map((item) => (
                      <span key={item.id} className="rounded-full bg-[#faf7f2] px-3 py-1 text-xs text-stone-600">
                        {item.service.name}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-sm">
            <p className="text-sm text-stone-500">Hoteles</p>
            <h2 className="font-serif text-3xl text-stone-900">Partners y leads B2B</h2>
            <div className="mt-6 grid gap-4">
              {hotels.map((hotel) => (
                <article key={hotel.id} className="rounded-[1.5rem] border border-stone-100 bg-[#faf7f2] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-stone-900">{hotel.name}</p>
                      <p className="text-sm text-stone-500">{hotel.contactName} · {hotel.district}</p>
                    </div>
                    <div className="text-right text-sm text-stone-600">
                      <p>{formatCommission(hotel.commissionRate)} comisión</p>
                      <p>{hotel.active ? "Activo" : "Pausado"}</p>
                    </div>
                  </div>
                </article>
              ))}
              {hotelLeads.length ? (
                <div className="rounded-[1.5rem] border border-dashed border-stone-300 p-5 text-sm text-stone-600">
                  <p className="font-medium text-stone-900">Leads recientes</p>
                  <div className="mt-3 grid gap-2">
                    {hotelLeads.map((lead) => (
                      <p key={lead.id}>{lead.hotelName} · {lead.contactName} · {lead.email}</p>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (session.role === Role.PROFESSIONAL) {
    const bookings = await prisma.booking.findMany({
      where: { professionalId: session.id },
      orderBy: { appointmentAt: "asc" },
      include: { service: true, customer: true },
    });

    const completedRevenue = bookings
      .filter((booking) => booking.status === BookingStatus.COMPLETED)
      .reduce((sum, booking) => sum + booking.totalAmount, 0);

    const profile = await prisma.professionalProfile.findUnique({ where: { userId: session.id } });
    const commission = Math.round(completedRevenue * (profile?.commissionRate ?? 0.35));

    return (
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-14 lg:px-10">
        <section>
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Profesional</p>
          <h1 className="mt-3 font-serif text-5xl text-stone-900">Agenda y comisiones</h1>
        </section>
        <div className="grid gap-4 md:grid-cols-3">
          {[["Reservas asignadas", String(bookings.length)], ["Realizadas", String(bookings.filter((b) => b.status === BookingStatus.COMPLETED).length)], ["Comisión estimada", formatCLP(commission)]].map(([label, value]) => (
            <article key={label} className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-stone-500">{label}</p>
              <p className="mt-3 text-3xl font-semibold text-stone-900">{value}</p>
            </article>
          ))}
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-sm">
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <article key={booking.id} className="rounded-[1.5rem] border border-stone-100 bg-[#faf7f2] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-stone-900">{booking.service.name}</p>
                    <p className="text-sm text-stone-500">{booking.customer.name} · {formatDateShort(booking.appointmentAt)}</p>
                  </div>
                  <span className="text-sm text-stone-700">{statusLabel(booking.status)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    );
  }

  const myBookings = await prisma.booking.findMany({
    where: { customerId: session.id },
    include: { service: true, professional: true },
    orderBy: { appointmentAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-14 lg:px-10">
      <section>
        <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Cliente</p>
        <h1 className="mt-3 font-serif text-5xl text-stone-900">Tus experiencias reservadas</h1>
      </section>
      <div className="grid gap-4">
        {myBookings.map((booking) => (
          <article key={booking.id} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium text-stone-900">{booking.service.name}</p>
                <p className="text-sm text-stone-500">{formatDateShort(booking.appointmentAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-stone-500">Estado</p>
                <p className="font-medium text-stone-900">{statusLabel(booking.status)}</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4 text-sm text-stone-600">
              <span>Total</span>
              <span>{formatCLP(booking.totalAmount)}</span>
            </div>
          </article>
        ))}
        <Link href="/reservas" className="rounded-full bg-stone-900 px-5 py-3 text-center text-sm font-medium text-white">
          Reservar nueva experiencia
        </Link>
      </div>
    </main>
  );
}
