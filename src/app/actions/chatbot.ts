"use server";

import { prisma } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";

interface ChatbotResponse {
  message: string;
  type: "info" | "action" | "summary" | "greeting" | "campaign" | "content";
}

export async function getChatbotResponse(userMessage: string): Promise<ChatbotResponse> {
  const tenantId = await getTenantId();
  const msg = userMessage.toLowerCase().trim();

  // Saludo
  if (msg.match(/^(hola|hey|buenas|buenos|hi)/)) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    return {
      message: `¡Hola! 👋 Soy tu **Agente de Marketing** de **${tenant?.name || "EduCRM"}**.\n\nPuedo ayudarte a:\n\n🎯 **Marketing**\n• "Plan de hoy" — Tareas de marketing del día\n• "Campaña WhatsApp" — Genero mensajes para tus leads\n• "Post Instagram" — Ideas de contenido para redes\n• "Remarketing" — Segmentos para reactivar\n\n📊 **Datos**\n• "Resumen" — KPIs del CRM\n• "Pipeline" — Estado del embudo\n• "Rendimiento" — Métricas de conversión`,
      type: "greeting",
    };
  }

  // PLAN DE MARKETING DEL DÍA
  if (msg.includes("plan") || msg.includes("tarea") || msg.includes("hoy") || msg.includes("día")) {
    return await getDailyMarketingPlan(tenantId);
  }

  // CAMPAÑA WHATSAPP
  if (msg.includes("whatsapp") || msg.includes("campaña") || msg.includes("mensaje") || msg.includes("plantilla")) {
    return await generateWhatsAppCampaign(tenantId);
  }

  // CONTENIDO PARA REDES SOCIALES
  if (msg.includes("post") || msg.includes("instagram") || msg.includes("facebook") || msg.includes("contenido") || msg.includes("red")) {
    return await generateSocialContent(tenantId);
  }

  // REMARKETING
  if (msg.includes("remarketing") || msg.includes("reactivar") || msg.includes("fríos") || msg.includes("inactivos")) {
    return await getRemarketing(tenantId);
  }

  // EMAIL MARKETING
  if (msg.includes("email") || msg.includes("correo") || msg.includes("boletín") || msg.includes("newsletter")) {
    return await generateEmailCampaign(tenantId);
  }

  // RESUMEN / KPIs
  if (msg.includes("resumen") || msg.includes("reporte") || msg.includes("kpi")) {
    return await getDailySummary(tenantId);
  }

  // SEGUIMIENTOS
  if (msg.includes("seguimiento") || msg.includes("pendiente") || msg.includes("urgente")) {
    return await getFollowUpActions(tenantId);
  }

  // PIPELINE
  if (msg.includes("pipeline") || msg.includes("oportunidad") || msg.includes("embudo")) {
    return await getPipelineStrategy(tenantId);
  }

  // RENDIMIENTO
  if (msg.includes("rendimiento") || msg.includes("conversión") || msg.includes("tasa")) {
    return await getPerformanceAnalysis(tenantId);
  }

  // PRODUCTOS
  if (msg.includes("producto") || msg.includes("precio") || msg.includes("nivel")) {
    return await getProductPromotion(tenantId);
  }

  // AYUDA
  return {
    message: `Soy tu agente de marketing. Prueba:\n\n🎯 **"Plan de hoy"** — Tu agenda de marketing\n📲 **"Campaña WhatsApp"** — Mensajes para leads\n📸 **"Post Instagram"** — Ideas de contenido\n🔄 **"Remarketing"** — Reactivar leads fríos\n📧 **"Email marketing"** — Boletines\n📊 **"Resumen"** — KPIs del CRM`,
    type: "info",
  };
}

// =============================================
// MARKETING AGENT FUNCTIONS
// =============================================

