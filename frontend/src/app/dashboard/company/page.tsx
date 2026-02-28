'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Building, Save, AlertCircle } from 'lucide-react';

interface Company {
    id: number;
    name: string;
    status: string;
    created_at: string;
}

export default function CompanySettingsPage() {
    const [company, setCompany] = useState<Company | null>(null);
    const [name, setName] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await api.get('/companies/me');
                setCompany(res.data);
                setName(res.data.name);
                setStatus(res.data.status);
            } catch (error: any) {
                setMessage({
                    text: error.response?.data?.detail || 'Failed to load company details',
                    type: 'error'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await api.put('/companies/me', { name, status });
            setCompany(res.data);
            setMessage({ text: 'Company settings updated successfully', type: 'success' });

            // Clear success message after 3 seconds
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (error: any) {
            setMessage({
                text: error.response?.data?.detail || 'Failed to update company settings',
                type: 'error'
            });
        } finally {
            setSaving(false);
        }
    };

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
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                    <Building size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
                    <p className="text-gray-500">Manage your organization's profile and status.</p>
                </div>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                    {message.type === 'error' && <AlertCircle size={20} />}
                    <p>{message.text}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 font-medium text-gray-900 bg-gray-50/50">
                    General Information
                </div>
                <div className="p-6">
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g. Acme Corp"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="SUSPENDED">Suspended</option>
                                </select>
                            </div>
                        </div>

                        {company && (
                            <div className="pt-4 border-t border-gray-100 text-sm text-gray-500 flex justify-between">
                                <span>Company ID: {company.id}</span>
                                <span>Registered: {new Date(company.created_at).toLocaleDateString()}</span>
                            </div>
                        )}

                        <div className="pt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving || (name === company?.name && status === company?.status)}
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
