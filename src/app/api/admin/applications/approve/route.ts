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
    let invoiceInfo = null;
    if (!skipBilling) {
       try {
         const { createInvoice, processPdfData } = await import('@/lib/billing');
         const { getStripePrice } = await import('@/lib/stripe');
         const price = getStripePrice();

         const invoiceResult = await createInvoice({
           name: application.billingName || application.clubName,
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
            invoiceInfo = invoiceResult;
            
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
    }

    await application.save();

    // Send Approval Email
    try {
        const { sendEmail } = await import('@/lib/mailer');
        const { getEmailTemplates } = await import('@/lib/config');
        const templates = await getEmailTemplates();
        const baseMessage = templates.applicationApproved;

        const targetEmail = application.applicantEmail;
        
        if (targetEmail) {
            const attachments = [];
            if (invoiceInfo?.pdf && invoiceInfo?.invoiceId) {
                const { processPdfData } = await import('@/lib/billing');
                const pdfBuffer = await processPdfData(invoiceInfo.pdf, invoiceInfo.invoiceId);
                if (pdfBuffer) {
                    attachments.push({
                        filename: `szamla_${invoiceInfo.invoiceId}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    });
                }
            }

            await sendEmail({
                to: targetEmail,
                subject: 'Gratulálunk! OAC Jelentkezésed elfogadásra került',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #b62441; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">Sikeres Jelentkezés!</h1>
                    </div>
                    <div style="padding: 24px; background-color: #ffffff; color: #374151; line-height: 1.6;">
                        <p>Kedves <strong>${application.applicantName || application.clubName}</strong>!</p>
                        <p>${baseMessage}</p>
                        <p>A(z) <strong>${application.clubName}</strong> klub jelentkezése az OAC Amatőr Nemzeti Ligába elfogadásra került.</p>
                        
                        <div style="margin: 25px 0; padding: 15px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #b62441;">
                            <p style="margin: 0; font-weight: bold;">Következő lépések:</p>
                            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                                <li>Lépj be a tDarts platformra</li>
                                <li>Hozd létre az első OAC versenyedet</li>
                                <li>Használd a hivatalos OAC logókat a hirdetésekben</li>
                            </ul>
                        </div>
 
                        ${application.invoiceNumber ? `<p>A befizetésről szóló számlát csatoltuk ehhez az emailhez.</p>` : ''}
 
                        <p>Sikeres versenyzést kívánunk!</p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 0.9em; color: #6b7280;">
                            Üdvözlettel,<br>
                            OAC Csapat & MDSZ
                        </div>
                    </div>
                </div>
                `,
                attachments: attachments.length > 0 ? attachments : undefined
            });
        }
    } catch (mailError) {
        console.error('Approval email error:', mailError);
    }

    return NextResponse.json({ message: 'Application approved and league created' });
  } catch (error: any) {
    console.error('Approve application error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
