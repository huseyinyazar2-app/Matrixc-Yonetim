import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function DashboardPage() {
    // 1. Fetch all users
    const allUsers = await db.query.users.findMany();

    // 2. Fetch all transactions
    const allTransactions = await db.query.transactions.findMany({
        orderBy: (tx, { desc }) => [desc(tx.date)],
    });

    // 3. Calculate Kasa Balance
    let kasaBalance = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    // 4. Calculate User Balances
    const userBalances: Record<string, { name: string; personalSpends: number; receivedPayouts: number; balance: number }> = {};
    for (const u of allUsers) {
        userBalances[u.id] = { name: u.name, personalSpends: 0, receivedPayouts: 0, balance: 0 };
    }

    let totalPersonalExpense = 0;

    for (const tx of allTransactions) {
        if (tx.source === "KASA") {
            if (tx.type === "INCOME") {
                kasaBalance += tx.amount;
                totalIncome += tx.amount;
            } else if (tx.type === "EXPENSE" || tx.type === "TRANSFER" || tx.type === "PAYOUT") {
                kasaBalance -= tx.amount;
                if (tx.type === "EXPENSE") totalExpense += tx.amount;
            }
        }

        if (tx.type === "EXPENSE" && tx.source === "PERSONAL") {
            if (userBalances[tx.userId]) {
                userBalances[tx.userId].personalSpends += tx.amount;
            }
            totalPersonalExpense += tx.amount;
        }

        if (tx.type === "PAYOUT" && tx.source === "KASA") {
            if (userBalances[tx.userId]) {
                userBalances[tx.userId].receivedPayouts += tx.amount;
            }
        }
    }

    // Calculate final net balance: (Spends out of pocket) - (Payouts received from Kasa)
    const userBalanceList = Object.values(userBalances).map(u => {
        u.balance = u.personalSpends - u.receivedPayouts;
        return u;
    }).filter(u => u.balance !== 0 || u.personalSpends > 0);

    const recentTransactionsData = await db.select({
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
        .orderBy(desc(transactions.date), desc(transactions.createdAt))
        .limit(5);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Kasa Card */}
                <div className="glass-card p-6 relative overflow-hidden group border-t-4 border-t-emerald-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full mix-blend-screen filter blur-[50px] group-hover:bg-emerald-500/20 transition-all duration-500"></div>
                    <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">Güncel Kasa</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">₺{kasaBalance.toLocaleString("tr-TR")}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5 text-sm text-gray-600 dark:text-gray-500 flex justify-between">
                        <span>Gelir: ₺{totalIncome.toLocaleString()}</span>
                        <span>Toplam Gider: ₺{(totalIncome - kasaBalance).toLocaleString()}</span>
                    </div>
                </div>

                {/* Personal Expenses Card */}
                <div className="glass-card p-6 relative overflow-hidden group border-t-4 border-t-purple-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full mix-blend-screen filter blur-[50px] group-hover:bg-purple-500/20 transition-all duration-500"></div>
                    <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-1 uppercase tracking-wider">Cepten Harcanan (Tüm Kişiler)</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">₺{totalPersonalExpense.toLocaleString("tr-TR")}</span>
                    </div>
                    <p className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5 text-sm text-gray-600 dark:text-gray-500">
                        Şirketin personelleri tarafından yapılan toplam kişisel harcama.
                    </p>
                </div>

                {/* Personel Bakiyeleri Card */}
                <div className="glass-card p-6 relative overflow-hidden group border-t-4 border-t-blue-500 lg:col-span-1 md:col-span-2">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full mix-blend-screen filter blur-[50px] transition-all duration-500"></div>
                    <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-4 uppercase tracking-wider">Kişilerin Güncel Bakiye Durumu</h3>

                    <div className="space-y-3 z-10 relative max-h-[140px] overflow-y-auto pr-2">
                        {userBalanceList.length === 0 ? (
                            <p className="text-sm text-gray-500">Henüz kimsenin alacak/verecek bakiyesi yok.</p>
                        ) : (
                            userBalanceList.map((u, i) => (
                                <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-white/5 p-2 rounded-lg">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</span>
                                    <span className={`text-sm font-bold ${u.balance > 0 ? 'text-emerald-600 dark:text-emerald-400' : u.balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500'}`}>
                                        {u.balance > 0 ? `+${u.balance.toLocaleString()} ₺ (Alacaklı)` : u.balance < 0 ? `${u.balance.toLocaleString()} ₺ (Borçlu/Avans)` : '0 ₺'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Son 5 İşlem</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400">
                                <th className="py-3 px-6 font-medium">Tarih</th>
                                <th className="py-3 px-6 font-medium">Kullanıcı</th>
                                <th className="py-3 px-6 font-medium">İşlem Türü</th>
                                <th className="py-3 px-6 font-medium">Açıklama</th>
                                <th className="py-3 px-6 font-medium text-right">Tutar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                            {recentTransactionsData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">Henüz hiçbir işlem bulunmamaktadır.</td>
                                </tr>
                            ) : (
                                recentTransactionsData.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 px-6 text-gray-900 dark:text-gray-300">
                                            {format(new Date(tx.date), "dd MMM yyyy", { locale: tr })}
                                        </td>
                                        <td className="py-4 px-6 text-gray-900 dark:text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-xs text-blue-700 dark:text-blue-300 font-bold">
                                                    {tx.userName?.charAt(0)}
                                                </div>
                                                {tx.userName}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {tx.type === "INCOME" && <span className="px-2 py-1 text-xs rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">Gelir</span>}
                                            {tx.type === "EXPENSE" && <span className="px-2 py-1 text-xs rounded-md bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">Gider ({tx.source})</span>}
                                            {tx.type === "PAYOUT" && <span className="px-2 py-1 text-xs rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">Kasa Çıkışı</span>}
                                            {tx.type === "TRANSFER" && <span className="px-2 py-1 text-xs rounded-md bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">Kasa Ödemesi</span>}
                                        </td>
                                        <td className="py-4 px-6 text-gray-900 dark:text-gray-300">{tx.description}</td>
                                        <td className={`py-4 px-6 text-right font-medium ${tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
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
