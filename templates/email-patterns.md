# Email Patterns

This template provides patterns for implementing email functionality, including email templates, transactional emails, and integration with email services.

## Email Service Setup

### 1. Nodemailer Configuration
```javascript
// config/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server ready');
  }
});

module.exports = transporter;
```

### 2. SendGrid Configuration
```javascript
// config/sendgrid.js
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, html, text) {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject,
    text,
    html
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('SendGrid error:', error);
    throw error;
  }
}

module.exports = { sendEmail };
```

### 3. AWS SES Configuration
```javascript
// config/ses.js
const AWS = require('aws-sdk');

const ses = new AWS.SES({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function sendEmail(to, subject, html, text) {
  const params = {
    Source: process.env.SES_FROM_EMAIL,
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to]
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8'
      },
      Body: {
        Html: {
          Data: html,
          Charset: 'UTF-8'
        },
        Text: {
          Data: text,
          Charset: 'UTF-8'
        }
      }
    }
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log('Email sent:', result.MessageId);
    return result;
  } catch (error) {
    console.error('SES error:', error);
    throw error;
  }
}

module.exports = { sendEmail };
```

## Email Service Class

```javascript
// services/emailService.js
const transporter = require('../config/email');
const { renderTemplate } = require('../utils/emailTemplates');

class EmailService {
  async send(to, subject, template, data) {
    try {
      const html = renderTemplate(template, data);
      const text = this.htmlToText(html);

      const mailOptions = {
        from: `"${process.env.APP_NAME}" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
        text
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);

      return info;
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  async sendWelcome(user) {
    return this.send(
      user.email,
      'Welcome to Our App!',
      'welcome',
      {
        name: user.name,
        email: user.email,
        loginUrl: `${process.env.APP_URL}/login`
      }
    );
  }

  async sendPasswordReset(user, resetToken) {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

    return this.send(
      user.email,
      'Password Reset Request',
      'password-reset',
      {
        name: user.name,
        resetUrl,
        expiresIn: '1 hour'
      }
    );
  }

  async sendVerificationEmail(user, verificationToken) {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;

    return this.send(
      user.email,
      'Verify Your Email',
      'email-verification',
      {
        name: user.name,
        verificationUrl
      }
    );
  }

  async sendOrderConfirmation(user, order) {
    return this.send(
      user.email,
      `Order Confirmation #${order.id}`,
      'order-confirmation',
      {
        name: user.name,
        orderId: order.id,
        items: order.items,
        total: order.total,
        orderUrl: `${process.env.APP_URL}/orders/${order.id}`
      }
    );
  }

  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

module.exports = new EmailService();
```

## Email Templates

### 1. Base Template
```javascript
// templates/email/base.js
function baseTemplate(content, data = {}) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.subject || 'Email'}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #007bff;
          color: white;
          padding: 20px;
          text-align: center;
        }
        .content {
          padding: 20px;
          background-color: #f9f9f9;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${data.appName || 'Our App'}</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} ${data.appName || 'Our App'}. All rights reserved.</p>
        <p>
          <a href="${data.unsubscribeUrl || '#'}">Unsubscribe</a> |
          <a href="${data.preferencesUrl || '#'}">Email Preferences</a>
        </p>
      </div>
    </body>
    </html>
  `;
}

module.exports = baseTemplate;
```

### 2. Welcome Email Template
```javascript
// templates/email/welcome.js
const baseTemplate = require('./base');

function welcomeTemplate(data) {
  const content = `
    <h2>Welcome, ${data.name}!</h2>
    <p>Thank you for joining us. We're excited to have you on board!</p>
    <p>To get started, please verify your email address by clicking the button below:</p>
    <a href="${data.verificationUrl}" class="button">Verify Email</a>
    <p>If you didn't create an account, you can safely ignore this email.</p>
    <p>Best regards,<br>The Team</p>
  `;

  return baseTemplate(content, {
    subject: 'Welcome!',
    appName: process.env.APP_NAME
  });
}

module.exports = welcomeTemplate;
```

### 3. Password Reset Template
```javascript
// templates/email/password-reset.js
const baseTemplate = require('./base');

function passwordResetTemplate(data) {
  const content = `
    <h2>Password Reset Request</h2>
    <p>Hi ${data.name},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <a href="${data.resetUrl}" class="button">Reset Password</a>
    <p>This link will expire in ${data.expiresIn}.</p>
    <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
    <p>Best regards,<br>The Team</p>
  `;

  return baseTemplate(content, {
    subject: 'Password Reset',
    appName: process.env.APP_NAME
  });
}

module.exports = passwordResetTemplate;
```

### 4. Order Confirmation Template
```javascript
// templates/email/order-confirmation.js
const baseTemplate = require('./base');

function orderConfirmationTemplate(data) {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>$${(item.quantity * item.price).toFixed(2)}</td>
    </tr>
  `).join('');

  const content = `
    <h2>Order Confirmation</h2>
    <p>Hi ${data.name},</p>
    <p>Thank you for your order! Your order #${data.orderId} has been confirmed.</p>
    
    <h3>Order Details:</h3>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background-color: #f0f0f0;">
          <th style="padding: 10px; text-align: left;">Item</th>
          <th style="padding: 10px; text-align: left;">Qty</th>
          <th style="padding: 10px; text-align: left;">Price</th>
          <th style="padding: 10px; text-align: left;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr style="font-weight: bold;">
          <td colspan="3" style="padding: 10px; text-align: right;">Total:</td>
          <td style="padding: 10px;">$${data.total.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>

    <a href="${data.orderUrl}" class="button">View Order</a>
    
    <p>We'll send you another email when your order ships.</p>
    <p>Best regards,<br>The Team</p>
  `;

  return baseTemplate(content, {
    subject: `Order Confirmation #${data.orderId}`,
    appName: process.env.APP_NAME
  });
}

