'use client';

import React from 'react';
import {
    Edit2,
    Trash2,
    Search,
    X,
    Loader2,
    Users,
    Mail,
    UserPlus,
    IndianRupee
} from 'lucide-react';
import { Employee, FormData } from '../types';
import config from "../config/employee.config.json"
import apiConfig from "../config/api.config.json"
import { stringify } from '../core/app.service';
import StatCard from '../components/StatCard';

const { defaultFormValue, url } = config
const { methods, headers } = apiConfig
const { POST, PUT, DELETE }: { POST: string, PUT: string, DELETE: string } = methods

export default function EmployeesPage() {
    const [employees, setEmployees] = React.useState<Employee[]>([]);
    const [filteredEmployees, setFilteredEmployees] = React.useState<Employee[]>([]);
    const [form, setForm] = React.useState<FormData>(defaultFormValue);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [showForm, setShowForm] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [notification, setNotification] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [deleteId, setDeleteId] = React.useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const response = await fetch(url);
            const data = await response.json();
            setEmployees(data);
            setFilteredEmployees(data);
        } catch (error) {
            showNotification(1, 'Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        load();
    }, []);

    React.useEffect(() => {
        const filtered = employees.filter(emp =>
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEmployees(filtered);
    }, [searchTerm, employees]);

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const showNotification = (type: 0 | 1, message: string) => {
        setNotification({ type: type == 0 ? 'success' : 'error', message });
        setTimeout(() => setNotification(null), 3000);
    };

    const resetForm = () => {
        setForm(defaultFormValue);
        setEditingId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.email || form.salary <= 0) {
            showNotification(1, 'Please fill all fields correctly');
            return;
        }

        setLoading(true);
        try {
            if (editingId) {
                await fetch(url, { method: PUT, headers, body: stringify({ id: editingId, ...form }) });
                showNotification(0, 'Employee updated successfully');
                await new Promise(res => setTimeout(res, 500));
                await load();
            } else {
                await fetch(url, { method: POST, headers, body: stringify(form) });
                showNotification(0, 'Employee added successfully');
            }
            await load();
            resetForm();
        } catch (error) {
            showNotification(1, 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (employee: Employee) => {
        let { name, email, salary, id } = employee
        setForm({ name, email, salary });
        setEditingId(id);
        setShowForm(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        setLoading(true);
        try {
            await fetch(url, { method: DELETE, headers, body: stringify({ id: deleteId }) });
            showNotification(0, 'Employee deleted successfully');
            setShowDeleteModal(false);
            await load();
        } catch {
            showNotification(1, 'Failed to delete employee');
        } finally {
            setLoading(false);
        }
    };

    const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
    const averageSalary = employees.length ? totalSalary / employees.length : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {notification && (
                <div className={`fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
                    {notification.type === 'success' ? '✓' : '✗'} {notification.message}
                </div>
            )}

            <div className=" mx-auto px-4 py-8">
                <div className="mb-2">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Employee Management
                    </h1>
                    <p className="text-gray-600 mt-2">Manage your workforce efficiently</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
                    <StatCard
                        title="Total Employees"
                        value={employees.length}
                        icon={<Users />}
                        color="blue"
                    />

                    <StatCard
                        title="Total Salary Pool"
                        value={totalSalary}
                        icon={<IndianRupee />}
                        color="green"
                        isCurrency
                    />

                    <StatCard
                        title="Average Salary"
                        value={averageSalary}
                        icon={<IndianRupee />}
                        color="purple"
                        isCurrency
                    />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                        >
                            <UserPlus className="w-5 h-5" />
                            Add Employee
                        </button>
                    </div>

                    {showDeleteModal && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                            <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-5 animate-in fade-in zoom-in-95">

                                <h2 className="text-base font-semibold text-gray-800 mb-2">
                                    Delete Employee
                                </h2>

                                <p className="text-sm text-gray-600 mb-5">
                                    Are you sure you want to delete this employee? This action cannot be undone.
                                </p>

                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="px-3 py-1.5 text-sm border rounded hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={confirmDelete}
                                        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>

                            </div>
                        </div>
                    )}

                    {showForm && (
                        <div className="border-t border-gray-100 p-4 bg-gray-50 animate-in slide-in-from-top-2 duration-300">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Annual Salary (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="50000"
                                            value={form.salary || ''}
                                            onChange={e => setForm({ ...form, salary: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {editingId ? 'Update Employee' : 'Add Employee'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading && employees.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        </div>
                    ) : filteredEmployees.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">No employees found</p>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="mt-2 text-blue-600 hover:text-blue-700"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-600">Name</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-600">Email</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-600">Salary</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map((emp, index) => (
                                        <tr
                                            key={emp.id}
                                            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                                }`}
                                        >
                                            <td className="py-3 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                        {emp.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{emp.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-6">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-600">{emp.email}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-6 text-right">
                                                <span className="font-semibold text-gray-900">
                                                    ₹{emp.salary.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(emp)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(emp.id)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}