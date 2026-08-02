import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net",
  port: 465,
  secure: true,
  auth: {
    user: "info@dirtridecamp.com",
    pass: "12CMSxx766@",
  },
});

async function sendTestEmail() {
  try {
    console.log("1️⃣ Verifying SMTP...");
    const verified = await transporter.verify();
    if (!verified) {
      console.log("❌ SMTP verification failed");
      process.exit(1);
    }
    console.log("✅ SMTP verified");

    console.log("2️⃣ Sending test email...");
    const result = await transporter.sendMail({
      from: "info@dirtridecamp.com",
      to: "kulhary.1999@gmail.com",
      subject: "🎉 DRC Email System - FINAL TEST",
      html: "<h2>Email System Working!</h2><p>This email was sent successfully via GoDaddy SMTP.</p>",
    });

    console.log("✅ Email sent successfully!");
    console.log("📧 Message ID:", result.messageId);
    console.log("✅ Check your email at kulhary.1999@gmail.com");
    process.exit(0);
  } catch (error) {
    console.log("❌ FAILED:", error.message);
    process.exit(1);
  }
}

sendTestEmail();
