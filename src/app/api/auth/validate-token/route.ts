import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const TDARTS_API_URL = process.env.NEXT_PUBLIC_TDARTS_API_URL || 'https://tdarts.sironic.hu';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ message: 'Token is required' }, { status: 400 });
    }

    // Validate token with tDarts API
    const response = await fetch(`${TDARTS_API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Token validation failed');
    }

    const userData = await response.json();

    // Set the token as HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('tdarts_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return NextResponse.json({ 
      success: true,
      user: userData.user 
    });

  } catch (error: any) {
    console.error('Token validation error:', error.message);
    return NextResponse.json({ 
      message: 'Token validation failed' 
    }, { status: 401 });
  }
}

