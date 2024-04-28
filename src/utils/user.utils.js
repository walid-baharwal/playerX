import crypto from "crypto";
import { apiError } from "./apiError.js";
import sharp from "sharp";
import nodemailer from "nodemailer";
import fs from "fs";
import { passwordResetTokenLimit } from "../constants.js";

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
        const token = crypto.randomBytes(25).toString("hex");
        user.passwordReset.token = token;
        user.passwordReset.tokenExpiry = Date.now() + passwordResetTokenLimit;
        await user.save({ validateBeforeSave: false });
        return token;
    } catch (error) {
        throw new apiError(500, "Something went wrong while generating password reset token " + error.message);
    }
};

// Function to send a password reset email
const sendPasswordResetEmail = async (email, passwordResetToken) => {
    try {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE_PROVIDER,
            host: process.env.EMAIL_HOST,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: "playerX  <your-email@example.com>",
            to: email,
            subject: "Password Reset",
            html: `<p style="color: blue;">You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
            <p>Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:</p>
            <a href="http://your-app-url.com/reset/${passwordResetToken}" style="color: red;">Reset Password</a>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
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
    if (
        metadata.format !== "png" &&
        metadata.format !== "gif" &&
        metadata.format !== "jpeg" &&
        metadata.format !== "jpg"
    ) {
        /* unlinking here beacuse if someone upload  a image that does not match the format or requirement an
         error is thrown but the file still remain in public folder beacuse multer already save 
         the file in public folder by doing this if an error occured unnessory file will be unlinked*/
        fs.unlinkSync(filePath);
        throw new Error("Invalid file type, only PNG jpeg jpg or GIF (no animations) is allowed!");
    }

    // Check dimensions
    if (metadata.width < minWidth || metadata.height < minHeight) {
        fs.unlinkSync(filePath);
        throw new apiError(400, `Image dimensions must be at least ${minWidth} x ${minHeight} pixels.`);
    }

    const fileSizeMB = metadata.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
        fs.unlinkSync(filePath);
        throw new apiError(400, `File size must be less than ${maxSizeMB}MB.`);
    }
};
export { generateAccessAndRefreshTokens, generatePasswordResetToken, sendPasswordResetEmail, validateImage };
