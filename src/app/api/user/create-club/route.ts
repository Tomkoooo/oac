import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';


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

    // Create club in database
    const { createClub } = await import('@/lib/tdarts-data');
    
    // Ensure contact is properly formatted object if needed, but schema handles it.
    // passing body fields directly
    const club = await createClub(userId, {
        name,
        description,
        location,
        address,
        contact
    });

    return NextResponse.json(club);

  } catch (error: any) {
    console.error('Create club error:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }

    const message = error.message || 'Internal Server Error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
