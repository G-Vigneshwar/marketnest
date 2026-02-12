/**
 * ============================================
 * MarketNest Database Schema
 * ============================================
 * 
 * This file contains all the SQL commands needed to set up your MarketNest
 * database in Supabase. Run these commands in your Supabase SQL Editor.
 * 
 * Structure:
 * 1. Users Table - Stores both brands and shoppers
 * 2. Products Table - Stores product listings
 * 3. Storage Bucket - For product images
 * 4. Security Policies - Row Level Security (RLS) settings
 * ============================================
 */


-- ============================================
-- SECTION 1: USERS TABLE
-- ============================================
-- This table stores user accounts for both BRAND and USER roles.
-- Brands use this to manage their products, shoppers use it for browsing.

CREATE TABLE IF NOT EXISTS public.users (
  -- Unique identifier (UUID or custom text)
  id text PRIMARY KEY,
  
  -- Email address (must be unique)
  email text UNIQUE NOT NULL,
  
  -- Password (stored as plain text in this demo app)
  -- In production, always hash passwords!
  password text NOT NULL,
  
  -- Display name (brand name or shopper name)
  name text NOT NULL,
  
  -- User role: either 'BRAND' (seller) or 'USER' (buyer)
  role text NOT NULL CHECK (role IN ('BRAND', 'USER')),
  
  -- When the account was created (auto-set to current UTC time)
  "createdAt" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ============================================
-- SECTION 2: SEED USERS (DEMO ACCOUNTS)
-- ============================================
-- These are default test accounts you can use to log in.
-- They will only be added if they don't already exist.

-- Add Brand Account (brand@brand.com / brand123)
INSERT INTO public.users (id, email, password, name, role)
SELECT 
  'brand-' || gen_random_uuid()::text,
  'brand@brand.com',
  'brand123',
  'Demo Brand',
  'BRAND'
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE email = 'brand@brand.com'
);

-- Add Shopper Account (shopper@shopper.com / shopper123)
INSERT INTO public.users (id, email, password, name, role)
SELECT 
  'shopper-' || gen_random_uuid()::text,
  'shopper@shopper.com',
  'shopper123',
  'Demo Shopper',
  'USER'
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE email = 'shopper@shopper.com'
);


-- ============================================
-- SECTION 3: PRODUCTS TABLE
-- ============================================
-- This table stores all product listings.
-- Each product belongs to a brand (seller).

CREATE TABLE IF NOT EXISTS public.products (
  -- Unique product identifier
  id text PRIMARY KEY,
  
  -- Link to the brand who sells this product
  -- REFERENCES means this must match an existing user id
  "brandId" text NOT NULL REFERENCES public.users(id),
  
  -- Brand name stored for faster queries (denormalized data)
  "brandName" text NOT NULL,
  
  -- Product details
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,  -- Decimal number for prices
  category text NOT NULL,   -- e.g., "Outerwear", "Accessories", etc.
  
  -- URL to product image (stored in Supabase Storage)
  "imageUrl" text NOT NULL,
  
  -- When the product was listed
  "createdAt" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ============================================
-- SECTION 4: IMAGE STORAGE SETUP
-- ============================================
-- This section sets up a storage bucket for product images.
-- Images are uploaded here and the URL is saved in the products table.


-- Step 1: Create the storage bucket (container for images)
-- The bucket is set to 'public' so images can be viewed by anyone
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- SECTION 5: STORAGE POLICIES (SECURITY)
-- ============================================
-- These policies control WHO can do WHAT with images.
-- 
-- For this demo app, we use permissive policies because our app
-- manages authentication through a custom system (not Supabase Auth).
-- 
-- IN PRODUCTION: You should restrict these based on proper authentication!


-- Allow anyone to VIEW images (public read access)
CREATE POLICY "Public Read Images" ON storage.objects
FOR SELECT 
USING ( bucket_id = 'product-images' );


-- Allow anyone to UPLOAD images (demo mode)
-- This bypasses auth checks for simplicity
CREATE POLICY "Public Upload Images" ON storage.objects
FOR INSERT 
WITH CHECK ( bucket_id = 'product-images' );


-- Allow anyone to UPDATE images
CREATE POLICY "Public Update Images" ON storage.objects
FOR UPDATE 
USING ( bucket_id = 'product-images' );


-- Allow anyone to DELETE images
CREATE POLICY "Public Delete Images" ON storage.objects
FOR DELETE 
USING ( bucket_id = 'product-images' );


-- ============================================
-- SECTION 6: ROW LEVEL SECURITY (RLS)
-- ============================================
-- RLS adds an extra layer of security to your tables.
-- When enabled, rows are automatically filtered based on policies.
--
-- For this demo, we allow full access because:
-- 1. Our app handles auth in the frontend
-- 2. We want maximum flexibility for testing
--
-- IN PRODUCTION: Use proper RLS policies based on user identity!


-- Enable RLS on users and products tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;


-- Allow full access to users table (demo mode)
CREATE POLICY "Public Users Access" ON public.users
FOR ALL USING (true) WITH CHECK (true);


-- Allow full access to products table (demo mode)
CREATE POLICY "Public Products Access" ON public.products
FOR ALL USING (true) WITH CHECK (true);


-- ============================================
-- SUMMARY
-- ============================================
-- After running this file, your Supabase project will have:
-- 1. A 'users' table with brand and shopper accounts
-- 2. A 'products' table for product listings
-- 3. A 'product-images' storage bucket for images
-- 4. Proper security policies for demo use
--
-- You can now connect your frontend to Supabase!
-- ============================================

