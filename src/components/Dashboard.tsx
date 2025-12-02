import { useEffect, useState } from 'react';
import { Package, TrendingUp, Clock, CheckCircle, MapPin, Filter, AlertCircle } from 'lucide-react';
import { supabase, EVOrder } from '../lib/supabase';
import MetricCard from './MetricCard';

type FilterType = 'active' | 'stock' | 'delivered';

export default function Dashboard() {
  const [allOrders, setAllOrders] = useState<EVOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filter, setFilter] = useState<FilterType>('active');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders from Supabase...');
      const { data, error } = await supabase
        .from('ev_orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Orders fetched:', data?.length || 0);
      setAllOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Error loading orders. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const parseDeliveryDate = (deliveryDate: string | null): number => {
    if (!deliveryDate) return Infinity;
  
    // Trim and normalize input
    const dateStr = deliveryDate.trim();
  
    // Case 1: DD-MM-YYYY (e.g., 15-11-2025)
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateStr)) {
      const [day, month, year] = dateStr.split("-").map(Number);
      if (!day || !month || !year) return Infinity;
      return new Date(year, month - 1, day).getTime();
    }
  
    // Case 2: DD-MON-YY (e.g., 15-Nov-26)
    if (/^\d{1,2}-[A-Za-z]{3}-\d{2}$/.test(dateStr)) {
      const [dayStr, monStr, yearStr] = dateStr.split("-");
      const day = parseInt(dayStr, 10);
      const monthAbbr = monStr.toLowerCase();
      const monthMap: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
      };
      const month = monthMap[monthAbbr];
      if (month === undefined || isNaN(day)) return Infinity;
  
      let year = parseInt(yearStr, 10);
      // Assume 00–49 => 2000–2049, 50–99 => 1950–1999 (common rule)
      year += year < 50 ? 2000 : 1900;
  
      return new Date(year, month, day).getTime();
    }
  
    // Fallback for unsupported formats
    return Infinity;
  };
  
  const parseDeliveryDate2 = (deliveryDate: string | null): number => {
    if (!deliveryDate) return Infinity;

    const [day, month, year] = deliveryDate.split("-").map(Number);

    // Basic validation
    if (!day || !month || !year) return Infinity;

    return new Date(year, month - 1, day).getTime();
  };

  const getFilteredOrders = (): EVOrder[] => {
    let filtered: EVOrder[];

    if (filter === 'active') {
      filtered = allOrders.filter(o => o.status === 'Priority' || o.status === 'In Production' || o.status === 'No Progress');
    } else if (filter === 'stock') {
      filtered = allOrders.filter(o => o.status === 'Stock');
    } else {
      filtered = allOrders.filter(o => o.status === 'Delivered');
    }

    /*return filtered.sort((a, b) => {
      const aDate = parseDeliveryDate(a.delivery_date);
      const bDate = parseDeliveryDate(b.delivery_date);
      console.log(`Comparing delivery dates: ${a.delivery_date}:(${aDate}) vs ${b.delivery_date}:(${bDate})`);
      return aDate - bDate;
    });*/

    return filtered.sort((a, b) => {
      // Define custom status order
      const statusOrder = ['Priority', 'In Production', 'No Progress'];
  
      const statusA = statusOrder.indexOf(a.status || '');
      const statusB = statusOrder.indexOf(b.status || '');
  
      // If both statuses are in our defined order, sort by that first
      if (statusA !== -1 && statusB !== -1 && statusA !== statusB) {
        return statusA - statusB;
      }
  
      // If one has a known status and the other doesn’t, known one goes first
      if (statusA !== -1 && statusB === -1) return -1;
      if (statusA === -1 && statusB !== -1) return 1;
  
      // Otherwise, sort by delivery date
      const dateA = parseDeliveryDate(a.delivery_date);
      const dateB = parseDeliveryDate(b.delivery_date);
      //return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      return   dateA - dateB;
    });
  };

  const displayedOrders = getFilteredOrders();

  const metrics = {
    total: allOrders.length,
    priority: allOrders.filter(o => o.status === 'Priority').length,
    inProduction: allOrders.filter(o => o.status === 'In Production').length,
    stock: allOrders.filter(o => o.status === 'Stock').length,
    delivered: allOrders.filter(o => o.status === 'Delivered').length,
    locations: new Set(allOrders.map(o => o.location)).size,
  };

  const getRowClass = (status: string | null): string => {
    if (status === 'Priority') return 'bg-orange-100';
    if (status === 'In Production') return 'bg-yellow-100';
    if (status === 'Stock') return 'bg-blue-100';
    if (status === 'Delivered') return 'bg-green-100';
    if (status === 'No Progress') return 'bg-red-100';
    return 'bg-gray-50';
  };

  const getStatusBadge = (status: string | null) => {
    if (status === 'Priority') {
      return 'bg-orange-200 text-orange-900 border-orange-400';
    } else if (status === 'In Production') {
      return 'bg-yellow-200 text-yellow-900 border-yellow-400';
    } else if (status === 'Stock') {
      return 'bg-blue-200 text-blue-900 border-blue-400';
    } else if (status === 'Delivered') {
      return 'bg-green-200 text-green-900 border-green-400';
    } else if (status === 'No Progress') {
      return 'bg-red-200 text-red-900 border-red-400';
    }
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-[98%] mx-auto p-6">
        <header className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img
                src="/skyyriderelectric logo.png"
                alt="Skyyy Rider Electric"
                className="h-16 w-auto"
              />
              <div className="border-l-2 border-gray-300 pl-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Manufacturing Dashboard
                </h1>
                <p className="text-gray-600">Production & Order Tracking System</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-sm text-gray-500">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <MetricCard
            title="Total Orders"
            value={metrics.total}
            icon={Package}
            color="bg-blue-200"
          />
          <MetricCard
            title="Priority"
            value={metrics.priority}
            icon={AlertCircle}
            color="bg-orange-200"
          />
          <MetricCard
            title="In Production"
            value={metrics.inProduction}
            icon={TrendingUp}
            color="bg-yellow-200"
          />
          <MetricCard
            title="Stock"
            value={metrics.stock}
            icon={Package}
            color="bg-blue-300"
          />
          <MetricCard
            title="Delivered"
            value={metrics.delivered}
            icon={CheckCircle}
            color="bg-green-200"
          />
          <MetricCard
            title="Locations"
            value={metrics.locations}
            icon={MapPin}
            color="bg-teal-200"
          />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {filter === 'active' && 'Active Orders'}
              {filter === 'stock' && 'Stock Orders'}
              {filter === 'delivered' && 'Delivered Orders'}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('active')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Active
              </button>
              <button
                onClick={() => setFilter('stock')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'stock'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Package className="w-4 h-4" />
                Stock ({metrics.stock})
              </button>
              <button
                onClick={() => setFilter('delivered')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'delivered'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Delivered ({metrics.delivered})
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Party Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Location</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Model</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Motor</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Battery</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Custom</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Order Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Delivery</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {displayedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                        No orders found for this filter
                      </td>
                    </tr>
                  ) : (
                    displayedOrders.map((order) => {
                      const rowClass = getRowClass(order.status);
                      const statusBadge = getStatusBadge(order.status);

                      const typeColor = order.type === 'Premium'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-500 text-white';

                      return (
                        <tr key={order.id} className={rowClass}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.party_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{order.location}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{order.model}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${typeColor}`}>
                              {order.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{order.motor}W</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{order.battery || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{order.customization || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {order.order_date ? new Date(order.order_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{order.delivery_date || '-'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusBadge}`}>
                              {order.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                            {order.remarks || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
