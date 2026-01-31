import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { getVerifiedTournaments } = await import('@/lib/tdarts-data');
    
    // Efficiently count verified tournaments
    // We can use the existing function or a lighter query if performance becomes an issue
    // For now, reusing existing robust logic is safer
    const { total } = await getVerifiedTournaments(1, 0);

    return NextResponse.json({
      verifiedTournaments: total,
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Public stats error:", error);
    return NextResponse.json(
      { message: "Failed to fetch stats", verifiedTournaments: 0 },
      { status: 500 }
    );
  }
}
