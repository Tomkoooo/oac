import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import { AdminUser } from '@/models';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const currentUser = await AdminUser.findOne({ email: (session.user as any).email });

    if (!currentUser) {
       return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { userId, newPassword } = body;

    if (!userId || !newPassword) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    
    // Authorization check
    // 1. Superadmin can change anyone's password
    // 2. Admin can only change their own
    
    if (currentUser.role !== 'superadmin' && currentUser._id.toString() !== userId) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await AdminUser.findByIdAndUpdate(userId, {
        password: hashedPassword
    });

    return NextResponse.json({ message: 'Password updated successfully' });

  } catch (error: any) {
    console.error('Password update error:', error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
