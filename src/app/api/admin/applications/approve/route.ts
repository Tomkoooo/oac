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
    const { applicationId, clubId, skipBilling } = body;

    if (!applicationId || !clubId) {
      return NextResponse.json({ message: 'Application ID and Club ID required' }, { status: 400 });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    if (application.status !== 'submitted') {
      return NextResponse.json({ message: 'Application already processed' }, { status: 400 });
    }

    // Create OAC league in database
    try {
      const { createOacLeague } = await import('@/lib/tdarts-data');
      await createOacLeague(
        clubId,
        application.applicantUserId,
        'OAC Magyar Nemzeti Amatőr Liga',
        'Hivatalos OAC liga'
      );
    } catch (error) {
      console.error('Error creating league in database:', error);
      return NextResponse.json({ message: 'Failed to create league in database' }, { status: 500 });
    }

    application.status = 'approved';

    // Handle Billing
    // Handle Billing
    // skipBilling = "Approve with Manual Invoice" or "Do not generate invoice now"
    // If !skipBilling, we attempt to generate invoice.
    
    if (!skipBilling) {
       try {
         const { createInvoice } = await import('@/lib/billing');
         const { getStripePrice } = await import('@/lib/stripe');
         const price = getStripePrice();

         const invoiceResult = await createInvoice({
           name: application.billingName || application.clubName, // Fallback
           zip: application.billingZip || '0000',
           city: application.billingCity || 'Unknown',
           address: application.billingAddress || 'Unknown',
           taxNumber: application.billingTaxNumber,
           email: application.billingEmail || application.applicantEmail,
           paymentMethod: application.paymentMethod || 'transfer',
           amount: price,
           isPaid: true,
           comment: `Manual Approval: ${applicationId}`
         });
         
         application.paymentStatus = 'paid';
         
         if (invoiceResult && !invoiceResult.skipped) {
            application.invoiceSent = true;
            application.invoiceNumber = invoiceResult.invoiceId;
            
            // Clear Billing Data (Data Minimization)
            application.billingName = undefined;
            application.billingZip = undefined;
            application.billingCity = undefined;
            application.billingAddress = undefined;
            application.billingTaxNumber = undefined;
            application.billingEmail = undefined;
         }
       } catch (billingError) {
         console.error('Billing error during manual approval:', billingError);
         application.notes = (application.notes || '') + ' [SYSTEM] Invoice creation failed during manual approval.';
       }
    } else {
        // "Approve with Manual Invoice" or "Approve without Billing"
        // We do NOT clear data here, as admin might need it for manual invoice.
        // We keep it until they mark as invoiced.
        // Assuming user intends to send invoice manually.
    }

    await application.save();

    return NextResponse.json({ message: 'Application approved and league created' });
  } catch (error: any) {
    console.error('Approve application error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
