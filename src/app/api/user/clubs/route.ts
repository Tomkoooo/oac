import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { tdartsApi } from '@/lib/tdarts-api';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tdarts_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's clubs from tDarts
    const response = await tdartsApi.get('/api/users/me/clubs', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Fetch clubs error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Internal Server Error';
    return NextResponse.json({ message }, { status });
  }
}
