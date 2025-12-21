import dbConnect from "@/lib/db";
import { Config } from "@/models";
import fs from 'fs';
import path from 'path';

export async function getRules() {
  // 1. Try to fetch from DB
  try {
    await dbConnect();
    const config = await Config.findOne({ key: 'oac_rules' });
    if (config && config.value) {
      return config.value;
    }
  } catch (error) {
    console.error("Database error while fetching rules:", error);
  }

  // 2. Fallback to local rules.json
  try {
    const rulesPath = path.join(process.cwd(), 'src', 'data', 'rules.json');
    if (fs.existsSync(rulesPath)) {
      const fileContent = fs.readFileSync(rulesPath, 'utf-8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error("File error while fetching local rules:", error);
  }

  return null;
}
