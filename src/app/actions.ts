"use server";

import { prisma } from "@/lib/db";
import { authenticate, destroySession, hashPassword } from "@/lib/auth";
import { getTenantId, requireAuth } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import type { LeadFormData, LeadFilters } from "@/types";

// ========================================
// AUTH ACTIONS
// ========================================

export async function loginAction(email: string, password: string) {
  try {
    const session = await authenticate(email, password);
    if (!session) {
      return { error: "Correo o contraseña incorrectos" };
    }
    return { success: true, session };
  } catch (error: any) {
    console.error("LOGIN DATABASE ERROR:", error);
    return { error: `DB Error: ${error.message || "Falla de conexión"}` };
  }
}

export async function logoutAction() {
  await destroySession();
}

export async function registerTenantAction(data: {
  institutionName: string;
  slug: string;
  adminName: string;
  email: string;
  password: string;
}) {
  // Validar que el slug no exista
  const existingTenant = await prisma.tenant.findUnique({
    where: { slug: data.slug },
  });
  if (existingTenant) {
    return { error: "Ya existe una institución con ese identificador (slug). Elige otro nombre." };
  }

  // Validar que el email no exista
  const existingUser = await prisma.user.findFirst({
    where: { email: data.email.toLowerCase() },
  });
  if (existingUser) {
    return { error: "Ya existe una cuenta con ese correo electrónico." };
  }

  const passwordHash = await hashPassword(data.password);

  // Crear Tenant + User + Productos por defecto en una transacción
  const tenant = await prisma.tenant.create({
    data: {
      name: data.institutionName,
      slug: data.slug,
      users: {
        create: {
          email: data.email.toLowerCase(),
          passwordHash,
          name: data.adminName,
          role: "admin",
        },
      },
      products: {
        createMany: {
          data: [
            { name: "Inicial 1", level: "Inicial", price: 250 },
            { name: "Inicial 2", level: "Inicial", price: 250 },
            { name: "EGB 1", level: "EGB", price: 300 },
            { name: "EGB 2", level: "EGB", price: 300 },
            { name: "EGB 3", level: "EGB", price: 300 },
            { name: "EGB 4", level: "EGB", price: 320 },
            { name: "EGB 5", level: "EGB", price: 320 },
            { name: "EGB 6", level: "EGB", price: 320 },
            { name: "EGB 7", level: "EGB", price: 340 },
            { name: "EGB 8", level: "EGB", price: 340 },
            { name: "EGB 9", level: "EGB", price: 340 },
            { name: "EGB 10", level: "EGB", price: 360 },
            { name: "BGU 1", level: "BGU", price: 400 },
            { name: "BGU 2", level: "BGU", price: 400 },
            { name: "BGU 3", level: "BGU", price: 400 },
          ],
        },
      },
    },
  });

  // Autenticar automáticamente al nuevo usuario
  const session = await authenticate(data.email.toLowerCase(), data.password);
  if (!session) {
    return { error: "Cuenta creada, pero hubo un error al iniciar sesión. Intenta desde /login." };
  }

  return { success: true, tenantSlug: tenant.slug };
}


// ========================================
// LEAD ACTIONS
// ========================================

export async function createLead(data: LeadFormData) {
  const tenantId = await getTenantId();
  const lead = await prisma.lead.create({
    data: {
      tenantId,
      studentName: data.studentName,
      guardianName: data.guardianName,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      studentAge: data.studentAge || null,
      gradeInterest: data.gradeInterest || null,
      campus: data.campus || null,
      source: data.source,
      interestReason: data.interestReason || null,
      notes: data.notes || null,
      status: "Nuevo",
    },
  });
  revalidatePath("/pipeline");
  revalidatePath("/leads");
  return lead;
}

export async function importLeadsAction(leadsData: any[]) {
  const tenantId = await getTenantId();
  
  try {
    const results = await prisma.$transaction(
      leadsData.map((lead) => 
        prisma.lead.create({
          data: {
            tenantId,
            studentName: lead.studentName || "Sin Nombre",
            guardianName: lead.guardianName || lead.studentName || "Sin Representante",
            phone: String(lead.phone || "").replace(/\D/g, ""),
            whatsapp: String(lead.whatsapp || lead.phone || "").replace(/\D/g, ""),
            email: lead.email || null,
            gradeInterest: lead.gradeInterest || null,
            source: lead.source || "Importación",
            status: "Nuevo",
            notes: lead.notes || "Importado masivamente",
          },
        })
      )
    );
    
    revalidatePath("/leads");
    revalidatePath("/pipeline");
    return { success: true, count: results.length };
  } catch (error: any) {
    console.error("IMPORT ERROR:", error);
    return { success: false, error: error.message || "Error al importar los datos" };
  }
}

