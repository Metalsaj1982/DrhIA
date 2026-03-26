import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: "colegio-demo" },
    update: {},
    create: {
      name: "Colegio Horizonte",
      slug: "colegio-demo",
      primaryColor: "#0F2B4C",
      secondaryColor: "#2563EB",
      pipelineStages: JSON.stringify([
        "Nuevo",
        "Contactado",
        "Interesado",
        "Visita Programada",
        "Entrevista",
        "Pre-inscripción",
        "Inscrito",
      ]),
    },
  });

  // Create demo user
  const passwordHash = await bcrypt.hash("demo1234", 12);
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: "admin@colegio.com" } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "admin@colegio.com",
      passwordHash,
      name: "María García",
      role: "admin",
    },
  });

  // Create demo leads
  const leadsData = [
    {
      studentName: "Sofía Martínez",
      guardianName: "Laura Martínez",
      phone: "+52 55 1234 5678",
      whatsapp: "+5215512345678",
      email: "laura.martinez@email.com",
      studentAge: 8,
      gradeInterest: "3° Primaria",
      campus: "Campus Norte",
      source: "facebook_ads",
      status: "Nuevo",
      interestReason: "Busca colegio con enfoque bilingüe",
      notes: "Madre muy interesada en programa de inglés",
    },
    {
      studentName: "Diego Rodríguez",
      guardianName: "Elena Rodríguez",
      phone: "+52 55 2345 6789",
      whatsapp: "+5215523456789",
      email: "elena.rodriguez@email.com",
      studentAge: 12,
      gradeInterest: "1° Secundaria",
      campus: "Campus Centro",
      source: "instagram_ads",
      status: "Contactado",
      nextAction: "Programar seguimiento",
      nextActionAt: new Date(Date.now() - 86400000), // overdue
      interestReason: "Cambio de escuela por mudanza",
    },
    {
      studentName: "Valentina López",
      guardianName: "Carlos López",
      phone: "+52 55 3456 7890",
      whatsapp: "+5215534567890",
      email: "carlos.lopez@email.com",
      studentAge: 5,
      gradeInterest: "Preescolar 3",
      campus: "Campus Norte",
      source: "referral",
      status: "Interesado",
      nextAction: "Enviar información de costos",
      nextActionAt: new Date(Date.now() + 3600000),
      interestReason: "Recomendación de familia amiga",
    },
    {
      studentName: "Mateo Hernández",
      guardianName: "Ana Hernández",
      phone: "+52 55 4567 8901",
      whatsapp: "+5215545678901",
      email: "ana.hernandez@email.com",
      studentAge: 10,
      gradeInterest: "5° Primaria",
      campus: "Campus Sur",
      source: "website",
      status: "Visita Programada",
      nextAction: "Recorrido Escolar",
      nextActionAt: new Date(Date.now() + 172800000),
    },
    {
      studentName: "Isabella García",
      guardianName: "Roberto García",
      phone: "+52 55 5678 9012",
      whatsapp: "+5215556789012",
      email: "roberto.garcia@email.com",
      studentAge: 14,
      gradeInterest: "3° Secundaria",
      campus: "Campus Centro",
      source: "facebook_ads",
      status: "Entrevista",
      nextAction: "Firma pendiente",
      nextActionAt: new Date(Date.now() + 86400000),
    },
    {
      studentName: "Santiago Vega",
      guardianName: "Patricia Vega",
      phone: "+52 55 6789 0123",
      whatsapp: "+5215567890123",
      email: "patricia.vega@email.com",
      studentAge: 6,
      gradeInterest: "1° Primaria",
      campus: "Campus Norte",
      source: "whatsapp",
      status: "Pre-inscripción",
      nextAction: "Completar documentación",
      nextActionAt: new Date(Date.now() + 259200000),
    },
    {
      studentName: "Camila Torres",
      guardianName: "Miguel Torres",
      phone: "+52 55 7890 1234",
      whatsapp: "+5215578901234",
      email: "miguel.torres@email.com",
      studentAge: 9,
      gradeInterest: "4° Primaria",
      campus: "Campus Sur",
      source: "manual",
      status: "Inscrito",
    },
    {
      studentName: "Emilio Cruz",
      guardianName: "Fernanda Cruz",
      phone: "+52 55 8901 2345",
      whatsapp: "+5215589012345",
      email: "fernanda.cruz@email.com",
      studentAge: 7,
      gradeInterest: "2° Primaria",
      campus: "Campus Centro",
      source: "facebook_ads",
      status: "Nuevo",
      interestReason: "Interesada en actividades extracurriculares",
    },
    {
      studentName: "Regina Flores",
      guardianName: "Alejandro Flores",
      phone: "+52 55 9012 3456",
      whatsapp: "+5215590123456",
      email: "alejandro.flores@email.com",
      studentAge: 11,
      gradeInterest: "6° Primaria",
      campus: "Campus Norte",
      source: "instagram_ads",
      status: "Contactado",
      nextAction: "Enviar brochure digital",
      nextActionAt: new Date(Date.now() + 7200000),
    },
    {
      studentName: "Leonardo Morales",
      guardianName: "Diana Morales",
      phone: "+52 55 0123 4567",
      whatsapp: "+5215501234567",
      email: "diana.morales@email.com",
      studentAge: 15,
      gradeInterest: "1° Preparatoria",
      campus: "Campus Centro",
      source: "website",
      status: "Interesado",
      nextAction: "Resolver dudas sobre programa IB",
      nextActionAt: new Date(Date.now() - 7200000), // overdue
      interestReason: "Interesado en programa de Bachillerato Internacional",
    },
  ];

  for (const data of leadsData) {
    await prisma.lead.create({
      data: { tenantId: tenant.id, ...data },
    });
  }

  // Create demo templates
  const templates = [
    {
      name: "Bienvenida Inicial",
      content:
        "Hola {guardian_name}, ¡gracias por su interés en {school_name}! Nos encantaría platicar sobre las opciones que tenemos para {student_name} en {grade_interest}. ¿Le parece bien si agendamos una llamada?",
    },
    {
      name: "Seguimiento Post-Visita",
      content:
        "Hola {guardian_name}, fue un placer recibirlos en nuestra visita del {visit_date}. Esperamos que {student_name} haya disfrutado el recorrido. ¿Tiene alguna duda adicional sobre el proceso de inscripción?",
    },
    {
      name: "Recordatorio de Documentación",
      content:
        "Hola {guardian_name}, le recordamos que estamos esperando la documentación de {student_name} para completar su proceso de inscripción en {grade_interest}. ¿Necesita ayuda con algún documento?",
    },
  ];

  for (const tpl of templates) {
    await prisma.messageTemplate.create({
      data: { tenantId: tenant.id, ...tpl },
    });
  }

  // Create some demo messages
  const leads = await prisma.lead.findMany({ where: { tenantId: tenant.id }, take: 3 });
  if (leads.length > 0) {
    await prisma.leadMessage.createMany({
      data: [
        {
          tenantId: tenant.id,
          leadId: leads[0].id,
          channel: "whatsapp",
          direction: "outbound",
          content: "Hola Laura, ¡bienvenida! Vi su interés en nuestro colegio para Sofía. ¿Le gustaría agendar una visita?",
          status: "delivered",
        },
        {
          tenantId: tenant.id,
          leadId: leads[0].id,
          channel: "whatsapp",
          direction: "inbound",
          content: "Hola, sí me interesa mucho. ¿Qué horarios tienen disponibles?",
          status: "read",
        },
        {
          tenantId: tenant.id,
          leadId: leads[1].id,
          channel: "whatsapp",
          direction: "outbound",
          content: "Hola Elena, gracias por contactarnos. Tenemos excelentes opciones para Diego en secundaria. ¿Cuándo podríamos platicar?",
          status: "sent",
        },
      ],
    });
  }

  // Create demo appointments
  if (leads.length > 2) {
    await prisma.appointment.create({
      data: {
        tenantId: tenant.id,
        leadId: leads[2].id,
        type: "visit",
        scheduledAt: new Date(Date.now() + 172800000),
        notes: "Recorrido por instalaciones deportivas",
      },
    });
  }

  // Create a demo enrollment
  if (leads.length > 0) {
    const enrolledLead = await prisma.lead.findFirst({
      where: { tenantId: tenant.id, status: "Inscrito" },
    });
    if (enrolledLead) {
      await prisma.enrollment.create({
        data: {
          tenantId: tenant.id,
          leadId: enrolledLead.id,
          studentName: enrolledLead.studentName,
          guardianName: enrolledLead.guardianName,
          gradeFinal: enrolledLead.gradeInterest || "4° Primaria",
          campus: enrolledLead.campus,
          notes: "Inscripción completada exitosamente",
        },
      });
    }
  }

  console.log("✅ Seed complete!");
  console.log("📧 Login: admin@colegio.com");
  console.log("🔑 Password: demo1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
