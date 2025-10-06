/*
  # Fix visitor update policies for checkout cancellation

  1. Security Updates
    - Remove restrictive update policies
    - Add comprehensive update policy for anonymous users
    - Ensure both authenticated and anonymous users can update visitor records

  2. Policy Changes
    - Allow anonymous users to update all visitor fields
    - Remove any restrictions that might block status and check_out_time updates
*/

-- Drop existing restrictive update policies
DROP POLICY IF EXISTS "Allow anonymous visitor updates" ON visitors;
DROP POLICY IF EXISTS "Allow authenticated visitor updates" ON visitors;

-- Create comprehensive update policy for anonymous users
CREATE POLICY "Anonymous users can update all visitor data"
  ON visitors
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create comprehensive update policy for authenticated users
CREATE POLICY "Authenticated users can update all visitor data"
  ON visitors
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);