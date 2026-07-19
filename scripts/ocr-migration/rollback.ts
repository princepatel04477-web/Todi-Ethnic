import { DbService } from "./db-service";

async function main() {
  console.log("⏪ Starting rollback process...");
  const db = new DbService();
  
  try {
    await db.connect();
    const count = await db.rollback();
    console.log(`\n🎉 Rollback complete. Successfully restored ${count} product names.`);
  } catch (err: any) {
    console.error("\n❌ Rollback failed:", err.message);
    process.exit(1);
  } finally {
    await db.disconnect();
  }
}

main();
