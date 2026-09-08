const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;

const initializeMailer = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT, 10) || 587,
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    logger.info('Nodemailer configured with provided SMTP credentials');
  } else {
    // Development fallback using Ethereal test account or simulated logger
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      logger.info(`Nodemailer running with Ethereal test account (${testAccount.user})`);
    } catch (err) {
      logger.warn(`Could not create Ethereal account, running email in mock logger mode: ${err.message}`);
      transporter = {
        sendMail: async (options) => {
          logger.info(`[MOCK EMAIL SENT] To: ${options.to} | Subject: ${options.subject}`);
          return { messageId: `mock-${Date.now()}` };
        }
      };
    }
  }
};

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    if (!transporter) {
      await initializeMailer();
    }
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"FixIt Platform" <notifications@fixit.org>',
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    if (nodemailer.getTestMessageUrl && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info(`Email Preview URL: ${previewUrl}`);
      }
    }
    return info;
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    // Do not throw so caller workflow continues without blocking
    return null;
  }
};

module.exports = {
  initializeMailer,
  sendEmail
};