export async function getLeads(filters?: LeadFilters) {
  const tenantId = await getTenantId();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    tenantId,
    deletedAt: null,
  };

  if (filters?.status) where.status = filters.status;
  if (filters?.source) where.source = filters.source;
  if (filters?.gradeInterest) where.gradeInterest = filters.gradeInterest;
  if (filters?.campus) where.campus = filters.campus;

  if (filters?.overdue) {
    where.nextActionAt = { lt: new Date() };
  }
  if (filters?.noNextAction) {
    where.nextAction = null;
  }

  if (filters?.search) {
    where.OR = [
      { guardianName: { contains: filters.search, mode: "insensitive" } },
      { studentName: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search } },
      { whatsapp: { contains: filters.search } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters?.dateFrom || filters?.dateTo) {
    where.createdAt = {};
    if (filters?.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters?.dateTo) where.createdAt.lte = new Date(filters.dateTo);
  }

  return prisma.lead.findMany({
    where,
    orderBy: [
      { nextActionAt: "asc" },
      { createdAt: "desc" },
    ],
    include: {
      appointments: { take: 1, orderBy: { scheduledAt: "asc" } },
      enrollment: true,
      product: true,
    },
  });
}

export async function getLeadById(id: string) {
  const tenantId = await getTenantId();
  return prisma.lead.findFirst({
    where: { id, tenantId, deletedAt: null },
    include: {
      messages: { orderBy: { sentAt: "asc" } },
      appointments: { orderBy: { scheduledAt: "desc" } },
      enrollment: true,
    },
  });
}

export async function updateLead(id: string, data: Partial<LeadFormData> & {
  status?: string;
  nextAction?: string | null;
  nextActionAt?: string | null;
  lostReason?: string | null;
  notes?: string | null;
}) {
  const tenantId = await getTenantId();
  const updateData: Record<string, unknown> = {};

  if (data.studentName !== undefined) updateData.studentName = data.studentName;
  if (data.guardianName !== undefined) updateData.guardianName = data.guardianName;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.studentAge !== undefined) updateData.studentAge = data.studentAge;
  if (data.gradeInterest !== undefined) updateData.gradeInterest = data.gradeInterest;
  if (data.campus !== undefined) updateData.campus = data.campus;
  if (data.source !== undefined) updateData.source = data.source;
  if (data.interestReason !== undefined) updateData.interestReason = data.interestReason;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.nextAction !== undefined) updateData.nextAction = data.nextAction;
  if (data.nextActionAt !== undefined) updateData.nextActionAt = data.nextActionAt ? new Date(data.nextActionAt) : null;
  if (data.lostReason !== undefined) updateData.lostReason = data.lostReason;

  updateData.lastInteractionAt = new Date();

  const lead = await prisma.lead.updateMany({
    where: { id, tenantId },
    data: updateData,
  });

  revalidatePath("/pipeline");
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  return lead;
}

export async function moveLeadStage(id: string, newStatus: string) {
  const tenantId = await getTenantId();
  await prisma.lead.updateMany({
    where: { id, tenantId },
    data: { status: newStatus, lastInteractionAt: new Date() },
  });
  revalidatePath("/pipeline");
  revalidatePath("/leads");
}

export async function softDeleteLead(id: string) {
  const tenantId = await getTenantId();
  await prisma.lead.updateMany({
    where: { id, tenantId },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/pipeline");
  revalidatePath("/leads");
}

// ========================================
// PIPELINE ACTIONS
// ========================================

export async function getPipelineData() {
  const session = await requireAuth();
  const tenantId = session.tenantId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { pipelineStages: true },
  });

  const stages = (tenant?.pipelineStages ? JSON.parse(tenant.pipelineStages as string) : null) || [
    "Nuevo", "Contactado", "Interesado", "Visita Programada",
    "Entrevista", "Pre-inscripción", "Inscrito",
  ];

  const leads = await prisma.lead.findMany({
    where: { tenantId, deletedAt: null },
    include: { product: true },
    orderBy: [{ nextActionAt: "asc" }, { createdAt: "desc" }],
  });

  return stages.map((stage: string) => ({
    stage,
    leads: leads.filter((l: any) => l.status === stage),
    count: leads.filter((l: any) => l.status === stage).length,
  }));
}

