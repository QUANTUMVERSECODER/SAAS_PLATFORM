'use client';

import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { LogOut, Home, Users, Building, Activity, Bot } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
    const { user, logout } = useAppStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!user) return null;

    return (
        <div className="w-64 h-screen bg-gray-900 text-white flex flex-col">
            <div className="p-6 text-2xl font-bold border-b border-gray-800">
                SaaS Platform
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded hover:bg-gray-800 transition-colors">
                    <Home size={20} /> Dashboard
                </Link>

                {user.role === 'COMPANY_ADMIN' && (
                    <>
                        <Link href="/dashboard/company" className="flex items-center gap-3 p-3 rounded hover:bg-gray-800 transition-colors">
                            <Building size={20} /> Company Settings
                        </Link>
                        <Link href="/dashboard/employees" className="flex items-center gap-3 p-3 rounded hover:bg-gray-800 transition-colors">
                            <Users size={20} /> Employees
                        </Link>
                    </>
                )}

                <Link href="/dashboard/activities" className="flex items-center gap-3 p-3 rounded hover:bg-gray-800 transition-colors">
                    <Activity size={20} /> Audit Logs
                </Link>
                <Link href="/dashboard/ai" className="flex items-center gap-3 p-3 rounded hover:bg-gray-800 transition-colors text-purple-400">
                    <Bot size={20} /> AI Insights
                </Link>
            </nav>

            <div className="p-4 border-t border-gray-800">
                <div className="mb-4 truncate text-sm text-gray-400">{user.email}</div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full p-2 bg-red-600/20 text-red-500 rounded hover:bg-red-600 hover:text-white transition-colors"
                >
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </div>
    );
}
