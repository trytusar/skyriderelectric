/*
  # Fix NULL Status Values

  ## Overview
  Set default status for orders that have NULL status values

  ## Changes
  1. Update all NULL status values to 'In Production'
  2. Ensure all orders have a valid status

  ## Notes
  This ensures all orders are visible in the dashboard
*/

-- Update NULL status to In Production
UPDATE ev_orders 
SET status = 'In Production' 
WHERE status IS NULL OR status = '' OR status = 'Unknown';

-- Also update any old DELIVERED values (just in case)
UPDATE ev_orders 
SET status = 'Delivered' 
WHERE status = 'DELIVERED';
