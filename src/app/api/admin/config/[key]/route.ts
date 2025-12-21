import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Config } from "@/models";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    await dbConnect();
    const { key } = await params;

    // Special handling for rules to support fallback
    if (key === 'oac_rules') {
      const { getRules } = await import("@/lib/rules");
      const rules = await getRules();
      // Return wrapped in 'value' to match Config schema structure expected by frontend
      return NextResponse.json({ value: rules });
    }
    
    // Using simple findOne for the key
    const config = await Config.findOne({ key });
    
    if (!config) {
      return NextResponse.json({ error: "Config not found" }, { status: 404 });
    }
    
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    await dbConnect();
    const { key } = await params;
    const { value } = await req.json();
    
    const config = await Config.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
