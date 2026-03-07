"use client";

import { useActionState } from "react";
import { addIncome } from "./actions";
import { CheckCircle2, AlertCircle, Wallet, ArrowDownCircle } from "lucide-react";

export default function KasaPage() {
    const [state, formAction, isPending] = useActionState(addIncome, null);

    return (
        <div className="space-y-6">
            <div className="glass-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                        <Wallet className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Kasaya Para Ekle (Gelir)</h2>
                        <p className="text-sm text-gray-400">Şirket kasasına giren kazançları veya fonları buradan kaydedebilirsiniz. Sadece Yöneticiler işlem yapabilir.</p>
                    </div>
                </div>

                <form action={formAction} className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gelir Tutarı (₺)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                name="amount"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                placeholder="Örn: 50000"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Açıklama / Nereden Geldi?</label>
                            <input
                                type="text"
                                name="description"
                                required
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                placeholder="Örn: Müşteri A Proje Peşinatı"
                            />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tarih</label>
                            <input
                                type="date"
                                name="date"
                                required
                                defaultValue={new Date().toISOString().split("T")[0]}
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        {state?.error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{state.error}</p>
                            </div>
                        )}
                        {state?.success && (
                            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400">
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{state.success}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:pointer-events-none"
                        >
                            <ArrowDownCircle className="w-5 h-5" />
                            {isPending ? "Ekleniyor..." : "Kasaya Gelir Ekle"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
