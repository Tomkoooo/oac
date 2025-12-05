import { NextResponse } from 'next/server';
import axios from 'axios';
import { cookies } from 'next/headers';

const TDARTS_API_URL = process.env.NEXT_PUBLIC_TDARTS_API_URL || 'https://tdarts.sironic.hu';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Call tDarts API
    const response = await axios.post(`${TDARTS_API_URL}/api/auth/login`, {
      email,
      password,
    });

    const { token, user } = response.data;

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('tdarts_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    // Return user data (without token)
    return NextResponse.json({ user });

  } catch (error: any) {
    console.error('Login error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Internal Server Error';
    return NextResponse.json({ message }, { status });
  }
}
