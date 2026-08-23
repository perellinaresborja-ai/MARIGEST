"use server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClient(data: any) {
  await requireAuth();
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
          name: `${data.paymentTermDays} días`,
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
  await requireAuth();
  return await prisma.client.findMany({
    include: {
      agreement: true,
      paymentTerm: true
    },
    orderBy: { commercialName: "asc" }
  });
}
export async function updateClient(id: string, data: any) {
  await requireAuth();
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
    if (data.paymentTermDays) {
      let pt = await prisma.paymentTerm.findFirst({ where: { days: parseInt(data.paymentTermDays) } });
      if (!pt) {
        pt = await prisma.paymentTerm.create({ data: { name: `${data.paymentTermDays} días`, days: parseInt(data.paymentTermDays) } });
      }
      await prisma.client.update({
        where: { id: client.id },
        data: { paymentTermId: pt.id }
      });
    }

    if (data.agreementType) {
      if (data.agreementType === "NONE") {
        await prisma.client.update({ where: { id: client.id }, data: { agreementId: null } });
      } else {
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
    }

    revalidatePath("/clientes");
    revalidatePath("/clientes/" + id);
    return { success: true, client };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

