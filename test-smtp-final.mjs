import nodemailer from "nodemailer";

console.log("Testing GoDaddy SMTP with correct password...\n");

const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net",
  port: 465,
  secure: true,
  auth: {
    user: "info@dirtridecamp.com",
    pass: "12CMSxx766@",
  },
  connectionTimeout: 10000,
  socketTimeout: 10000,
});

async function test() {
  try {
    console.log("🔍 Verifying SMTP connection...");
    const verified = await transporter.verify();
    
    if (verified) {
      console.log("✅ SMTP verified successfully!");
      console.log("📧 Sending test email...");
      
      const result = await transporter.sendMail({
        from: "info@dirtridecamp.com",
        to: "kulhary.1999@gmail.com",
        subject: "🎉 DRC Email System - WORKING!",
        html: "<p>✅ GoDaddy SMTP is now working perfectly!</p>",
      });
      
      console.log("✅ Email sent successfully!");
      console.log("Message ID:", result.messageId);
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

test();
