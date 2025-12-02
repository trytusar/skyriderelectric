/*
  # EV Manufacturing Orders Database Schema

  ## Overview
  Creates a comprehensive table to store electric vehicle order data for manufacturing dashboard display.

  ## New Tables
  
  ### `ev_orders`
  Main table containing all order information:
  - `id` (uuid, primary key) - Unique identifier for each order
  - `party_name` (text) - Customer/dealer name
  - `location` (text) - Delivery location
  - `model` (text) - Vehicle model identifier
  - `type` (text) - Vehicle type (Classic/Premium)
  - `tyre` (text) - Tyre specification
  - `motor` (text) - Motor specification in watts
  - `battery` (text, nullable) - Battery specification
  - `customization` (text, nullable) - Special customization details
  - `order_date` (date, nullable) - Date order was placed
  - `delivery_date` (text, nullable) - Expected/actual delivery date
  - `status` (text, nullable) - Current order status (DELIVERED, etc.)
  - `remarks` (text, nullable) - Special notes or issues
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record last update timestamp

  ## Security
  - Enable RLS on `ev_orders` table
  - Add policies for public read access (suitable for display dashboards)
  - Add policies for authenticated users to insert/update orders

  ## Indexes
  - Index on status for filtering
  - Index on delivery_date for sorting
  - Index on location for grouping
*/

CREATE TABLE IF NOT EXISTS ev_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_name text NOT NULL,
  location text NOT NULL,
  model text NOT NULL,
  type text NOT NULL,
  tyre text NOT NULL,
  motor text NOT NULL,
  battery text,
  customization text,
  order_date date,
  delivery_date text,
  status text,
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ev_orders ENABLE ROW LEVEL SECURITY;

-- Policy for reading orders (public access for dashboards)
CREATE POLICY "Anyone can view orders"
  ON ev_orders
  FOR SELECT
  USING (true);

-- Policy for inserting orders
CREATE POLICY "Authenticated users can insert orders"
  ON ev_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for updating orders
CREATE POLICY "Authenticated users can update orders"
  ON ev_orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ev_orders_status ON ev_orders(status);
CREATE INDEX IF NOT EXISTS idx_ev_orders_delivery_date ON ev_orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_ev_orders_location ON ev_orders(location);
CREATE INDEX IF NOT EXISTS idx_ev_orders_order_date ON ev_orders(order_date);

