import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(email, otp) {
  try {
    console.log("[Email Service] Sending OTP to:", email);
    
    const emailPromise = resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@atsresume.com",
      to: email,
      subject: "Your ATS Resume OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">✉️ Email Verification</h2>
          <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <p style="font-size: 14px; color: #666; margin: 10px 0;">Your verification code:</p>
            <p style="font-size: 36px; font-weight: bold; color: #007bff; letter-spacing: 5px; margin: 20px 0;">${otp}</p>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
          <p style="color: #999; font-size: 12px;">Do not share this code with anyone.</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">ATS Resume Team</p>
        </div>
      `,
    });

    // Set timeout for email service
    const result = await Promise.race([
      emailPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email service timeout")), 15000)
      ),
    ]);

    console.log("[Email Service] Email sent successfully to:", email);
    return { success: true };
  } catch (error) {
    console.error("[Email Service] Error sending email to:", email, error.message);
    return { success: false, error: error.message };
  }
}

export async function sendResumeDownloadLink(
  email,
  downloadLink,
  resumeTitle
) {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@atsresume.com",
      to: email,
      subject: `Your Resume: ${resumeTitle}`,
      html: `
        <h2>Your Resume is Ready!</h2>
        <p>Your resume "${resumeTitle}" has been generated successfully.</p>
        <p><a href="${downloadLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Download Resume</a></p>
        <p>This link will expire in 7 days.</p>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Email Send Error:", error);
    return { success: false, error: error.message };
  }
}

export async function sendPaymentConfirmation(
  email,
  amount,
  transactionId
) {
  try {
    const amountInRupees = (amount / 100).toFixed(2);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@atsresume.com",
      to: email,
      subject: "Payment Confirmation - ATS Resume",
      html: `
        <h2>Payment Confirmed</h2>
        <p>Thank you for your payment!</p>
        <p><strong>Amount:</strong> ₹${amountInRupees}</p>
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
        <p>Your resume is now ready for download.</p>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Email Send Error:", error);
    return { success: false, error: error.message };
  }
}

export async function sendPasswordResetEmail(
  email,
  resetLink
) {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@atsresume.com",
      to: email,
      subject: "Reset Your Password - ATS Resume",
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Email Send Error:", error);
    return { success: false, error: error.message };
  }
}
