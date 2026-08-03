import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net",
  port: 587,
  secure: false,
  auth: {
    user: "info@dirtridecamp.com",
    pass: process.env.SMTP_PASSWORD,
  },
  connectionTimeout: 15000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
});

const FROM = "info@dirtridecamp.com";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const info = await transporter.sendMail({ from: FROM, to, subject, html });
  console.log(`[EMAIL] ✅ Sent "${subject}" to ${to}, ID: ${(info as unknown as Record<string, unknown>)?.messageId}`);
  return info;
}

export function drcEmailTemplate({
  title,
  body,
  ctaText,
  ctaUrl,
}: {
  title: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
}) {
  return `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0D0D0D; color: #F1E9DD; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-family: 'Oswald', Impact, sans-serif; color: #E8622C; font-size: 28px; text-transform: uppercase; letter-spacing: 2px; margin: 0;">DRC</h1>
        <p style="color: #B9A886; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 4px 0 0;">Dirt Ride Camp</p>
      </div>
      <div style="background: #1A1A1A; border: 1px solid #333333; border-radius: 4px; padding: 24px;">
        <h2 style="color: #F1E9DD; font-size: 20px; margin: 0 0 16px;">${title}</h2>
        ${body}
        ${ctaText && ctaUrl ? `
          <div style="text-align: center; margin-top: 24px;">
            <a href="${ctaUrl}" style="display: inline-block; background: #E8622C; color: white; padding: 12px 32px; text-decoration: none; border-radius: 4px; font-weight: 600; text-transform: uppercase; font-size: 14px;">${ctaText}</a>
          </div>
        ` : ""}
      </div>
      <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #333333;">
        <p style="color: #888888; font-size: 12px; margin: 0;">Dirt Ride Camp &middot; Ride &middot; Explore &middot; Connect</p>
        <p style="color: #888888; font-size: 11px; margin: 4px 0 0;">info@dirtridecamp.com</p>
      </div>
    </div>
  `;
}
