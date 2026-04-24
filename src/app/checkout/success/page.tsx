import SuccessPageClient from "./SuccessPageClient";

type SuccessPageProps = {
  searchParams: Promise<{
    bookingId?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;

  return <SuccessPageClient bookingId={params.bookingId ?? null} />;
}
