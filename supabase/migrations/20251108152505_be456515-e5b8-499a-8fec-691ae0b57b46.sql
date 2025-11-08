-- Add user_id column to generation_jobs (nullable first)
ALTER TABLE public.generation_jobs 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing permissive RLS policies
DROP POLICY IF EXISTS "Anyone can insert generation jobs" ON public.generation_jobs;
DROP POLICY IF EXISTS "Anyone can read generation jobs" ON public.generation_jobs;
DROP POLICY IF EXISTS "Anyone can update generation jobs" ON public.generation_jobs;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create user-scoped RLS policies for generation_jobs
CREATE POLICY "Users can insert their own generation jobs"
ON public.generation_jobs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own generation jobs"
ON public.generation_jobs
FOR SELECT
TO authenticated
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can update their own generation jobs"
ON public.generation_jobs
FOR UPDATE
TO authenticated
USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can delete their own generation jobs"
ON public.generation_jobs
FOR DELETE
TO authenticated
USING (user_id IS NULL OR auth.uid() = user_id);