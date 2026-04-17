'use client';

import React from 'react';
import { Users, DollarSign, TrendingUp, FileText } from 'lucide-react';
import employee_config from "./config/employee.config.json"
import payroll_config from "./config/payroll.config.json"
import MiniStatCard from './components/MiniStatCard';
import { DashboardHeader } from "./static/DashboardHeader"
import { DashboardNavigation } from "./static/DashboardNavigation"

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
      <DashboardHeader />

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
        <DashboardNavigation />

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

              {payrolls.slice(0, 1).map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between py-2 text-sm hover:bg-gray-50 px-2 rounded transition"
                >
                  <span className="text-gray-700">{p.month}</span>
                  <span className="font-medium text-gray-900">
                    ₹ {p.base_salary + p.bonus}
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