"use server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionType, TransactionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function addPayment(transactionId: string, amount: number, method: string, date: Date, notes?: string) {
  await requireAuth();
  const tx = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!tx) throw new Error("Transacción no encontrada");

  await prisma.$transaction(async (prismaTx) => {
    // Register payment movement
    await prismaTx.paymentMovement.create({
      data: {
        transactionId,
        amount,
        method,
        date,
        notes
      }
    });

    // Calculate new paidAmount
    const newPaidAmount = tx.paidAmount + amount;
    
    // Determine new status
    // To prevent floating point issues, use epsilon or round
    const pendingAmount = Math.max(0, tx.amount - newPaidAmount);
    let newStatus = TransactionStatus.PENDING;
    if (pendingAmount <= 0.01) {
      newStatus = TransactionStatus.PAID;
    } else if (newPaidAmount > 0) {
      newStatus = TransactionStatus.PARTIAL;
    }

    await prismaTx.transaction.update({
      where: { id: transactionId },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus
      }
    });
  });

  revalidatePath("/tesoreria");
  revalidatePath("/");
  return { success: true };
}

export async function createExpense(data: {
  supplierName?: string;
  documentNo?: string;
  concept: string;
  category: string;
  baseAmount: number;
  vatPercent: number;
  vatAmount: number;
  amount: number; // Total
  isPaid: boolean;
  dueDate?: Date;
  eventId?: string;
  paymentMethod?: string;
}) {
  const expenseDate = new Date();

  await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        supplierName: data.supplierName,
        documentNo: data.documentNo,
        concept: data.concept,
        category: data.category,
        baseAmount: data.baseAmount,
        vatPercent: data.vatPercent,
        vatAmount: data.vatAmount,
        amount: data.amount,
        isPaid: data.isPaid,
        dueDate: data.dueDate,
        eventId: data.eventId,
        date: expenseDate
      }
    });

    // Create Payable Transaction
    const transaction = await tx.transaction.create({
      data: {
        type: TransactionType.PAYABLE,
        status: data.isPaid ? TransactionStatus.PAID : TransactionStatus.PENDING,
        amount: data.amount,
        paidAmount: data.isPaid ? data.amount : 0,
        expectedMethod: data.paymentMethod,
        dueDate: data.dueDate || expenseDate,
        date: expenseDate,
        referenceId: expense.id
      }
    });

    if (data.isPaid) {
      await tx.paymentMovement.create({
        data: {
          transactionId: transaction.id,
          amount: data.amount,
          method: data.paymentMethod || "Desconocido",
          date: expenseDate,
          notes: "Pagado al registrar gasto"
        }
      });
    }
  });

  revalidatePath("/tesoreria");
  revalidatePath("/");
  return { success: true };
}

export async function getTesoreriaDashboard() {
  await requireAuth();
  const now = new Date();
  
  const transactions = await prisma.transaction.findMany({
    where: { status: { not: "PAID" } },
    orderBy: { dueDate: 'asc' }
  });

  let aCobrarTotal = 0;
  let aPagarTotal = 0;
  let vencidoCobrar = 0;
  let vencidoPagar = 0;

  // Previsions
  const getDaysDiff = (date: Date) => Math.ceil((new Date(date).getTime() - now.getTime()) / (1000 * 3600 * 24));
  
  const prevision = {
    d7: { cobrar: 0, pagar: 0 },
    d30: { cobrar: 0, pagar: 0 },
    d60: { cobrar: 0, pagar: 0 },
    d90: { cobrar: 0, pagar: 0 },
  };

  for (const t of transactions) {
    const pending = t.amount - t.paidAmount;
    if (Math.abs(pending) < 0.01) continue;

    const days = getDaysDiff(t.dueDate);
    const isVencido = days < 0;

    if (t.type === "RECEIVABLE") {
      aCobrarTotal += pending;
      if (isVencido) vencidoCobrar += pending;
      
      if (days >= 0 && days <= 7) prevision.d7.cobrar += pending;
      if (days >= 0 && days <= 30) prevision.d30.cobrar += pending;
      if (days >= 0 && days <= 60) prevision.d60.cobrar += pending;
      if (days >= 0 && days <= 90) prevision.d90.cobrar += pending;
    } else {
      aPagarTotal += pending;
      if (isVencido) vencidoPagar += pending;
      
      if (days >= 0 && days <= 7) prevision.d7.pagar += pending;
      if (days >= 0 && days <= 30) prevision.d30.pagar += pending;
      if (days >= 0 && days <= 60) prevision.d60.pagar += pending;
      if (days >= 0 && days <= 90) prevision.d90.pagar += pending;
    }
  }

  // Calculate balance preved for X days (current + upcoming cobrar - upcoming pagar)
  // Actually, balance foreseen is just what will enter - what will leave.
  const calculateBalance = (cobrar: number, pagar: number) => cobrar - pagar;

  return {
    aCobrarTotal,
    vencidoCobrar,
    aPagarTotal,
    vencidoPagar,
    balanceActual: aCobrarTotal - aPagarTotal,
    prevision: {
      d7: { ...prevision.d7, balance: calculateBalance(prevision.d7.cobrar, prevision.d7.pagar) },
      d30: { ...prevision.d30, balance: calculateBalance(prevision.d30.cobrar, prevision.d30.pagar) },
      d60: { ...prevision.d60, balance: calculateBalance(prevision.d60.cobrar, prevision.d60.pagar) },
      d90: { ...prevision.d90, balance: calculateBalance(prevision.d90.cobrar, prevision.d90.pagar) },
    }
  };
}
