/*
  # Add No Progress status option

  1. Changes
    - Update the status check constraint to include 'No Progress' as a valid status option
    - This allows orders to be marked as 'No Progress' (displayed in red)
  
  2. Notes
    - Existing data is not affected
    - All existing status values remain valid
*/

DO $$ 
BEGIN
  -- Drop the existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ev_orders_status_check'
  ) THEN
    ALTER TABLE ev_orders DROP CONSTRAINT ev_orders_status_check;
  END IF;

  -- Add new constraint with 'No Progress' included
  ALTER TABLE ev_orders ADD CONSTRAINT ev_orders_status_check 
    CHECK (status IN ('Priority', 'In Production', 'Stock', 'Delivered', 'No Progress'));
END $$;
