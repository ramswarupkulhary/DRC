import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.secureserver.net",
  port: 465,
  secure: true,
  auth: {
    user: "info@dirtridecamp.com",
    pass: "12CMSxx766",
  },
});

async function test() {
  try {
    console.log("🔍 Verifying SMTP connection to smtp.secureserver.net:465...");
    const verified = await transporter.verify();
    
    if (verified) {
      console.log("✅ SMTP verified successfully!");
      console.log("📧 Sending test email...");
      
      const result = await transporter.sendMail({
        from: "info@dirtridecamp.com",
        to: "kulhary.1999@gmail.com",
        subject: "DRC Test Email",
        html: "<p>This is a test email to verify SMTP is working.</p>",
      });
      
      console.log("✅ Email sent successfully!");
      console.log("Message ID:", result.messageId);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Code:", error.code);
  }
  process.exit(0);
}

test();
