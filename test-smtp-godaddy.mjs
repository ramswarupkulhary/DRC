import nodemailer from "nodemailer";

console.log("Testing GoDaddy SMTP Configuration...\n");

const configs = [
  {
    name: "GoDaddy Port 587 (TLS)",
    host: "smtp.secureserver.net",
    port: 587,
    secure: false,
    user: "info@dirtridecamp.com",
    pass: "12CMSxx766",
  },
  {
    name: "GoDaddy Port 465 (SSL)",
    host: "smtp.secureserver.net",
    port: 465,
    secure: true,
    user: "info@dirtridecamp.com",
    pass: "12CMSxx766",
  },
];

async function testConfig(config) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing: ${config.name}`);
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Secure: ${config.secure}`);

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      connectionTimeout: 5000,
      socketTimeout: 5000,
    });

    const timer = setTimeout(() => {
      console.log("   ❌ Connection TIMEOUT (no response)");
      resolve(false);
    }, 6000);

    transporter.verify((error, success) => {
      clearTimeout(timer);
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
        console.log(`      Code: ${error.code}`);
        resolve(false);
      } else if (success) {
        console.log(`   ✅ Connection successful!`);
        resolve(true);
      }
    });
  });
}

async function main() {
  for (const config of configs) {
    await testConfig(config);
  }
  console.log("\n✅ Testing complete!\n");
  process.exit(0);
}

main();
