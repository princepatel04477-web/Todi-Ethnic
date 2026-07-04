-- Supabase Migration: 20260629000000_schema.sql
-- Description: Base database schema for Todi Creation.
-- Defines categories, products, inquiries, triggers, indexes, and RLS policies.

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

---------------------------------------------------------
-- 1. Trigger Function to auto-update updated_at columns
---------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


---------------------------------------------------------
-- 2. Categories Table
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Attach update_at trigger to categories
CREATE TRIGGER trigger_update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


---------------------------------------------------------
-- 3. Products Table
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    fabric TEXT NOT NULL,
    image_urls TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    featured BOOLEAN DEFAULT false NOT NULL,
    stock INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- Attach update_at trigger to products
CREATE TRIGGER trigger_update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


---------------------------------------------------------
-- 4. Inquiries Table
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    items JSONB NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Attach update_at trigger to inquiries
CREATE TRIGGER trigger_update_inquiries_updated_at
    BEFORE UPDATE ON inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


---------------------------------------------------------
-- 5. Indexes
---------------------------------------------------------
-- Indexes on categories table
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Indexes on products table
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);


---------------------------------------------------------
-- 6. Row Level Security (RLS) & Policies
---------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Allow public select on categories"
    ON categories FOR SELECT
    USING (true);

CREATE POLICY "Allow admin CRUD on categories"
    ON categories FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@todicreation.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@todicreation.com');

-- Policies for products
CREATE POLICY "Allow public select for active products"
    ON products FOR SELECT
    USING (deleted_at IS NULL OR auth.jwt() ->> 'email' = 'admin@todicreation.com');

CREATE POLICY "Allow admin CRUD on products"
    ON products FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@todicreation.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@todicreation.com');

-- Policies for inquiries
CREATE POLICY "Allow public insert on inquiries"
    ON inquiries FOR INSERT
    WITH CHECK (status = 'pending');

CREATE POLICY "Allow admin select, update, delete on inquiries"
    ON inquiries FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@todicreation.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@todicreation.com');


---------------------------------------------------------
-- 7. Storage Bucket & Storage Policies
---------------------------------------------------------
-- Ensure storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the product-images bucket
CREATE POLICY "Allow public read access to product-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated admin to upload to product-images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = 'admin@todicreation.com');

CREATE POLICY "Allow authenticated admin to update product-images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = 'admin@todicreation.com')
    WITH CHECK (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = 'admin@todicreation.com');

CREATE POLICY "Allow authenticated admin to delete from product-images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = 'admin@todicreation.com');
