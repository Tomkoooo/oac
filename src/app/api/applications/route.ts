import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import { Application } from '@/models';
import { sendEmail } from '@/lib/mailer';

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

    await dbConnect();
    const applications = await Application.find({ applicantUserId: userId }).sort({ submittedAt: -1 });

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
      return NextResponse.json({ message: 'Application already submitted' }, { status: 400 });
    }

    // Fetch applicant details from database
    let applicantName = '';
    let applicantEmail = ''; 
    try {
      const { getUserById } = await import('@/lib/tdarts-data');
      const user = await getUserById(applicantUserId);
      if (user) {
        applicantName = user.name || '';
        applicantEmail = user.email || '';
      }
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
                 unit_amount: price * 100, 
               },
               quantity: 1,
             },
           ],
           mode: 'payment',
           success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
           cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment_cancelled=true`,
           customer_email: billingEmail, 
           metadata: {
             applicationId: application._id.toString(),
             clubId: clubId,
             userId: applicantUserId
           },
         });

         checkoutUrl = session.url;
         
         application.paymentId = session.id;
         await application.save();

       } catch (stripeError: any) {
         console.error('Stripe session creation failed:', stripeError);
         await Application.findByIdAndDelete(application._id);
         return NextResponse.json({ message: 'Payment initialization failed: ' + stripeError.message }, { status: 500 });
       }
    } else if (paymentMethod === 'transfer') {
       let unique = false;
       let reference = '';
       let attempts = 0;
       
       while (!unique && attempts < 10) {
         const random = Math.floor(100000 + Math.random() * 900000).toString();
         const exists = await Application.findOne({ transferReference: random });
         if (!exists) {
           reference = random;
           unique = true;
         }
         attempts++;
       }

       if (!reference) {
           reference = Date.now().toString().slice(-6);
       }

       application.transferReference = reference;
       await application.save();

       try {
         const { getEmailTemplates } = await import('@/lib/config');
         const templates = await getEmailTemplates();
         const baseMessage = templates.bankTransferInstructions;

         const amount = process.env.NEXT_PUBLIC_CLUB_APPLICATION_PRICE_NET || '20000';
         const bankName = process.env.BANK_NAME || 'OTP Bank';
         const bankAccount = process.env.BANK_ACCOUNT_NUMBER || '11700000-00000000';
         const bankAccountName = process.env.BANK_ACCOUNT_NAME || 'Magyar Darts Szövetség';

         const messageV2 = `
 Kedves ${billingName || applicantName}!
 
 ${baseMessage}
 
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

         const targetEmail = billingEmail || applicantEmail;
         if (targetEmail) {
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
                         <p>${baseMessage}</p>
                         
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
       }
    }

    return NextResponse.json({ application, checkoutUrl });
  } catch (error: any) {
    console.error('Create application error:', error.message);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
