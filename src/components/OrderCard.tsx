import { Package, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { EVOrder } from '../lib/supabase';

interface OrderCardProps {
  order: EVOrder;
}

export default function OrderCard({ order }: OrderCardProps) {
  const getStatusColor = (status: string | null) => {
    if (status === 'DELIVERED') return 'bg-green-100 border-green-300 text-green-800';
    if (!status && order.remarks?.includes('Hold')) return 'bg-amber-100 border-amber-300 text-amber-800';
    return 'bg-blue-100 border-blue-300 text-blue-800';
  };

  const getStatusLabel = (status: string | null) => {
    if (status === 'DELIVERED') return 'Delivered';
    if (!status && order.remarks?.includes('Hold')) return 'On Hold';
    return 'In Production';
  };

  const getTypeColor = (type: string) => {
    return type === 'Premium'
      ? 'bg-slate-800 text-white'
      : 'bg-slate-500 text-white';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 mb-1">{order.party_name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{order.location}</span>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(order.type)}`}>
            {order.type}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-500 mb-1">Model</p>
            <p className="font-semibold text-gray-900">{order.model}</p>
          </div>
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs text-gray-500 mb-1">Motor</p>
            <p className="font-semibold text-gray-900">{order.motor}W</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded p-3 mb-3">
          <p className="text-xs text-gray-500 mb-1">Battery</p>
          <p className="font-semibold text-gray-900">{order.battery || 'Not specified'}</p>
        </div>

        {order.delivery_date && (
          <div className="flex items-center gap-2 mb-3 text-sm">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Delivery: <span className="font-medium text-gray-900">{order.delivery_date}</span></span>
          </div>
        )}

        {order.remarks && (
          <div className="flex items-start gap-2 mb-3 p-2 bg-amber-50 rounded border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-amber-800">{order.remarks}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </span>
          {order.customization && order.customization !== 'NA' && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Package className="w-3 h-3" />
              <span>Custom</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
