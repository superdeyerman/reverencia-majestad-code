import { prisma } from "@/lib/prisma";
import { BookingForm } from "@/components/forms/booking-form";

export const dynamic = "force-dynamic";

export default async function ReservasPage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { category: "asc" }],
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <BookingForm services={services} />
    </main>
  );
}
