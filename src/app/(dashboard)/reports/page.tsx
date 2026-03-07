import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { BarChart3, Users, Receipt, ArrowRightLeft } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default async function ReportsPage() {
    const allUsers = await db.query.users.findMany();

    // Rapor hesaplamaları
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
        .orderBy(desc(transactions.date));

    // Her kullanıcının kendi cebinden harcadığı (PERSONAL EXPENSE)
    // Ve kasanın kullanıcıya geri ödediği (TRANSFER)
    const userBalances = allUsers.map(user => {
        const userExpenses = allTransactions.filter(t => t.userId === user.id && t.type === "EXPENSE" && t.source === "PERSONAL");
        const userTransfers = allTransactions.filter(t => t.userId === user.id && t.type === "TRANSFER");

        const totalSpent = userExpenses.reduce((acc, t) => acc + t.amount, 0);
        const totalReceived = userTransfers.reduce((acc, t) => acc + t.amount, 0);

        return {
            user,
            totalSpent,
            totalReceived,
            debtRemaining: totalSpent - totalReceived, // Şirketin çalışana olan borcu
        };
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Finansal Raporlar</h2>
                    <p className="text-sm text-gray-400">Şirket borçları, harcama özetleri ve tam işlem geçmişi.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBalances.map(({ user, totalSpent, totalReceived, debtRemaining }) => (
                    <div key={user.id} className="glass-card overflow-hidden">
                        <div className="p-5 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg font-bold text-white">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">{user.name}</h3>
                                    <p className="text-xs text-gray-400 capitalize">{user.role === 'ADMIN' ? 'Yönetici' : 'Personel'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 flex items-center gap-2"><Receipt className="w-4 h-4" /> Cep Harcaması:</span>
                                <span className="font-medium text-white">₺{totalSpent.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400 flex items-center gap-2"><ArrowRightLeft className="w-4 h-4" /> Ödenen (Kasadan):</span>
                                <span className="font-medium text-white">₺{totalReceived.toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Şirketin Borcu:</span>
                                <span className={`text-xl font-bold ${debtRemaining > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                                    ₺{debtRemaining.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card overflow-hidden mt-8">
                <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-gray-400" />
                        Tüm İşlem Geçmişi
                    </h3>
                    {/* Gelecekte filtreleme eklenebilir. Basitlik adına şimdilik hepsi gösteriliyor. */}
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
                            {allTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">Henüz hiçbir işlem bulunmamaktadır.</td>
                                </tr>
                            ) : (
                                allTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 px-6 text-gray-300">
                                            {format(new Date(tx.date), "dd MMM yyyy", { locale: tr })}
                                        </td>
                                        <td className="py-4 px-6 text-gray-300 font-medium">
                                            {tx.userName}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col gap-1">
                                                {tx.type === "INCOME" && <span className="px-2 py-1 w-max text-[10px] uppercase font-bold rounded bg-emerald-500/20 text-emerald-400">💵 Gelir</span>}
                                                {tx.type === "EXPENSE" && <span className="px-2 py-1 w-max text-[10px] uppercase font-bold rounded bg-rose-500/20 text-rose-400">📉 Gider</span>}
                                                {tx.type === "TRANSFER" && <span className="px-2 py-1 w-max text-[10px] uppercase font-bold rounded bg-purple-500/20 text-purple-400">🔄 Personel Ödemesi</span>}

                                                {tx.type === "EXPENSE" && (
                                                    <span className="text-[10px] text-gray-500 font-semibold uppercase">{tx.source === 'KASA' ? 'Kasa Ödedi' : 'Kendisi Ödedi'}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-300 whitespace-normal min-w-[200px]">{tx.description}</td>
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
