const nodemailer = require('nodemailer');

// Manually set env vars for testing
const SMTP_HOST = 'smtp.gmail.com';
const SMTP_PORT = 587;
const SMTP_USER = 'info.corpow@gmail.com';
const SMTP_PASS = 'jyqslfywqoelezji';

async function testSMTP() {
  console.log('Testing SMTP connection...');
  console.log('SMTP_HOST:', SMTP_HOST);
  console.log('SMTP_PORT:', SMTP_PORT);
  console.log('SMTP_USER:', SMTP_USER);
  console.log('SMTP_PASS:', SMTP_PASS ? '***configured***' : 'NOT SET');

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Send test email
    const info = await transporter.sendMail({
      from: `"Expense Tracker" <${SMTP_USER}>`,
      to: SMTP_USER,
      subject: 'Test Email from Expense Tracker',
      text: 'This is a test email to verify SMTP configuration.',
      html: '<b>This is a test email to verify SMTP configuration.</b>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ SMTP Error:', error.message);
    console.error('Error code:', error.code);
  }
}

testSMTP();
