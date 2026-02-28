'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Users, Plus, Trash2, Edit2, AlertCircle, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface Employee {
    id: number;
    email: string;
    role: string;
    created_at: string;
}

export default function EmployeesPage() {
    const { user } = useAppStore();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('EMPLOYEE');
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/users/');
            setEmployees(res.data);
        } catch (err: any) {
            setError('Failed to load employees.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const openAddModal = () => {
        setModalMode('add');
        setEmail('');
        setPassword('');
        setRole('EMPLOYEE');
        setFormError('');
        setSelectedEmployee(null);
        setShowModal(true);
    };

    const openEditModal = (employee: Employee) => {
        setModalMode('edit');
        setRole(employee.role);
        setFormError('');
        setSelectedEmployee(employee);
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to remove this employee?')) return;

        try {
            await api.delete(`/users/${id}`);
            setEmployees(employees.filter(emp => emp.id !== id));
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to delete employee.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setFormError('');

        try {
            if (modalMode === 'add') {
                await api.post('/users/', { email, password, role });
            } else if (selectedEmployee) {
                await api.put(`/users/${selectedEmployee.id}`, { role });
            }
            setShowModal(false);
            fetchEmployees();
        } catch (err: any) {
            setFormError(err.response?.data?.detail || 'Failed to save changes.');
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
        <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
                        <p className="text-gray-500">Manage access and roles for your team members.</p>
                    </div>
                </div>

                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={18} /> Add Employee
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-4 text-sm font-semibold text-gray-600">Email</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Role</th>
                                <th className="p-4 text-sm font-semibold text-gray-600">Added Date</th>
                                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {employees.map((employee) => (
                                <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900 flex items-center gap-2">
                                            {employee.email}
                                            {user?.id === employee.id && (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">You</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${employee.role === 'COMPANY_ADMIN'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-green-100 text-green-700'
                                            }`}>
                                            {employee.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {employee.created_at ? new Date(employee.created_at).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="p-4 flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => openEditModal(employee)}
                                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Edit Role"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(employee.id)}
                                            disabled={user?.id === employee.id}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                                            title="Remove Employee"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {employees.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">
                                        No employees found. Add one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden relative">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-900">
                                {modalMode === 'add' ? 'Add New Employee' : 'Edit Employee Role'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-700 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                    {formError}
                                </div>
                            )}

                            {modalMode === 'add' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                            placeholder="jane@company.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </>
                            )}

                            {modalMode === 'edit' && selectedEmployee && (
                                <div>
                                    <label className="block text-sm text-gray-500 mb-1">Employee Email</label>
                                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 mb-4">
                                        {selectedEmployee.email}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                                >
                                    <option value="EMPLOYEE">Employee</option>
                                    <option value="COMPANY_ADMIN">Company Admin</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center min-w-[100px]"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        modalMode === 'add' ? 'Add User' : 'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
