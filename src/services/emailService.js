const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true' || false, // true para 465, false para outras portas
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(to, subject, messageText) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #0D47A1; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Cultura Connect</h1>
          <p style="color: #f1f1f1; font-size: 18px;">Notificação</p>
        </div>
        <div style="padding: 20px;">
          <p style="font-size: 16px;">${messageText}</p>
        </div>
        <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          Esta é uma mensagem automática. Por favor, não responda.
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `Cultura Connect`,
    to,
    envelope: {
      from: `Cultura Connect`,
      to,
    },
    subject,
    text: messageText, // fallback para clientes sem suporte HTML
    html,
  });
}

module.exports = { sendEmail };
