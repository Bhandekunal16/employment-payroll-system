import React from "react"
const PayrollCard = ({ loading, payrolls }: { loading: boolean, payrolls: any[] }) => {
    return (
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
    )
}

export default PayrollCard;