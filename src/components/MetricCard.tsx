import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: string;
}

export default function MetricCard({ title, value, icon: Icon, color, trend }: MetricCardProps) {
  return (
    <div className={`${color} rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          )}
        </div>
        <div className="p-2 bg-white/50 rounded-lg">
          <Icon className="w-5 h-5 text-gray-700" />
        </div>
      </div>
    </div>
  );
}
