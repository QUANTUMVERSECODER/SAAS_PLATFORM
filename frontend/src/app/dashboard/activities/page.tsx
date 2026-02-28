'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Activity, Clock, AlertCircle } from 'lucide-react';

interface ActivityLog {
    id: number;
    action: string;
    details: string;
    timestamp: string;
    user_id: number;
}

export default function ActivitiesPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/activities/');
                setLogs(res.data);
            } catch (err: any) {
                setError('Failed to load activity logs.');
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Activity size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="text-gray-500">Track all actions and events across your company.</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
                <div className="p-6 border-b border-gray-200 font-medium text-gray-900 bg-gray-50/50 flex items-center justify-between">
                    <span>Recent Activity</span>
                    <span className="text-xs font-normal text-gray-500 bg-white px-2.5 py-1 border border-gray-200 rounded-full shadow-sm">
                        Last 50 events
                    </span>
                </div>

                <div className="divide-y divide-gray-100">
                    {logs.map((log) => (
                        <div key={log.id} className="p-5 hover:bg-gray-50/50 transition-colors flex items-start gap-4">
                            <div className="mt-1 flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                                    <Clock size={16} />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4 mb-1">
                                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                                        {log.action.replace(/_/g, ' ')}
                                    </h4>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 break-words">
                                    {log.details || 'No additional details provided.'}
                                </p>
                                <div className="mt-2 text-xs text-gray-400">
                                    User ID: {log.user_id}
                                </div>
                            </div>
                        </div>
                    ))}

                    {logs.length === 0 && !error && (
                        <div className="p-12 text-center text-gray-500">
                            <Activity size={32} className="mx-auto mb-3 opacity-20" />
                            <p>No activity logs found for your company.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
