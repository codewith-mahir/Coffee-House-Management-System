// Generate Ethereal email credentials for testing
// Run with: node generate-ethereal.js

const nodemailer = require('nodemailer');

async function generateEtherealCredentials() {
  try {
    console.log('🔧 Generating Ethereal email credentials...\n');

    // Create a test account
    const testAccount = await nodemailer.createTestAccount();

    console.log('✅ Ethereal account created successfully!');
    console.log('📧 Email:', testAccount.user);
    console.log('🔑 Password:', testAccount.pass);
    console.log('📮 SMTP Host:', testAccount.smtp.host);
    console.log('🔌 SMTP Port:', testAccount.smtp.port);
    console.log('🔗 Web Interface:', nodemailer.getTestMessageUrl(testAccount));
    console.log('\n📝 Add these to your server/.env file:');
    console.log(`ETHEREAL_USER=${testAccount.user}`);
    console.log(`ETHEREAL_PASS=${testAccount.pass}`);

    // Test the transporter
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    // Verify transporter
    await transporter.verify();
    console.log('\n✅ Email transporter verified successfully!');

    return testAccount;
  } catch (error) {
    console.error('❌ Failed to generate Ethereal credentials:', error.message);
    throw error;
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  generateEtherealCredentials();
}

module.exports = { generateEtherealCredentials };
