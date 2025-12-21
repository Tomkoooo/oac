import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Application } from '@/models';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get all applications that are missing applicant details
    const applications = await Application.find({
      $or: [
        { applicantName: { $exists: false } },
        { applicantName: '' },
        { applicantEmail: { $exists: false } },
        { applicantEmail: '' }
      ]
    });

    console.log(`Found ${applications.length} applications missing details`);

    let updated = 0;
    let failed = 0;

    // Fetch and update each application
    for (const app of applications) {
      try {
        const { tdartsApi } = await import('@/lib/tdarts-api');
        const userResponse = await tdartsApi.get(`/api/users/${app.applicantUserId}`, {
          headers: {
            'x-internal-secret': process.env.TDARTS_INTERNAL_SECRET || 'development-secret-change-in-production'
          }
        });

        app.applicantName = userResponse.data.name || '';
        app.applicantEmail = userResponse.data.email || '';
        await app.save();
        updated++;
        console.log(`Updated application ${app._id} with user details`);
      } catch (error) {
        console.error(`Failed to fetch details for user ${app.applicantUserId}:`, error);
        failed++;
      }
    }

    return NextResponse.json({ 
      message: 'Applications updated', 
      updated, 
      failed,
      total: applications.length 
    });
  } catch (error: any) {
    console.error('Populate applicants error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
