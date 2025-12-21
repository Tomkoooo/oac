import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const TDARTS_API_URL = process.env.NEXT_PUBLIC_TDARTS_API_URL || 'https://tdarts.sironic.hu';
const INTERNAL_SECRET = process.env.TDARTS_INTERNAL_SECRET || process.env.INTERNAL_API_SECRET;

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathString = path.join('/');
    const searchParams = req.nextUrl.searchParams.toString();
    const url = `${TDARTS_API_URL}/api/${pathString}${searchParams ? `?${searchParams}` : ''}`;

    console.log(`Proxying request to: ${url}`);

    const response = await axios.get(url, {
      headers: {
        'x-internal-secret': INTERNAL_SECRET,
        'Content-Type': 'application/json'
      },
      validateStatus: () => true // Handle errors manually
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('Proxy error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch data from tDarts API' },
      { status: 500 }
    );
  }
}
