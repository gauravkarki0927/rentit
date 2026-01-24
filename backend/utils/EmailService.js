/**
 * Email Notification Service
 * Handles all email communications in the system
 * Currently using console logging for development
 * Can be integrated with real email services like Gmail, SendGrid, Nodemailer, etc.
 */

class EmailService {
  /**
   * Send welcome email to new user
   */
  static async sendWelcomeEmail(user) {
    const emailContent = {
      to: user.email,
      subject: "Welcome to RENTIT - Room Rental Platform",
      message: `
        Hello ${user.name},
        
        Welcome to RENTIT! Your account has been successfully created.
        
        Account Details:
        - Email: ${user.email}
        - User Type: ${user.userType}
        - Account Status: Active
        
        You can now:
        1. Browse rental listings
        2. Create your own listings (if owner)
        3. Apply to properties
        4. Make payments and manage bookings
        
        For support, contact us at support@rentit.com
        
        Best regards,
        RENTIT Team
      `,
    };

    return this._logEmail(emailContent);
  }

  /**
   * Send email verification link
   */
  static async sendVerificationEmail(user, token) {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const emailContent = {
      to: user.email,
      subject: "Verify Your RENTIT Email Address",
      message: `
        Hello ${user.name},
        
        Please verify your email address by clicking the link below:
        ${verificationLink}
        
        This link will expire in 24 hours.
        
        If you did not create this account, please ignore this email.
        
        Best regards,
        RENTIT Team
      `,
    };

    return this._logEmail(emailContent);
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(user, resetToken) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const emailContent = {
      to: user.email,
      subject: "RENTIT - Password Reset Request",
      message: `
        Hello ${user.name},
        
        We received a request to reset your password. Click the link below to proceed:
        ${resetLink}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email and your password will remain unchanged.
        
        Best regards,
        RENTIT Team
      `,
    };

    return this._logEmail(emailContent);
  }

  /**
   * Send password changed confirmation
   */
  static async sendPasswordChangedEmail(user) {
    const emailContent = {
      to: user.email,
      subject: "RENTIT - Password Changed Successfully",
      message: `
        Hello ${user.name},
        
        Your password has been changed successfully.
        
        If you didn't make this change, please reset your password immediately at:
        ${process.env.FRONTEND_URL}/forgot-password
        
        Best regards,
        RENTIT Team
      `,
    };

    return this._logEmail(emailContent);
  }

  /**
   * Send listing approval notification
   */
  static async sendListingApprovedEmail(user, post) {
    const emailContent = {
      to: user.email,
      subject: "RENTIT - Your Listing Has Been Approved!",
      message: `
        Hello ${user.name},
        
        Great news! Your listing "${post.name}" has been approved and is now live on RENTIT.
        
        Listing Details:
        - Title: ${post.name}
        - Location: ${post.location?.city || 'N/A'}
        - Price: Rs. ${post.price}/month
        - Status: APPROVED
        
        View your listing: ${process.env.FRONTEND_URL}/listings/${post._id}
        
        You can now receive applications from interested renters.
        
        Best regards,
        RENTIT Team
      `,
    };

    return this._logEmail(emailContent);
  }

  /**
   * Send listing rejection notification
   */
  static async sendListingRejectedEmail(user, post, reason) {
    const emailContent = {
      to: user.email,
      subject: "RENTIT - Your Listing Requires Changes",
      message: `
        Hello ${user.name},
        
        Your listing "${post.name}" requires some changes before it can be approved.
        
        Reason: ${reason || 'The listing does not meet our guidelines.'}
        
        Please review your listing and make necessary changes. You can resubmit after editing.
        
        View and edit your listing: ${process.env.FRONTEND_URL}/edit-listing/${post._id}
        
        If you have any questions, please contact us at support@rentit.com
        
        Best regards,
        RENTIT Team
      `,
    };

    return this._logEmail(emailContent);
  }

