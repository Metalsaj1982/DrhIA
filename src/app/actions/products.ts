"use server";

import { prisma } from "@/lib/db";
import { getTenantId } from "@/lib/tenant";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  const tenantId = await getTenantId();
  return prisma.product.findMany({
    where: { tenantId },
    orderBy: { createdAt: "asc" },
  });
}

export async function createProduct(data: { name: string; level: string; price: number }) {
  const tenantId = await getTenantId();
  const product = await prisma.product.create({
    data: {
      tenantId,
      name: data.name,
      level: data.level,
      price: data.price,
      active: true,
    },
  });
  revalidatePath("/products");
  return product;
}

export async function updateProduct(id: string, data: { name?: string; level?: string; price?: number; active?: boolean }) {
  const tenantId = await getTenantId();
  const product = await prisma.product.updateMany({
    where: { id, tenantId },
    data,
  });
  revalidatePath("/products");
  revalidatePath("/pipeline");
  revalidatePath("/analytics");
  return product;
}

export async function toggleProduct(id: string, active: boolean) {
  const tenantId = await getTenantId();
  await prisma.product.updateMany({
    where: { id, tenantId },
    data: { active },
  });
  revalidatePath("/products");
}

export async function deleteProduct(id: string) {
  const tenantId = await getTenantId();
  await prisma.product.deleteMany({
    where: { id, tenantId },
  });
  revalidatePath("/products");
}
