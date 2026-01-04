import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tdarts_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Decode JWT locally
    let userId = '';
    try {
        const tokenPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = tokenPayload.userId || tokenPayload.id || tokenPayload.sub;
    } catch (e) {
        return NextResponse.json({ message: 'Invalid token format' }, { status: 401 });
    }

    if (!userId) {
       return NextResponse.json({ message: 'Invalid token payload' }, { status: 401 });
    }

    // Fetch user's clubs from database
    const { getUserClubs } = await import('@/lib/tdarts-data');
    const clubs = await getUserClubs(userId);

    return NextResponse.json(clubs);
  } catch (error: any) {
    console.error('Fetch clubs error:', error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
