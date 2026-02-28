'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAppStore } from '@/store/useAppStore';
import { Users, Activity, Building, Zap } from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAppStore();
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await api.get('/dashboard/metrics');
                setMetrics(res.data);
            } catch (err) {
                console.error('Failed to load metrics', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-200 rounded w-3/4"></div></div></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Platform Overview</h1>
                <p className="text-gray-500 mt-1">Welcome back, {user?.email}. Here's what's happening at {metrics?.company_name || 'your company'}.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-500">Total Users</h3>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={20} /></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{metrics?.total_users || 0}</div>
                    <div className="mt-2 text-sm text-green-600 flex items-center gap-1">+2 this week</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-500">Company Status</h3>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Building size={20} /></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 capitalize">{metrics?.company_status || 'Unknown'}</div>
                    <div className="mt-2 text-sm text-gray-500">Based on your subscription</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-500">Pending Invites</h3>
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Activity size={20} /></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">0</div>
                    <div className="mt-2 text-sm text-gray-500">All users accepted</div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-500">AI Tokens</h3>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Zap size={20} /></div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">95%</div>
                    <div className="mt-2 text-sm text-emerald-600">Available this month</div>
                </div>
            </div>

            {/* Additional UI elements as needed for dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-96 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                        <Activity size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Activity Chart Visualization Area</p>
                        <p className="text-sm">Connect to a charting library (Recharts) here</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Recent Audit Logs</h3>
                    <div className="space-y-4">
                        <div className="py-2 border-b border-gray-50">
                            <p className="text-sm font-medium">Logged In</p>
                            <p className="text-xs text-gray-500">Just now</p>
                        </div>
                        <div className="py-2 border-b border-gray-50">
                            <p className="text-sm font-medium">Updated Profile</p>
                            <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                        <div className="py-2">
                            <p className="text-sm font-medium">Joined Workspace</p>
                            <p className="text-xs text-gray-500">Yesterday</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
