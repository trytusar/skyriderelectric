/*
  # Update Order Status Values

  ## Overview
  Updates the existing orders to use new status values and prepares the system for the new status workflow.

  ## Changes
  1. Update existing 'DELIVERED' status to 'Delivered'
  2. Set NULL status values to 'In Production'
  3. No schema changes needed - status column already supports text values

  ## New Status Options
  - Priority: High priority orders (orange color in UI)
  - In Production: Normal production flow (yellow color in UI)
  - Stock: Completed and in stock (hidden by default, shown via filter)
  - Delivered: Delivered to customer (hidden by default, shown via filter)

  ## Notes
  This migration updates existing data to align with new status values.
  Future orders will use these new status options.
*/

-- Update existing DELIVERED status to new format
UPDATE ev_orders 
SET status = 'Delivered' 
WHERE status = 'DELIVERED';

-- Set NULL status to In Production for existing orders
UPDATE ev_orders 
SET status = 'In Production' 
WHERE status IS NULL;
