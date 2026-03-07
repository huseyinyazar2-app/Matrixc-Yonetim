"use server";

import { db } from "@/db";
import { todos } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addTodo(prevState: any, formData: FormData) {
    const session = await getSession();
    if (!session) return { error: "Oturum süresi dolmuş." };

    const task = formData.get("task") as string;
    const urgency = formData.get("urgency") as string;

    if (!task || !urgency) {
        return { error: "Lütfen görevi ve aciliyeti girin." };
    }

    try {
        await db.insert(todos).values({
            id: crypto.randomUUID(),
            task,
            urgency,
            createdBy: session.name || session.username,
            isCompleted: false,
        });

        revalidatePath("/todos");
        return { success: "Görev başarıyla eklendi." };
    } catch (error) {
        return { error: "Görev eklenirken hata oluştu." };
    }
}

export async function toggleTodo(id: string, isCompleted: boolean) {
    const session = await getSession();
    if (!session) return { error: "Oturum süresi dolmuş." };

    try {
        await db.update(todos).set({ isCompleted: !isCompleted }).where(eq(todos.id, id));
        revalidatePath("/todos");
        return { success: "Durum güncellendi." };
    } catch (error) {
        return { error: "Güncelleme başarısız." };
    }
}

export async function deleteTodo(id: string) {
    const session = await getSession();
    if (!session) return { error: "Oturum süresi dolmuş." };

    try {
        await db.delete(todos).where(eq(todos.id, id));
        revalidatePath("/todos");
        return { success: "Silindi." };
    } catch (error) {
        return { error: "Silme başarısız." };
    }
}
