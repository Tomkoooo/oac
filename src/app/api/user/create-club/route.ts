import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { tdartsApi } from '@/lib/tdarts-api';

/**
 * POST /api/user/create-club
 * Create a new club in tDarts for the logged-in user
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tdarts_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Decode JWT to get user ID
    const tokenPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    const userId = tokenPayload.userId || tokenPayload.id || tokenPayload.sub;

    if (!userId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, location, address, contact } = body;

    if (!name || !description || !location) {
      return NextResponse.json({ 
        message: 'Name, description, and location are required' 
      }, { status: 400 });
    }

    // Create club in tDarts with internal secret for service-to-service auth
    const response = await tdartsApi.post('/api/clubs/create', {
      creatorId: userId,
      clubData: {
        name,
        description,
        location,
        address,
        contact,
      }
    }, {
      headers: {
        'x-internal-secret': process.env.TDARTS_INTERNAL_SECRET || 'development-secret-change-in-production'
      }
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Create club error:', error);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);
    
    const status = error.response?.status || 500;
    // tDarts API returns errors in 'error' field, not 'message'
    const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Internal Server Error';
    
    return NextResponse.json({ message }, { status });
  }
}
