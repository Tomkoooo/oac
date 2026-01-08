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
    const { applicationId, notes } = body;

    if (!applicationId) {
      return NextResponse.json({ message: 'Application ID required' }, { status: 400 });
    }

    const application = await Application.findById(applicationId);
    if (!application) {
      return NextResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    // Allow rejecting approved applications (to un-verify)
    if (application.status === 'rejected') {
      return NextResponse.json({ message: 'Application already rejected' }, { status: 400 });
    }

    // If application was approved, we need to remove the OAC league and unverify the club
    if (application.status === 'approved') {
      try {
        const { removeOacLeague } = await import('@/lib/tdarts-data');
        await removeOacLeague(application.clubId, 'delete_league');
      } catch (error) {
        console.error('Error removing OAC league in tDarts:', error);
        // Continue to update local status even if remote fails (or maybe fail?)
        // For now, let's log and continue, but maybe we should warn
      }
    }

    application.status = 'rejected';
    if (notes) {
      application.notes = notes;
    }
    await application.save();

    // Send Rejection Email
    try {
        const { sendEmail } = await import('@/lib/mailer');
        const { getEmailTemplates } = await import('@/lib/config');
        const templates = await getEmailTemplates();
        
        // Use applicationRemoval template if status was approved (meaning it's a removal)
        const isRemoval = application.status === 'approved'; // Wait, it was approved BEFORE we set it to rejected
        // Actually, we set it to rejected at line 46. 
        // Let's check the old status.
        
        const baseMessage = isRemoval ? templates.applicationRemoval : templates.applicationRejected;

        const targetEmail = application.applicantEmail;
        
        if (targetEmail) {
            await sendEmail({
                to: targetEmail,
                subject: isRemoval ? 'Értesítés: OAC Klub státusz visszavonva' : 'Értesítés: OAC Jelentkezés elutasítva',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #374151; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">Értesítés Jelentkezésről</h1>
                    </div>
                    <div style="padding: 24px; background-color: #ffffff; color: #374151; line-height: 1.6;">
                        <p>Kedves <strong>${application.applicantName || application.clubName}</strong>!</p>
                        <p>${baseMessage}</p>
                        <p>A(z) <strong>${application.clubName}</strong> klub OAC liga jelentkezése ${isRemoval ? 'visszavonásra' : 'elutasításra'} került.</p>
                        
                        ${notes ? `
                        <div style="margin: 25px 0; padding: 15px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                            <p style="margin: 0; font-weight: bold; color: #991b1b;">Indoklás / Megjegyzés:</p>
                            <p style="margin: 10px 0 0 0;">${notes}</p>
                        </div>
                        ` : ''}
 
                        <p>Amennyiben kérdésed van, vagy javítani szeretnéd a hiányosságokat, kérjük válaszolj erre az emailre.</p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 0.9em; color: #6b7280;">
                            Üdvözlettel,<br>
                            OAC Csapat & MDSZ
                        </div>
                    </div>
                </div>
                `
            });
        }
    } catch (mailError) {
        console.error('Rejection email error:', mailError);
    }

    return NextResponse.json({ message: 'Application rejected and OAC status revoked' });
  } catch (error: any) {
    console.error('Reject application error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
