-- ============================================================
-- COMBINED TODI CREATION SCHEMA + SEED DATA
-- Paste this entire file into:
--   Supabase Dashboard → SQL Editor → New Query → Run
-- Project: https://supabase.com/dashboard/project/byozkbjcsrlbeemveawy
-- ============================================================

-- ========== Base Schema ==========

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER trigger_update_categories_updated_at
    BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Products
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
    new_arrival BOOLEAN DEFAULT false NOT NULL,
    stock INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deleted_at TIMESTAMPTZ
);

CREATE TRIGGER trigger_update_products_updated_at
    BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inquiries
CREATE TABLE IF NOT EXISTS inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    items JSONB NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER trigger_update_inquiries_updated_at
    BEFORE UPDATE ON inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON products(new_arrival);

-- RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Category policies
CREATE POLICY "Allow public select on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow admin CRUD on categories" ON categories FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@todicreation.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@todicreation.com');

-- Product policies
CREATE POLICY "Allow public select for active products" ON products FOR SELECT
    USING (deleted_at IS NULL OR auth.jwt() ->> 'email' = 'admin@todicreation.com');
CREATE POLICY "Allow admin CRUD on products" ON products FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@todicreation.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@todicreation.com');

-- Inquiry policies
CREATE POLICY "Allow public insert on inquiries" ON inquiries FOR INSERT WITH CHECK (status = 'pending');
CREATE POLICY "Allow admin select, update, delete on inquiries" ON inquiries FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'email' = 'admin@todicreation.com')
    WITH CHECK (auth.jwt() ->> 'email' = 'admin@todicreation.com');

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read access to product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Allow admin upload to product-images" ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = 'admin@todicreation.com');
CREATE POLICY "Allow admin update product-images" ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = 'admin@todicreation.com');
CREATE POLICY "Allow admin delete from product-images" ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'product-images' AND auth.jwt() ->> 'email' = 'admin@todicreation.com');

-- ========== Seed Categories ==========

INSERT INTO categories (id, name, slug, description) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Bridal Collection', 'bridal-collection', 'Luxury bridal masterpieces handcrafted with timeless embroidery and royal craftsmanship.'),
  ('c0000000-0000-0000-0000-000000000002', 'Sider Lengha', 'sider-lengha', 'Elegant festive silhouettes designed for bridesmaids, celebrations and modern occasions.'),
  ('c0000000-0000-0000-0000-000000000003', 'Farsi Lengha', 'farsi-lengha', 'Classic heritage-inspired designs featuring graceful flares and intricate artisan detailing.'),
  ('c0000000-0000-0000-0000-000000000004', 'Indo Western', 'indo-western', 'Contemporary fusion couture combining modern fashion with traditional elegance.')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- ========== Seed Storage Policies for Service Role ==========

-- Allow service_role to bypass auth checks for storage (needed for import script)
CREATE POLICY "Allow service_role full access to product-images" ON storage.objects FOR ALL
    TO service_role
    USING (bucket_id = 'product-images')
    WITH CHECK (bucket_id = 'product-images');
