"use server";

import { db } from "@/db";
import { transactions } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, sum } from "drizzle-orm";

export async function addIncome(prevState: any, formData: FormData) {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
        return { error: "Yetkisiz işlem." };
    }

    const amountStr = formData.get("amount") as string;
    const description = formData.get("description") as string;
    const dateStr = formData.get("date") as string;

    if (!amountStr || !description || !dateStr) {
        return { error: "Lütfen tüm alanları doldurun." };
    }

    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
        return { error: "Geçerli bir tutar giriniz." };
    }

    try {
        const date = new Date(dateStr);

        await db.insert(transactions).values({
            id: crypto.randomUUID(),
            type: "INCOME",
            amount,
            description,
            source: "KASA",
            date,
            userId: session.id,
        });

        revalidatePath("/kasa");
        revalidatePath("/");
        revalidatePath("/reports");
        return { success: "Kasaya gelir başarıyla eklendi." };
    } catch (error) {
        return { error: "Gelir eklenirken bir hata oluştu." };
    }
}

export async function addOutflow(prevState: any, formData: FormData) {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
        return { error: "Yetkisiz işlem." };
    }

    const amountStr = formData.get("amount") as string;
    const description = formData.get("description") as string;
    const outflowType = formData.get("outflowType") as string; // 'BORC_IADESI' or 'KAR_PAYI'
    const dateStr = formData.get("date") as string;

    if (!amountStr || !description || !outflowType || !dateStr) {
        return { error: "Lütfen tüm alanları doldurun." };
    }

    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) {
        return { error: "Geçerli bir tutar giriniz." };
    }

    try {
        // Calculate current Kasa balance
        const allTransactions = await db.query.transactions.findMany({
            where: eq(transactions.source, "KASA")
        });

        let kasaBalance = 0;
        allTransactions.forEach(t => {
            if (t.type === "INCOME") kasaBalance += t.amount;
            else if (t.type === "EXPENSE" || t.type === "PAYOUT") kasaBalance -= t.amount;
        });

        if (amount > kasaBalance) {
            return { error: `Kasada yeterli bakiye yok! Mevcut Bakiye: ${kasaBalance.toLocaleString("tr-TR")} ₺` };
        }

        const date = new Date(dateStr);
        const finalDescription = `[${outflowType === 'BORC_IADESI' ? 'Borç İadesi' : 'Kâr Payı/Avans'}] ${description}`;

        await db.insert(transactions).values({
            id: crypto.randomUUID(),
            type: "PAYOUT",
            amount,
            description: finalDescription,
            source: "KASA",
            date,
            userId: session.id,
        });

        revalidatePath("/kasa");
        revalidatePath("/");
        revalidatePath("/reports");
        return { success: "Kasadan çıkış işlemi başarıyla kaydedildi." };
    } catch (error) {
        return { error: "İşlem sırasında bir hata oluştu." };
    }
}
