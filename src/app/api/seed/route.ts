import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Create demo tenant
    const tenant = await prisma.tenant.upsert({
      where: { slug: 'colegio-demo' },
      update: {},
      create: {
        name: 'Colegio Horizonte',
        slug: 'colegio-demo',
        primaryColor: '#0F2B4C',
        secondaryColor: '#2563EB',
        pipelineStages: JSON.stringify([
          'Nuevo',
          'Contactado',
          'Interesado',
          'Visita Programada',
          'Entrevista',
          'Pre-inscripción',
          'Inscrito',
        ]),
      },
    });

    // 2. Create demo user
    const passwordHash = await bcrypt.hash('demo1234', 12);
    await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: 'admin@colegio.com' } },
      update: { passwordHash },
      create: {
        tenantId: tenant.id,
        email: 'admin@colegio.com',
        passwordHash,
        name: 'Administrador Demo',
        role: 'admin',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Base de datos inicializada correctamente.',
      login: 'admin@colegio.com',
      password: 'demo1234'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
