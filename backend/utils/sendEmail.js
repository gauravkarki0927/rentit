import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async ({ email, subject, message }) => {
  await transporter.sendMail({
    from: `"RentIt Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    text: message,
  });
};

export const sendMailToAdmin = async ({ name, email, subject, message }) => {
  await transporter.sendMail({
    from: `"RentIt Support" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_ADMIN,
    subject: subject,
    html: `
    <p>Hello Admin, You have a mail from a user and the details are as follows: <br>
    Name: ${name} <br>
    Email: ${email} <br>
    Message: I would like to contact you regarding ${subject}. My message is as follows: ${message}</p>`,
  });
};

export const sendEmailVerificationCode = async ({ name, code, email }) => {
  await transporter.sendMail({
    from: `"RentIt-Room Rental System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "User Email Verification",
    html: `
    <p>Hello ${name},<br>
    Your email verification code is <h2>${code}</h2><br>
    Please use this code to verify your email address and do not share it with anyone. <br>
    If you did not request this, please ignore this email. <br>`
  });
};

export default sendOTP;
