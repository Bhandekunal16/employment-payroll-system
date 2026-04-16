'use client';

import { useEffect, useState } from 'react';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  Plus,
  Edit2,
  Search,
  X,
  Loader2,
  Download,
  Filter
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  salary: number;
}

interface Payroll {
  id: string;
  employee_id: string;
  employee_name?: string;
  month: string;
  base_salary: number;
  bonus: number;
  deductions: number;
  net_salary: number;
  created_at?: string;
}

interface PayrollForm {
  employee_id: string;
  month: string;
  base_salary: number;
  bonus: number;
  deductions: number;
}

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [filteredPayrolls, setFilteredPayrolls] = useState<Payroll[]>([]);
  const [form, setForm] = useState<PayrollForm>({
    employee_id: '',
    month: '',
    base_salary: 0,
    bonus: 0,
    deductions: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [summary, setSummary] = useState({ totalPayroll: 0, avgNetSalary: 0, totalBonus: 0 });
  const [showModal, setShowModal] = useState(false);
  const [selectedPayrollId, setSelectedPayrollId] = useState<string | null>(null);
  const [bonusInput, setBonusInput] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [empRes, payRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/payroll')
      ]);

      const emp = await empRes.json();
      const pay = await payRes.json();

      // Enrich payroll data with employee names
      const enrichedPayrolls = pay.map((p: Payroll) => ({
        ...p,
        employee_name: emp.find((e: Employee) => e.id === p.employee_id)?.name || 'Unknown'
      }));

      setEmployees(emp);
      setPayrolls(enrichedPayrolls);
      setFilteredPayrolls(enrichedPayrolls);
      calculateSummary(enrichedPayrolls);
    } catch (error) {
      showNotification('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let filtered = payrolls;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.month.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMonth) {
      filtered = filtered.filter(p => p.month === selectedMonth);
    }

    setFilteredPayrolls(filtered);
    calculateSummary(filtered);
  }, [searchTerm, selectedMonth, payrolls]);

  const calculateSummary = (payrollsList: Payroll[]) => {
    const total = payrollsList.reduce((sum, p) => sum + p.net_salary, 0);
    const avg = payrollsList.length ? total / payrollsList.length : 0;
    const totalBonus = payrollsList.reduce((sum, p) => sum + (p.bonus || 0), 0);

    setSummary({
      totalPayroll: total,
      avgNetSalary: avg,
      totalBonus: totalBonus
    });
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const resetForm = () => {
    setForm({
      employee_id: '',
      month: '',
      base_salary: 0,
      bonus: 0,
      deductions: 0
    });
    setShowForm(false);
  };

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    setForm({
      ...form,
      employee_id: employeeId,
      base_salary: employee?.salary || 0
    });
  };

  const submit = async () => {
    if (!form.employee_id || !form.month) {
      showNotification('error', 'Please select employee and month');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      showNotification('success', `Payroll generated! Net Salary: £${data.net.toLocaleString()}`);
      await load();
      resetForm();
    } catch (error) {
      showNotification('error', 'Failed to generate payroll');
    } finally {
      setLoading(false);
    }
  };

  const updateBonus = (id: string) => {
    setSelectedPayrollId(id);
    setBonusInput('');
    setShowModal(true);
  };

  const submitBonusUpdate = async () => {
    if (!selectedPayrollId) return;

    const bonusNum = Number(bonusInput);
    if (isNaN(bonusNum)) {
      showNotification('error', 'Enter valid number');
      return;
    }

    setLoading(true);
    try {
      await fetch('/api/payroll', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPayrollId,
          bonus: bonusNum
        })
      });

      showNotification('success', 'Bonus updated');
      setShowModal(false);
      await load();
    } catch {
      showNotification('error', 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const getUniqueMonths = () => {
    const months = payrolls.map(p => p.month).filter(Boolean);
    return [...new Set(months)];
  };

  const calculateNetSalary = () => {
    return form.base_salary + form.bonus - form.deductions;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
          {notification.type === 'success' ? '✓' : '✗'} {notification.message}
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Payroll Management
          </h1>
          <p className="text-gray-600 mt-2">Process payroll and manage employee compensation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Payroll</p>
                <p className="text-3xl font-bold text-gray-900">£{summary.totalPayroll.toLocaleString()}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Average Net Salary</p>
                <p className="text-3xl font-bold text-gray-900">£{summary.avgNetSalary.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Bonuses</p>
                <p className="text-3xl font-bold text-gray-900">£{summary.totalBonus.toLocaleString()}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-2 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex gap-3 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by employee or month..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="">All Months</option>
                  {getUniqueMonths().map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              New Payroll
            </button>
          </div>

          {showForm && (
            <div className="border-t border-gray-100 p-6 bg-gray-50 animate-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                  <select
                    value={form.employee_id}
                    onChange={e => handleEmployeeSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <input
                    type="month"
                    value={form.month}
                    onChange={e => setForm({ ...form, month: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary (£)</label>
                  <input
                    type="number"
                    value={form.base_salary}
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bonus (£)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.bonus || ''}
                    onChange={e => setForm({ ...form, bonus: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deductions (£)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.deductions || ''}
                    onChange={e => setForm({ ...form, deductions: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Net Salary Preview</label>
                  <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="font-semibold text-blue-700">
                      £{calculateNetSalary().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={submit}
                  disabled={loading || !form.employee_id || !form.month}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Generate Payroll
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading && payrolls.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : filteredPayrolls.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No payroll records found</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create First Payroll
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Employee</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-600">Month</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-600">Base Salary</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-600">Bonus</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-600">Deductions</th>
                    <th className="text-right py-4 px-6 font-semibold text-gray-600">Net Salary</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayrolls.map((payroll, index) => (
                    <tr
                      key={payroll.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                    >
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {payroll.employee_name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-gray-900">{payroll.employee_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{payroll.month}</span>
                        </div>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <span className="text-gray-600">£{payroll.base_salary.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <span className="text-green-600 font-medium">+£{payroll.bonus?.toLocaleString() || 0}</span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <span className="text-red-600 font-medium">-£{payroll.deductions?.toLocaleString() || 0}</span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <span className="font-bold text-gray-900">£{payroll.net_salary.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateBonus(payroll.id)}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit Bonus
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

        {filteredPayrolls.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                showNotification('success', 'Export feature coming soon');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">

            <h2 className="text-xl font-semibold mb-4">Update Bonus</h2>

            <input
              type="number"
              placeholder="Enter bonus amount"
              value={bonusInput}
              onChange={(e) => setBonusInput(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={submitBonusUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}