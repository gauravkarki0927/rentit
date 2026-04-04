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

export default sendOTP;

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
    If you did not request this, please ignore this email. <br>`,
  });
};

// export const sendPostApproveMail = async ({ user, post }) => {
//   await transporter.sendMail({
//     from: `"RentIt Support" <${process.env.EMAIL_USER}>`,
//     to: user.email,
//     subject: "RENTIT - Your Listing Has Been Approved!",
//     message: `
//         Hello ${user.name},

//         Great news! Your listing "${post.name}" has been approved and is now live on RENTIT.

//         Listing Details:
//         - Title: ${post.name}
//         - Location: ${post.location?.city || "N/A"}
//         - Price: Rs. ${post.price}/month
//         - Status: APPROVED

//         You can now receive applications from interested renters.

//         Best regards,
//         RENTIT Team
//       `,
//   });
// };

// export const sendPostRejectedEmail = async ({ user, post }) => {
//   await transporter.sendMail({
//     from: `"RentIt Support" <${process.env.EMAIL_USER}>`,
//     to: user.email,
//     subject: "RENTIT - Your Listing Has Been Approved!",
//     message: `
//         Hello ${user.name},
        
//         Your listing "${post.name}" requires some changes before it can be approved.
        
//         Reason: ${reason || 'The listing does not meet our guidelines.'}
        
//         Please review your listing and make necessary changes. You can resubmit after editing.
        
//         View and edit your listing: ${process.env.FRONTEND_URL}/edit-listing/${post._id}
        
//         If you have any questions, please contact us at support@rentit.com
        
//         Best regards,
//         RENTIT Team
//       `,
//   });
// };

export const sendApplicationSentEmailToOwner = async ({
  owner,
  applicant,
  post,
}) => {
  await transporter.sendMail({
    from: `"RentIt Support" <${process.env.EMAIL_USER}>`,
    to: owner.email,
    subject: `RENTIT - New Application for ${post.name}`,
    text: `
Hello ${owner.name},

You have received a new application for your listing "${post.name}".

Applicant Details:
- Name: ${applicant.userName}
- Email: ${applicant.userEmail}
- Phone: ${applicant.userPhone}
- Duration: ${applicant.duration}
- Number of People: ${applicant.people}

Please respond to the applicant within 48 hours.

Best regards,
RENTIT Team
    `,
  });
};

export const sendApplicationReceivedEmailToTenant = async ({
  applicant,
  post,
}) => {
  await transporter.sendMail({
    from: `"RentIt Support" <${process.env.EMAIL_USER}>`,
    to: applicant.userEmail,
    subject: `RENTIT - Application Submitted for ${post.name}`,
    text: `
Hello ${applicant.userName},

Your application for "${post.name}" has been successfully submitted.

Please wait for their response.

Thank you for using RENTIT.

Best regards,
RENTIT Team
    `,
  });
};

export const sendApplicationApproveEmailToTenant = async ({
  applicant,
  post,
  owner,
}) => {
  await transporter.sendMail({
    from: `"RentIt Support" <${process.env.EMAIL_USER}>`,
    to: applicant.userEmail,
    subject: `RENTIT - Application Approved for ${post.name}`,
    text: `
Hello ${applicant.userName},

Your application for "${post.name}" has been approved by the owner.
You can now proceed to finalize the rental agreement.
The owner will contact you shortly.

Contact them if you have any questions through:
Name: ${owner.name || "N/A"}
Email: ${owner.email || "N/A"}
Phone: ${owner.phoneNymber || "N/A"}

Thank you for using RENTIT.

Best regards,
RENTIT Team
    `,
  });
};

export const sendApplicationRejectEmailToTenant = async ({
  applicant,
  post,
}) => {
  await transporter.sendMail({
    from: `"RentIt Support" <${process.env.EMAIL_USER}>`,
    to: applicant.userEmail,
    subject: `RENTIT - Application Rejected for ${post.name}`,
    text: `
Hello ${applicant.userName},

Your application for "${post.name}" has been rejected by the owner.

Thank you for using RENTIT.

Best regards,
RENTIT Team
    `,
  });
};
