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
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #F5F5F5; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-family: 'Oswald', Impact, sans-serif; font-size: 32px; text-transform: uppercase; letter-spacing: 1px; margin: 0; color: #F5F5F5; font-weight: 700;">
          D<span style="color: #E8622C;">R</span>C
        </h1>
        <p style="color: #E8622C; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 4px; margin: 8px 0 0;">// Motorsports</p>
      </div>
      <div style="background: #141414; border: 1px solid #262626; padding: 28px;">
        <h2 style="color: #F5F5F5; font-family: 'Oswald', Impact, sans-serif; font-size: 22px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 16px;">${title}</h2>
        ${body}
        ${ctaText && ctaUrl ? `
          <div style="margin-top: 28px;">
            <a href="${ctaUrl}" style="display: inline-block; background: #E8622C; color: #ffffff; padding: 12px 28px; text-decoration: none; font-family: 'Oswald', Impact, sans-serif; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; font-size: 13px;">${ctaText}</a>
          </div>
        ` : ""}
      </div>
      <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #262626;">
        <p style="color: #E8622C; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin: 0;">Adventure isn't found. It's earned.</p>
        <p style="color: #8A8A8A; font-size: 11px; margin: 8px 0 0;">DRC Motorsports Pvt Ltd &middot; info@dirtridecamp.com</p>
      </div>
    </div>
  `;
}
