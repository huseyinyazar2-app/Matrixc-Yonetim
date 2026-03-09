"use client";

import { useActionState, useRef } from "react";
import { addIncome, addOutflow } from "./actions";
import { CheckCircle2, AlertCircle, Wallet, ArrowDownCircle, ArrowUpRight } from "lucide-react";
import { useFormStatus } from "react-dom";

function IncomeSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:pointer-events-none"
        >
            {pending ? <ArrowDownCircle className="w-5 h-5 animate-pulse" /> : <ArrowDownCircle className="w-5 h-5" />}
            {pending ? "İşleniyor..." : "Kasaya Gelir Ekle"}
        </button>
    );
}

function OutflowSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:pointer-events-none"
        >
            {pending ? <ArrowUpRight className="w-5 h-5 animate-pulse" /> : <ArrowUpRight className="w-5 h-5" />}
            {pending ? "İşleniyor..." : "Kasadan Çıkış Yap"}
        </button>
    );
}

type ActionState = { error?: string; success?: string | boolean };
const initialState: ActionState = { error: undefined, success: undefined };

export default function KasaForms() {
    const [incomeState, incomeAction] = useActionState(addIncome, initialState);
    const [outflowState, outflowAction] = useActionState(addOutflow, initialState);

    const incomeRef = useRef<HTMLFormElement>(null);
    const outflowRef = useRef<HTMLFormElement>(null);

    if (incomeState && 'success' in incomeState && incomeState.success && incomeRef.current) incomeRef.current.reset();
    if (outflowState && 'success' in outflowState && outflowState.success && outflowRef.current) outflowRef.current.reset();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GELİR EKLEME FORMU */}
            <div className="glass-card p-6 border-t-4 border-t-emerald-500">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                        <Wallet className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Kasaya Para Ekle (Gelir)</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Şirket kasasına giren fonları buradan kaydedin.</p>
                    </div>
                </div>

                <form action={incomeAction} ref={incomeRef} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gelir Tutarı (₺)</label>
                        <input
                            type="number"
                            step="0.01" min="0.01"
                            name="amount" required
                            className="w-full bg-white/50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            placeholder="Örn: 50000"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Açıklama / Nereden Geldi?</label>
                        <input
                            type="text"
                            name="description" required
                            className="w-full bg-white/50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                            placeholder="Örn: Müşteri A Proje"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tarih</label>
                        <input
                            type="date"
                            name="date" required
                            defaultValue={new Date().toISOString().split("T")[0]}
                            className="w-full bg-white/50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>

                    <div className="pt-2">
                        {incomeState?.error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 dark:text-red-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{incomeState.error}</p>
                            </div>
                        )}
                        {incomeState?.success && (
                            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{incomeState.success}</p>
                            </div>
                        )}
                        <IncomeSubmitButton />
                    </div>
                </form>
            </div>

            {/* PARA ÇIKIŞ FORMU */}
            <div className="glass-card p-6 border-t-4 border-t-rose-500">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center border border-rose-500/30">
                        <ArrowUpRight className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Kasadan Para Çıkışı</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Personele Borç İadesi veya Kâr Payı</p>
                    </div>
                </div>

                <form action={outflowAction} ref={outflowRef} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Çıkış Tutarı (₺)</label>
                            <input
                                type="number"
                                step="0.01" min="0.01"
                                name="amount" required
                                className="w-full bg-white/50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">İşlem Türü</label>
                            <select
                                name="outflowType" required
                                className="w-full bg-white/50 dark:bg-[#111827] border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 appearance-none"
                            >
                                <option value="BORC_IADESI">Borç İadesi (Personele)</option>
                                <option value="KAR_PAYI">Kâr Payı / Avans</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kime Verildi / Açıklama</label>
                        <input
                            type="text"
                            name="description" required
                            className="w-full bg-white/50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                            placeholder="Örn: Ahmet (Geçen haftaki harcama iadesi)"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tarih</label>
                        <input
                            type="date"
                            name="date" required
                            defaultValue={new Date().toISOString().split("T")[0]}
                            className="w-full bg-white/50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                        />
                    </div>

                    <div className="pt-2">
                        {outflowState?.error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 dark:text-red-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{outflowState.error}</p>
                            </div>
                        )}
                        {outflowState?.success && (
                            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{outflowState.success}</p>
                            </div>
                        )}
                        <OutflowSubmitButton />
                    </div>
                </form>
            </div>
        </div>
    );
}
