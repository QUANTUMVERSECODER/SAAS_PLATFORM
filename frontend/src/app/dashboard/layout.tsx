'use client';

import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, setUser } = useAppStore();
    const router = useRouter();
    const [loading, setLoading] = useState(!user);

    useEffect(() => {
        const checkAuth = async () => {
            if (!user) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                } catch {
                    router.push('/login');
                    return;
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, [user, router, setUser]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
