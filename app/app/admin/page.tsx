'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Users, Crown, Search, Shield, RefreshCw, ChevronDown, Sparkles } from 'lucide-react';
import { PlanType } from '@/lib/plans';

interface User {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string;
    plan_type: PlanType;
    subscription_status: string;
    search_count: number;
    current_cycle_scans: number;
}

interface Stats {
    total_users: number;
    pro_users: number;
    advanced_users: number;
    free_users: number;
    total_searches_this_month: number;
}

const ADMIN_EMAILS = ['ed@eduardoescalante.com'];

import { useTranslation } from '@/context/LanguageContext';

export default function AdminPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const { t, language } = useTranslation();

    const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

    useEffect(() => {
        if (user && isAdmin) {
            fetchUsers();
        } else if (user && !isAdmin) {
            setError(t.admin.onlyAdmins);
            setIsLoading(false);
        }
    }, [user, isAdmin]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = () => setOpenDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) throw new Error('No session');

            const response = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data.users);
            setStats(data.stats);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetPlan = async (userId: string, email: string, planType: PlanType) => {
        setActionLoading(userId);
        setOpenDropdown(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) throw new Error('No session');

            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'set_plan',
                    userId,
                    email,
                    planType
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Action failed');
            }

            // Refresh users list
            await fetchUsers();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateStr: string) => {
        if (!dateStr) return t.admin.never;
        return new Date(dateStr).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPlanBadge = (planType: PlanType) => {
        switch (planType) {
            case 'advanced':
                return (
                    <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs font-medium">
                        <Sparkles size={12} />
                        ADVANCED
                    </span>
                );
            case 'pro':
                return (
                    <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs font-medium">
                        <Crown size={12} />
                        PRO
                    </span>
                );
            default:
                return (
                    <span className="text-gray-500 text-xs">
                        {language === 'es' ? 'Gratis' : 'Free'}
                    </span>
                );
        }
    };

    const getUsageDisplay = (u: User) => {
        if (u.plan_type === 'free') {
            return `${u.search_count}/1`;
        } else if (u.plan_type === 'pro') {
            return `${u.current_cycle_scans}/5`;
        } else if (u.plan_type === 'advanced') {
            return `${u.current_cycle_scans}/15`;
        }
        return `${u.search_count}`;
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="text-center">
                    <Shield size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">{t.admin.accessDenied}</h2>
                    <p className="text-gray-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Shield className="text-blue-500" />
                        {t.admin.title}
                    </h1>
                    <p className="text-gray-500 mt-1">{t.admin.description}</p>
                </div>
                <button
                    onClick={fetchUsers}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-[#222] hover:bg-[#333] text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    {t.admin.update}
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="text-blue-500" size={24} />
                            <span className="text-gray-400 text-sm">{t.admin.stats.totalUsers}</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.total_users}</p>
                    </div>
                    <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="text-purple-500" size={24} />
                            <span className="text-gray-400 text-sm">Advanced</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.advanced_users}</p>
                    </div>
                    <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Crown className="text-yellow-500" size={24} />
                            <span className="text-gray-400 text-sm">{t.admin.stats.proUsers}</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.pro_users}</p>
                    </div>
                    <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="text-gray-500" size={24} />
                            <span className="text-gray-400 text-sm">{t.admin.stats.freeUsers}</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.free_users}</p>
                    </div>
                    <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <Search className="text-green-500" size={24} />
                            <span className="text-gray-400 text-sm">{t.admin.stats.searchesThisMonth}</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.total_searches_this_month}</p>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder={t.admin.searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Users Table */}
            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-[#1A1A1A] border border-[#333] rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#333]">
                                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">{t.admin.table.email}</th>
                                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">{t.admin.table.plan}</th>
                                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">{t.admin.table.searches}</th>
                                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">{t.admin.table.registration}</th>
                                <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">{t.admin.table.lastAccess}</th>
                                <th className="text-right text-gray-400 text-sm font-medium px-6 py-4">{t.admin.table.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className="border-b border-[#222] hover:bg-[#222] transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-white font-medium">{u.email}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getPlanBadge(u.plan_type)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white">{getUsageDisplay(u)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        {formatDate(u.created_at)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        {formatDate(u.last_sign_in_at)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="relative inline-block">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenDropdown(openDropdown === u.id ? null : u.id);
                                                }}
                                                disabled={actionLoading === u.id}
                                                className="inline-flex items-center gap-2 bg-[#333] hover:bg-[#444] text-white px-3 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50"
                                            >
                                                {actionLoading === u.id ? (
                                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        {language === 'es' ? 'Cambiar Plan' : 'Change Plan'}
                                                        <ChevronDown size={14} />
                                                    </>
                                                )}
                                            </button>

                                            {/* Dropdown Menu */}
                                            {openDropdown === u.id && (
                                                <div
                                                    className="absolute right-0 mt-1 w-36 bg-[#2A2A2A] border border-[#444] rounded-lg shadow-xl z-50 overflow-hidden"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        onClick={() => handleSetPlan(u.id, u.email, 'free')}
                                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#333] transition-colors flex items-center gap-2 ${u.plan_type === 'free' ? 'text-green-400 bg-green-500/10' : 'text-gray-300'
                                                            }`}
                                                    >
                                                        <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                                                        Free
                                                    </button>
                                                    <button
                                                        onClick={() => handleSetPlan(u.id, u.email, 'pro')}
                                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#333] transition-colors flex items-center gap-2 ${u.plan_type === 'pro' ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-300'
                                                            }`}
                                                    >
                                                        <Crown size={14} className="text-yellow-500" />
                                                        Pro
                                                    </button>
                                                    <button
                                                        onClick={() => handleSetPlan(u.id, u.email, 'advanced')}
                                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[#333] transition-colors flex items-center gap-2 ${u.plan_type === 'advanced' ? 'text-purple-400 bg-purple-500/10' : 'text-gray-300'
                                                            }`}
                                                    >
                                                        <Sparkles size={14} className="text-purple-500" />
                                                        Advanced
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            {t.admin.noUsersFound}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
