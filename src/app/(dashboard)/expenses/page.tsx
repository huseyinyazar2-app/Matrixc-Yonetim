import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import ExpensesForm from "./ExpensesForm";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { getSession } from "@/lib/auth";

export default async function ExpensesPage() {
    const session = await getSession();
    const recentExpenses = await db
        .select({
            id: transactions.id,
            amount: transactions.amount,
            description: transactions.description,
            source: transactions.source,
            date: transactions.date,
            userName: users.name,
        })
        .from(transactions)
        .leftJoin(users, eq(transactions.userId, users.id))
        .where(session?.role === "ADMIN"
            ? eq(transactions.type, "EXPENSE")
            : and(eq(transactions.type, "EXPENSE"), eq(transactions.userId, session?.userId as string))
        )
        .orderBy(desc(transactions.date), desc(transactions.createdAt))
        .limit(20);

    return (
        <div className="space-y-6">
            <ExpensesForm />

            <div className="glass-card overflow-hidden mt-8">
                <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Son Harcamalar (Harcama Geçmişi)</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Eklenen harcamalar anında burada listelenir.</p>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {recentExpenses.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">Henüz harcama kaydedilmemiş.</div>
                    ) : (
                        recentExpenses.map((expense) => (
                            <div key={expense.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-semibold text-gray-900 dark:text-white">{expense.description}</p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${expense.source === 'KASA' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'}`}>
                                            {expense.source === 'KASA' ? 'Kasadan' : 'Cebinden'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {format(new Date(expense.date), "dd MMMM yyyy", { locale: tr })} - Ekleyen: {expense.userName}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <span className="font-mono text-lg font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-3 py-1 rounded-lg">
                                        - {expense.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
