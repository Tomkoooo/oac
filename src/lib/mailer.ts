import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 5000, // 5 seconds
  socketTimeout: 10000, // 10 seconds
});

export const sendEmail = async ({
  to,
  subject,
  text,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: any[];
}) => {
  try {
    console.log(`[Mailer] Sending email to: ${to}, Subject: ${subject}`);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"OAC Admin" <noreply@tdarts.hu>',
      to,
      subject,
      text,
      html,
      attachments,
    });
    console.log(`[Mailer] Email sent successfully. MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Mailer] Error sending email to ${to}:`, error);
    throw error;
  }
};
