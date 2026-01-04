import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { getOacStats } = await import('@/lib/tdarts-data');
    const data = await getOacStats();

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Stats proxy error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
