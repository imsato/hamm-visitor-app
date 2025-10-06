/*
  # Fix Visitor RLS Policies for Database Updates

  1. Security Updates
    - Update RLS policies to allow anonymous users to perform UPDATE operations
    - Ensure checkout and checkout cancellation operations work properly
    - Maintain security while allowing necessary operations

  2. Policy Changes
    - Allow anonymous users to update visitor status and checkout times
    - Allow anonymous users to cancel checkout operations
    - Keep other security restrictions in place
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Allow anonymous checkout update" ON visitors;
DROP POLICY IF EXISTS "Authenticated users can update visitors" ON visitors;

-- Create comprehensive update policy for anonymous users
CREATE POLICY "Allow anonymous visitor updates"
  ON visitors
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create comprehensive update policy for authenticated users
CREATE POLICY "Allow authenticated visitor updates"
  ON visitors
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;