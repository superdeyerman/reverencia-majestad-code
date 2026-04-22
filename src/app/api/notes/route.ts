import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  customerProfileId: z.string().min(1),
  body: z.string().min(3),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Nota inválida" }, { status: 400 });
  }

  const note = await prisma.internalNote.create({
    data: {
      customerId: parsed.data.customerProfileId,
      authorId: session.id,
      body: parsed.data.body,
    },
  });

  return NextResponse.json({ note });
}
