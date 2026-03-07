import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { desc, eq, sum } from "drizzle-orm";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function DashboardPage() {
    // Fetch transactions to calculate Kasa balance
    const allKasaIncomes = await db.query.transactions.findMany({
        where: eq(transactions.type, "INCOME"),
    });
    const allKasaExpenses = await db.query.transactions.findMany({
        where: (x, { and, eq }) => and(eq(x.type, "EXPENSE"), eq(x.source, "KASA")),
    });
    const allKasaTransfers = await db.query.transactions.findMany({
        where: eq(transactions.type, "TRANSFER"),
    });

    const totalIncome = allKasaIncomes.reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = allKasaExpenses.reduce((acc, t) => acc + t.amount, 0);
    const totalTransfers = allKasaTransfers.reduce((acc, t) => acc + t.amount, 0);

    const kasaBalance = totalIncome - totalExpense - totalTransfers;

    // Personal Expenses (out of pocket) this month (just total for all time for simplicity first)
    const personalExpenses = await db.query.transactions.findMany({
        where: (x, { and, eq }) => and(eq(x.type, "EXPENSE"), eq(x.source, "PERSONAL")),
    });
    const totalPersonalExpense = personalExpenses.reduce((acc, t) => acc + t.amount, 0);

    // Recent 5 transactions
    const recentTransactions = await db.select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        description: transactions.description,
        source: transactions.source,
        date: transactions.date,
        userName: users.name,
    })
        .from(transactions)
        .leftJoin(users, eq(transactions.userId, users.id))
        .orderBy(desc(transactions.date))
        .limit(5);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Kasa Card */}
                <div className="glass-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full mix-blend-screen filter blur-[50px] group-hover:bg-emerald-500/30 transition-all duration-500"></div>
                    <h3 className="text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">Güncel Kasa</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-white tracking-tight">₺{kasaBalance.toLocaleString("tr-TR")}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 text-sm text-gray-500 flex justify-between">
                        <span>Gelir: ₺{totalIncome.toLocaleString()}</span>
                        <span>Gider: ₺{(totalExpense + totalTransfers).toLocaleString()}</span>
                    </div>
                </div>

                {/* Personal Expenses Card */}
                <div className="glass-card p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[50px] group-hover:bg-purple-500/30 transition-all duration-500"></div>
                    <h3 className="text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">Cepten Harcanan (Tüm Kişiler)</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-white tracking-tight">₺{totalPersonalExpense.toLocaleString("tr-TR")}</span>
                    </div>
                    <p className="mt-4 pt-4 border-t border-white/5 text-sm text-gray-500">
                        Şirketin personellerine borçu toplamı (Raporlardan detaylı bakabilirsiniz).
                    </p>
                </div>

                {/* Info Card */}
                <div className="glass-card p-6 relative overflow-hidden group hidden lg:block">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[50px] group-hover:bg-blue-500/30 transition-all duration-500"></div>
                    <h3 className="text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">Hızlı Erişim</h3>
                    <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-400">Kasaya yeni bir gelir girmek için <span className="text-blue-400">Kasa</span> sekmesine gidin.</p>
                        <p className="text-sm text-gray-400">Yeni bir harcama (Kasa veya Cep) için <span className="text-purple-400">Harcamalar</span> sekmesini kullanın.</p>
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-semibold text-white text-lg">Son 5 İşlem</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-gray-400">
                                <th className="py-3 px-6 font-medium">Tarih</th>
                                <th className="py-3 px-6 font-medium">Kullanıcı</th>
                                <th className="py-3 px-6 font-medium">İşlem Türü</th>
                                <th className="py-3 px-6 font-medium">Açıklama</th>
                                <th className="py-3 px-6 font-medium text-right">Tutar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {recentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">Henüz hiçbir işlem bulunmamaktadır.</td>
                                </tr>
                            ) : (
                                recentTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 px-6 text-gray-300">
                                            {format(new Date(tx.date), "dd MMM yyyy", { locale: tr })}
                                        </td>
                                        <td className="py-4 px-6 text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-300 font-bold">
                                                    {tx.userName?.charAt(0)}
                                                </div>
                                                {tx.userName}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {tx.type === "INCOME" && <span className="px-2 py-1 text-xs rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Gelir</span>}
                                            {tx.type === "EXPENSE" && <span className="px-2 py-1 text-xs rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">Gider ({tx.source})</span>}
                                            {tx.type === "TRANSFER" && <span className="px-2 py-1 text-xs rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">Kasa Ödemesi</span>}
                                        </td>
                                        <td className="py-4 px-6 text-gray-300">{tx.description}</td>
                                        <td className={`py-4 px-6 text-right font-medium ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {tx.type === 'INCOME' ? '+' : '-'}₺{tx.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
