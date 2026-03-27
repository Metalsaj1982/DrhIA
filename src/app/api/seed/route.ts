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
    const user = await prisma.user.upsert({
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

    // 3. Seed Fake Ecuadorean Leads
    const existingLeads = await prisma.lead.count({ where: { tenantId: tenant.id } });
    if (existingLeads === 0) {
      const dummyLeads = [
        { name: 'Juan Pérez', phone: '+593981234567', stage: 'Nuevo', source: 'WhatsApp', interest: 'Inicial' },
        { name: 'María Gómez', phone: '+593987654321', stage: 'Contactado', source: 'Meta Ads', interest: 'Primaria' },
        { name: 'Carlos Ruiz', phone: '+593991234567', stage: 'Interesado', source: 'WhatsApp', interest: 'Secundaria' },
        { name: 'Ana Torres', phone: '+593997654321', stage: 'Visita Programada', source: 'Facebook', interest: 'Inicial' },
        { name: 'Luis Mendoza', phone: '+593982345678', stage: 'Entrevista', source: 'Instagram', interest: 'Primaria' },
        { name: 'Elena Castro', phone: '+593992345678', stage: 'Pre-inscripción', source: 'WhatsApp', interest: 'Secundaria' },
        { name: 'Pedro Ortiz', phone: '+593983456789', stage: 'Inscrito', source: 'Directo', interest: 'Primaria' },
        { name: 'Lucía Vega', phone: '+593993456789', stage: 'Nuevo', source: 'WhatsApp', interest: 'Inicial' },
        { name: 'Diego Silva', phone: '+593984567890', stage: 'Contactado', source: 'Instagram', interest: 'Secundaria' },
        { name: 'Carmen Núñez', phone: '+593994567890', stage: 'Interesado', source: 'Facebook', interest: 'Primaria' },
        { name: 'Javier Morales', phone: '+593985678901', stage: 'Visita Programada', source: 'WhatsApp', interest: 'Inicial' },
        { name: 'Sofía Herrera', phone: '+593995678901', stage: 'Entrevista', source: 'Meta Ads', interest: 'Secundaria' },
        { name: 'Andrés Gil', phone: '+593986789012', stage: 'Nuevo', source: 'WhatsApp', interest: 'Primaria' },
        { name: 'Valentina Rojas', phone: '+593996789012', stage: 'Contactado', source: 'Directo', interest: 'Inicial' },
        { name: 'Mateo Castillo', phone: '+593987890123', stage: 'Interesado', source: 'Instagram', interest: 'Secundaria' },
        { name: 'Camila Peña', phone: '+593997890123', stage: 'Visita Programada', source: 'WhatsApp', interest: 'Primaria' },
        { name: 'Sebastián Cruz', phone: '+593988901234', stage: 'Nuevo', source: 'Facebook', interest: 'Inicial' },
        { name: 'Isabella Ríos', phone: '+593998901234', stage: 'Entrevista', source: 'WhatsApp', interest: 'Secundaria' },
        { name: 'Gabriel Vargas', phone: '+593989012345', stage: 'Pre-inscripción', source: 'Meta Ads', interest: 'Primaria' },
        { name: 'Martina León', phone: '+593999012345', stage: 'Inscrito', source: 'WhatsApp', interest: 'Inicial' },
      ];

      for (const lead of dummyLeads) {
        await prisma.lead.create({
          data: {
            tenantId: tenant.id,
            studentName: `Hijo de ${lead.name}`,
            guardianName: lead.name,
            phone: lead.phone,
            whatsapp: lead.phone,
            status: lead.stage,
            source: lead.source,
            gradeInterest: lead.interest,
          }
        });
      }
    }

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
