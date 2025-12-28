import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import { Application } from '@/models';
import crypto from 'crypto';
import { sendEmail } from '@/lib/mailer';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tdarts_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Decode token to get user ID
    // For now, we'll fetch all applications (in production, filter by userId)
    await dbConnect();
    const applications = await Application.find({}).sort({ submittedAt: -1 });

    return NextResponse.json({ applications });
  } catch (error: any) {
    console.error('Fetch applications error:', error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tdarts_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      clubId, 
      clubName, 
      billingName,
      billingZip,
      billingCity,
      billingAddress,
      billingTaxNumber,
      billingEmail,
      paymentMethod
    } = body;

    if (!clubId || !clubName) {
      return NextResponse.json({ message: 'Club ID and name are required' }, { status: 400 });
    }

    // Decode JWT token to get user ID
    let applicantUserId = '';
    try {
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.decode(token) as { sub?: string; userId?: string; id?: string; _id?: string } | null;
      
      if (decoded) {
        applicantUserId = decoded.sub || decoded.userId || decoded.id || decoded._id || '';
      }
    } catch (decodeError) {
      console.error('JWT decode error:', decodeError);
    }

    if (!applicantUserId || applicantUserId === 'unknown') {
      return NextResponse.json({ message: 'Invalid user token' }, { status: 401 });
    }

    await dbConnect();

    // Check if application already exists for this club
    const existing = await Application.findOne({ clubId, applicantUserId });
    if (existing) {
      // If payment failed or pending, maybe allow retry?
      // For now, strict check.
      return NextResponse.json({ message: 'Application already submitted' }, { status: 400 });
    }

    // Fetch applicant details from tDarts
    let applicantName = '';
    let applicantEmail = ''; // This is User's email, distinct from Billing Email
    try {
      const { tdartsApi } = await import('@/lib/tdarts-api');
      const userResponse = await tdartsApi.get(`/api/users/${applicantUserId}`, {
        headers: {
          'x-internal-secret': process.env.TDARTS_INTERNAL_SECRET || 'development-secret-change-in-production'
        }
      });
      applicantName = userResponse.data.name || '';
      applicantEmail = userResponse.data.email || '';
    } catch (fetchError) {
      console.error('Error fetching applicant details:', fetchError);
    }

    // Create new application
    const application = await Application.create({
      clubId,
      clubName,
      applicantUserId,
      applicantName,
      applicantEmail,
      status: 'submitted',
      submittedAt: new Date(),
      
      // Billing & Payment
      billingName,
      billingZip,
      billingCity,
      billingAddress,
      billingTaxNumber,
      billingEmail,
      paymentMethod: paymentMethod || 'transfer',
      paymentStatus: 'pending'
    });

    let checkoutUrl = null;

    if (paymentMethod === 'stripe') {
       try {
         const { stripe, getStripePrice } = await import('@/lib/stripe');
         const price = getStripePrice();
         
         const session = await stripe.checkout.sessions.create({
           payment_method_types: ['card'],
           line_items: [
             {
               price_data: {
                 currency: 'huf',
                 product_data: {
                   name: 'OAC Klub Tagsági Díj',
                   description: `Tagsági díj a(z) ${clubName} részére`,
                 },
                 unit_amount: price * 100, // Stripe expects amount in filler/cents
               },
               quantity: 1,
             },
           ],
           mode: 'payment',
           success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
           cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment_cancelled=true`,
           customer_email: billingEmail, // Prefill email
           metadata: {
             applicationId: application._id.toString(),
             clubId: clubId,
             userId: applicantUserId
           },
         });

         checkoutUrl = session.url;
         
         // Update application with session ID
         application.paymentId = session.id;
         await application.save();

       } catch (stripeError: any) {
         console.error('Stripe session creation failed:', stripeError);
         // Do not fail the whole request, but return error for checkout?
         // Or fail? Better to fail.
         await Application.findByIdAndDelete(application._id);
         return NextResponse.json({ message: 'Payment initialization failed: ' + stripeError.message }, { status: 500 });
       }
    } else if (paymentMethod === 'transfer') {
       // Generate 6-digit unique reference
       let unique = false;
       let reference = '';
       let attempts = 0;
       
       while (!unique && attempts < 10) {
         // Generate random 6 digits
         const random = Math.floor(100000 + Math.random() * 900000).toString();
         // Check collision
         const exists = await Application.findOne({ transferReference: random });
         if (!exists) {
           reference = random;
           unique = true;
         }
         attempts++;
       }

       if (!reference) {
          // Extremely unlikely fallback or error
          reference = Date.now().toString().slice(-6);
       }

       application.transferReference = reference;
       await application.save();

       // Send Email
       try {
         const amount = process.env.CLUB_APPLICATION_PRICE_GROSS || '25000';
         const bankName = process.env.BANK_NAME || 'OTP Bank';
         const bankAccount = process.env.BANK_ACCOUNT_NUMBER || '11700000-00000000';
         const bankAccountName = process.env.BANK_ACCOUNT_NAME || 'Magyar Darts Szövetség';

         const messageV2 = `
Kedves ${billingName || applicantName}!

Köszönjük jelentkezésedet az OAC ligába a(z) ${clubName} nevében.

A regisztráció véglegesítéséhez kérjük utald át az éves tagsági díjat.

**Utalási Adatok:**
Kedvezményezett: **${bankAccountName}**
Bank: **${bankName}**
Számlaszám: **${bankAccount}**
Összeg: **${amount} Ft**

**KÖZLEMÉNY: ${reference}**
(Nagyon fontos, hogy csak ezt a 6 jegyű kódot írd a közleménybe, hogy a rendszerünk automatikusan beazonosíthassa az utalást!)

Amint az összeg beérkezik, a rendszerünk automatikusan aktiválja a jelentkezést és kiállítja a számlát.

Üdvözlettel,
OAC Csapat
         `;

         // Determine email recipient
         const targetEmail = billingEmail || applicantEmail;
         if (targetEmail) {
            // We use the internal mail helper directly since we are on server side
             await sendEmail({
                to: targetEmail,
                subject: 'Utalási információk - OAC Jelentkezés',
                text: messageV2,
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #ef4444; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">Utalási Információk</h1>
                    </div>
                    <div style="padding: 24px; background-color: #ffffff; color: #374151; line-height: 1.6;">
                        <p>Kedves <strong>${billingName || applicantName}</strong>!</p>
                        <p>Köszönjük jelentkezésedet az OAC ligába a(z) <strong>${clubName}</strong> nevében.</p>
                        <p>A regisztráció véglegesítéséhez kérjük utald át az éves tagsági díjat.</p>
                        
                        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0;">Kedvezményezett: <strong>${bankAccountName}</strong></p>
                            <p style="margin: 5px 0;">Bank: <strong>${bankName}</strong></p>
                            <p style="margin: 5px 0;">Számlaszám: <strong style="font-family: monospace; font-size: 1.1em;">${bankAccount}</strong></p>
                            <p style="margin: 5px 0;">Összeg: <strong>${amount} Ft</strong></p>
                        </div>

                        <div style="background-color: #fef2f2; border: 1px solid #fee2e2; padding: 15px; border-radius: 8px; text-align: center;">
                            <p style="margin: 0; color: #991b1b; font-weight: bold;">KÖZLEMÉNY:</p>
                            <p style="margin: 10px 0; font-size: 2em; font-weight: bold; color: #dc2626; letter-spacing: 5px;">${reference}</p>
                            <p style="margin: 0; font-size: 0.9em; color: #7f1d1d;">Csak ezt a 6 jegyű kódot írd a közleménybe!</p>
                        </div>

                        <p>Amint az összeg beérkezik, a rendszerünk automatikusan aktiválja a jelentkezést és kiállítja a számlát.</p>
                    </div>
                </div>
                `
             });
         }
       } catch (mailError) {
         console.error('Failed to send transfer instruction email:', mailError);
         // Don't fail the request, just log it.
       }
    }

    return NextResponse.json({ application, checkoutUrl });
  } catch (error: any) {
    console.error('Create application error:', error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
