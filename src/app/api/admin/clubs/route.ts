import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch verified clubs from database
    const { getVerifiedClubs } = await import('@/lib/tdarts-data');
    const data = await getVerifiedClubs();
    
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('Fetch clubs error:', error.message);
    return NextResponse.json({ 
      message: 'Internal Server Error', 
      error: error.message,
      clubs: [],
      stats: { total: 0, verified: 0, unverified: 0 }
    }, { status: 500 });
  }
}

