'use client';
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, signOut } = useAuth();

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar - Visible only in Dashboard */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 ml-64 h-screen overflow-y-auto relative">
                {/* Header Bar */}
                <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-[#222] px-8 py-4">
                    <div className="flex items-center justify-end gap-4">
                        <span className="text-sm text-gray-400">{user?.email}</span>
                        <button
                            onClick={async () => {
                                try {
                                    console.log('Sign out clicked');
                                    await signOut();
                                } catch (error) {
                                    console.error('Sign out error:', error);
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <LogOut size={16} />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
