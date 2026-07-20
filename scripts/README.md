# Product Seeding Scripts

## seed-products.ts

A comprehensive TypeScript script that:

1. **Uploads product images** to Supabase Storage
2. **Detects duplicate images** by SHA256 hash to prevent the same photo appearing under multiple products
3. **Inserts products** into the `products` table with proper category relationships
4. **Verifies results** with category counts and duplicate URL detection

### Prerequisites

1. Real Supabase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Image folders in the project root:
   - `Bridal_Photos/` - 20 bridal lehenga images
   - `Sider_Lehenga/` - 20 sider lehenga images
   - `Farsi_lehenga/` - 19 farsi lehenga images
   - `Indo_western.jpeg` - 1 indo-western image

### Usage

```bash
npm run seed
```

### What it does

1. **Creates storage bucket** (`product-images`) if it doesn't exist
2. **Creates categories** (Bridal Lehenga, Sider Lehenga, Farsi Lehenga, Indo-Western) if they don't exist
3. **Uploads images** with duplicate detection:
   - Computes SHA256 hash of each image
   - Skips upload if the exact same file was already uploaded
   - Reports all duplicate groups found
4. **Inserts products** with:
   - Proper category relationships
   - B2B-appropriate descriptions
   - Public storage URLs for images
   - SKU codes matching the pattern: `TC-BRD-XXXX`, `TC-SDR-XXXX`, `TC-FAR-XXXX`, `TC-IND-XXX`
5. **Verifies** the seeding:
   - Counts products by category
   - Detects duplicate image URLs
   - Flags categories with insufficient products (Indo-Western)

### Output

The script outputs:
- Total products created
- Images uploaded vs duplicates skipped
- Verification table showing products per category
- Warning if Indo-Western category needs more photos

### Database Schema

Uses the existing schema from `supabase/migrations/20260629000000_schema.sql`:

**products table:**
- `id` (UUID, primary key)
- `title` (text)
- `slug` (text, unique)
- `description` (text)
- `sku` (text, unique)
- `price` (numeric)
- `category_id` (UUID, foreign key)
- `fabric` (text)
- `image_urls` (text array)
- `featured` (boolean)
- `stock` (integer)

**categories table:**
- `id` (UUID, primary key)
- `name` (text)
- `slug` (text, unique)
- `description` (text)

## upload-images.sh

A simple bash script for uploading images via curl. Use this if you prefer shell scripts over TypeScript.

```bash
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_KEY=your-service-role-key \
./scripts/upload-images.sh
```
