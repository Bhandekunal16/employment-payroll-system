'use client';

import React from 'react';
import { Users, DollarSign, TrendingUp, FileText } from 'lucide-react';
import Link from 'next/link';
import employee_config from "./config/employee.config.json"
import payroll_config from "./config/payroll.config.json"
import MiniStatCard from './components/MiniStatCard';
const { url } = payroll_config
const getEmp = employee_config.url

export default function Home() {
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [payrolls, setPayrolls] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [empRes, payRes] = await Promise.all([fetch(getEmp), fetch(url)]);
      const [emp, pay] = await Promise.all([empRes.json(), payRes.json()])

      setEmployees(emp);
      setPayrolls(pay);
    } catch (err) {
      console.error('Dashboard load failed');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { load().then(() => { console.log('i am working!'); }) }, []);

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


      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <MiniStatCard
          title="Employees"
          value={totalEmployees}
          icon={<Users />}
          color="blue"
          loading={loading}
        />

        <MiniStatCard
          title="Total Payroll"
          value={totalPayroll}
          icon={<DollarSign />}
          color="green"
          loading={loading}
          isCurrency
        />

        <MiniStatCard
          title="Avg Salary"
          value={Math.round(avgSalary)}
          icon={<TrendingUp />}
          color="purple"
          loading={loading}
          isCurrency
        />

        <MiniStatCard
          title="Payroll Records"
          value={totalReports}
          icon={<FileText />}
          color="purple"
          loading={loading}
          isCurrency
        />

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