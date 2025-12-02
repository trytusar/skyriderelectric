import { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CSVUploadProps {
  onSuccess: () => void;
}

export default function CSVUpload({ onSuccess }: CSVUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadedCount, setUploadedCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV file is empty or invalid');

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1);

    return rows.map(row => {
      const values = row.split(',').map(v => v.trim());
      const obj: any = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';

        if (header === 'party_name') obj.party_name = value;
        else if (header === 'location') obj.location = value;
        else if (header === 'model') obj.model = value;
        else if (header === 'type') obj.type = value;
        else if (header === 'tyre') obj.tyre = value;
        else if (header === 'motor') obj.motor = value;
        else if (header === 'battery') obj.battery = value || null;
        else if (header === 'customization') obj.customization = value || null;
        else if (header === 'order_date') {
          if (value && value !== 'NA') {
            const date = new Date(value);
            obj.order_date = isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
          } else {
            obj.order_date = null;
          }
        }
        else if (header === 'delivery_date') obj.delivery_date = value || null;
        else if (header === 'status') obj.status = value || null;
        else if (header === 'remarks') obj.remarks = value || null;
      });

      return obj;
    }).filter(obj => obj.party_name && obj.location && obj.model);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setLoading(true);
    setUploadedCount(0);

    try {
      const text = await file.text();
      const orders = parseCSV(text);

      if (orders.length === 0) {
        throw new Error('No valid orders found in CSV file');
      }

      const { error: insertError } = await supabase
        .from('ev_orders')
        .insert(orders);

      if (insertError) throw insertError;

      setUploadedCount(orders.length);
      setSuccess(`Successfully uploaded ${orders.length} orders!`);
      onSuccess();

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload CSV file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={loading}
          className="hidden"
          id="csv-upload"
        />
        <label
          htmlFor="csv-upload"
          className={`cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center gap-4">
            {loading ? (
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            ) : (
              <Upload className="w-16 h-16 text-gray-400" />
            )}
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-1">
                {loading ? 'Uploading...' : 'Click to upload CSV file'}
              </p>
              <p className="text-sm text-gray-600">
                or drag and drop your file here
              </p>
            </div>
            <button
              type="button"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              Select CSV File
            </button>
          </div>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Upload Failed</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">Upload Successful</h3>
              <p className="text-sm text-green-700">
                {success} {uploadedCount > 0 && `(${uploadedCount} records)`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">CSV File Example</h3>
        <div className="bg-white rounded border border-gray-200 p-4 overflow-x-auto">
          <pre className="text-xs text-gray-700 font-mono">
{`party_name,location,model,type,tyre,motor,battery,customization,order_date,delivery_date,status,remarks
Airforce,Jodhpur,2s+cargo,Classic,145-80-12,2000,Lion-105ah,NA,2025-08-22,11-Sep-25,,
EPIC,Jankia,8S,Premium,165-60-12,3000W,Lithium,Water bottle holder,2025-09-05,,,
Aditya motors,Bangalore,6s+A/F,Premium,165-60-12,2000,Lion-105ah,NA,,Hold,,Hold for now`}
          </pre>
        </div>
        <p className="text-xs text-gray-600 mt-3">
          * Empty values are allowed for optional fields
          <br />
          * Date format: YYYY-MM-DD for order_date, any format for delivery_date
          <br />
          * Ensure column headers match exactly (case-insensitive)
        </p>
      </div>
    </div>
  );
}