async function getDailyMarketingPlan(tenantId: string): Promise<ChatbotResponse> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [newLeads, overdueLeads, totalLeads, enrolled, contactedNotAdvanced] = await Promise.all([
    prisma.lead.count({ where: { tenantId, deletedAt: null, status: "Nuevo" } }),
    prisma.lead.count({ where: { tenantId, deletedAt: null, nextActionAt: { lt: new Date() } } }),
    prisma.lead.count({ where: { tenantId, deletedAt: null } }),
    prisma.enrollment.count({ where: { tenantId } }),
    prisma.lead.count({ where: { tenantId, deletedAt: null, status: "Contactado" } }),
  ]);

  const tasks: string[] = [];
  let priority = 1;

  if (overdueLeads > 0) {
    tasks.push(`${priority}. 🔴 **URGENTE**: Enviar seguimiento a **${overdueLeads} leads con acciones vencidas** (escribe "campaña whatsapp" para generar los mensajes)`);
    priority++;
  }
  if (newLeads > 0) {
    tasks.push(`${priority}. 🟡 **Contactar ${newLeads} leads nuevos** — Primer mensaje de bienvenida en las primeras 2 horas`);
    priority++;
  }
  if (contactedNotAdvanced > 0) {
    tasks.push(`${priority}. 🟠 **Mover ${contactedNotAdvanced} leads "Contactados"** — Enviar info de precios y agendar visita`);
    priority++;
  }

  tasks.push(`${priority}. 📸 **Publicar en Instagram** — Escribe "post instagram" para ideas`);
  priority++;
  tasks.push(`${priority}. 📧 **Enviar boletín semanal** si hay novedades (escribe "email marketing")`);

  const convRate = totalLeads > 0 ? ((enrolled / totalLeads) * 100).toFixed(1) : "0";

  return {
    message: `📋 **Plan de Marketing — ${today.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}**\n\n${tasks.join("\n\n")}\n\n---\n📊 Conversión actual: **${convRate}%** (${enrolled}/${totalLeads})`,
    type: "campaign",
  };
}

async function generateWhatsAppCampaign(tenantId: string): Promise<ChatbotResponse> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const schoolName = tenant?.name || "nuestro colegio";

  // Buscar leads que necesitan atención
  const newLeads = await prisma.lead.findMany({
    where: { tenantId, deletedAt: null, status: "Nuevo" },
    take: 3,
    include: { product: true },
  });

  const overdueLeads = await prisma.lead.findMany({
    where: { tenantId, deletedAt: null, nextActionAt: { lt: new Date() } },
    take: 3,
    include: { product: true },
  });

  let messages = `📲 **Campaña WhatsApp — ${schoolName}**\n\n`;

  if (newLeads.length > 0) {
    messages += `**🆕 Mensaje de Bienvenida (para ${newLeads.length} leads nuevos):**\n\n`;
    messages += `> Hola {nombre_padre} 👋, gracias por su interés en **${schoolName}**.\n>\n> Nos encantaría platicar sobre las opciones que tenemos para {nombre_alumno} en {nivel}.\n>\n> ¿Le gustaría agendar una visita personalizada esta semana?\n>\n> 📞 Puede llamarnos o responder a este mensaje.\n\n`;
  }

  if (overdueLeads.length > 0) {
    messages += `**⚠️ Mensaje de Seguimiento (para ${overdueLeads.length} leads sin respuesta):**\n\n`;
    messages += `> Hola {nombre_padre}, somos de **${schoolName}** 🎓\n>\n> Hace unos días conversamos sobre la admisión de {nombre_alumno}. ¿Tuvo oportunidad de revisar la información?\n>\n> Tenemos **cupos limitados** para el próximo período. Me encantaría ayudarle a resolver cualquier duda.\n>\n> ¿Le parece si agendamos una breve llamada?`;
    messages += `\n\n`;
  }

  messages += `**🎉 Mensaje de Cierre (para leads en Pre-inscripción):**\n\n`;
  messages += `> ¡Hola {nombre_padre}! 🎉\n>\n> Solo un recordatorio amigable: la documentación de {nombre_alumno} para completar la inscripción en **${schoolName}** está pendiente.\n>\n> ¿Necesita ayuda con algún documento? Estamos para servirle. 📋`;

  messages += `\n\n---\n💡 **Tip**: Envía estos mensajes entre **9-11 AM** o **2-4 PM** para mayor tasa de respuesta.`;

  return { message: messages, type: "campaign" };
}

