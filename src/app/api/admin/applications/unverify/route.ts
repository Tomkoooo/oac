import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Application } from '@/models';
import { removeOacLeague } from '@/lib/tdarts-data';
import { sendEmail } from '@/lib/mailer';
import { getEmailTemplates } from '@/lib/config';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { applicationId, removalType } = body;

    // clubId might be missing in some frontend calls, we fetch it from application
    let clubId = body.clubId;

    if (!applicationId) {
      return NextResponse.json({ message: 'Application ID is required' }, { status: 400 });
    }

    await dbConnect();
    const application = await Application.findById(applicationId);

    if (!application) {
      return NextResponse.json({ message: 'Application not found' }, { status: 404 });
    }

    if (!clubId) {
        clubId = application.clubId;
    }

    if (!clubId) {
        return NextResponse.json({ message: 'Club ID could not be determined' }, { status: 400 });
    }

    // 1. Remove OAC League in tDarts
    try {
      console.log(`[Unverify] Removing OAC status for club ${clubId} (Type: ${removalType || 'delete_league'})`);
      await removeOacLeague(clubId, removalType || 'delete_league');
    } catch (removeError: any) {
      console.error('Failed to remove OAC league in tDarts database:', removeError);
      // We continue even if league removal fails (maybe it was already deleted)
    }

    // 2. Update Application Status
    application.status = 'rejected'; 
    application.notes = (application.notes || '') + `\n[SYSTEM] Unverified on ${new Date().toLocaleString()} (Type: ${removalType || 'delete_league'})`;
    await application.save();

    // 3. Send Notification Email
    try {
      const templates = await getEmailTemplates();
      const baseMessage = templates.applicationRemoval;
      
      const targetEmail = application.applicantEmail;
      if (targetEmail) {
        const typeText = removalType === 'delete_league' ? 'törlésre' : 'lezárásra';
        
        await sendEmail({
          to: targetEmail,
          subject: 'Értesítés: OAC Klub státusz visszavonva',
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #374151; padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">OAC Státusz Visszavonva</h1>
              </div>
              <div style="padding: 24px; background-color: #ffffff; color: #374151; line-height: 1.6;">
                  <p>Kedves <strong>${application.applicantName || application.clubName}</strong>!</p>
                  <p>${baseMessage}</p>
                  <p>Tájékoztatunk, hogy a(z) <strong>${application.clubName}</strong> klub OAC liga tagsága és hivatalos státusza ${typeText} került.</p>
                  
                  <div style="margin: 25px 0; padding: 15px; background-color: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                      <p style="margin: 0; font-weight: bold; color: #991b1b;">Művelet típusa:</p>
                      <p style="margin: 5px 0 0 0;">${removalType === 'delete_league' ? 'Liga teljes törlése' : 'Liga lezárása és archiválása'}</p>
                  </div>

                  <p>Amennyiben ez tévedésből történt, vagy kérdésed van a döntéssel kapcsolatban, kérjük válaszolj erre az emailre.</p>
                  
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 0.9em; color: #6b7280;">
                      Üdvözlettel,<br>
                      OAC Csapat & MDSZ
                  </div>
              </div>
          </div>
          `
        });
      }
    } catch (mailError: any) {
      console.error('Failed to send unverify email:', mailError.message);
    }

    return NextResponse.json({ success: true, message: 'Státusz visszavonva' });

  } catch (error: any) {
    console.error('Unverify error:', error);
    return NextResponse.json({ message: error.message || 'Hiba történt a művelet során' }, { status: 500 });
  }
}
