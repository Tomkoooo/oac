import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import dbConnect from '@/lib/db';
import { Application } from '@/models';
import { createInvoice } from '@/lib/billing';
import { stripe } from '@/lib/stripe';


export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
       throw new Error('STRIPE_WEBHOOK_SECRET is missing');
    }
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return NextResponse.json({ message: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const applicationId = session.metadata?.applicationId;
    const userId = session.metadata?.userId;
    const clubId = session.metadata?.clubId;

    if (applicationId) {
      try {
        await dbConnect();
        const application = await Application.findById(applicationId);

        if (application) {
          // 1. Update Payment Status
          application.paymentStatus = 'paid';
          application.paymentId = session.id;
          // Auto-approve if paid via Stripe
          if (application.status === 'submitted') {
             application.status = 'approved';
             
             // 2. Create League in tDarts
              try {
                const { createOacLeague } = await import('@/lib/tdarts-data');
                await createOacLeague(
                  clubId,
                  application.applicantUserId,
                  'OAC Magyar Nemzeti Amatőr Liga',
                  'Hivatalos OAC liga'
                );
              } catch (leagueError) {
                console.error('Failed to auto-create league via webhook:', leagueError);
                // We typically verify the league creation. If it fails, admin should see it.
                // But status is approved. Maybe we should log an error note?
                application.notes = (application.notes || '') + ' [SYSTEM] League creation failed during webhook.';
              }
          }

          await application.save();

          // 3. Generate Invoice
          try {
             const amount = session.amount_total ? session.amount_total / 100 : 0; // Convert from cents
             const invoiceResult = await createInvoice({
               name: application.billingName,
               zip: application.billingZip,
               city: application.billingCity,
               address: application.billingAddress,
               taxNumber: application.billingTaxNumber,
               email: application.billingEmail,
               paymentMethod: 'stripe',
               amount: amount > 0 ? amount : parseInt(process.env.CLUB_APPLICATION_PRICE_NET || '0'),
               isPaid: true,
               comment: `Stripe Payment: ${session.id}`
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
             }
             await application.save();

          } catch (billingError) {
             console.error('Failed to create invoice via webhook:', billingError);
             application.notes = (application.notes || '') + ' [SYSTEM] Invoice creation failed.';
             await application.save();
          }
        }
      } catch (err) {
        console.error('Error processing application in webhook:', err);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
