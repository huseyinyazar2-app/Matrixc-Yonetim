"use client";

import { useState } from "react";
import { BarChart3, Receipt, ArrowRightLeft, Printer, Filter, Calendar } from "lucide-react";
import { format, subDays, startOfMonth, startOfYear, isAfter, isBefore } from "date-fns";
import { tr } from "date-fns/locale";

type UserType = {
    id: string;
    name: string;
    role: string;
};

type TransactionType = {
    id: string;
    type: "INCOME" | "EXPENSE" | "TRANSFER" | "PAYOUT";
    amount: number;
    source: "KASA" | "PERSONAL";
    date: Date;
    description: string;
    userId: string | null;
    userName: string | null;
};

export default function ReportsClient({
    users,
    initialTransactions
}: {
    users: UserType[];
    initialTransactions: TransactionType[];
}) {
    const [selectedUserId, setSelectedUserId] = useState<string>("ALL");
    const [dateFilter, setDateFilter] = useState<string>("ALL"); // ALL, THIS_MONTH, LAST_30, THIS_YEAR

    // Apply Filters
    const filteredTransactions = initialTransactions.filter(tx => {
        // User Filter
        if (selectedUserId !== "ALL" && tx.userId !== selectedUserId) {
            return false;
        }

        // Date Filter
        const txDate = new Date(tx.date);
        const now = new Date();

        if (dateFilter === "THIS_MONTH") {
            if (isBefore(txDate, startOfMonth(now))) return false;
        } else if (dateFilter === "LAST_30") {
            if (isBefore(txDate, subDays(now, 30))) return false;
        } else if (dateFilter === "THIS_YEAR") {
            if (isBefore(txDate, startOfYear(now))) return false;
        }

        return true;
    });

    // Calculate Balances after filtering
    // Her kullanıcının kendi cebinden harcadığı (PERSONAL EXPENSE) ve kasanın ona verdiği (PAYOUT/TRANSFER)
    const userBalances = users.map(user => {
        const userExpenses = filteredTransactions.filter(t => t.userId === user.id && t.type === "EXPENSE" && t.source === "PERSONAL");
        const userPayouts = filteredTransactions.filter(t => t.userId === user.id && (t.type === "PAYOUT" || t.type === "TRANSFER"));

        const totalSpent = userExpenses.reduce((acc, t) => acc + t.amount, 0);
        const totalReceived = userPayouts.reduce((acc, t) => acc + t.amount, 0);

        return {
            user,
            totalSpent,
            totalReceived,
            debtRemaining: totalSpent - totalReceived, // Şirketin çalışana olan borcu
        };
    }).filter(ub => selectedUserId === "ALL" || ub.user.id === selectedUserId);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                        <BarChart3 className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Finansal Raporlar</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Şirket borçları, harcama özetleri ve tam işlem geçmişi.</p>
                    </div>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-xl hover:bg-gray-50 dark:hover:bg-white/20 transition-all text-gray-700 dark:text-white font-medium shadow-sm"
                >
                    <Printer className="w-4 h-4" />
                    Yazdır / PDF Al
                </button>
            </div>

            {/* Print Header (Visible only on print) */}
            <div className="hidden print:block mb-8">
                <h1 className="text-3xl font-bold text-black border-b-2 border-black pb-2">Matrixc Yönetim - Finansal Rapor</h1>
                <p className="mt-2 text-sm text-gray-600">Oluşturulma Tarihi: {format(new Date(), "dd MMMM yyyy HH:mm", { locale: tr })}</p>
                <p className="text-sm text-gray-600">
                    Filtre: {dateFilter === 'ALL' ? 'Tüm Zamanlar' : dateFilter === 'THIS_MONTH' ? 'Bu Ay' : dateFilter === 'LAST_30' ? 'Son 30 Gün' : 'Bu Yıl'}
                </p>
            </div>

            {/* FILTERS */}
            <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 print:hidden border-t-2 border-t-purple-500">
                <div className="flex items-center gap-2 flex-1">
                    <Filter className="w-4 h-4 text-purple-500" />
                    <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg py-2 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="ALL">Tüm Personeller</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 flex-1">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg py-2 px-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="ALL">Tüm Zamanlar</option>
                        <option value="THIS_MONTH">Bu Ay</option>
                        <option value="LAST_30">Son 30 Gün</option>
                        <option value="THIS_YEAR">Bu Yıl</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-2">
                {userBalances.map(({ user, totalSpent, totalReceived, debtRemaining }) => (
                    <div key={user.id} className="glass-card overflow-hidden print:border print:border-gray-300 print:shadow-none bg-white dark:bg-[#111827]">
                        <div className="p-5 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg font-bold text-white print:bg-gray-200 print:text-black print:from-gray-200 print:to-gray-200">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white print:text-black">{user.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role === 'ADMIN' ? 'Yönetici' : 'Personel'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2 print:text-black"><Receipt className="w-4 h-4" /> Cep Harcaması:</span>
                                <span className="font-medium text-gray-900 dark:text-white print:text-black">₺{totalSpent.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2 print:text-black"><ArrowRightLeft className="w-4 h-4" /> Ödenen (Kasa):</span>
                                <span className="font-medium text-gray-900 dark:text-white print:text-black">₺{totalReceived.toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-end">
                                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 print:text-black">Şirketin Borcu:</span>
                                <span className={`text-xl font-bold ${debtRemaining > 0 ? "text-rose-600 dark:text-rose-400 print:text-black" : "text-emerald-600 dark:text-emerald-400 print:text-black"}`}>
                                    ₺{debtRemaining.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                {userBalances.length === 0 && (
                    <div className="col-span-full p-8 text-center text-gray-500">Bu filtrelere uygun personel kaydı bulunamadı.</div>
                )}
            </div>

            <div className="glass-card overflow-hidden mt-8 print:shadow-none print:border-none bg-white dark:bg-[#111827]">
                <div className="p-6 border-b border-gray-100 dark:border-white/5 print:border-black print:px-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg flex items-center gap-2 print:text-black">
                        <Receipt className="w-5 h-5 text-gray-500 dark:text-gray-400 print:hidden" />
                        İşlem Geçmişi ({filteredTransactions.length} kayıt)
                    </h3>
                </div>

                <div className="overflow-x-auto print:overflow-visible">
                    <table className="w-full text-left text-sm whitespace-nowrap print:text-xs">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 print:bg-white print:text-black print:border-black">
                                <th className="py-3 px-6 print:px-2 font-medium">Tarih</th>
                                <th className="py-3 px-6 print:px-2 font-medium">Kullanıcı</th>
                                <th className="py-3 px-6 print:px-2 font-medium">İşlem Türü</th>
                                <th className="py-3 px-6 print:px-2 font-medium">Açıklama</th>
                                <th className="py-3 px-6 print:px-2 font-medium text-right">Tutar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5 print:divide-gray-300">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">Bu filtrelere uygun işlem bulunamadı.</td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors print:hover:bg-white">
                                        <td className="py-4 px-6 print:px-2 text-gray-900 dark:text-gray-300 print:text-black">
                                            {format(new Date(tx.date), "dd MMM yyyy", { locale: tr })}
                                        </td>
                                        <td className="py-4 px-6 print:px-2 text-gray-900 dark:text-gray-300 font-medium print:text-black">
                                            {tx.userName || "-"}
                                        </td>
                                        <td className="py-4 px-6 print:px-2">
                                            <div className="flex flex-col gap-1">
                                                {tx.type === "INCOME" && <span className="px-2 py-1 w-max text-[10px] uppercase font-bold rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 print:bg-transparent print:text-black print:border print:border-black">Gelir</span>}
                                                {tx.type === "EXPENSE" && <span className="px-2 py-1 w-max text-[10px] uppercase font-bold rounded bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 print:bg-transparent print:text-black print:border print:border-black">Gider</span>}
                                                {tx.type === "PAYOUT" && <span className="px-2 py-1 w-max text-[10px] uppercase font-bold rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 print:bg-transparent print:text-black print:border print:border-black">Kasa Çıkışı</span>}
                                                {tx.type === "TRANSFER" && <span className="px-2 py-1 w-max text-[10px] uppercase font-bold rounded bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 print:bg-transparent print:text-black print:border print:border-black">Ödeme</span>}

                                                {tx.type === "EXPENSE" && (
                                                    <span className="text-[10px] text-gray-500 font-semibold uppercase print:text-gray-600">{tx.source === 'KASA' ? 'Kasa Ödedi' : 'Cebinden Ödedi'}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 print:px-2 text-gray-900 dark:text-gray-300 whitespace-normal min-w-[200px] print:text-black">{tx.description}</td>
                                        <td className={`py-4 px-6 print:px-2 text-right font-medium print:text-black ${tx.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
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
