#!/usr/bin/env npx tsx
/**
 * Seed Products to Supabase
 * 
 * This script:
 * 1. Uploads product images to Supabase Storage
 * 2. Detects and skips duplicate images by file hash
 * 3. Inserts products into the database
 * 4. Provides verification and reporting
 * 
 * Usage: npx tsx scripts/seed-products.ts
 * 
 * Requires environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';

// Types
interface ProductData {
  id: string;
  title: string;
  slug: string;
  description: string;
  sku: string;
    category_id: string;
  fabric: string;
  image_urls: string[];
  featured: boolean;
  stock: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ImageFile {
  path: string;
  hash: string;
  category: string;
  productName: string;
}

interface UploadResult {
  originalPath: string;
  storagePath: string;
  publicUrl: string;
  hash: string;
  skipped: boolean;
  reason?: string;
}

// Category mapping
const CATEGORIES: Record<string, Category> = {
  bridal: {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Bridal Collection',
    slug: 'bridal-collection',
  },
  sider: {
    id: 'c0000000-0000-0000-0000-000000000002',
    name: 'Sider Lehenga',
    slug: 'sider-lehengas',
  },
  farsi: {
    id: 'c0000000-0000-0000-0000-000000000003',
    name: 'Farsi Lehenga',
    slug: 'farsi-lehengas',
  },
  'indo-western': {
    id: 'c0000000-0000-0000-0000-000000000004',
    name: 'Indo-Western',
    slug: 'indo-western',
  },
};

// Product definitions from the existing migration
const PRODUCT_DEFINITIONS: Record<string, Partial<ProductData>[]> = {
  bridal: [
    { id: 'b0000000-0000-0000-0000-000000000001', title: 'Royal Bridal Zardozi Lengha 6332', sku: 'TC-BRD-6332', fabric: 'Banarasi Silk', featured: true, stock: 8 },
    { id: 'b0000000-0000-0000-0000-000000000002', title: 'Heritage Bridal Lengha 6333', sku: 'TC-BRD-6333', fabric: 'Banarasi Silk', featured: false, stock: 6 },
    { id: 'b0000000-0000-0000-0000-000000000003', title: 'Majestic Bridal Lengha 6412', sku: 'TC-BRD-6412', fabric: 'Banarasi Silk', featured: false, stock: 10 },
    { id: 'b0000000-0000-0000-0000-000000000004', title: 'Regal Bridal Lengha 7009', sku: 'TC-BRD-7009', fabric: 'Banarasi Silk', featured: true, stock: 5 },
    { id: 'b0000000-0000-0000-0000-000000000005', title: 'Zardozi Empress Lengha 7148', sku: 'TC-BRD-7148', fabric: 'Velvet Silk', featured: true, stock: 3 },
    { id: 'b0000000-0000-0000-0000-000000000006', title: 'Imperial Bridal Lengha 7164', sku: 'TC-BRD-7164', fabric: 'Bridal Georgette', featured: false, stock: 7 },
    { id: 'b0000000-0000-0000-0000-000000000007', title: 'Classic Bridal Lengha 7405', sku: 'TC-BRD-7405', fabric: 'Raw Silk', featured: false, stock: 12 },
    { id: 'b0000000-0000-0000-0000-000000000008', title: 'Kundan Bridal Lengha 7415', sku: 'TC-BRD-7415', fabric: 'Banarasi Silk', featured: false, stock: 9 },
    { id: 'b0000000-0000-0000-0000-000000000009', title: 'Velvet Heritage Lengha 7416', sku: 'TC-BRD-7416', fabric: 'Velvet Silk', featured: false, stock: 4 },
    { id: 'b0000000-0000-0000-0000-000000000010', title: 'Royal Canopy Bridal Lengha 7417', sku: 'TC-BRD-7417', fabric: 'Banarasi Silk', featured: true, stock: 6 },
    { id: 'b0000000-0000-0000-0000-000000000011', title: 'Pearl Essence Lengha 7421', sku: 'TC-BRD-7421', fabric: 'Bridal Georgette', featured: false, stock: 8 },
    { id: 'b0000000-0000-0000-0000-000000000012', title: 'Grandeur Bridal Lengha 7422', sku: 'TC-BRD-7422', fabric: 'Banarasi Silk', featured: false, stock: 7 },
    { id: 'b0000000-0000-0000-0000-000000000013', title: 'Zari Cascade Lengha 7423', sku: 'TC-BRD-7423', fabric: 'Banarasi Silk', featured: false, stock: 10 },
    { id: 'b0000000-0000-0000-0000-000000000014', title: 'Silk Lustre Lengha 7424', sku: 'TC-BRD-7424', fabric: 'Raw Silk', featured: false, stock: 8 },
    { id: 'b0000000-0000-0000-0000-000000000015', title: 'Floral Heritage Lengha 7425', sku: 'TC-BRD-7425', fabric: 'Bridal Georgette', featured: false, stock: 6 },
    { id: 'b0000000-0000-0000-0000-000000000016', title: 'Regal Gold Lengha 7426', sku: 'TC-BRD-7426', fabric: 'Banarasi Silk', featured: false, stock: 5 },
    { id: 'b0000000-0000-0000-0000-000000000017', title: 'Zardosi Dream Lengha 7428', sku: 'TC-BRD-7428', fabric: 'Velvet Silk', featured: true, stock: 4 },
    { id: 'b0000000-0000-0000-0000-000000000018', title: 'Royal Brocade Lengha 7429', sku: 'TC-BRD-7429', fabric: 'Banarasi Silk', featured: false, stock: 7 },
    { id: 'b0000000-0000-0000-0000-000000000019', title: 'Heritage Weave Lengha 7431', sku: 'TC-BRD-7431', fabric: 'Banarasi Silk', featured: false, stock: 11 },
    { id: 'b0000000-0000-0000-0000-000000000020', title: 'Zardozi Majesty Lengha 7432', sku: 'TC-BRD-7432', fabric: 'Velvet Silk', featured: false, stock: 6 },
  ],
  sider: [
    { id: 'b0000000-0000-0000-0000-000000000021', title: 'Festive Sider Lengha 7404', sku: 'TC-SDR-7404', fabric: 'Georgette', featured: false, stock: 15 },
    { id: 'b0000000-0000-0000-0000-000000000022', title: 'Modern Sider Lengha 7406', sku: 'TC-SDR-7406', fabric: 'Georgette', featured: false, stock: 12 },
    { id: 'b0000000-0000-0000-0000-000000000023', title: 'Celestial Sider Lengha 7407', sku: 'TC-SDR-7407', fabric: 'Georgette', featured: false, stock: 10 },
    { id: 'b0000000-0000-0000-0000-000000000024', title: 'Garden Bloom Sider Lengha 7408', sku: 'TC-SDR-7408', fabric: 'Chiffon', featured: false, stock: 14 },
    { id: 'b0000000-0000-0000-0000-000000000025', title: 'Resham Grace Lengha 7409', sku: 'TC-SDR-7409', fabric: 'Georgette', featured: false, stock: 11 },
    { id: 'b0000000-0000-0000-0000-000000000026', title: 'Summer Bloom Sider Lengha 7410', sku: 'TC-SDR-7410', fabric: 'Chiffon', featured: false, stock: 18 },
    { id: 'b0000000-0000-0000-0000-000000000027', title: 'Golden Thread Sider Lengha 7411', sku: 'TC-SDR-7411', fabric: 'Silk Georgette', featured: true, stock: 8 },
    { id: 'b0000000-0000-0000-0000-000000000028', title: 'Festive Radiance Lengha 7412', sku: 'TC-SDR-7412', fabric: 'Georgette', featured: false, stock: 13 },
    { id: 'b0000000-0000-0000-0000-000000000029', title: 'Pearl Bloom Lengha 7413', sku: 'TC-SDR-7413', fabric: 'Silk Georgette', featured: false, stock: 9 },
    { id: 'b0000000-0000-0000-0000-000000000030', title: 'Orchid Trail Sider Lengha 7414', sku: 'TC-SDR-7414', fabric: 'Chiffon', featured: false, stock: 10 },
    { id: 'b0000000-0000-0000-0000-000000000031', title: 'Twilight Sider Lengha 7418', sku: 'TC-SDR-7418', fabric: 'Georgette', featured: false, stock: 12 },
    { id: 'b0000000-0000-0000-0000-000000000032', title: 'Meadow Sider Lengha 7419', sku: 'TC-SDR-7419', fabric: 'Chiffon', featured: false, stock: 16 },
    { id: 'b0000000-0000-0000-0000-000000000033', title: 'Aurora Sider Lengha 7420', sku: 'TC-SDR-7420', fabric: 'Georgette', featured: false, stock: 11 },
    { id: 'b0000000-0000-0000-0000-000000000034', title: 'Elegant Sider Lengha 7427', sku: 'TC-SDR-7427', fabric: 'Silk Georgette', featured: false, stock: 14 },
    { id: 'b0000000-0000-0000-0000-000000000035', title: 'Crystal Sider Lengha 7439', sku: 'TC-SDR-7439', fabric: 'Georgette', featured: true, stock: 7 },
    { id: 'b0000000-0000-0000-0000-000000000036', title: 'Starlight Sider Lengha 7440', sku: 'TC-SDR-7440', fabric: 'Silk Georgette', featured: false, stock: 9 },
    { id: 'b0000000-0000-0000-0000-000000000037', title: 'Regal Sider Lengha 7441', sku: 'TC-SDR-7441', fabric: 'Georgette', featured: false, stock: 8 },
    { id: 'b0000000-0000-0000-0000-000000000038', title: 'Blossom Sider Lengha 7442', sku: 'TC-SDR-7442', fabric: 'Chiffon', featured: false, stock: 13 },
    { id: 'b0000000-0000-0000-0000-000000000039', title: 'Festive Grace Lengha 7450', sku: 'TC-SDR-7450', fabric: 'Georgette', featured: false, stock: 15 },
    { id: 'b0000000-0000-0000-0000-000000000040', title: 'Golden Hour Sider Lengha 7451', sku: 'TC-SDR-7451', fabric: 'Silk Georgette', featured: false, stock: 10 },
  ],
  farsi: [
    { id: 'b0000000-0000-0000-0000-000000000041', title: 'Classic Trail Farsi Lengha 8085', sku: 'TC-FAR-8085', fabric: 'Banarasi Silk', featured: true, stock: 8 },
    { id: 'b0000000-0000-0000-0000-000000000042', title: 'Royal Trail Farsi Lengha 8096', sku: 'TC-FAR-8096', fabric: 'Banarasi Silk', featured: false, stock: 6 },
    { id: 'b0000000-0000-0000-0000-000000000043', title: 'Zari Trail Farsi Lengha 8097', sku: 'TC-FAR-8097', fabric: 'Banarasi Silk', featured: false, stock: 7 },
    { id: 'b0000000-0000-0000-0000-000000000044', title: 'Heritage Trail Lengha 8098', sku: 'TC-FAR-8098', fabric: 'Raw Silk', featured: false, stock: 9 },
    { id: 'b0000000-0000-0000-0000-000000000045', title: 'Grand Trail Farsi Lengha 8099', sku: 'TC-FAR-8099', fabric: 'Banarasi Silk', featured: false, stock: 5 },
    { id: 'b0000000-0000-0000-0000-000000000046', title: 'Trail Elegance Lengha 8212', sku: 'TC-FAR-8212', fabric: 'Georgette', featured: false, stock: 10 },
    { id: 'b0000000-0000-0000-0000-000000000047', title: 'Silk Trail Farsi Lengha 8213', sku: 'TC-FAR-8213', fabric: 'Banarasi Silk', featured: false, stock: 8 },
    { id: 'b0000000-0000-0000-0000-000000000048', title: 'Vintage Trail Farsi Lengha 8271', sku: 'TC-FAR-8271', fabric: 'Raw Silk', featured: false, stock: 7 },
    { id: 'b0000000-0000-0000-0000-000000000049', title: 'Gold Border Trail Lengha 8272', sku: 'TC-FAR-8272', fabric: 'Banarasi Silk', featured: true, stock: 6 },
    { id: 'b0000000-0000-0000-0000-000000000050', title: 'Resham Trail Farsi Lengha 8273', sku: 'TC-FAR-8273', fabric: 'Georgette', featured: false, stock: 9 },
    { id: 'b0000000-0000-0000-0000-000000000051', title: 'Zardosi Trail Farsi Lengha 8274', sku: 'TC-FAR-8274', fabric: 'Velvet Silk', featured: false, stock: 4 },
    { id: 'b0000000-0000-0000-0000-000000000052', title: 'Trail Cascade Lengha 8366', sku: 'TC-FAR-8366', fabric: 'Banarasi Silk', featured: false, stock: 5 },
    { id: 'b0000000-0000-0000-0000-000000000053', title: 'Garden Trail Lengha 8373', sku: 'TC-FAR-8373', fabric: 'Georgette', featured: false, stock: 11 },
    { id: 'b0000000-0000-0000-0000-000000000054', title: 'Royal Farsi Lengha 8374', sku: 'TC-FAR-8374', fabric: 'Banarasi Silk', featured: false, stock: 6 },
    { id: 'b0000000-0000-0000-0000-000000000055', title: 'Velvet Trail Farsi Lengha 8430', sku: 'TC-FAR-8430', fabric: 'Velvet Silk', featured: false, stock: 5 },
    { id: 'b0000000-0000-0000-0000-000000000056', title: 'Heritage Gold Trail Lengha 8433', sku: 'TC-FAR-8433', fabric: 'Banarasi Silk', featured: false, stock: 8 },
    { id: 'b0000000-0000-0000-0000-000000000057', title: 'Silk Trail Cascade Lengha 8469', sku: 'TC-FAR-8469', fabric: 'Raw Silk', featured: false, stock: 7 },
    { id: 'b0000000-0000-0000-0000-000000000058', title: 'Grand Farsi Lengha 8470', sku: 'TC-FAR-8470', fabric: 'Banarasi Silk', featured: true, stock: 4 },
    { id: 'b0000000-0000-0000-0000-000000000059', title: 'Majestic Trail Farsi Lengha 8471', sku: 'TC-FAR-8471', fabric: 'Velvet Silk', featured: false, stock: 3 },
  ],
  'indo-western': [
    { id: 'b0000000-0000-0000-0000-000000000060', title: 'Contemporary Fusion Indo-Western Set', sku: 'TC-IND-001', fabric: 'Indo-Western Silk', featured: true, stock: 10 },
  ],
};

// Descriptions for products
const PRODUCT_DESCRIPTIONS: Record<string, string> = {
  bridal: 'Opulent bridal lengha handcrafted with intricate embroidery and fine craftsmanship.',
  sider: 'Elegant sider lengha with delicate handwork and contemporary design.',
  farsi: 'Graceful heritage lengha featuring classic trail cuts and traditional detailing.',
  'indo-western': 'Modern asymmetrical silhouette with premium handworked embroidery and contemporary cuts for the fashion-forward boutique.',
};

// Utility functions
function computeFileHash(filePath: string): string {
  const fileBuffer = readFileSync(filePath);
  const hash = createHash('sha256');
  hash.update(fileBuffer);
  return hash.digest('hex');
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getImageFiles(folders: Record<string, string>): ImageFile[] {
  const images: ImageFile[] = [];

  for (const [categoryKey, folderPath] of Object.entries(folders)) {
    if (!existsSync(folderPath)) {
      console.warn(`⚠️  Folder not found: ${folderPath}`);
      continue;
    }

    // Check if it's a file (for Indo Western single file case)
    const stats = statSync(folderPath);
    if (stats.isFile()) {
      const hash = computeFileHash(folderPath);
      const fileName = basename(folderPath);
      images.push({
        path: folderPath,
        hash,
        category: categoryKey,
        productName: fileName.replace(/\.[^.]+$/, ''),
      });
      continue;
    }

    // It's a directory
    const files = readdirSync(folderPath);
    for (const file of files) {
      const ext = extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        const filePath = join(folderPath, file);
        const hash = computeFileHash(filePath);
        // Extract product number from filename (e.g., "6332.jpeg_202606302100.jpeg" -> "6332")
        const baseName = file.split('.')[0];
        images.push({
          path: filePath,
          hash,
          category: categoryKey,
          productName: baseName,
        });
      }
    }
  }

  return images;
}

function findDuplicates(images: ImageFile[]): Map<string, ImageFile[]> {
  const hashMap = new Map<string, ImageFile[]>();

  for (const image of images) {
    const existing = hashMap.get(image.hash) || [];
    existing.push(image);
    hashMap.set(image.hash, existing);
  }

  return hashMap;
}

async function ensureBucketExists(supabase: SupabaseClient, bucketName: string): Promise<boolean> {
  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    console.error('❌ Error listing buckets:', error.message);
    return false;
  }

  const bucketExists = buckets.some((b) => b.name === bucketName);

  if (!bucketExists) {
    console.log(`📦 Creating bucket: ${bucketName}`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
    });

    if (createError) {
      console.error('❌ Error creating bucket:', createError.message);
      return false;
    }
    console.log(`✅ Bucket "${bucketName}" created`);
  } else {
    console.log(`✅ Bucket "${bucketName}" already exists`);
  }

  return true;
}

async function uploadImage(
  supabase: SupabaseClient,
  bucketName: string,
  imagePath: string,
  storagePath: string,
  existingHashes: Set<string>
): Promise<UploadResult> {
  const fileBuffer = readFileSync(imagePath);
  const hash = createHash('sha256').update(fileBuffer).digest('hex');

  // Check if already uploaded by hash
  if (existingHashes.has(hash)) {
    return {
      originalPath: imagePath,
      storagePath,
      publicUrl: '',
      hash,
      skipped: true,
      reason: 'Duplicate hash - already uploaded',
    };
  }

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(storagePath, fileBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    console.error(`❌ Upload failed for ${imagePath}:`, error.message);
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucketName).getPublicUrl(storagePath);

  existingHashes.add(hash);

  return {
    originalPath: imagePath,
    storagePath,
    publicUrl,
    hash,
    skipped: false,
  };
}

async function ensureCategoriesExist(
  supabase: SupabaseClient,
  categories: Record<string, Category>
): Promise<boolean> {
  console.log('\n📋 Ensuring categories exist...');

  for (const [key, category] of Object.entries(categories)) {
    const { error } = await supabase.from('categories').upsert(
      {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: PRODUCT_DESCRIPTIONS[key] || '',
      },
      { onConflict: 'slug' }
    );

    if (error) {
      console.error(`❌ Error upserting category ${category.name}:`, error.message);
      return false;
    }
    console.log(`  ✅ ${category.name}`);
  }

  return true;
}

async function insertProducts(
  supabase: SupabaseClient,
  uploadResults: UploadResult[],
  productDefinitions: Record<string, Partial<ProductData>[]>
): Promise<{ success: number; failed: number }> {
  console.log('\n📝 Inserting products...');

  let success = 0;
  let failed = 0;

  // Group uploads by category
  const uploadsByCategory: Record<string, UploadResult[]> = {};
  for (const result of uploadResults) {
    // Extract category from storage path (e.g., "bridal/6332.jpeg" -> "bridal")
    const category = result.storagePath.split('/')[0];
    if (!uploadsByCategory[category]) {
      uploadsByCategory[category] = [];
    }
    uploadsByCategory[category].push(result);
  }

  // Insert products for each category
  for (const [categoryKey, uploads] of Object.entries(uploadsByCategory)) {
    const definitions = productDefinitions[categoryKey] || [];

    for (let i = 0; i < uploads.length && i < definitions.length; i++) {
      const upload = uploads[i];
      const def = definitions[i];

      if (!def || !upload.publicUrl) {
        continue;
      }

      const product: ProductData = {
        id: def.id!,
        title: def.title!,
        slug: generateSlug(def.title!),
        description: PRODUCT_DESCRIPTIONS[categoryKey] || '',
        sku: def.sku!,
                category_id: CATEGORIES[categoryKey].id,
        fabric: def.fabric!,
        image_urls: [upload.publicUrl],
        featured: def.featured || false,
        stock: def.stock || 1,
      };

      const { error } = await supabase.from('products').upsert(product, {
        onConflict: 'slug',
      });

      if (error) {
        console.error(`  ❌ Failed to insert ${product.title}:`, error.message);
        failed++;
      } else {
        console.log(`  ✅ ${product.title}`);
        success++;
      }
    }
  }

  return { success, failed };
}

async function verifySeeding(supabase: SupabaseClient): Promise<void> {
  console.log('\n🔍 Verification Results:');
  console.log('='.repeat(50));

  // Count products by category
  const { data: products, error } = await supabase
    .from('products')
    .select('category_id, image_urls')
    .is('deleted_at', null);

  if (error) {
    console.error('❌ Error fetching products for verification:', error.message);
    return;
  }

  // Count by category
  const categoryCounts: Record<string, number> = {};
  const imageUrls = new Set<string>();
  let duplicateCount = 0;

  for (const product of products || []) {
    const categoryName = Object.values(CATEGORIES).find((c) => c.id === product.category_id)?.name || 'Unknown';
    categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;

    // Check for duplicate image URLs
    for (const url of product.image_urls || []) {
      if (imageUrls.has(url)) {
        duplicateCount++;
      } else {
        imageUrls.add(url);
      }
    }
  }

  console.log('\n📊 Products by Category:');
  for (const [category, count] of Object.entries(categoryCounts)) {
    console.log(`  ${category}: ${count} products`);
  }

  console.log(`\n📈 Total products: ${products?.length || 0}`);
  console.log(`🖼️  Unique images: ${imageUrls.size}`);
  console.log(`⚠️  Duplicate image URLs: ${duplicateCount}`);

  // Flag Indo-Western
  const indoWesternCount = categoryCounts['Indo-Western'] || 0;
  if (indoWesternCount < 5) {
    console.log(`\n⚠️  WARNING: Indo-Western category has only ${indoWesternCount} product(s).`);
    console.log('   This category needs more product photography before it looks credible alongside other categories.');
  }

  console.log('\n' + '='.repeat(50));
}

// Main execution
async function main() {
  console.log('🚀 Starting product seeding script...\n');

  // Load environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅' : '❌');
    console.error('\n   Please set these in your .env.local file');
    process.exit(1);
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Define image folders
  const imageFolders: Record<string, string> = {
    bridal: join(process.cwd(), 'Bridal_Photos'),
    sider: join(process.cwd(), 'Sider_Lengha'),
    farsi: join(process.cwd(), 'Farsi_lengha'),
    'indo-western': join(process.cwd(), 'Indo_western.jpeg'),
  };

  const BUCKET_NAME = 'product-images';

  // Step 1: Ensure bucket exists
  console.log('📦 Setting up storage bucket...');
  const bucketReady = await ensureBucketExists(supabase, BUCKET_NAME);
  if (!bucketReady) {
    process.exit(1);
  }

  // Step 2: Get all image files and detect duplicates
  console.log('\n📁 Scanning image files...');
  const images = getImageFiles(imageFolders);
  console.log(`Found ${images.length} images`);

  const duplicateMap = findDuplicates(images);
  const duplicateGroups = Array.from(duplicateMap.values()).filter((group) => group.length > 1);

  if (duplicateGroups.length > 0) {
    console.log(`\n⚠️  Found ${duplicateGroups.length} duplicate image groups:`);
    for (const group of duplicateGroups) {
      console.log(`  Hash: ${group[0].hash.substring(0, 8)}...`);
      for (const img of group) {
        console.log(`    - ${img.path}`);
      }
    }
  }

  // Step 3: Ensure categories exist
  const categoriesReady = await ensureCategoriesExist(supabase, CATEGORIES);
  if (!categoriesReady) {
    process.exit(1);
  }

  // Step 4: Upload images
  console.log('\n📤 Uploading images...');
  const existingHashes = new Set<string>();
  const uploadResults: UploadResult[] = [];

  for (const image of images) {
    // Determine storage path
    const ext = extname(image.path);
    const storagePath = `${image.category}/${image.productName}${ext}`;

    try {
      const result = await uploadImage(supabase, BUCKET_NAME, image.path, storagePath, existingHashes);
      uploadResults.push(result);

      if (result.skipped) {
        console.log(`  ⏭️  Skipped (duplicate): ${image.path}`);
      } else {
        console.log(`  ✅ Uploaded: ${storagePath}`);
      }
    } catch {
      console.error(`  ❌ Failed: ${image.path}`);
    }
  }

  // Step 5: Insert products
  const insertResults = await insertProducts(supabase, uploadResults, PRODUCT_DEFINITIONS);

  // Step 6: Verify
  await verifySeeding(supabase);

  // Final summary
  console.log('\n✨ Seeding complete!');
  console.log(`   Products inserted: ${insertResults.success}`);
  console.log(`   Products failed: ${insertResults.failed}`);
  console.log(`   Images uploaded: ${uploadResults.filter((r) => !r.skipped).length}`);
  console.log(`   Duplicates skipped: ${uploadResults.filter((r) => r.skipped).length}`);
  console.log(`   Storage bucket: ${BUCKET_NAME}`);
  console.log(`   Database table: products`);
}

main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
