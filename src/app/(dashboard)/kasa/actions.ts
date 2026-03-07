"use server";

import { db } from "@/db";
import { transactions } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addIncome(prevState: any, formData: FormData) {
    const session = await getSession();

    if (!session) {
        return { error: "Oturum süresi dolmuş." };
    }

    // Only admins can add income to Kasa in many real world apps, but we will allow it for anyone based on requirement, or check role.
    if (session.role !== "ADMIN") {
        return { error: "Kasaya gelir eklemek için YÖNETİCİ yetkiniz olmalıdır." };
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
        return { success: "Gelir başarıyla eklendi." };
    } catch (error) {
        console.error(error);
        return { error: "Gelir eklenirken bir hata oluştu." };
    }
}
