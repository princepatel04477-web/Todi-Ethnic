-- Supabase Seed Migration: Categories Only
-- 
-- Seeding only the four categories: Bridal Lehenga, Sider Lehenga, Farsi Lehenga, Indo-Western.
-- All product seeding has been removed per client requests.

-- ============================================================
-- 1. UPSERT CATEGORIES
-- ============================================================
INSERT INTO categories (id, name, slug, description, image_url)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Bridal Lehenga', 'bridal-lehengas', 'Luxury bridal masterpieces handcrafted with timeless embroidery and royal craftsmanship.', '/images/categories/Bridal-cc.png'),
  ('c0000000-0000-0000-0000-000000000002', 'Sider Lehenga', 'sider-lehengas', 'Elegant festive silhouettes designed for bridesmaids, celebrations and modern occasions.', '/images/categories/Sider.png'),
  ('c0000000-0000-0000-0000-000000000003', 'Farsi Lehenga', 'farsi-lehengas', 'Classic heritage-inspired designs featuring graceful flares and intricate artisan detailing.', '/images/categories/farsi.png'),
  ('c0000000-0000-0000-0000-000000000004', 'Indo-Western', 'indo-western', 'Contemporary fusion couture combining modern fashion with traditional elegance.', '/images/categories/Indo-Western.png')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;
