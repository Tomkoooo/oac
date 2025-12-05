import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import { AdminUser } from '@/models';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const users = await AdminUser.find({}).select('-password');
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Fetch admin users error:', error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Verify user is superadmin
    const admin = await AdminUser.findOne({ email: (session.user as any).email });
    if (!admin || admin.role !== 'superadmin') {
      return NextResponse.json({ message: 'Forbidden - Superadmin only' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, role = 'admin' } = body;

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
    }

    const existing = await AdminUser.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: 'Admin user already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await AdminUser.create({
      email,
      password: hashedPassword,
      role,
    });

    return NextResponse.json({ 
      user: { 
        _id: newAdmin._id, 
        email: newAdmin.email, 
        role: newAdmin.role 
      } 
    });
  } catch (error: any) {
    console.error('Create admin user error:', error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const admin = await AdminUser.findOne({ email: (session.user as any).email });
    if (!admin || admin.role !== 'superadmin') {
      return NextResponse.json({ message: 'Forbidden - Superadmin only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'User ID required' }, { status: 400 });
    }

    const targetUser = await AdminUser.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (targetUser.role === 'superadmin') {
      const superadminCount = await AdminUser.countDocuments({ role: 'superadmin' });
      if (superadminCount <= 1) {
        return NextResponse.json({ 
          message: 'Cannot delete the last superadmin' 
        }, { status: 400 });
      }
    }

    // Prevent deleting yourself
    if (targetUser.email === (session.user as any).email) {
      return NextResponse.json({ 
        message: 'Cannot delete your own account' 
      }, { status: 400 });
    }

    await AdminUser.findByIdAndDelete(userId);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Delete admin user error:', error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
