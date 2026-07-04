import React from "react";
import fs from "fs";
import path from "path";
import { getContactConfig, ContactConfig } from "@/lib/services/contactConfig";
import ContactSettingsForm from "@/components/admin/ContactSettingsForm";

export const metadata = {
  title: "Contact Page Management | Todi Creations Admin",
};

export default async function AdminContactSettingsPage() {
  const config = getContactConfig();

  // Next.js Server Action to save contact settings
  const handleSaveSettings = async (payload: ContactConfig) => {
    "use server";
    try {
      const configPath = path.join(process.cwd(), "src/lib/services/contactConfig.json");
      fs.writeFileSync(configPath, JSON.stringify(payload, null, 2), "utf-8");
      return { success: true };
    } catch (err) {
      console.error("Server Action save config error:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to write config file.";
      return { success: false, error: errMsg };
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <ContactSettingsForm
        initialConfig={config}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
