import React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  isCurrency?: boolean;
  color: 'green' | 'blue' | 'purple';
}

const colorMap = {
  green: {
    bg: 'bg-green-50',
    text: 'text-green-500'
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-500'
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-500'
  }
};

export default function StatCard({ title, value, icon, color, isCurrency = false }: StatCardProps) {
  const styles = colorMap[color];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">

        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {isCurrency ? `₹${value.toLocaleString()}` : value}
          </p>
        </div>

        <div className={`${styles.bg} p-3 rounded-full`}>
          <div className={`w-6 h-6 ${styles.text}`}>
            {icon}
          </div>
        </div>

      </div>
    </div>
  );
}