// ========================================
// MESSAGE ACTIONS
// ========================================

export async function sendMessage(leadId: string, content: string, channel = "whatsapp") {
  const tenantId = await getTenantId();
  const message = await prisma.leadMessage.create({
    data: {
      tenantId,
      leadId,
      channel,
      direction: "outbound",
      content,
      status: "sent",
    },
  });

  await prisma.lead.updateMany({
    where: { id: leadId, tenantId },
    data: { lastInteractionAt: new Date() },
  });

  revalidatePath(`/leads/${leadId}`);
  revalidatePath("/inbox");
  return message;
}

export async function getConversations() {
  const tenantId = await getTenantId();

  const leads = await prisma.lead.findMany({
    where: {
      tenantId,
      deletedAt: null,
      messages: { some: {} },
    },
    include: {
      messages: {
        orderBy: { sentAt: "desc" },
        take: 1,
      },
    },
    orderBy: { lastInteractionAt: "desc" },
  });

  return leads.map((lead: any) => ({
    leadId: lead.id,
    guardianName: lead.guardianName,
    studentName: lead.studentName,
    whatsapp: lead.whatsapp,
    lastMessage: lead.messages[0] || null,
    status: lead.status,
  }));
}

export async function getLeadMessages(leadId: string) {
  const tenantId = await getTenantId();
  return prisma.leadMessage.findMany({
    where: { leadId, tenantId },
    orderBy: { sentAt: "asc" },
  });
}

// ========================================
// APPOINTMENT ACTIONS
// ========================================

export async function createAppointment(data: {
  leadId: string;
  type: string;
  scheduledAt: string;
  notes?: string;
}) {
  const tenantId = await getTenantId();
  const appointment = await prisma.appointment.create({
    data: {
      tenantId,
      leadId: data.leadId,
      type: data.type,
      scheduledAt: new Date(data.scheduledAt),
      notes: data.notes || null,
    },
  });

  // Set lead's next action to the appointment
  await prisma.lead.updateMany({
    where: { id: data.leadId, tenantId },
    data: {
      nextAction: `${data.type === "visit" ? "Visita" : data.type === "interview" ? "Entrevista" : "Recorrido"} programada`,
      nextActionAt: new Date(data.scheduledAt),
      lastInteractionAt: new Date(),
    },
  });

  revalidatePath("/appointments");
  revalidatePath("/pipeline");
  revalidatePath(`/leads/${data.leadId}`);
  return appointment;
}

