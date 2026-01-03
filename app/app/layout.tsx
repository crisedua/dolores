'use client';
import { useState } from 'react';
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Menu } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, signOut } = useAuth();
    const { t } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar - Visible only in Dashboard */}
            <Sidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Main Content */}
            <main className="flex-1 md:ml-64 h-screen overflow-y-auto relative transisiton-all duration-300">
                {/* Header Bar */}
                <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-[#222] px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between md:justify-end gap-4">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden text-gray-400 hover:text-white transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400 hidden sm:inline-block">{user?.email}</span>
                            <button
                                onClick={async () => {
                                    try {
                                        console.log('Sign out clicked');
                                        await signOut();
                                    } catch (error) {
                                        console.error('Sign out error:', error);
                                    }
                                }}
                                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <LogOut size={16} />
                                <span className="hidden sm:inline">{t.sidebar.logout}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
