import React from 'react';

interface MiniStatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple';
    loading?: boolean;
    isCurrency?: boolean;
}

const colorMap = {
    blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600'
    },
    green: {
        bg: 'bg-green-50',
        text: 'text-green-600'
    },
    purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600'
    }
};

export default function MiniStatCard({
    title,
    value,
    icon,
    color,
    loading = false,
    isCurrency = false
}: MiniStatCardProps) {
    const styles = colorMap[color];

    return (
        <div className="group bg-white/70 backdrop-blur rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <div className="flex justify-between items-center">

                <div>
                    <p className="text-xs text-gray-500">{title}</p>
                    <p className="text-xl font-semibold mt-1">
                        {loading
                            ? '...'
                            : isCurrency
                                ? `₹ ${value.toLocaleString()}`
                                : value}
                    </p>
                </div>

                <div className={`p-2 rounded-lg ${styles.bg} group-hover:scale-110 transition`}>
                    <div className={`w-5 h-5 ${styles.text}`}>
                        {icon}
                    </div>
                </div>

            </div>
        </div>
    );
}