-- Insert sample data from the provided spreadsheet
INSERT INTO ev_orders (party_name, location, model, type, tyre, motor, battery, customization, order_date, delivery_date, status, remarks)
VALUES
  ('Airforce', 'Jodhpur', '2s+cargo', 'Classic', '145-80-12', '2000', 'Lion-105ah', 'NA', '2025-08-22', '11-Sep-25', NULL, NULL),
  ('Oriclean', 'Bhubaneswar', '2S+Garbage', 'Premium', '165-60-12', '2000', 'Lion-105', 'Cargo-Green & blue', '2025-08-05', '13-Sep-25', 'DELIVERED', NULL),
  ('EPIC', 'Jankia, khordha', '8S', 'Premium', '165-60-12', '3000W', 'Lithium', 'ater bottle holder, sticker print, usb port', '2025-09-05', NULL, NULL, NULL),
  ('NTPC Limited, Raipur', 'Bilaspur', '6s(4+2)', 'Classic', '145-80-12', '2000', 'Lion-105ah', 'NA', '2025-08-28', '12-Sep-25', NULL, NULL),
  ('Chattisgarh medical ofz', 'Raipur', 'e ambulance', 'Classic', '145-80-12', '2000', NULL, 'NA', '2025-08-29', '15-Sep-25', NULL, NULL),
  ('Airforce', 'Bihar', '6s', 'Classic', '145-80-12', '2000', 'Lion-105ah', 'NA', '2025-08-23', '19-Sep-25', 'DELIVERED', 'Battery tags to be removed'),
  ('Rama Rao', 'Nellore', '14S', 'Premium', '155-80-12', '7500', 'Lion-230', 'Polycarbonate body', NULL, '10-Sep-25', NULL, NULL),
  ('Paradip Port', 'Paradip', '14S Closed', 'Premium', '155-80-12', '7500', 'Lion-230', 'NA', NULL, '12-Sep-25', NULL, NULL),
  ('HENKEL', 'Pune', '4s(2+2)', 'Classic', '145-80-12', '2000', 'Lead-135ah', 'NA', '2025-08-25', '20-Sep-25', NULL, 'Motor tags to be removed'),
  ('Lakshadweep', 'Lakshadweep', '8s', 'Classic', '145-80-12', '2000', 'Lion-105ah', 'Baggage space', '2025-08-26', '23-Sep-25', NULL, 'Battery & Motor tags to be removed'),
  ('Lakshadweep', 'Lakshadweep', '8s', 'Classic', '145-80-12', '2000', 'Lion-105ah', 'Baggage space', '2025-08-26', '24-Sep-25', NULL, 'Battery & Motor tags to be removed'),
  ('Lakshadweep', 'Lakshadweep', '8s', 'Classic', '145-80-12', '2000', 'Lion-105ah', 'Baggage space', '2025-08-26', '25-Sep-25', NULL, 'Battery & Motor tags to be removed'),
  ('Lakshadweep', 'Lakshadweep', '8s', 'Classic', '145-80-12', '2000', 'Lion-105ah', 'Baggage space', '2025-08-26', '26-Sep-25', NULL, 'Battery & Motor tags to be removed'),
  ('Lakshadweep', 'Lakshadweep', '8s', 'Classic', '145-80-12', '2000', 'Lion-105ah', 'Baggage space', '2025-08-26', '27-Sep-25', NULL, 'Battery & Motor tags to be removed'),
  ('Lakshadweep', 'Lakshadweep', '8s', 'Classic', '145-80-12', '2000', 'Lion-105ah', 'Baggage space', '2025-08-26', '29-Sep-25', NULL, 'Battery & Motor tags to be removed'),
  ('Lakshadweep', 'Lakshadweep', '8s', 'Classic', '145-80-12', '2000', 'Lion-105ah', 'Baggage space', '2025-08-26', '30-Sep-25', NULL, 'Battery & Motor tags to be removed'),
  ('Lakshadweep', 'Lakshadweep', '8s', 'Classic', '145-80-12', '2000', 'Lion-105ah', 'Baggage space', '2025-08-26', '1-Oct-25', NULL, 'Battery & Motor tags to be removed'),
  ('Lakshadweep', 'Lakshadweep', '8s', 'Classic', '145-80-12', '2000', 'Lion-105ah', 'Baggage space', '2025-08-26', '2-Oct-25', NULL, 'Battery & Motor tags to be removed'),
  ('Lakshadweep', 'Lakshadweep', '8s', 'Classic', '145-80-12', '2000', 'Lion-105ah', 'Baggage space', '2025-08-26', '3-Oct-25', NULL, 'Battery & Motor tags to be removed'),
  ('Lakshadweep', 'Lakshadweep', '8s', 'Classic', '145-80-12', '2000', 'Lion-105ah', 'Baggage space', '2025-08-26', '4-Oct-25', NULL, 'Battery & Motor tags to be removed'),
  ('Lakshadweep', 'Lakshadweep', '8s', 'Classic', '145-80-12', '2000', 'Lion-105ah', 'Baggage space', '2025-08-26', '6-Oct-25', NULL, 'Battery & Motor tags to be removed'),
  ('Lakshadweep', 'Lakshadweep', '8s', 'Classic', '145-80-12', '2000', 'Lion-105ah', 'Baggage space', '2025-08-26', '7-Oct-25', NULL, 'Battery & Motor tags to be removed'),
  ('Lakshadweep', 'Lakshadweep', '8s', 'Classic', '145-80-12', '2000', 'Lion-105ah', 'Baggage space', '2025-08-26', '8-Oct-25', NULL, 'Battery & Motor tags to be removed'),
  ('Aditya motors', 'Bangalore', '6s+A/F', 'Premium', '165-60-12', '2000', 'Lion-105ah', 'NA', NULL, 'Hold', NULL, 'Hold for now'),
  ('ADANI', 'GUJJURAT', '2S+Cargo', 'Premium', '165-60-12', '2000W', 'Lithium', 'COUSTMISE', '2025-09-12', NULL, NULL, NULL),
  ('ADANI', 'GUJJURAT', '2S+Cargo', 'Premium', '165-60-12', '2000W', 'Lithium', 'SHADE CARGO', '2025-09-12', NULL, NULL, NULL),
  ('AUSTRALIA', 'AUSTRALIA', '6S (4+2)', 'Premium', '165-60-12', '2000W', 'Lithium', 'AUSTRALIA NEW MODEL', '2025-09-15', NULL, NULL, NULL),
  ('Bharat Electronics Limited (BEL)', 'Hyderabad', '6S (4+2)', 'Classic', '145-80-12', '2000W', 'Lithium', NULL, '2025-09-09', NULL, NULL, NULL);
