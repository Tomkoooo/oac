import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import { Application } from '@/models';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tdarts_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Decode token to get user ID
    // For now, we'll fetch all applications (in production, filter by userId)
    await dbConnect();
    const applications = await Application.find({}).sort({ submittedAt: -1 });

    return NextResponse.json({ applications });
  } catch (error: any) {
    console.error('Fetch applications error:', error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tdarts_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clubId, clubName } = body;

    if (!clubId || !clubName) {
      return NextResponse.json({ message: 'Club ID and name are required' }, { status: 400 });
    }

    // Decode JWT token to get user ID
    let applicantUserId = '';
    try {
      const jwt = require('jsonwebtoken');
      const decoded: any = jwt.decode(token);
      console.log('Decoded token structure:', JSON.stringify(decoded, null, 2)); // Detailed debug log
      
      if (decoded) {
        // Check common JWT fields for user ID, prioritizing 'sub' (standard subject)
        // tDarts likely uses 'sub' or 'userId'
        applicantUserId = decoded.sub || decoded.userId || decoded.id || decoded._id;
        console.log('Extracted applicantUserId:', applicantUserId);
      }
    } catch (decodeError) {
      console.error('JWT decode error:', decodeError);
    }

    if (!applicantUserId || applicantUserId === 'unknown') {
      return NextResponse.json({ message: 'Invalid user token: Unable to extract user ID' }, { status: 401 });
    }

    await dbConnect();

    // Check if application already exists for this club
    const existing = await Application.findOne({ clubId, applicantUserId });
    if (existing) {
      return NextResponse.json({ message: 'Application already submitted' }, { status: 400 });
    }

    // Fetch applicant details from tDarts
    let applicantName = '';
    let applicantEmail = '';
    try {
      const { tdartsApi } = await import('@/lib/tdarts-api');
      const userResponse = await tdartsApi.get(`/api/users/${applicantUserId}`, {
        headers: {
          'x-internal-secret': process.env.TDARTS_INTERNAL_SECRET || 'development-secret-change-in-production'
        }
      });
      applicantName = userResponse.data.name || '';
      applicantEmail = userResponse.data.email || '';
      console.log('Fetched applicant details:', { applicantName, applicantEmail });
    } catch (fetchError) {
      console.error('Error fetching applicant details:', fetchError);
      // Continue with application creation even if we can't fetch details
    }

    // Create new application
    const application = await Application.create({
      clubId,
      clubName,
      applicantUserId,
      applicantName,
      applicantEmail,
      status: 'submitted',
      submittedAt: new Date(),
    });

    return NextResponse.json({ application });
  } catch (error: any) {
    console.error('Create application error:', error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
