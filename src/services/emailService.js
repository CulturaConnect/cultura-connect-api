const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
  host: "127.0.0.1", // Postfix local
  port: 25,          // Porta SMTP do MTA
  secure: false,     // STARTTLS não é usado na porta 25 local
  tls: { rejectUnauthorized: false }, // evita frescura com cert local
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
    from: '"Cultura Connect" <no-reply@connectcultura.org>',
    to,
    envelope: {
      from: '"Cultura Connect" <no-reply@connectcultura.org>',
      to,
    },
    subject,
    text: messageText, // fallback para clientes sem suporte HTML
    html,
  });
}

module.exports = { sendEmail };
