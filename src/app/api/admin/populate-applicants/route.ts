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
        const { getUserById } = await import('@/lib/tdarts-data');
        const user = await getUserById(app.applicantUserId);

        if (user) {
          app.applicantName = user.name || '';
          app.applicantEmail = user.email || '';
          await app.save();
          updated++;
          console.log(`Updated application ${app._id} with user details`);
        } else {
             console.log(`User not found for application ${app._id}`);
        }
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
