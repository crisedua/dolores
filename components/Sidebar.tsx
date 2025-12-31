'use client';
import {
    LayoutGrid,
    Folder,
    CheckSquare,
    Search,
    BarChart3,
    LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Sidebar() {
    const { user, signOut } = useAuth();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--sidebar-bg)] border-r border-[#333] flex flex-col p-4 z-50">
            {/* Brand */}
            <div className="flex items-center gap-2 mb-8 px-2">
                <div className="w-8 h-8 bg-white text-black font-bold flex items-center justify-center rounded-lg">
                    <BarChart3 size={20} />
                </div>
                <span className="font-bold text-lg text-white tracking-tight">Focus</span>
            </div>

            {/* Main Nav */}
            <div className="space-y-6 flex-1">

                {/* Section: Projects */}
                <div>
                    <h3 className="text-xs font-semibold text-[#666] uppercase mb-3 px-2">Discoveries</h3>
                    <nav className="space-y-1">
                        <NavItem icon={<LayoutGrid size={18} />} label="All Discoveries" active />
                        <NavItem icon={<Folder size={18} />} label="Saved Templates" />
                    </nav>
                </div>

                {/* Section: Tasks */}
                <div>
                    <h3 className="text-xs font-semibold text-[#666] uppercase mb-3 px-2">Analysis</h3>
                    <nav className="space-y-1">
                        <NavItem icon={<CheckSquare size={18} />} label="Recent Reports" badge="4" />
                        <NavItem icon={<Search size={18} />} label="Search History" />
                    </nav>
                </div>
            </div>

            {/* Footer / User */}
            <div className="pt-4 border-t border-[#333]">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer group relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
                    <div className="flex-1 w-full overflow-hidden">
                        <p className="text-sm font-medium text-white truncate" title={user?.email}>{user?.email || 'Guest User'}</p>
                        <p className="text-xs text-gray-500 mb-2">Free Plan</p>

                        {/* Credits Usage */}
                        <div className="pr-2">
                            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                <span>Credits Used</span>
                                <span>85%</span>
                            </div>
                            <div className="h-1 w-full bg-[#222] rounded-full overflow-hidden">
                                <div className="h-full w-[85%] bg-blue-500/80 rounded-full" />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => signOut()}
                        className="p-1.5 hover:bg-white/10 rounded-md text-gray-500 hover:text-white transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}

import { ReactNode } from 'react';

function NavItem({ icon, label, active = false, badge }: { icon: ReactNode, label: string, active?: boolean, badge?: string }) {
    return (
        <div className={`
      flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all
      ${active ? 'bg-[#333] text-white' : 'text-[#888] hover:text-white hover:bg-white/5'}
    `}>
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm font-medium">{label}</span>
            </div>
            {badge && (
                <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded-full">{badge}</span>
            )}
        </div>
    )
}
