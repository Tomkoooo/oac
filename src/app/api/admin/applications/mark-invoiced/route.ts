import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Application } from '@/models';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { applicationId, invoiceNumber } = body;

    if (!applicationId) {
      return NextResponse.json({ message: 'Application ID required' }, { status: 400 });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    application.invoiceSent = true;
    if (invoiceNumber) {
        application.invoiceNumber = invoiceNumber;
    }

    // Clear Billing Data (Data Minimization)
    application.billingName = undefined;
    application.billingZip = undefined;
    application.billingCity = undefined;
    application.billingAddress = undefined;
    application.billingTaxNumber = undefined;
    application.billingEmail = undefined;

    await application.save();

    return NextResponse.json({ message: 'Marked as Invoiced' });
  } catch (error: any) {
    console.error('Mark invoiced error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
