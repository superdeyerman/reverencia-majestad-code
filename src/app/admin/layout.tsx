import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session || (session.role !== Role.ADMIN && session.role !== Role.STAFF)) {
    redirect("/login");
  }

  return <div className="min-h-screen bg-[#faf8f5]">{children}</div>;
}
