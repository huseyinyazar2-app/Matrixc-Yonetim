"use client";

import { useActionState, useRef } from "react";
import { addTodo } from "./actions";
import { AlertCircle, Plus, AlertTriangle, AlertOctagon, Flag } from "lucide-react";

export default function TodoForm() {
    const [state, formAction, isPending] = useActionState(addTodo, null);
    const formRef = useRef<HTMLFormElement>(null);

    return (
        <form
            ref={formRef}
            action={async (formData) => {
                await formAction(formData);
                if (!state?.error) {
                    formRef.current?.reset();
                }
            }}
            className="space-y-4"
        >
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Görev Adı</label>
                    <input
                        type="text"
                        name="task"
                        required
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        placeholder="Örn: Aylık raporu hazırla"
                    />
                </div>

                <div className="w-full md:w-48 space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Aciliyet</label>
                    <div className="relative">
                        <select
                            name="urgency"
                            required
                            defaultValue="NORMAL"
                            className="w-full bg-[#111827] border border-white/10 rounded-xl py-2.5 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
                        >
                            <option value="NORMAL">🟢 Normal</option>
                            <option value="ACİL">🟠 Acil</option>
                            <option value="ÇOK ACİL">🔴 Çok Acil</option>
                        </select>
                        <Flag className="w-4 h-4 text-gray-500 absolute left-3 top-3 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
                <div className="flex-1">
                    {state?.error && (
                        <div className="inline-flex items-center gap-2 p-2 px-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            <p className="text-sm">{state.error}</p>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-medium rounded-xl flex items-center gap-2 transition-all disabled:opacity-70 disabled:pointer-events-none shadow-lg shadow-indigo-500/20"
                >
                    <Plus className="w-5 h-5" />
                    {isPending ? "Ekleniyor..." : "Görev Ekle"}
                </button>
            </div>
        </form>
    );
}
