import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tDartsUrl = process.env.NEXT_PUBLIC_TDARTS_API_URL || 'https://tdarts.sironic.hu';
    const response = await fetch(`${tDartsUrl}/api/integration/oac-data`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        // 'x-secret': process.env.TDARTS_API_SECRET // If needed later
      }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch from tDarts: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Stats proxy error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
