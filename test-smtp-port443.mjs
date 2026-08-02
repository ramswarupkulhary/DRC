import nodemailer from "nodemailer";

console.log("Testing GoDaddy SMTP on port 443...\n");

const transporter = nodemailer.createTransport({
  host: "smtp.secureserver.net",
  port: 443,
  secure: true,
  auth: {
    user: "info@dirtridecamp.com",
    pass: "12CMSxx766",
  },
  connectionTimeout: 10000,
  socketTimeout: 10000,
});

async function test() {
  try {
    console.log("🔍 Verifying SMTP connection on port 443...");
    const verified = await transporter.verify();
    
    if (verified) {
      console.log("✅ SMTP verified successfully!");
      console.log("📧 Sending test email...");
      
      const result = await transporter.sendMail({
        from: "info@dirtridecamp.com",
        to: "kulhary.1999@gmail.com",
        subject: "DRC Test Email - Port 443",
        html: "<p>Test email from port 443 configuration.</p>",
      });
      
      console.log("✅ Email sent successfully!");
      console.log("Message ID:", result.messageId);
    } else {
      console.log("❌ Verification failed");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Code:", error.code);
  }
  process.exit(0);
}

test();
