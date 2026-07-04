-- Supabase Migration: 20260704000000_remove_price.sql
-- Description: Drop price column and delete all products in the database.

-- 1. Delete all existing products in the 4 categories
DELETE FROM products;

-- 2. Drop price column from products table
ALTER TABLE products DROP COLUMN IF EXISTS price CASCADE;
