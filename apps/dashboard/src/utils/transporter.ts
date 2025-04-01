import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025, // Default MailHog SMTP port
  secure: false,
});

export default transporter;