async function generateSocialContent(tenantId: string): Promise<ChatbotResponse> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const schoolName = tenant?.name || "Tu Colegio";

  const [totalLeads, enrolled] = await Promise.all([
    prisma.lead.count({ where: { tenantId, deletedAt: null } }),
    prisma.enrollment.count({ where: { tenantId } }),
  ]);

  const dayOfWeek = new Date().getDay();
  const contentCalendar: Record<number, { type: string; idea: string; caption: string; hashtags: string }> = {
    0: { type: "🎥 Reel/Video", idea: "Tour virtual por las instalaciones", caption: `🏫 Descubre por qué **${schoolName}** es el hogar ideal para tu hijo. ¡Agenda tu visita! 👉 Link en bio`, hashtags: "#Admisiones #Colegio #Educación #MatrículaAbierta" },
    1: { type: "📸 Carrusel", idea: "5 razones para elegir tu colegio", caption: `✨ 5 razones por las que los padres eligen **${schoolName}** para el futuro de sus hijos.\n\n1️⃣ Educación bilingüe\n2️⃣ Grupos reducidos\n3️⃣ Tecnología en el aula\n4️⃣ Deportes y arte\n5️⃣ Valores y comunidad`, hashtags: "#MejorColegio #EducaciónDeCalidad #Matrículas" },
    2: { type: "📖 Story/Post", idea: "Testimonio de un padre de familia", caption: `"Elegir **${schoolName}** fue la mejor decisión para nuestra familia" — Padre de familia 💙\n\n¿Quieres conocernos? Agenda tu visita 👇`, hashtags: "#TestimonioReal #PadresDeFamilia #ColegioTop" },
    3: { type: "🎓 Infografía", idea: "Niveles educativos y precios", caption: `📚 Conoce nuestros niveles: Inicial, EGB y BGU.\n\n🎯 Inscripciones abiertas con cupos limitados.\n\n💬 Escríbenos para más información.`, hashtags: "#Inscripciones #NivelesEducativos #CuposLimitados" },
    4: { type: "📸 Foto", idea: "Detrás de cámaras del colegio", caption: `Un vistazo a lo que hace especial a **${schoolName}** 📸\n\nNuestros estudiantes aprenden, crecen y brillan cada día. ✨`, hashtags: "#VidaEscolar #Colegio #Educación" },
    5: { type: "🎥 Reel", idea: "Antes y después de un estudiante", caption: `De nuevo ingreso a estudiante estrella ⭐\n\nEn **${schoolName}** transformamos vidas. ¿Quieres ser parte?\n\n👉 Link en bio para agendar tu visita gratuita.`, hashtags: "#TransformaciónEducativa #Matrícula2025" },
    6: { type: "📖 Story", idea: "Encuesta: ¿Qué buscan los padres?", caption: `🤔 Pregunta del día: ¿Qué es lo más importante para ti al elegir colegio?\n\nA) Nivel académico\nB) Instalaciones\nC) Valores\nD) Precio`, hashtags: "#EncuestaEducativa #PadresDeFamilia" },
  };

  const todayContent = contentCalendar[dayOfWeek] || contentCalendar[1];

  return {
    message: `📸 **Contenido para Redes — Hoy**\n\n**Tipo**: ${todayContent.type}\n**Idea**: ${todayContent.idea}\n\n**Caption sugerido:**\n${todayContent.caption}\n\n**Hashtags:**\n${todayContent.hashtags}\n\n---\n📊 Tu audiencia: **${totalLeads} prospectos** interesados, **${enrolled} familias** ya inscritas.\n💡 **Tip**: Publica entre **6-8 PM** para máximo alcance. Usa Stories con enlace a tu formulario de admisión.`,
    type: "content",
  };
}

async function getRemarketing(tenantId: string): Promise<ChatbotResponse> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [coldLeads, staleContacted, lostLeads, totalForRemarketing] = await Promise.all([
    prisma.lead.count({
      where: { tenantId, deletedAt: null, status: "Nuevo", createdAt: { lt: sevenDaysAgo } },
    }),
    prisma.lead.count({
      where: { tenantId, deletedAt: null, status: "Contactado", updatedAt: { lt: sevenDaysAgo } },
    }),
    prisma.lead.count({
      where: { tenantId, deletedAt: null, status: "Interesado", updatedAt: { lt: thirtyDaysAgo } },
    }),
    prisma.lead.count({
      where: {
        tenantId, deletedAt: null,
        status: { in: ["Nuevo", "Contactado", "Interesado"] },
        updatedAt: { lt: sevenDaysAgo },
      },
    }),
  ]);

  let segments = `🔄 **Remarketing — Segmentos Identificados**\n\n`;

  if (coldLeads > 0) {
    segments += `🧊 **Leads Fríos (${coldLeads})** — Nuevos hace +7 días sin contactar\n→ *Acción*: Enviar WhatsApp de bienvenida urgente\n→ Escribe **"campaña whatsapp"** para los mensajes\n\n`;
  }

  if (staleContacted > 0) {
    segments += `⏸️ **Contactados Estancados (${staleContacted})** — Sin avance hace +7 días\n→ *Acción*: Enviar oferta especial o invitación a Open House\n→ Mensaje sugerido: "Tenemos una **promoción especial** este mes..."\n\n`;
  }

  if (lostLeads > 0) {
    segments += `💤 **Interesados Dormidos (${lostLeads})** — Sin actividad hace +30 días\n→ *Acción*: Campaña de reactivación con descuento por tiempo limitado\n→ Mensaje sugerido: "Hola, aún tenemos un cupo reservado para {alumno}..."\n\n`;
  }

  if (totalForRemarketing === 0) {
    segments += `✅ No hay leads para remarketing. ¡Tu seguimiento está al día!\n`;
  } else {
    segments += `---\n📊 **Total para remarketing: ${totalForRemarketing} leads**\n💡 Exporta estos segmentos desde **Contactos → Exportar CSV** para subir a Meta Ads como audiencia personalizada.`;
  }

  return { message: segments, type: "campaign" };
}

