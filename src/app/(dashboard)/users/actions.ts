"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addUser(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
        return { error: "Yetkisiz işlem." };
    }

    const username = formData.get("username") as string;
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string || "USER";

    if (!username || !name || !password) {
        return { error: "Lütfen tüm alanları doldurun." };
    }

    try {
        const existing = await db.query.users.findFirst({
            where: eq(users.username, username)
        });

        if (existing) {
            return { error: "Bu kullanıcı adı zaten alınmış." };
        }

        const id = crypto.randomUUID();
        await db.insert(users).values({
            id,
            username,
            name,
            password,
            role
        });

        revalidatePath("/users");
        return { success: true };
    } catch (error) {
        return { error: "Sistemsel bir hata oluştu." };
    }
}

export async function updateUserPassword(formData: FormData) {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
        return { error: "Yetkisiz işlem." };
    }

    const userId = formData.get("userId") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!userId || !newPassword) {
        return { error: "Geçersiz veriler." };
    }

    try {
        await db.update(users)
            .set({ password: newPassword })
            .where(eq(users.id, userId));

        revalidatePath("/users");
        return { success: true };
    } catch (error) {
        return { error: "Güncelleme başarısız." };
    }
}
