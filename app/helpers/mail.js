const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "28d8da7b68eae0",
    pass: "b2663dca612646",
  }
});

module.exports = transporter;