import { NextResponse } from "next/server";
import { z } from "zod";
import { comparePassword, createSession, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Credenciales inválidas." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  const valid = await comparePassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  const token = await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  await setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
