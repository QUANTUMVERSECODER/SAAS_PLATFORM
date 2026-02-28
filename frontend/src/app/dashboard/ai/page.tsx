'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Bot, TrendingUp, Zap, BarChart, AlertCircle } from 'lucide-react';

interface AIInsights {
    company_id: number;
    insights: string[];
    productivity_score: number;
    generated_at: string;
}

export default function AIInsightsPage() {
    const [data, setData] = useState<AIInsights | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const res = await api.get('/ai/insights');
                setData(res.data);
            } catch (err: any) {
                setError(err.response?.data?.detail || 'Failed to generate AI insights.');
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col h-full items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-purple-600 font-medium animate-pulse">Generating your custom AI insights...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto mt-8">
                <div className="p-6 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-4 shadow-sm">
                    <AlertCircle size={24} className="mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Could not generate insights</h3>
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    // Helper to determine score color
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const scoreStyle = getScoreColor(data.productivity_score);

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-lg shadow-md">
                        <Bot size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">AI Productivity Insights</h1>
                        <p className="text-gray-500">Intelligent analysis of your team's workflow and efficiency.</p>
                    </div>
                </div>

                <div className="text-sm text-gray-500 flex flex-col items-end">
                    <span className="font-medium">Last generated</span>
                    <span>{data.generated_at ? new Date(data.generated_at).toLocaleString() : 'N/A'}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Score Card */}
                <div className={`col-span-1 p-6 rounded-2xl border ${scoreStyle} flex flex-col items-center justify-center text-center shadow-sm transition-all hover:shadow-md`}>
                    <div className="mb-2">
                        <TrendingUp size={32} className="opacity-80" />
                    </div>
                    <div className="text-5xl font-extrabold tracking-tight mb-2">
                        {data.productivity_score}
                        <span className="text-2xl opacity-60">/100</span>
                    </div>
                    <h3 className="font-semibold text-lg opacity-90">Team Productivity Score</h3>
                    <p className="text-sm mt-2 opacity-75">
                        {data.productivity_score >= 80 ? 'Excellent performance! Keep it up.' :
                            data.productivity_score >= 60 ? 'Good, but there is room for improvement.' :
                                'Attention needed to improve workflows.'}
                    </p>
                </div>

                {/* Key Insights List */}
                <div className="col-span-1 md:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col shadow-sm">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                        <Zap className="text-yellow-500" size={24} />
                        <h2 className="text-xl font-bold text-gray-900">Actionable Recommendations</h2>
                    </div>

                    <ul className="space-y-4 flex-1">
                        {data.insights.map((insight, index) => (
                            <li key={index} className="flex flex-col gap-1 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <p className="text-gray-800 font-medium">
                                        {insight}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Simulated Data Vis block (Placeholder for actual charts) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart className="text-blue-500" size={24} />
                    <h2 className="text-xl font-bold text-gray-900">Activity Distribution</h2>
                </div>

                <div className="h-48 w-full flex items-end justify-between gap-2 px-4 pb-4 border-b-2 border-l-2 border-gray-100">
                    {/* Placeholder bars to make it look like a dashboard */}
                    {[40, 70, 45, 90, 65, 80, 55].map((height, i) => (
                        <div key={i} className="w-full flex justify-center group relative cursor-pointer">
                            <div
                                className="w-3/4 bg-blue-100 group-hover:bg-blue-600 rounded-t-sm transition-all duration-300"
                                style={{ height: `${height}%` }}
                            ></div>
                            {/* Simple tooltip effect */}
                            <div className="absolute -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                Day {i + 1}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400 px-4">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                </div>
            </div>
        </div>
    );
}
