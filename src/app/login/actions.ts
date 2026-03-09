"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { encrypt } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(prevState: any, formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
        return { error: "Lütfen tüm alanları doldurun." };
    }

    let success = false;
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.username, username),
        });

        if (!user) {
            return { error: "Geçersiz kullanıcı adı veya şifre." };
        }

        const isValidPassword = password === user.password;

        if (!isValidPassword) {
            return { error: "Geçersiz kullanıcı adı veya şifre." };
        }

        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const sessionToken = await encrypt({ id: user.id, username: user.username, role: user.role, name: user.name, expires });

        (await cookies()).set("session", sessionToken, { expires, httpOnly: true, path: "/" });
        success = true;
    } catch (error) {
        return { error: "Sistemsel bir hata oluştu." };
    }

    if (success) {
        redirect("/");
    }
}

export async function logout() {
    (await cookies()).delete("session");
    redirect("/login");
}
