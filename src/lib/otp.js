import { prisma } from "./prisma";

/**
 * Generate a 6-digit OTP
 */
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create OTP for email verification
 */
export async function createOTP(email) {
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.otpVerification.upsert({
      where: { email },
      update: {
        otp,
        expiresAt,
        attempts: 0,
      },
      create: {
        email,
        otp,
        expiresAt,
        attempts: 0,
      },
    });

    return { otp, expiresAt };
  } catch (error) {
    console.error("OTP Creation Error:", error);
    throw new Error("Failed to create OTP");
  }
}

/**
 * Verify OTP
 */
export async function verifyOTP(email, otp) {
  try {
    const otpRecord = await prisma.otpVerification.findUnique({
      where: { email },
    });

    if (!otpRecord) {
      return { valid: false, error: "OTP not found" };
    }

    if (new Date() > otpRecord.expiresAt) {
      return { valid: false, error: "OTP has expired" };
    }

    if (otpRecord.attempts >= 5) {
      return { valid: false, error: "Maximum attempts exceeded" };
    }

    if (otpRecord.otp !== otp) {
      await prisma.otpVerification.update({
        where: { email },
        data: { attempts: { increment: 1 } },
      });
      return { valid: false, error: "Invalid OTP" };
    }

    await prisma.otpVerification.delete({ where: { email } });
    return { valid: true };
  } catch (error) {
    console.error("OTP Verification Error:", error);
    throw new Error("Failed to verify OTP");
  }
}

/**
 * Delete expired OTPs
 */
export async function cleanupExpiredOTPs() {
  try {
    await prisma.otpVerification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error("OTP Cleanup Error:", error);
  }
}
