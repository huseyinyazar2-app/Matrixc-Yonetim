import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ count: 0 }, { status: 401 });
    }

    // Sadece tamamlanmamış (isCompleted = false) todo'ların sayısını getir.
    const allTodos = await db.query.todos.findMany({
        where: eq(todos.isCompleted, false)
    });

    return NextResponse.json({ count: allTodos.length });
}
