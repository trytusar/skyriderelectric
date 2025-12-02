import { useEffect, useState } from 'react';
import { Edit2, Save, X, Loader2, Filter, Package, CheckCircle, ArrowUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, EVOrder } from '../lib/supabase';

interface OrdersManagerProps {
  onDataUpdate: () => void;
}

type FilterType = 'active' | 'stock' | 'delivered';
type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

export default function OrdersManager({ onDataUpdate }: OrdersManagerProps) {
  const [orders, setOrders] = useState<EVOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<EVOrder>>({});
  const [saving, setSaving] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('active');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('ev_orders')
        .select('*');

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
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


  const convertToDateInput = (deliveryDate: string | null): string => {
    if (!deliveryDate) return '';

    const match = deliveryDate.match(/(\d{1,2})-([A-Za-z]{3})-(\d{2})/);
    if (match) {
      const [, day, month, year] = match;
      const monthMap: { [key: string]: string } = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
      };
      const monthNum = monthMap[month.toLowerCase()] || '01';
      const fullYear = '20' + year;
      const paddedDay = day.padStart(2, '0');
      return `${fullYear}-${monthNum}-${paddedDay}`;
    }

    return '';
  };

  const convertFromDateInput = (dateInput: string): string => {
    if (!dateInput) return '';

    const date = new Date(dateInput);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);

    return `${day}-${month}-${year}`;
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const startEdit = (order: EVOrder) => {
    setEditingId(order.id);
    setEditForm(order);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('ev_orders')
        .update({
          party_name: editForm.party_name,
          location: editForm.location,
          model: editForm.model,
          type: editForm.type,
          tyre: editForm.tyre,
          motor: editForm.motor,
          battery: editForm.battery,
          customization: editForm.customization,
          order_date: editForm.order_date,
          delivery_date: editForm.delivery_date,
          status: editForm.status,
          remarks: editForm.remarks,
          email: editForm.email,
          phoneno: editForm.phoneno
        })
        .eq('id', editingId);

      if (error) throw error;

      await fetchOrders();
      onDataUpdate();
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const filteredOrders = orders
    .filter(order => {
      if (activeFilter === 'active') {
        return order.status === 'Priority' || order.status === 'In Production' || order.status === 'No Progress';
      } else if (activeFilter === 'stock') {
        return order.status === 'Stock';
      } else if (activeFilter === 'delivered') {
        return order.status === 'Delivered';
      }
      return true;
    })
    .filter(order => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        order.party_name?.toLowerCase().includes(query) ||
        order.location?.toLowerCase().includes(query) ||
        order.model?.toLowerCase().includes(query) ||
        order.type?.toLowerCase().includes(query) ||
        order.status?.toLowerCase().includes(query) ||
        order.remarks?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
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

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const handleFilterChange = (newFilter: FilterType) => {
    setActiveFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const stockCount = orders.filter(o => o.status === 'Stock').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {activeFilter === 'active' ? 'Active Orders' : activeFilter === 'stock' ? 'Stock Orders' : 'Delivered Orders'}
        </h2>
        <div className="flex gap-3">
          {/*<button
            onClick={toggleSortOrder}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all"
            title={sortOrder === 'asc' ? 'Sort by delivery date descending' : 'Sort by delivery date ascending'}
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortOrder === 'asc' ? 'Earliest Delivery' : 'Latest Delivery'}
          </button>*/}
          <button
            onClick={() => handleFilterChange('active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeFilter === 'active'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Active
          </button>
          <button
            onClick={() => handleFilterChange('stock')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeFilter === 'stock'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Package className="w-4 h-4" />
            Stock ({stockCount})
          </button>
          <button
            onClick={() => handleFilterChange('delivered')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeFilter === 'delivered'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Delivered ({deliveredCount})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by party name, location, model, status..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
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
                <th className="px-4 py-3 text-left text-sm font-semibold">Tyre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Motor</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Battery</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Custom</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Order Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Delivery</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Remarks</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Phone No.</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-8 text-center text-gray-500">
                    {searchQuery ? 'No orders found matching your search' : 'No orders found for this filter'}
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order, index) => {
                const isEditing = editingId === order.id;

                const getRowClass = (status: string | null): string => {
                  if (status === 'Priority') return 'bg-orange-100';
                  if (status === 'In Production') return 'bg-yellow-100';
                  if (status === 'Stock') return 'bg-blue-100';
                  if (status === 'Delivered') return 'bg-green-100';
                  if (status === 'No Progress') return 'bg-red-100';
                  return index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
                };

                const rowClass = getRowClass(order.status);

                return (
                  <tr key={order.id} className={rowClass}>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.party_name || ''}
                          onChange={(e) => setEditForm({ ...editForm, party_name: e.target.value })}
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{order.party_name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.location || ''}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-gray-700">{order.location}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.model || ''}
                          onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="font-semibold text-gray-900">{order.model}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.type || ''}
                          onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-gray-700">{order.type || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.tyre || ''}
                          onChange={(e) => setEditForm({ ...editForm, tyre: e.target.value })}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-gray-700">{order.tyre || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.motor || ''}
                          onChange={(e) => setEditForm({ ...editForm, motor: e.target.value })}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-gray-700">{order.motor || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.battery || ''}
                          onChange={(e) => setEditForm({ ...editForm, battery: e.target.value })}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-gray-700">{order.battery || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.customization || ''}
                          onChange={(e) => setEditForm({ ...editForm, customization: e.target.value })}
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-gray-700">{order.customization || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <input
                          type="date"
                          value={editForm.order_date || ''}
                          onChange={(e) => setEditForm({ ...editForm, order_date: e.target.value })}
                          className="w-36 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-gray-700">
                          {order.order_date ? new Date(order.order_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <input
                          type="date"
                          value={convertToDateInput(editForm.delivery_date || '')}
                          onChange={(e) => setEditForm({ ...editForm, delivery_date: convertFromDateInput(e.target.value) })}
                          className="w-36 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        <span className="text-gray-700">{order.delivery_date || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <select
                          value={editForm.status || ''}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="w-36 px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="Priority">Priority</option>
                          <option value="In Production">In Production</option>
                          <option value="Stock">Stock</option>
                          <option value="Delivered">Delivered</option>
                          <option value="No Progress">No Progress</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                          order.status === 'Priority'
                            ? 'bg-orange-200 text-orange-900 border-orange-400'
                            : order.status === 'In Production'
                            ? 'bg-yellow-200 text-yellow-900 border-yellow-400'
                            : order.status === 'Stock'
                            ? 'bg-blue-200 text-blue-900 border-blue-400'
                            : order.status === 'Delivered'
                            ? 'bg-green-200 text-green-900 border-green-400'
                            : order.status === 'No Progress'
                            ? 'bg-red-200 text-red-900 border-red-400'
                            : 'bg-gray-100 text-gray-800 border-gray-300'
                        }`}>
                          {order.status || 'Unknown'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.remarks || ''}
                          onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                          className="w-48 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Remarks"
                        />
                      ) : (
                        <span className="text-gray-600 max-w-xs truncate block">{order.remarks || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.email || ''}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-48 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Email"
                        />
                      ) : (
                        <span className="text-gray-600 max-w-xs truncate block">{order.email || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.phoneno || ''}
                          onChange={(e) => setEditForm({ ...editForm, phoneno: e.target.value })}
                          className="w-48 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Phone No."
                        />
                      ) : (
                        <span className="text-gray-600 max-w-xs truncate block">{order.phoneno || '-'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={saving}
                            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                            title="Save"
                          >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                            title="Cancel"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(order)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
