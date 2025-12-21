import dbConnect from "@/lib/db";
import { Config } from "@/models";
import fs from 'fs';
import path from 'path';

export async function getRules() {
  try {
    await dbConnect();
    
    // Try to fetch from DB
    const config = await Config.findOne({ key: 'oac_rules' });
    
    if (config && config.value) {
      return config.value;
    }

    // Fallback to local rules.json
    const rulesPath = path.join(process.cwd(), 'src', 'data', 'rules.json');
    if (fs.existsSync(rulesPath)) {
        const fileContent = fs.readFileSync(rulesPath, 'utf-8');
        return JSON.parse(fileContent);
    }

    return null;
  } catch (error) {
    console.error("Error fetching rules:", error);
    // Final fallback to avoid crash
    return {};
  }
}
