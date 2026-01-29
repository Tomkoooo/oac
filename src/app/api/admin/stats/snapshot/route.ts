import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { StatsSnapshot } from '@/database/models/stats-snapshot.model';

/**
 * POST /api/admin/stats/snapshot
 * Creates a snapshot of current statistics for historical tracking
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const snapshot = await (StatsSnapshot as any).createTodaySnapshot();
    
    return NextResponse.json({
      success: true,
      snapshot
    });
  } catch (error: any) {
    console.error('Snapshot creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create snapshot' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/stats/snapshot?days=90
 * Retrieves historical statistics snapshots
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '90');

    await dbConnect();
    
    const historical = await (StatsSnapshot as any).getHistoricalData(days);
    
    return NextResponse.json({
      success: true,
      data: historical
    });
  } catch (error: any) {
    console.error('Historical snapshot fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch historical data' },
      { status: 500 }
    );
  }
}
