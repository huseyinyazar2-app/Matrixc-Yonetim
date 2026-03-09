import { db } from "@/db";
import { users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserPlus, Key, ShieldAlert } from "lucide-react";
import UsersForm from "./UsersForm";

export default async function UsersPage() {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
        redirect("/");
    }

    const allUsers = await db.query.users.findMany({
        orderBy: (users, { asc }) => [asc(users.createdAt)]
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-rose-500" />
                        Personel ve Yetkilendirme
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Sisteme yeni kişiler ekleyin veya şifreleri yönetin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <UsersForm />
                </div>

                <div className="lg:col-span-2">
                    <div className="glass-card overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
                            <h3 className="font-semibold flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-purple-500" />
                                Mevcut Kullanıcılar
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-200 dark:divide-gray-800">
                            {allUsers.map((user) => (
                                <div key={user.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === 'ADMIN' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'}`}>
                                                {user.role === 'ADMIN' ? 'Yönetici' : 'Personel'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                                    </div>

                                    <div className="flex items-center gap-3 bg-gray-100 dark:bg-black/40 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800">
                                        <Key className="w-4 h-4 text-gray-400" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Şifre (Açık Metin)</span>
                                            <span className="font-mono text-sm text-gray-900 dark:text-rose-400">{user.password}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
