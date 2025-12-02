import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface EVOrder {
  id: string;
  party_name: string;
  location: string;
  model: string;
  type: string;
  tyre: string;
  motor: string;
  battery: string | null;
  customization: string | null;
  order_date: string | null;
  delivery_date: string | null;
  status: string | null;
  remarks: string | null;
  email: string | null;
  phoneno: string | null;
  created_at: string;
  updated_at: string;
}
