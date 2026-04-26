import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function HotelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || session.role !== Role.HOTEL_MANAGER) {
    redirect('/login');
  }

  return <div className="min-h-screen bg-[#faf8f5]">{children}</div>;
}
