import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Application } from '@/models';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { applicationId, clubId, removalType = 'delete_league' } = body; // Add removalType parameter

    if (!applicationId || !clubId) {
      return NextResponse.json({ message: 'Application ID and Club ID required' }, { status: 400 });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    // Only approved or removal_requested applications can be unverified
    if (application.status !== 'approved' && application.status !== 'removal_requested') {
      return NextResponse.json({ message: 'Only approved or removal requested applications can be unverified' }, { status: 400 });
    }

    // Call tDarts API to remove OAC league and unverify club
    try {
      const { tdartsApi } = await import('@/lib/tdarts-api');
      await tdartsApi.delete(`/api/clubs/${clubId}/leagues/remove-oac`, {
        headers: {
          'x-internal-secret': process.env.TDARTS_INTERNAL_SECRET || 'development-secret-change-in-production'
        },
        data: {
          removalType // Pass the removal type to tDarts
        }
      });
    } catch (error) {
      console.error('Error removing OAC league in tDarts:', error);
      return NextResponse.json({ message: 'Failed to remove league in tDarts' }, { status: 500 });
    }

    // Update application status to rejected
    application.status = 'rejected';
    application.notes = removalType === 'delete_league' 
      ? 'OAC status removed by admin - League deleted'
      : 'OAC status removed by admin - League terminated';
    application.removalType = removalType;
    await application.save();

    return NextResponse.json({ message: 'Club unverified and league removed successfully' });
  } catch (error: any) {
    console.error('Unverify application error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
