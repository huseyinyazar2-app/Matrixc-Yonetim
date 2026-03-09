"use client";

import { useActionState, useRef } from "react";
import { addUser } from "./actions";
import { UserPlus, Loader2, Key } from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all"
        >
            {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            {pending ? "Ekleniyor..." : "Personel Ekle"}
        </button>
    );
}

type ActionState = { error?: string; success?: string | boolean };
const initialState: ActionState = { error: undefined, success: undefined };

export default function UsersForm() {
    const [state, formAction] = useActionState(addUser, initialState);
    const formRef = useRef<HTMLFormElement>(null);

    if (state.success && formRef.current) {
        formRef.current.reset();
    }

    return (
        <div className="glass-card p-6 border-t-4 border-t-purple-500">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-purple-400" />
                    Yeni Personel Ekle
                </h3>
            </div>

            <form ref={formRef} action={formAction} className="space-y-4">
                {state.error && (
                    <div className="bg-rose-500/10 border border-rose-500 text-rose-500 text-sm p-3 rounded-xl flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        {state.error}
                    </div>
                )}

                {state.success && (
                    <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-500 text-sm p-3 rounded-xl flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Personel başarıyla sisteme eklendi!
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">İsim Soyisim</label>
                    <input
                        type="text"
                        name="name"
                        required
                        className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-white/10 px-4 py-2 bg-white/50 dark:bg-black/50 text-gray-900 dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        placeholder="Örn: Ahmet Yılmaz"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Kullanıcı Adı</label>
                    <input
                        type="text"
                        name="username"
                        required
                        className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-white/10 px-4 py-2 bg-white/50 dark:bg-black/50 text-gray-900 dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        placeholder="Örn: ahmety"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Şifre (Açık Metin)</label>
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Key className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="password"
                            required
                            className="block w-full pl-10 rounded-xl border border-gray-300 dark:border-white/10 px-4 py-2 bg-white/50 dark:bg-black/50 text-gray-900 dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                            placeholder="Giriş Şifresi"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Yetki Rolü</label>
                    <select
                        name="role"
                        className="mt-1 block w-full rounded-xl border border-gray-300 dark:border-white/10 px-4 py-2 bg-white/50 dark:bg-black/50 text-gray-900 dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        defaultValue="USER"
                    >
                        <option value="USER">Personel (Sadece Harcama/Görev Görebilir)</option>
                        <option value="ADMIN">Yönetici (Tüm Sistemi Görebilir)</option>
                    </select>
                </div>

                <div className="pt-2">
                    <SubmitButton />
                </div>
            </form>
        </div>
    );
}
