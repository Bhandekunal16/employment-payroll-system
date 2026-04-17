import Link from "next/link";

const buttons = [
  {
    path: "/employees",
    style: "bg-blue-600 hover:bg-blue-700 ",
    title: "+ Add Employee",
  },
  {
    path: "/payroll",
    style: "bg-green-600 hover:bg-green-700",
    title: "+ Generate Payroll",
  },
];

export const DashboardNavigation = () => {
  const addStyle = (input: string) => {
    return `w-full text-left px-4 py-2 text-sm rounded-lg  text-white ${input} transition`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <h2 className="text-sm font-semibold text-gray-800 mb-4">
        Quick Actions
      </h2>

      <div className="flex flex-col gap-3">
        {buttons.map((button) => (
          <Link
            key={button.path}
            href={button.path}
            className={addStyle(button.style)}
          >
            {button.title}
          </Link>
        ))}
      </div>
    </div>
  );
};
