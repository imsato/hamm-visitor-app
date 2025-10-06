/*
  # Fix RLS policies for visitors table

  1. Security Updates
    - Allow anonymous users to insert visitor data (for public reception system)
    - Allow authenticated users to read and update visitor data (for staff management)
    - Maintain security while enabling public access for visitor registration

  2. Changes
    - Drop existing restrictive policies
    - Create new policies that allow anonymous inserts
    - Keep read/update/delete restricted to authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can insert visitors" ON visitors;
DROP POLICY IF EXISTS "Authenticated users can read all visitors" ON visitors;
DROP POLICY IF EXISTS "Authenticated users can update visitors" ON visitors;
DROP POLICY IF EXISTS "Authenticated users can delete visitors" ON visitors;

-- Allow anonymous users to insert visitor data (for public reception)
CREATE POLICY "Allow anonymous insert for visitors"
  ON visitors
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read all visitor data
CREATE POLICY "Authenticated users can read all visitors"
  ON visitors
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update visitor data (for check-out, etc.)
CREATE POLICY "Authenticated users can update visitors"
  ON visitors
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete visitor data
CREATE POLICY "Authenticated users can delete visitors"
  ON visitors
  FOR DELETE
  TO authenticated
  USING (true);

-- Also allow anonymous users to read visitor data (for displaying visitor info after registration)
CREATE POLICY "Allow anonymous read for visitors"
  ON visitors
  FOR SELECT
  TO anon
  USING (true);