async function generateEmailCampaign(tenantId: string): Promise<ChatbotResponse> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const schoolName = tenant?.name || "Tu Colegio";

  const products = await prisma.product.findMany({
    where: { tenantId, active: true },
    orderBy: { price: "asc" },
    take: 3,
  });

  const priceRange = products.length > 0
    ? `desde $${products[0].price.toFixed(0)} USD`
    : "precios competitivos";

  return {
    message: `📧 **Campaña de Email — ${schoolName}**\n\n**Asunto sugerido:**\n"🎓 Inscripciones abiertas en ${schoolName} — Cupos limitados"\n\n**Cuerpo del email:**\n\nEstimado/a {nombre},\n\nGracias por su interés en **${schoolName}**. Nos complace informarle que las inscripciones para el próximo período están **abiertas**.\n\n📚 **Niveles disponibles**: Inicial, EGB y BGU\n💰 **Inversión**: ${priceRange}/mes\n🎯 **Incluye**: Educación bilingüe, actividades extracurriculares y acompañamiento personalizado\n\n¿Le gustaría agendar una **visita personalizada**? Responda a este correo o llámenos.\n\n¡Lo esperamos!\n*Equipo de Admisiones*\n*${schoolName}*\n\n---\n💡 **Tips de envío:**\n• Enviar los **martes o jueves a las 10 AM**\n• Segmenta por nivel de interés\n• Incluye botón de CTA: "Agendar Visita"`,
    type: "content",
  };
}

// =============================================
// DATA FUNCTIONS
// =============================================

async function getDailySummary(tenantId: string): Promise<ChatbotResponse> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalLeads, newToday, overdueLeads, enrollments] = await Promise.all([
    prisma.lead.count({ where: { tenantId, deletedAt: null } }),
    prisma.lead.count({ where: { tenantId, deletedAt: null, createdAt: { gte: today } } }),
    prisma.lead.count({ where: { tenantId, deletedAt: null, nextActionAt: { lt: new Date() } } }),
    prisma.enrollment.count({ where: { tenantId } }),
  ]);

  const convRate = totalLeads > 0 ? ((enrollments / totalLeads) * 100).toFixed(1) : "0";

  return {
    message: `📊 **Resumen del CRM**\n\n• **${totalLeads}** prospectos totales\n• **${newToday}** nuevos hoy\n• **${overdueLeads}** seguimientos vencidos ${overdueLeads > 0 ? "⚠️" : "✅"}\n• **${enrollments}** matrículas cerradas\n• Conversión: **${convRate}%**\n\n${overdueLeads > 0 ? '💡 Escribe **"plan de hoy"** para tu agenda de marketing.' : "✅ ¡Todo al día!"}`,
    type: "summary",
  };
}

async function getFollowUpActions(tenantId: string): Promise<ChatbotResponse> {
  const leads = await prisma.lead.findMany({
    where: { tenantId, deletedAt: null, nextActionAt: { lt: new Date() } },
    orderBy: { nextActionAt: "asc" },
    take: 5,
  });

  if (leads.length === 0) {
    return { message: "✅ No hay seguimientos pendientes.", type: "info" };
  }

  const list = leads.map((l: { guardianName: string; nextAction: string | null; nextActionAt: Date | null }, i: number) =>
    `${i + 1}. **${l.guardianName}** — "${l.nextAction}" (hace ${getTimeAgo(l.nextActionAt!)})`
  ).join("\n");

  return {
    message: `⚠️ **${leads.length} Seguimientos Vencidos:**\n\n${list}\n\n💡 Escribe **"campaña whatsapp"** para generar los mensajes de seguimiento automáticamente.`,
    type: "action",
  };
}

