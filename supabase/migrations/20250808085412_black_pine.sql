/*
  # Create mind maps table

  1. New Tables
    - `mind_maps`
      - `id` (uuid, primary key)
      - `name` (text)
      - `nodes` (jsonb, stores node data)
      - `edges` (jsonb, stores edge data)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `owner_id` (uuid, references profiles)
      - `collaborators` (text array, stores user IDs)

  2. Security
    - Enable RLS on `mind_maps` table
    - Add policies for owners to manage their maps
    - Add policies for collaborators to read/update shared maps
*/

-- Create mind_maps table
CREATE TABLE IF NOT EXISTS mind_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Untitled Mind Map',
  nodes jsonb DEFAULT '[]'::jsonb,
  edges jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  collaborators text[] DEFAULT '{}'::text[]
);

-- Enable RLS
ALTER TABLE mind_maps ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Owners can manage their mind maps"
  ON mind_maps
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Collaborators can read shared mind maps"
  ON mind_maps
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = ANY(collaborators));

CREATE POLICY "Collaborators can update shared mind maps"
  ON mind_maps
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = ANY(collaborators))
  WITH CHECK (auth.uid()::text = ANY(collaborators));

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS mind_maps_updated_at ON mind_maps;
CREATE TRIGGER mind_maps_updated_at
  BEFORE UPDATE ON mind_maps
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS mind_maps_owner_id_idx ON mind_maps(owner_id);
CREATE INDEX IF NOT EXISTS mind_maps_collaborators_idx ON mind_maps USING GIN(collaborators);
CREATE INDEX IF NOT EXISTS mind_maps_updated_at_idx ON mind_maps(updated_at DESC);