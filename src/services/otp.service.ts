import { prisma } from "..";
import { Resend } from "resend";
import { Headers } from "node-fetch";

// Polyfill Headers for Node.js < 18
if (!global.Headers) {
  (global as any).Headers = Headers;
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPEmail = async (email: string) => {
  try {
    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save OTP to database
    await prisma.emailOTP.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    // Send OTP email
    const { data, error } = await resend.emails.send({
      from: "Service Tracker <noreply@significanthobbies.com>",
      to: email,
      subject: "Your Service Tracker Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Welcome to Service Tracker!</h1>
          <p>Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${otp}
          </div>
          <p style="color: #666; margin-top: 20px;">
            This code will expire in 10 minutes. Please enter it to verify your email address.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Error sending OTP email:", error);
      throw new Error("Failed to send OTP email");
    }

    return true;
  } catch (error) {
    console.error("Error in sendOTPEmail:", error);
    throw error;
  }
};

export const verifyOTP = async (email: string, otp: string) => {
  try {
    // Find valid OTP
    const validOTP = await prisma.emailOTP.findFirst({
      where: {
        email,
        otp,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!validOTP) {
      return false;
    }

    // Delete used OTP
    await prisma.emailOTP.delete({
      where: { id: validOTP.id },
    });

    return true;
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    throw error;
  }
};
