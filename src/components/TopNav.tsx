"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Wallet, CheckSquare, BarChart3, LogOut, Menu, X } from "lucide-react";
import useSWR from "swr";
import { useState } from "react";
import { logout } from "@/app/login/actions";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function TopNav() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Poll every 5 seconds for real-time feel
    const { data } = useSWR("/api/todos/count", fetcher, {
        refreshInterval: 5000,
        revalidateOnFocus: true
    });

    const todoCount = data?.count || 0;

    const links = [
        { href: "/", label: "Panel", icon: LayoutDashboard },
        { href: "/expenses", label: "Harcamalar", icon: Receipt },
        { href: "/kasa", label: "Kasa", icon: Wallet },
        { href: "/todos", label: "Yapılacaklar", icon: CheckSquare, badge: todoCount },
        { href: "/reports", label: "Raporlar", icon: BarChart3 },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full glass border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <span className="text-white font-bold text-lg leading-none">M</span>
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight hidden sm:block">Matrixc</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-1">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2
                    ${isActive ? "text-white bg-white/10 shadow-inner" : "text-gray-400 hover:text-white hover:bg-white/5"}
                  `}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : ""}`} />
                                    {link.label}
                                    {link.badge !== undefined && link.badge > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-gray-950 animate-pulse">
                                            {link.badge > 99 ? '99+' : link.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}

                        <div className="w-px h-6 bg-white/10 mx-3"></div>

                        <button
                            onClick={() => logout()}
                            className="px-3 py-2 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Çıkış
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-colors"
                        >
                            <span className="sr-only">Menüyü aç/kapat</span>
                            {mobileMenuOpen ? (
                                <X className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden glass absolute top-[65px] left-0 w-full border-b border-white/10 shadow-2xl">
                    <div className="px-3 pt-3 pb-4 space-y-1">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-base font-medium transition-all
                    ${isActive ? "text-white bg-white/10" : "text-gray-400 hover:text-white hover:bg-white/5"}
                  `}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`w-5 h-5 ${isActive ? "text-purple-400" : ""}`} />
                                        {link.label}
                                    </div>
                                    {link.badge !== undefined && link.badge > 0 && (
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow-sm">
                                            {link.badge > 99 ? '99+' : link.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                        <div className="pt-2">
                            <button
                                onClick={() => { setMobileMenuOpen(false); logout(); }}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-left"
                            >
                                <LogOut className="w-5 h-5" />
                                Çıkış Yap
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
