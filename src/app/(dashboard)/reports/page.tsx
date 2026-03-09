import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
    const allUsers = await db.query.users.findMany();

    // Rapor verilerini al
    const allTransactions = await db.select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        source: transactions.source,
        date: transactions.date,
        description: transactions.description,
        userId: transactions.userId,
        userName: users.name,
    })
        .from(transactions)
        .leftJoin(users, eq(transactions.userId, users.id))
        .orderBy(desc(transactions.date), desc(transactions.createdAt));

    return (
        <ReportsClient
            users={allUsers}
            initialTransactions={allTransactions as any}
        />
    );
}
