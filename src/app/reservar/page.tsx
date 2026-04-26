import { redirect } from 'next/navigation';

export default async function ReservarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams(params).toString();
  redirect(query ? `/reservas?${query}` : '/reservas');
}
