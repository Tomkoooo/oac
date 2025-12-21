import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { to, subject, message, isHtml } = await req.json();

    if (!to || !subject || !message) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Apply red styling if HTML is requested or by default
    // User requested "emails need to be styled with the red color scheme"
    let htmlContent = message;
    if (isHtml || true) { // Always wrap in styled template
        htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #ef4444; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">OAC Értesítés</h1>
            </div>
            <div style="padding: 24px; background-color: #ffffff; color: #374151; line-height: 1.6;">
                ${message.replace(/\n/g, '<br/>')}
            </div>
            <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #6b7280;">
                <p>&copy; ${new Date().getFullYear()} OAC Portal. Minden jog fenntartva.</p>
            </div>
        </div>
        `;
    }

    await sendEmail({
      to,
      subject,
      html: htmlContent,
      text: message
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
