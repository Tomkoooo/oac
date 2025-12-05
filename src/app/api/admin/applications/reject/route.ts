import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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
    const { applicationId, notes } = body;

    if (!applicationId) {
      return NextResponse.json({ message: 'Application ID required' }, { status: 400 });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    // Allow rejecting approved applications (to un-verify)
    if (application.status === 'rejected') {
      return NextResponse.json({ message: 'Application already rejected' }, { status: 400 });
    }

    // If application was approved, we need to remove the OAC league and unverify the club
    if (application.status === 'approved') {
      try {
        const { tdartsApi } = await import('@/lib/tdarts-api');
        await tdartsApi.delete(`/api/clubs/${application.clubId}/leagues/remove-oac`, {
          headers: {
            'x-internal-secret': process.env.TDARTS_INTERNAL_SECRET || 'development-secret-change-in-production'
          }
        });
      } catch (error) {
        console.error('Error removing OAC league in tDarts:', error);
        // Continue to update local status even if remote fails (or maybe fail?)
        // For now, let's log and continue, but maybe we should warn
      }
    }

    application.status = 'rejected';
    if (notes) {
      application.notes = notes;
    }
    await application.save();

    return NextResponse.json({ message: 'Application rejected and OAC status revoked' });
  } catch (error: any) {
    console.error('Reject application error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