  /**
   * Send application received notification to owner
   */
  static async sendApplicationReceivedEmail(owner, applicant, post) {
    const emailContent = {
      to: owner.email,
      subject: `RENTIT - New Application for ${post.name}`,
      message: `
        Hello ${owner.name},
        
        You have received a new application for your listing "${post.name}".
        
        Applicant Details:
        - Name: ${applicant.userName}
        - Email: ${applicant.userEmail}
        - Phone: ${applicant.userPhone}
        - Duration: ${applicant.duration}
        - Number of People: ${applicant.people}
        
        Review application: ${process.env.FRONTEND_URL}/dashboard/applications
        
        Please respond to the applicant within 48 hours.
        
        Best regards,
        RENTIT Team
      `,
    };

    return this._logEmail(emailContent);
  }

  /**
   * Send payment confirmation email
   */
  static async sendPaymentConfirmationEmail(user, payment) {
    const emailContent = {
      to: user.email,
      subject: "RENTIT - Payment Confirmation",
      message: `
        Hello ${user.name},
        
        Your payment has been processed successfully.
        
        Payment Details:
        - Amount: Rs. ${payment.amount}
        - Purpose: ${payment.purpose}
        - Transaction ID: ${payment.transactionId}
        - Date: ${new Date(payment.createdAt).toLocaleString()}
        - Status: ${payment.status.toUpperCase()}
        
        View payment history: ${process.env.FRONTEND_URL}/dashboard/payments
        
        Thank you for using RENTIT!
        
        Best regards,
        RENTIT Team
      `,
    };

    return this._logEmail(emailContent);
  }

    /**
   * Send contact form email to admin
   */
    static async sendContactEmailToAdmin(email, name, subject, message) {
    const emailContent = {
      to: email,
      subject: `RENTIT - Re: ${subject}`,
      message: `
        Hello ${name},
        
        Thank you for contacting RENTIT. We have received your message and will respond within 24 hours.
        
        Your Message:
        ${message}
        
        Reference ID: ${this._generateRefId()}
        
        If your matter is urgent, please call us at +977-1-XXXX-XXXX
        
        Best regards,
        RENTIT Support Team
      `,
    };

    return this._logEmail(emailContent);
  }

  /**
   * Send contact form response email
   */
  static async sendContactResponseEmail(email, name, subject, message) {
    const emailContent = {
      to: email,
      subject: `RENTIT - Re: ${subject}`,
      message: `
        Hello ${name},
        
        Thank you for contacting RENTIT. We have received your message and will respond within 24 hours.
        
        Your Message:
        ${message}
        
        Reference ID: ${this._generateRefId()}
        
        If your matter is urgent, please call us at +977-1-XXXX-XXXX
        
        Best regards,
        RENTIT Support Team
      `,
    };

    return this._logEmail(emailContent);
  }

  /**
   * Send review notification email
   */
  static async sendReviewNotificationEmail(owner, reviewer, post, review) {
    const emailContent = {
      to: owner.email,
      subject: `RENTIT - New Review for ${post.name}`,
      message: `
        Hello ${owner.name},
        
        ${reviewer.name} has left a review for your listing "${post.name}".
        
        Review Details:
        - Rating: ${review.rating}/5 Stars
        - Comment: ${review.comment || 'No comment provided'}
        - Date: ${new Date(review.createdAt).toLocaleString()}
        
        View review: ${process.env.FRONTEND_URL}/listings/${post._id}#reviews
        
        Best regards,
        RENTIT Team
      `,
    };

    return this._logEmail(emailContent);
  }

  /**
   * Internal method to log emails (development)
   * In production, replace this with actual email sending logic
   * @private
   */
  static _logEmail(emailContent) {
    console.log("\n" + "=".repeat(60));
    console.log("📧 EMAIL NOTIFICATION");
    console.log("=".repeat(60));
    console.log(`To: ${emailContent.to}`);
    console.log(`Subject: ${emailContent.subject}`);
    console.log("\nMessage:");
    console.log(emailContent.message);
    console.log("=".repeat(60) + "\n");

    return {
      success: true,
      message: "Email logged successfully (development mode)",
      emailContent,
    };
  }

  /**
   * Generate unique reference ID for tracking
   * @private
   */
  static _generateRefId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `REF-${timestamp}-${random}`;
  }
}

export default EmailService;
