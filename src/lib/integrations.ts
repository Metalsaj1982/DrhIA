import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type IncomingLead = {
  tenantId: string;
  studentName?: string;
  guardianName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  source: "TikTok" | "Facebook" | "Instagram" | "Web" | "WhatsApp";
  notes?: string;
  gradeInterest?: string;
};

/**
 * Procesa un lead entrante desde integraciones externas
 */
export async function processIncomingLead(data: IncomingLead) {
  try {
    // Sanitizar teléfono
    const cleanPhone = data.phone.replace(/\D/g, "");
    
    // Buscar si ya existe (evitar duplicados recientes)
    const existing = await prisma.lead.findFirst({
      where: {
        tenantId: data.tenantId,
        OR: [
          { phone: cleanPhone },
          { whatsapp: cleanPhone },
          { email: data.email || undefined }
        ],
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
        }
      }
    });

    if (existing) {
      console.log(`[Integration] Potential duplicate found for ${cleanPhone}. Updating notes.`);
      await prisma.lead.update({
        where: { id: existing.id },
        data: {
          notes: `${existing.notes}\n---\nNueva entrada via ${data.source}: ${data.notes || "Sin notas adicionales"}`
        }
      });
      return { status: "updated", id: existing.id };
    }

    // Crear nuevo
    const lead = await prisma.lead.create({
      data: {
        tenantId: data.tenantId,
        studentName: data.studentName || data.guardianName,
        guardianName: data.guardianName,
        phone: cleanPhone,
        whatsapp: data.whatsapp?.replace(/\D/g, "") || cleanPhone,
        email: data.email || null,
        source: data.source,
        notes: data.notes || `Nuevo lead desde ${data.source}`,
        gradeInterest: data.gradeInterest || null,
        status: "Nuevo",
      }
    });

    revalidatePath("/leads");
    revalidatePath("/pipeline");
    
    return { status: "created", id: lead.id };
  } catch (error) {
    console.error("[Integration Error]", error);
    throw error;
  }
}
