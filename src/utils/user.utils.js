import crypto from "crypto";
import { apiError } from "./apiError.js";
import sharp from "sharp";
// Function to validate request and return errors if any
const validateRequest = (req) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new apiError(400, "", errors.array());
    }
};
const generateAccessAndRefreshTokens = async (user) => {
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new apiError(500, "Something went wrong while generating access and refresh tokens " + error.message);
    }
};

const generatePasswordResetToken = async (user) => {
    try {
        const resetToken = crypto.randomBytes(20).toString("hex");
        user.passwordResetToken = resetToken;
        user.passwordResetTokenExpiry = Date.now() + 3600000;
        await user.save({ validateBeforeSave: false });
        return passwordResetToken;
    } catch (error) {
        throw new apiError(500, "Something went wrong while generating password reset token " + error.message);
    }
};

// Function to send a password reset email
const sendPasswordResetEmail = async (email, passwordResetToken) => {
    try {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE_PROVIDER,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            to: email,
            from: "your-email@example.com",
            subject: "Password Reset",
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\nhttp://your-app-url.com/reset/${passwordResetToken}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };
        try {
            const info = await transporter.sendMail(mailOptions);
            // Check if the email was accepted by the SMTP server
            return info.accepted.length > 0;
        } catch (error) {
            console.error("Error sending email:", error);
            return false; // Indicate failure
        }
    } catch (error) {
        throw new apiError(500, "Something went wrong while sending reset link " + error.message);
    }
};
const validateImage = async (filePath, minWidth, minHeight, maxSizeMB) => {
    const metadata = await sharp(filePath).metadata();
    if (metadata.format !== 'png'  && metadata.format !== 'gif' && metadata.format !== 'jpeg' && metadata.format !== 'jpg') {
        throw new Error('Invalid file type, only PNG jpeg jpg or GIF (no animations) is allowed!');
    }

    // Check dimensions
    if (metadata.width < minWidth || metadata.height < minHeight) {
        throw new apiError(400, `Image dimensions must be at least ${minWidth} x ${minHeight} pixels.`);
    }

    const fileSizeMB = metadata.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
        throw new apiError(400, `File size must be less than ${maxSizeMB}MB.`);
    }
};
export {
    validateRequest,
    generateAccessAndRefreshTokens,
    generatePasswordResetToken,
    sendPasswordResetEmail,
    validateImage,
};
