-- Create generation_jobs table for tracking image generation status
CREATE TABLE IF NOT EXISTS public.generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_id text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  image_url text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow everyone to read (for polling)
CREATE POLICY "Anyone can read generation jobs"
  ON public.generation_jobs
  FOR SELECT
  USING (true);

-- Policy: Allow everyone to insert (for creating jobs)
CREATE POLICY "Anyone can insert generation jobs"
  ON public.generation_jobs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow everyone to update (for status updates)
CREATE POLICY "Anyone can update generation jobs"
  ON public.generation_jobs
  FOR UPDATE
  USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_generation_jobs_updated_at
  BEFORE UPDATE ON public.generation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();