module.exports = orderConfirmationTemplate;
```

## Template Renderer

```javascript
// utils/emailTemplates.js
const welcomeTemplate = require('../templates/email/welcome');
const passwordResetTemplate = require('../templates/email/password-reset');
const orderConfirmationTemplate = require('../templates/email/order-confirmation');

const templates = {
  welcome: welcomeTemplate,
  'password-reset': passwordResetTemplate,
  'order-confirmation': orderConfirmationTemplate
};

function renderTemplate(templateName, data) {
  const template = templates[templateName];

  if (!template) {
    throw new Error(`Template '${templateName}' not found`);
  }

  return template(data);
}

module.exports = { renderTemplate };
```

## Email Queue with Bull

```javascript
// queues/emailQueue.js
const Queue = require('bull');
const emailService = require('../services/emailService');

const emailQueue = new Queue('email', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

// Process email jobs
emailQueue.process(async (job) => {
  const { to, subject, template, data } = job.data;

  try {
    await emailService.send(to, subject, template, data);
    return { success: true };
  } catch (error) {
    console.error('Email queue error:', error);
    throw error;
  }
});

// Add email to queue
async function queueEmail(to, subject, template, data, options = {}) {
  return await emailQueue.add(
    { to, subject, template, data },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      ...options
    }
  );
}

module.exports = { emailQueue, queueEmail };
```

## Bulk Email Sending

```javascript
// services/bulkEmailService.js
const emailService = require('./emailService');

class BulkEmailService {
  async sendBulk(recipients, subject, template, data) {
    const batchSize = 50;
    const delay = 1000; // 1 second between batches

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      const promises = batch.map(recipient =>
        emailService.send(
          recipient.email,
          subject,
          template,
          { ...data, name: recipient.name }
        ).catch(error => {
          console.error(`Failed to send to ${recipient.email}:`, error);
          return { error, recipient };
        })
      );

      await Promise.all(promises);

      // Delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async sendNewsletter(recipients, subject, content) {
    return this.sendBulk(recipients, subject, 'newsletter', { content });
  }
}

module.exports = new BulkEmailService();
```

## Email Tracking

```javascript
// services/emailTrackingService.js
const { prisma } = require('../lib/prisma');

class EmailTrackingService {
  async trackSent(userId, emailType, recipient) {
    return await prisma.emailLog.create({
      data: {
        userId,
        emailType,
        recipient,
        status: 'sent',
        sentAt: new Date()
      }
    });
  }

  async trackOpened(emailLogId) {
    return await prisma.emailLog.update({
      where: { id: emailLogId },
      data: {
        opened: true,
        openedAt: new Date()
      }
    });
  }

  async trackClicked(emailLogId, link) {
    return await prisma.emailLog.update({
      where: { id: emailLogId },
      data: {
        clicked: true,
        clickedAt: new Date(),
        clickedLink: link
      }
    });
  }

  async getEmailStats(userId) {
    const stats = await prisma.emailLog.groupBy({
      by: ['emailType'],
      where: { userId },
      _count: true,
      _sum: {
        opened: true,
        clicked: true
      }
    });

    return stats;
  }
}

module.exports = new EmailTrackingService();
```

## Email Validation

```javascript
// utils/emailValidator.js
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isDisposableEmail(email) {
  const disposableDomains = [
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com'
    // Add more disposable domains
  ];

  const domain = email.split('@')[1];
  return disposableDomains.includes(domain);
}

async function verifyEmailExists(email) {
  // Use a service like ZeroBounce or Hunter.io
  // This is a placeholder
  return true;
}

module.exports = {
  isValidEmail,
  isDisposableEmail,
  verifyEmailExists
};
```

## Unsubscribe Handler

```javascript
// routes/unsubscribe.js
const express = require('express');
const { prisma } = require('../lib/prisma');

const router = express.Router();

router.get('/unsubscribe/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // Verify token and get user
    const user = await verifyUnsubscribeToken(token);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailSubscribed: false }
    });

    res.send('You have been unsubscribed from our emails.');
  } catch (error) {
    res.status(400).send('Invalid unsubscribe link.');
  }
});

module.exports = router;
```
