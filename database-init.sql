-- ============================================
-- Database initialization script
-- ============================================
-- This script creates all necessary tables, functions, triggers,
-- and RLS policies for the Instagram Slide Carousel Creator app
-- ============================================

-- 1. Create profiles table
-- Stores additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 2. Create generation_jobs table
-- Stores image generation job status and results
CREATE TABLE IF NOT EXISTS public.generation_jobs (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  slide_id TEXT NOT NULL,
  user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  image_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on generation_jobs
ALTER TABLE public.generation_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for generation_jobs
CREATE POLICY "Users can read their own generation jobs"
  ON public.generation_jobs
  FOR SELECT
  USING ((user_id IS NULL) OR (auth.uid() = user_id));

CREATE POLICY "Users can insert their own generation jobs"
  ON public.generation_jobs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generation jobs"
  ON public.generation_jobs
  FOR UPDATE
  USING ((user_id IS NULL) OR (auth.uid() = user_id));

CREATE POLICY "Users can delete their own generation jobs"
  ON public.generation_jobs
  FOR DELETE
  USING ((user_id IS NULL) OR (auth.uid() = user_id));

-- 3. Create utility functions
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- 4. Create triggers
-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on generation_jobs
DROP TRIGGER IF EXISTS update_generation_jobs_updated_at ON public.generation_jobs;
CREATE TRIGGER update_generation_jobs_updated_at
  BEFORE UPDATE ON public.generation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Script complete
-- ============================================
-- To run this script on your Supabase instance:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste this entire script
-- 3. Click "Run"
-- 
-- For Docker deployment with local Postgres:
-- docker exec -i <postgres_container> psql -U postgres < database-init.sql
-- ============================================