export async function getAppointments() {
  const tenantId = await getTenantId();
  return prisma.appointment.findMany({
    where: { tenantId },
    include: {
      lead: {
        select: { id: true, studentName: true, guardianName: true, gradeInterest: true },
      },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function updateAppointment(id: string, data: {
  scheduledAt?: string;
  notes?: string;
  type?: string;
}) {
  const tenantId = await getTenantId();
  const updateData: Record<string, unknown> = {};
  if (data.scheduledAt) updateData.scheduledAt = new Date(data.scheduledAt);
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.type) updateData.type = data.type;

  await prisma.appointment.updateMany({
    where: { id, tenantId },
    data: updateData,
  });
  revalidatePath("/appointments");
}

// ========================================
// ENROLLMENT ACTIONS
// ========================================

export async function convertToEnrollment(data: {
  leadId: string;
  studentName: string;
  guardianName: string;
  gradeFinal: string;
  campus?: string;
  notes?: string;
}) {
  const tenantId = await getTenantId();

  // Check for existing enrollment
  const existing = await prisma.enrollment.findUnique({
    where: { leadId: data.leadId },
  });
  if (existing) {
    return { error: "Este prospecto ya fue inscrito" };
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      tenantId,
      leadId: data.leadId,
      studentName: data.studentName,
      guardianName: data.guardianName,
      gradeFinal: data.gradeFinal,
      campus: data.campus || null,
      notes: data.notes || null,
    },
  });

  // Update lead status to "Inscrito"
  await prisma.lead.updateMany({
    where: { id: data.leadId, tenantId },
    data: { status: "Inscrito", lastInteractionAt: new Date() },
  });

  revalidatePath("/enrollments");
  revalidatePath("/pipeline");
  revalidatePath("/leads");
  return enrollment;
}

export async function getEnrollments() {
  const tenantId = await getTenantId();
  return prisma.enrollment.findMany({
    where: { tenantId },
    include: {
      lead: { select: { id: true, source: true, gradeInterest: true } },
    },
    orderBy: { closedAt: "desc" },
  });
}

// ========================================
// TEMPLATE ACTIONS
// ========================================

export async function getTemplates() {
  const tenantId = await getTenantId();
  return prisma.messageTemplate.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTemplate(data: { name: string; content: string }) {
  const tenantId = await getTenantId();
  return prisma.messageTemplate.create({
    data: { tenantId, name: data.name, content: data.content },
  });
}

export async function updateTemplate(id: string, data: { name?: string; content?: string }) {
  const tenantId = await getTenantId();
  await prisma.messageTemplate.updateMany({
    where: { id, tenantId },
    data,
  });
}

// ========================================
// ANALYTICS ACTIONS
// ========================================

export async function getDashboardStats() {
  const tenantId = await getTenantId();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalLeads,
    newLeadsThisMonth,
    enrollmentsThisMonth,
    allLeads,
    allEnrollments,
  ] = await Promise.all([
    prisma.lead.count({ where: { tenantId, deletedAt: null } }),
    prisma.lead.count({
      where: { tenantId, deletedAt: null, createdAt: { gte: startOfMonth } },
    }),
    prisma.enrollment.count({
      where: { tenantId, closedAt: { gte: startOfMonth } },
    }),
    prisma.lead.findMany({
      where: { tenantId, deletedAt: null },
      select: { source: true, status: true, product: { select: { price: true } } },
    }),
    prisma.enrollment.findMany({
      where: { tenantId },
      select: { closedAt: true, lead: { select: { product: { select: { price: true } } } } },
    }),
  ]);

  // Leads by source
  const sourceMap = new Map<string, number>();
  allLeads.forEach((l: any) => {
    sourceMap.set(l.source, (sourceMap.get(l.source) || 0) + 1);
  });
  const leadsBySource = Array.from(sourceMap.entries()).map(([source, count]) => ({
    source,
    count,
  }));

  // Leads by stage
  const stageMap = new Map<string, number>();
  allLeads.forEach((l: any) => {
    stageMap.set(l.status, (stageMap.get(l.status) || 0) + 1);
  });
  const leadsByStage = Array.from(stageMap.entries()).map(([stage, count]) => ({
    stage,
    count,
  }));

  // Enrollments by month (last 6 months)
  const enrollmentsByMonth: { month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthName = monthStart.toLocaleDateString("es-MX", { month: "short" });
    const count = allEnrollments.filter(
      (e: any) => new Date(e.closedAt) >= monthStart && new Date(e.closedAt) <= monthEnd
    ).length;
    enrollmentsByMonth.push({ month: monthName, count });
  }

  const conversionRate = totalLeads > 0
    ? Math.round((allEnrollments.length / totalLeads) * 100 * 10) / 10
    : 0;

  // Revenue calculation
  let pipelineValueUSD = 0;
  allLeads.forEach((l: any) => {
    if (l.status !== "Inscrito" && l.product) {
      pipelineValueUSD += l.product.price;
    }
  });

  let enrolledRevenueUSD = 0;
  allEnrollments.forEach((e: any) => {
    if (e.lead?.product) {
      enrolledRevenueUSD += e.lead.product.price;
    }
  });

  return {
    totalLeads,
    newLeadsThisMonth,
    enrollmentsThisMonth,
    conversionRate,
    pipelineValueUSD,
    enrolledRevenueUSD,
    leadsBySource,
    leadsByStage,
    enrollmentsByMonth,
  };
}

// ========================================
// TENANT SETTINGS
// ========================================

export async function getTenantSettings() {
  const session = await requireAuth();
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    include: { integrations: { select: { provider: true, connectedAt: true } } },
  });
  if (!tenant) return null;
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    logoUrl: tenant.logoUrl,
    primaryColor: tenant.primaryColor,
    secondaryColor: tenant.secondaryColor,
    pipelineStages: JSON.parse(tenant.pipelineStages as string),
    integrations: tenant.integrations.map(i => ({ provider: i.provider, connectedAt: i.connectedAt.toISOString() })),
  };
}

export async function updateTenantSettings(data: {
  name?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  pipelineStages?: string[];
}) {
  const tenantId = await getTenantId();
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
      ...(data.primaryColor && { primaryColor: data.primaryColor }),
      ...(data.secondaryColor && { secondaryColor: data.secondaryColor }),
      ...(data.pipelineStages && { pipelineStages: JSON.stringify(data.pipelineStages) }),
    },
  });
  revalidatePath("/settings");
  revalidatePath("/pipeline");
}
