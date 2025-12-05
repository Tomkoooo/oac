import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import { Application } from '@/models';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tdarts_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { applicationId, reason } = body;

    if (!applicationId) {
      return NextResponse.json({ message: 'Application ID required' }, { status: 400 });
    }

    await dbConnect();

    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    // Only approved applications can request removal
    if (application.status !== 'approved') {
      return NextResponse.json({ message: 'Only approved applications can request removal' }, { status: 400 });
    }

    // Update status to removal_requested
    application.status = 'removal_requested';
    if (reason) {
      application.notes = reason;
    }
    await application.save();

    return NextResponse.json({ message: 'Removal request submitted successfully' });
  } catch (error: any) {
    console.error('Request removal error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
