import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/db';
import { Application } from '@/models';
import { tdartsApi } from '@/lib/tdarts-api';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { applicationId, clubId } = body;

    if (!applicationId || !clubId) {
      return NextResponse.json({ message: 'Application ID and Club ID required' }, { status: 400 });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    if (application.status !== 'submitted') {
      return NextResponse.json({ message: 'Application already processed' }, { status: 400 });
    }

    // Create OAC league in tDarts
    try {
      await tdartsApi.post(`/api/clubs/${clubId}/leagues/create-oac`, {
        creatorId: application.applicantUserId,
        name: 'OAC Magyar Nemzeti Amatőr Liga',
        description: 'Hivatalos OAC liga',
      }, {
        headers: {
          'x-internal-secret': process.env.TDARTS_INTERNAL_SECRET || 'development-secret-change-in-production'
        }
      });
    } catch (error) {
      console.error('Error creating league in tDarts:', error);
      return NextResponse.json({ message: 'Failed to create league in tDarts' }, { status: 500 });
    }

    application.status = 'approved';
    await application.save();

    return NextResponse.json({ message: 'Application approved and league created' });
  } catch (error: any) {
    console.error('Approve application error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
