import TopNav from "@/components/TopNav";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden text-gray-900 dark:text-white transition-colors duration-300">
            <TopNav role={session?.role} />
            {/* Background blobs for the whole app */}
            <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-900/20 rounded-full mix-blend-screen filter blur-[150px] opacity-50 pointer-events-none"></div>
            <div className="fixed bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-900/20 rounded-full mix-blend-screen filter blur-[150px] opacity-50 pointer-events-none"></div>

            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 relative z-10 animate-fade-in">
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Hoş Geldiniz,</p>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{session?.name || "Kullanıcı"}</h1>
                    </div>
                    <div className="flex items-center">
                        <div className="text-xs font-semibold px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg shadow-sm">
                            Yetki: {session?.role === "ADMIN" ? "Yönetici" : "Personel"}
                        </div>
                    </div>
                </div>
                {children}
            </main>
        </div>
    );
}
