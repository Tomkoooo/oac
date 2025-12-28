import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import dbConnect from '@/lib/db';
import { Application } from '@/models';
import { createInvoice } from '@/lib/billing';
import { tdartsApi } from '@/lib/tdarts-api';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ message: 'Session ID is required' }, { status: 400 });
    }

    // 1. Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ message: 'Payment not completed', status: session.payment_status }, { status: 400 });
    }

    const applicationId = session.metadata?.applicationId;
    const clubId = session.metadata?.clubId;

    if (!applicationId) {
        return NextResponse.json({ message: 'Application ID missing in metadata' }, { status: 400 });
    }

    await dbConnect();
    const application = await Application.findById(applicationId);

    if (!application) {
        return NextResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    // 2. Process Application if not already processed
    if (application.paymentStatus !== 'paid') {
        application.paymentStatus = 'paid';
        application.paymentId = session.id;

        if (application.status === 'submitted') {
             application.status = 'approved';
             
             // Create League
             try {
                // Using internal secret for auth
                await tdartsApi.post(`/api/clubs/${clubId}/leagues/create-oac`, {
                  creatorId: application.applicantUserId,
                  name: 'OAC Magyar Nemzeti Amatőr Liga',
                  description: 'Hivatalos OAC liga',
                }, {
                  headers: {
                    'x-internal-secret': process.env.TDARTS_INTERNAL_SECRET || 'development-secret-change-in-production'
                  }
                });
             } catch (leagueError) {
                console.error('Failed to create league during verification:', leagueError);
                application.notes = (application.notes || '') + ' [SYSTEM] League creation failed during verification.';
             }
        }
        
        await application.save();

        // 3. Generate Invoice (if enabled)
        try {
            const amount = session.amount_total ? session.amount_total / 100 : 0;
            const invoiceResult = await createInvoice({
               name: application.billingName,
               zip: application.billingZip,
               city: application.billingCity,
               address: application.billingAddress,
               taxNumber: application.billingTaxNumber,
               email: application.billingEmail,
               paymentMethod: 'stripe',
               amount: amount > 0 ? amount : parseInt(process.env.CLUB_APPLICATION_PRICE_GROSS || '0'),
               isPaid: true,
               comment: `Stripe Payment Verified: ${session.id}`
            });
            
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
                
                await application.save();
            }
        } catch (billingError) {
            console.error('Invoice creation error:', billingError);
            // Don't fail the verification response
        }
    }

    return NextResponse.json({ success: true, application });

  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ message: error.message || 'Verification failed' }, { status: 500 });
  }
}
