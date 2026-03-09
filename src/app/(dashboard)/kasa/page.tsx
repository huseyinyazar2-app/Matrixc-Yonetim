import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { eq, desc, inArray, and } from "drizzle-orm";
import KasaForms from "./KasaForms";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function KasaPage() {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }

    // Kasaya giren çıkan tüm hareketleri getir (Kasa Kasası veya Diğer)
    const recentKasaTransactions = await db
        .select({
            id: transactions.id,
            amount: transactions.amount,
            description: transactions.description,
            type: transactions.type,
            date: transactions.date,
            userName: users.name,
        })
        .from(transactions)
        .leftJoin(users, eq(transactions.userId, users.id))
        .where(session.role === "ADMIN"
            ? eq(transactions.source, "KASA")
            : and(eq(transactions.source, "KASA"), eq(transactions.userId, session.userId))
        )
        .orderBy(desc(transactions.date), desc(transactions.createdAt))
        .limit(20);

    return (
        <div className="space-y-6">
            <KasaForms />

            <div className="glass-card overflow-hidden mt-8 border-t-4 border-t-indigo-500">
                <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Son Kasa Hareketleri (Tarihçe)</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gelir ve ödeme işlem geçmişiniz anlık listelenir.</p>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {recentKasaTransactions.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">Henüz kasa hareketi kaydedilmemiş.</div>
                    ) : (
                        recentKasaTransactions.map((t) => {
                            const isIncome = t.type === "INCOME";

                            return (
                                <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-gray-900 dark:text-white">{t.description}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isIncome ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'}`}>
                                                {isIncome ? 'Gelir Eklendi' : 'Para Çıkışı (Ödeme/Gider)'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {format(new Date(t.date), "dd MMMM yyyy", { locale: tr })} - İşlem Yapan: {t.userName}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <span className={`font-mono text-lg font-bold px-3 py-1 rounded-lg ${isIncome ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'}`}>
                                            {isIncome ? '+' : '-'} {t.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
