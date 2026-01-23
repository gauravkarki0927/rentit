import nodemailer from "nodemailer";

const sendMail = async ({ email, subject, message }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"RentIt Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text: message,
  });
};

export default sendMail;