async function getPipelineStrategy(tenantId: string): Promise<ChatbotResponse> {
  const stages = await prisma.lead.groupBy({
    by: ["status"],
    where: { tenantId, deletedAt: null },
    _count: { id: true },
  });

  const stageMap = new Map(stages.map((s: { status: string; _count: { id: number } }) => [s.status, s._count.id]));
  const total = stages.reduce((sum: number, s: { _count: { id: number } }) => sum + s._count.id, 0);

  let strategy = `📈 **Pipeline + Estrategia**\n\n`;

  const stagesOrder = ["Nuevo", "Contactado", "Interesado", "Visita Programada", "Entrevista", "Pre-inscripción", "Inscrito"];
  for (const stage of stagesOrder) {
    const count = Number(stageMap.get(stage) || 0);
    if (count > 0) strategy += `• **${stage}**: ${count}\n`;
  }

  strategy += `\n**Total**: ${total} prospectos\n\n`;

  const newCount = Number(stageMap.get("Nuevo") || 0);
  const contactedCount = Number(stageMap.get("Contactado") || 0);

  if (newCount > 3) {
    strategy += `🎯 **Prioridad**: Tienes **${newCount} leads sin contactar**. Envía WhatsApp de bienvenida HOY.\n`;
  }
  if (contactedCount > 3) {
    strategy += `📞 **Oportunidad**: **${contactedCount} leads contactados** esperan info de precios. Envía brochure digital.\n`;
  }

  return { message: strategy, type: "campaign" };
}

async function getPerformanceAnalysis(tenantId: string): Promise<ChatbotResponse> {
  const [total, enrolled, bySource] = await Promise.all([
    prisma.lead.count({ where: { tenantId, deletedAt: null } }),
    prisma.enrollment.count({ where: { tenantId } }),
    prisma.lead.groupBy({
      by: ["source"],
      where: { tenantId, deletedAt: null },
      _count: { id: true },
    }),
  ]);

  const rate = total > 0 ? ((enrolled / total) * 100).toFixed(1) : "0";
  const sourceList = bySource
    .sort((a: { _count: { id: number } }, b: { _count: { id: number } }) => b._count.id - a._count.id)
    .slice(0, 5)
    .map((s: { source: string; _count: { id: number } }) => `• ${s.source}: **${s._count.id}** leads`)
    .join("\n");

  let advice = "";
  if (Number(rate) < 5) advice = "\n\n💡 **Consejo**: La tasa es baja. Enfócate en seguimiento por WhatsApp dentro de las primeras 24 horas.";
  else if (Number(rate) < 15) advice = "\n\n💡 **Consejo**: Buen inicio. Acelera las visitas programadas para subir la conversión.";
  else advice = "\n\n🎯 **¡Excelente conversión!** Mantén el ritmo de seguimiento.";

  return {
    message: `📊 **Análisis de Rendimiento**\n\n• Prospectos: **${total}**\n• Matrículas: **${enrolled}**\n• Conversión: **${rate}%**\n\n**Leads por fuente:**\n${sourceList || "Sin datos"}${advice}`,
    type: "summary",
  };
}

async function getProductPromotion(tenantId: string): Promise<ChatbotResponse> {
  const products = await prisma.product.findMany({
    where: { tenantId, active: true },
    orderBy: { name: "asc" },
  });

  const grouped: Record<string, string[]> = {};
  products.forEach((p: { level: string; name: string; price: number }) => {
    if (!grouped[p.level]) grouped[p.level] = [];
    grouped[p.level].push(`${p.name} ($${p.price.toFixed(0)})`);
  });

  const list = Object.entries(grouped).map(([level, items]) =>
    `**${level}:** ${items.join(", ")}`
  ).join("\n");

  return {
    message: `🎓 **Productos y Promoción**\n\n${list}\n\n---\n💡 **Ideas de promoción:**\n• Descuento 10% por inscripción temprana\n• Plan de referidos: 5% de descuento por cada familia referida\n• Open House gratuito con actividades para niños`,
    type: "content",
  };
}

function getTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "menos de 1h";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
