import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { writeFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

// Load env variables
const envPath = join(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eq = trimmed.indexOf("=");
      if (eq !== -1) {
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export interface DBProduct {
  id: string;
  title: string;
  sku: string;
  image_urls: string[];
}

export class DbService {
  private client: SupabaseClient | null = null;

  async connect(): Promise<SupabaseClient> {
    if (this.client) return this.client;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase URL or service role key in .env.local");
    }

    console.log("🔌 Connecting to Supabase client...");
    this.client = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log("✅ Supabase client connected.");
    return this.client;
  }

  async disconnect(): Promise<void> {
    this.client = null;
    console.log("🔌 Supabase client disconnected.");
  }

  private getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error("Supabase client not connected. Call connect() first.");
    }
    return this.client;
  }

  /**
   * Fetch all active products
   */
  async fetchProducts(): Promise<DBProduct[]> {
    const client = this.getClient();
    console.log("📋 Fetching active products from Supabase...");
    
    const { data, error } = await client
      .from("products")
      .select("id, title, sku, image_urls")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    console.log(`✅ Fetched ${data.length} active products.`);
    return data || [];
  }

  /**
   * Create database backup table (Local JSON backup is the primary backup store)
   */
  async createBackupTable(products: DBProduct[]): Promise<void> {
    console.log("🛡️  Checking backup parameters...");
    console.log("   Since direct DDL schema creation is restricted on PostgreSQL,");
    console.log("   we will use the local JSON file backup and store migration details in local reports.");
  }

  /**
   * Save a local JSON file backup for redundancy
   */
  saveLocalBackup(products: DBProduct[]): string {
    const backupDir = join(__dirname, "backups");
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filePath = join(backupDir, `backup-${timestamp}.json`);
    
    console.log(`💾 Writing local JSON backup to ${filePath}...`);
    writeFileSync(filePath, JSON.stringify(products, null, 2), "utf8");
    console.log("✅ Local JSON backup saved.");
    return filePath;
  }

  /**
   * Update the product title in the database
   */
  async updateProductTitle(productId: string, newTitle: string): Promise<void> {
    const client = this.getClient();
    const { error } = await client
      .from("products")
      .update({ title: newTitle, updated_at: new Date().toISOString() })
      .eq("id", productId);

    if (error) {
      throw new Error(`Failed to update product title: ${error.message}`);
    }
  }

  /**
   * Perform a rollback using the latest local backup file
   */
  async rollback(): Promise<number> {
    await this.connect();
    const client = this.getClient();
    console.log("⏪ Initiating rollback from local backup files...");

    const backupDir = join(__dirname, "backups");
    if (!existsSync(backupDir)) {
      throw new Error("No backups directory found. Cannot rollback.");
    }

    const files = readdirSync(backupDir)
      .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
      .sort(); // sorted ascending, so latest will be last

    if (files.length === 0) {
      throw new Error("No backup files found. Cannot rollback.");
    }

    const latestFile = files[files.length - 1];
    const filePath = join(backupDir, latestFile);
    console.log(`📂 Loading latest backup file: ${filePath}`);

    const backupData = JSON.parse(readFileSync(filePath, "utf8")) as DBProduct[];
    console.log(`⏪ Restoring ${backupData.length} products to their original titles...`);

    let restoredCount = 0;
    for (const item of backupData) {
      try {
        const { error } = await client
          .from("products")
          .update({ title: item.title, updated_at: new Date().toISOString() })
          .eq("id", item.id);

        if (error) {
          console.error(`  ❌ Failed to restore product ${item.sku}: ${error.message}`);
        } else {
          restoredCount++;
        }
      } catch (err: any) {
        console.error(`  ❌ Error restoring product ${item.sku}: ${err.message}`);
      }
    }

    console.log(`✅ Rollback completed. Restored ${restoredCount}/${backupData.length} product titles.`);
    return restoredCount;
  }
}
