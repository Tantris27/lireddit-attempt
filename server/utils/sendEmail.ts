import nodemailer from 'nodemailer';

export async function sendEmail(to: string, html: string) {
  // const testAccount = await nodemailer.createTestAccount();
  // console.log('testAccount', testAccount);

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for port 465, false for all others
    auth: {
      user: 'u5mfqwa6sdyojjnd@ethereal.email',
      pass: 'PveXwej9x6mjjMpvpS',
      // user: testAccount.user,
      // pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"Fred Foo " <foo@example.com>',
    to: to,
    subject: 'Change Password',
    // text: text,
    html,
  });
  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}
