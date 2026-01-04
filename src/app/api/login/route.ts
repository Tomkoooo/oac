import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserModel } from '@/database/models/user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { tdartsDb } from '@/lib/tdarts-db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Ensure tDarts DB is connected
    await tdartsDb.asPromise();

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Check if user has password (might be OAuth only)
    if (!user.password) {
       return NextResponse.json({ message: 'Please login with Google' }, { status: 400 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Generate Token
    // We use a local secret or TDARTS_JWT_SECRET if available.
    // Since OAC decodes without verifying signature locally (in current implementation), this works for OAC access.
    // Ideally this should be the same as tDarts to share session fully.
    const secret = process.env.TDARTS_JWT_SECRET || process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'development-secret';
    
    const token = jwt.sign(
        { userId: user._id, email: user.email, sub: user._id }, 
        secret, 
        { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('tdarts_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    // Return user data (without password)
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.codes;

    return NextResponse.json({ user: userObj });

  } catch (error: any) {
    console.error('Login error:', error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
