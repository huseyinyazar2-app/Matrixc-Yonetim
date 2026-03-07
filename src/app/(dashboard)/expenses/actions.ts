"use server";

import { db } from "@/db";
import { transactions } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addExpense(prevState: any, formData: FormData) {
    const session = await getSession();

    if (!session) {
        return { error: "Oturum süresi dolmuş." };
    }

    const amountStr = formData.get("amount") as string;
    const description = formData.get("description") as string;
    const source = formData.get("source") as "KASA" | "PERSONAL";
    const dateStr = formData.get("date") as string;

    if (!amountStr || !description || !source || !dateStr) {
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
            type: "EXPENSE",
            amount,
            description,
            source,
            date,
            userId: session.id,
        });

        revalidatePath("/expenses");
        revalidatePath("/");
        revalidatePath("/reports");
        return { success: "Harcama başarıyla eklendi." };
    } catch (error) {
        console.error(error);
        return { error: "Harcama eklenirken bir hata oluştu." };
    }
}
