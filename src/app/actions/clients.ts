"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClient(data: any) {
  try {
    const client = await prisma.client.create({
      data: {
        commercialName: data.commercialName,
        legalName: data.legalName,
        cifNif: data.cifNif,
        fiscalAddress: data.fiscalAddress,
        deliveryAddress: data.deliveryAddress,
        email: data.email,
        billingEmail: data.billingEmail,
        phone: data.phone,
        contactPerson: data.contactPerson,
        type: data.type,
      }
    });

    // Simple implementation for commercial agreements
    if (data.agreementType && data.agreementType !== "NONE") {
      const agreement = await prisma.commercialAgreement.create({
        data: {
          name: `Acuerdo - ${data.commercialName}`,
          type: data.agreementType,
          paramX: data.paramX ? parseInt(data.paramX) : null,
          paramY: data.paramY ? parseInt(data.paramY) : null,
          paramFloat: data.paramFloat ? parseFloat(data.paramFloat) : null,
        }
      });
      await prisma.client.update({
        where: { id: client.id },
        data: { agreementId: agreement.id }
      });
    }

    if (data.paymentTermDays) {
      const paymentTerm = await prisma.paymentTerm.create({
        data: {
          name: `${data.paymentTermDays} dÃ­as`,
          days: parseInt(data.paymentTermDays)
        }
      });
      await prisma.client.update({
        where: { id: client.id },
        data: { paymentTermId: paymentTerm.id }
      });
    }

    revalidatePath("/clientes");
    return { success: true, clientId: client.id };
  } catch (error: any) {
    console.error("Error creating client:", error);
    return { success: false, error: error.message };
  }
}

export async function getClients() {
  return await prisma.client.findMany({
    include: {
      agreement: true,
      paymentTerm: true
    },
    orderBy: { commercialName: "asc" }
  });
}
export async function updateClient(id: string, data: any) {
  try {
    const client = await prisma.client.update({
      where: { id },
      data: {
        commercialName: data.commercialName,
        legalName: data.legalName,
        cifNif: data.cifNif,
        fiscalAddress: data.fiscalAddress,
        type: data.type,
        contactPerson: data.contactPerson,
        phone: data.phone,
        email: data.email,
        billingEmail: data.billingEmail,
      }
    });

    // Update payment term
    const termMap: Record<string, string> = {
      "0": "Al contado",
      "15": "15 días",
      "30": "30 días",
      "60": "60 días"
    };

    if (data.paymentTermDays) {
      const termName = termMap[data.paymentTermDays] || "Al contado";
      const pt = await prisma.paymentTerm.findFirst({ where: { days: parseInt(data.paymentTermDays) } });
      if (pt) {
        await prisma.client.update({
          where: { id: client.id },
          data: { paymentTermId: pt.id }
        });
      }
    }

    revalidatePath("/clientes");
    revalidatePath(/clientes/ + id);
    return { success: true, client };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

