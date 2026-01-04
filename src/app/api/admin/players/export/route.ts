import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all players from database
    const { getOacPlayersExport } = await import('@/lib/tdarts-data');
    const data = await getOacPlayersExport();
    
    return NextResponse.json({
        players: data,
        totalCount: data.length
    });
    
  } catch (error: any) {
    console.error('Fetch players error:', error.message);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error.message,
      players: [],
      totalCount: 0
    }, { status: 500 });
  }
}
