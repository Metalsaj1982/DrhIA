"use server";

import { prisma } from "@/lib/db";
import type { LeadFormData } from "@/types";

export async function submitPublicLead(tenantId: string, data: LeadFormData) {
  try {
    const lead = await prisma.lead.create({
      data: {
        tenantId,
        studentName: data.studentName,
        guardianName: data.guardianName,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        studentAge: data.studentAge || null,
        productId: data.productId || null,
        campus: data.campus || null,
        source: "website",
        interestReason: data.interestReason || null,
        notes: data.notes || null,
        status: "Nuevo",
      },
    });
    return { success: true, leadId: lead.id };
  } catch (error) {
    console.error("Error creating public lead:", error);
    return { error: "Ocurrió un error al enviar tu solicitud. Inténtalo más tarde." };
  }
}
