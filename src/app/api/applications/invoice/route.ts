import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Application } from '@/models';
import { getInvoicePdf } from '@/lib/billing';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID required' }, { status: 400 });
    }

    await dbConnect();

    // 1. Auth Check
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;
    let isAdmin = (session?.user as any)?.role === 'admin';

    // Fallback to tdarts_token if no next-auth session
    if (!userId) {
        const cookieStore = await cookies();
        const token = cookieStore.get('tdarts_token')?.value;
        if (token) {
            try {
                const secret = process.env.TDARTS_JWT_SECRET || process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'development-secret';
                const decoded = jwt.verify(token, secret) as any;
                userId = decoded.userId || decoded.sub;
            } catch (e) {
                // Ignore invalid token
            }
        }
    }

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch Application
    const application = await Application.findById(applicationId);
    if (!application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // 3. Authorization - User must be the owner OR an admin
    if (application.applicantUserId !== userId && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Check for Invoice
    if (!application.invoiceNumber) {
        return NextResponse.json({ error: 'Invoice not found for this application' }, { status: 404 });
    }

    // 5. Fetch PDF from Szamlazz.hu
    try {
        const pdfBuffer = await getInvoicePdf(application.invoiceNumber);
        
        if (!pdfBuffer) {
            return NextResponse.json({ error: 'Failed to retrieve PDF content' }, { status: 500 });
        }

        // 6. Return PDF Stream
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', `attachment; filename="szamla_${application.invoiceNumber}.pdf"`);
        const binaryData = new Uint8Array(pdfBuffer);
        headers.set('Content-Length', binaryData.length.toString());

        return new Response(binaryData, {
            status: 200,
            headers,
        });

    } catch (err) {
        console.error('Error retrieving invoice from provider:', err);
        return NextResponse.json({ error: 'Failed to retrieve invoice from provider' }, { status: 502 });
    }

  } catch (error) {
    console.error('Download invoice error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
