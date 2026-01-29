import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import { Application } from '@/models';
import { sendEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tdarts_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Decode JWT for applicant name
    let applicantName = 'Ismeretlen Felhasználó';
    try {
        const tokenPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        applicantName = tokenPayload.name || tokenPayload.username || applicantName;
    } catch (e) {}

    const body = await request.json();
    const { applicationId, reason } = body;

    if (!applicationId) {
      return NextResponse.json({ message: 'Application ID required' }, { status: 400 });
    }

    await dbConnect();

    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    // Only approved applications can request removal
    if (application.status !== 'approved') {
      return NextResponse.json({ message: 'Only approved applications can request removal' }, { status: 400 });
    }

    // Update status to removal_requested
    application.status = 'removal_requested';
    if (reason) {
      application.notes = reason;
    }
    await application.save();

    // Notify Office about removal request
    try {
        await sendEmail({
            to: 'office@magyardarts.hu',
            subject: `OAC Eltávolítási Kérelem - ${application.clubName}`,
            text: `
 Eltávolítási kérelem érkezett egy OAC tagsághoz.
 
 Klub: ${application.clubName} (ID: ${application.clubId})
 Kérelmező: ${applicantName}
 
 Indoklás:
 ${reason || 'Nem érkezett indoklás.'}
 
 Teendő: Az admin felületen hagyd jóvá vagy utasítsd el a kérelmet.
            `,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">OAC Eltávolítási Kérelem</h2>
                <p>Eltávolítási kérelem érkezett az alábbi klubhoz:</p>
                
                <div style="background: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Klub:</strong> ${application.clubName}</p>
                  <p style="margin: 5px 0;"><strong>Azonosító:</strong> <code>${application.clubId}</code></p>
                  <p style="margin: 5px 0;"><strong>Kérelmező:</strong> ${applicantName}</p>
                </div>
 
                <h3 style="color: #374151;">Indoklás</h3>
                <div style="border-left: 4px solid #e5e7eb; padding-left: 15px; font-style: italic; color: #4b5563;">
                  ${reason || 'Nem érkezett indoklás.'}
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.875rem; color: #6b7280; text-align: center;">
                  Ezt a kérelmet az adminisztrációs felületen tudod kezelni.
                </div>
              </div>
            `
        });
    } catch (mailError) {
        console.error('Failed to notify admin about removal request:', mailError);
    }

    return NextResponse.json({ message: 'Removal request submitted successfully' });
  } catch (error: any) {
    console.error('Request removal error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
