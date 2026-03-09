"use client";

import { useActionState, useRef } from "react";
import { addExpense } from "./actions";
import { CheckCircle2, AlertCircle, Receipt, Plus } from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:pointer-events-none"
        >
            <Plus className="w-5 h-5" />
            {pending ? "Ekleniyor..." : "Harcamayı Kaydet"}
        </button>
    );
}

type ActionState = { error?: string; success?: string | boolean };
const initialState: ActionState = { error: undefined, success: undefined };

export default function ExpensesForm() {
    const [state, formAction] = useActionState(addExpense, initialState);
    const formRef = useRef<HTMLFormElement>(null);

    if (state.success && formRef.current) {
        formRef.current.reset();
    }

    return (
        <div className="glass-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                    <Receipt className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Yeni Harcama Ekle</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Yaptığınız harcamaları buraya girerek kaydedebilirsiniz. Sisteme sizin isminizle kaydedilir.</p>
                </div>
            </div>

            <form action={formAction} ref={formRef} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tutar (₺)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            name="amount"
                            required
                            className="w-full bg-white/50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Açıklama / Nereye Harcandı?</label>
                        <input
                            type="text"
                            name="description"
                            required
                            className="w-full bg-white/50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            placeholder="Örn: Ofis Kırtasiye"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tarih</label>
                        <input
                            type="date"
                            name="date"
                            required
                            defaultValue={new Date().toISOString().split("T")[0]}
                            className="w-full bg-white/50 dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ödeme Kaynağı</label>
                        <select
                            name="source"
                            required
                            className="w-full bg-white/50 dark:bg-[#111827] border border-gray-300 dark:border-white/10 rounded-xl py-2.5 px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                        >
                            <option value="KASA">Şirket Kasasından</option>
                            <option value="PERSONAL">Kendi Cebimden</option>
                        </select>
                    </div>
                </div>

                <div className="pt-2">
                    {state?.error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 dark:text-red-400">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{state.error}</p>
                        </div>
                    )}
                    {state?.success && (
                        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm">{state.success}</p>
                        </div>
                    )}

                    <SubmitButton />
                </div>
            </form>
        </div>
    );
}
