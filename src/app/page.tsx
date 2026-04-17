'use client';

import { useEffect, useState } from 'react';
import { Users, DollarSign, TrendingUp, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [empRes, payRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/payroll')
      ]);

      const emp = await empRes.json();
      const pay = await payRes.json();

      setEmployees(emp);
      setPayrolls(pay);
    } catch (err) {
      console.error('Dashboard load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalEmployees = employees.length;

  const totalPayroll = payrolls.reduce(
    (sum, p) => sum + (p.net_salary || 0),
    0
  );

  const avgSalary = payrolls.length
    ? totalPayroll / payrolls.length
    : 0;

  const totalReports = payrolls.length;

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Welcome back 👋 — here’s your payroll overview
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {/* Card */}
        <div className="group bg-white/70 backdrop-blur rounded-xl shadow-sm p-4 hover:shadow-md transition">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Employees</p>
              <p className="text-xl font-semibold mt-1">
                {loading ? '...' : totalEmployees}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 group-hover:scale-110 transition">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="group bg-white/70 backdrop-blur rounded-xl  shadow-sm p-4 hover:shadow-md transition">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Total Payroll</p>
              <p className="text-xl font-semibold mt-1">
                ₹ {loading ? '...' : totalPayroll.toLocaleString()}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-green-50 group-hover:scale-110 transition">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="group bg-white/70 backdrop-blur rounded-xl  shadow-sm p-4 hover:shadow-md transition">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Avg Salary</p>
              <p className="text-xl font-semibold mt-1">
                ₹ {loading ? '...' : Math.round(avgSalary).toLocaleString()}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-purple-50 group-hover:scale-110 transition">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="group bg-white/70 backdrop-blur rounded-xl  shadow-sm p-4 hover:shadow-md transition">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Payroll Records</p>
              <p className="text-xl font-semibold mt-1">
                {loading ? '...' : totalReports}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-orange-50 group-hover:scale-110 transition">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>

      </div>

      {/* Actions + Recent */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>

          <div className="flex flex-col gap-3">

            <Link href="/employees">
              <button className="w-full text-left px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                + Add Employee
              </button>
            </Link>

            <Link href="/payroll">
              <button className="w-full text-left px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition">
                + Generate Payroll
              </button>
            </Link>

          </div>
        </div>

        {/* Recent Payroll */}
        <div className="bg-white rounded-xl  shadow-sm p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">
            Recent Payroll
          </h2>

          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : payrolls.length === 0 ? (
            <p className="text-sm text-gray-500">No records found</p>
          ) : (
            <div className="divide-y">

              {payrolls.slice(0, 5).map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between py-2 text-sm hover:bg-gray-50 px-2 rounded transition"
                >
                  <span className="text-gray-700">{p.month}</span>
                  <span className="font-medium text-gray-900">
                    ₹ {p.net_salary}
                  </span>
                </div>
              ))}

            </div>
          )}
        </div>

      </div>

    </div>
  );
}