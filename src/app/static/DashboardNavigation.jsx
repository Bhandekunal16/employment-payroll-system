import Link from 'next/link';

export const DashboardNavigation = () => {
  return (
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
  );
};
