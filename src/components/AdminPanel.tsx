import { useState, useEffect } from 'react';
import { Upload, Plus, FileText, LogOut, Edit3, Package, TrendingUp, CheckCircle, MapPin, AlertCircle } from 'lucide-react';
import { supabase, EVOrder } from '../lib/supabase';
import OrderForm from './OrderForm';
import CSVUpload from './CSVUpload';
import OrdersManager from './OrdersManager';
import MetricCard from './MetricCard';

interface AdminPanelProps {
  onLogout: () => void;
  onDataUpdate: () => void;
}

export default function AdminPanel({ onLogout, onDataUpdate }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'form' | 'csv' | 'manage'>('manage');
  const [orders, setOrders] = useState<EVOrder[]>([]);

  useEffect(() => {
    fetchOrders();
  }, [onDataUpdate]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('ev_orders')
        .select('*');

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const metrics = {
    total: orders.length,
    priority: orders.filter(o => o.status === 'Priority').length,
    inProduction: orders.filter(o => o.status === 'In Production').length,
    stock: orders.filter(o => o.status === 'Stock').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    locations: new Set(orders.map(o => o.location)).size,
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
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
                  Admin Panel
                </h1>
                <p className="text-gray-600">Manage Orders & Data</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 flex">
            <button
              onClick={() => setActiveTab('manage')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'manage'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Edit3 className="w-5 h-5" />
              Manage Orders
            </button>
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'form'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Plus className="w-5 h-5" />
              Add Single Order
            </button>
            <button
              onClick={() => setActiveTab('csv')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'csv'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Upload className="w-5 h-5" />
              Upload CSV
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'manage' ? (
              <OrdersManager onDataUpdate={onDataUpdate} />
            ) : activeTab === 'form' ? (
              <OrderForm onSuccess={onDataUpdate} />
            ) : (
              <CSVUpload onSuccess={onDataUpdate} />
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">CSV Format Requirements</h3>
              <p className="text-sm text-blue-800 mb-2">
                Your CSV file should contain the following columns in order:
              </p>
              <code className="text-xs bg-white px-3 py-2 rounded border border-blue-200 block text-blue-900">
                party_name, location, model, type, tyre, motor, battery, customization, order_date, delivery_date, status, remarks
              </code>
              <p className="text-xs text-blue-700 mt-2">
                * Date format: YYYY-MM-DD or DD-MMM-YY (e.g., 2025-09-15 or 15-Sep-25)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
