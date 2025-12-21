import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all players from tDarts with full data
    const tdartsUrl = process.env.NEXT_PUBLIC_TDARTS_API_URL || process.env.TDARTS_API_URL || 'https://tdarts.sironic.hu';
    const response = await fetch(`${tdartsUrl}/api/integration/oac-players`, {
      headers: {
        'x-internal-secret': process.env.TDARTS_INTERNAL_SECRET || process.env.NEXT_PUBLIC_TDARTS_INTERNAL_SECRET || ''
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Failed to fetch from tDarts:', response.status, response.statusText);
      throw new Error('Failed to fetch from tDarts');
    }

    const data = await response.json();
    
    return NextResponse.json(data);
    
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
