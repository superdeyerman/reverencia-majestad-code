import { ProfessionalKind, Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/prisma';

const applySchema = z.object({
  name: z.string().min(3, 'Nombre muy corto'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'Teléfono inválido'),
  kind: z.nativeEnum(ProfessionalKind),
  specialties: z.string().min(3, 'Indica al menos una especialidad'),
  bio: z.string().min(10, 'Bio muy corta'),
  experience: z.number().int().min(0).max(50).optional(),
});

export async function POST(request: Request) {
  try {
    const body = applySchema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', issues: body.error.flatten() },
        { status: 400 },
      );
    }

    const data = body.data;

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con este email. Contacta al equipo para continuar.' },
        { status: 409 },
      );
    }

    const specialtiesArray = data.specialties
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: Role.PROFESSIONAL,
        professional: {
          create: {
            kind: data.kind,
            specialties: specialtiesArray,
            bio: data.bio,
            isActive: false,
            commissionRate: 0.2,
            commissionPercentage: 20,
          },
        },
      },
    });

    await createAuditLog({
      userId: null,
      action: 'PROFESSIONAL_APPLICATION',
      entity: 'User',
      entityId: user.id,
      metadata: {
        name: data.name,
        email: data.email,
        kind: data.kind,
        experience: data.experience,
      },
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('professional apply error', error);
    return NextResponse.json(
      { error: 'No fue posible procesar tu solicitud. Intenta nuevamente.' },
      { status: 500 },
    );
  }
}
