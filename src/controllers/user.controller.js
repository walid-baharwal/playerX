import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { options } from "../constants.js";
import {
    validateRequest,
    generateAccessAndRefreshTokens,
    generatePasswordResetToken,
    sendPasswordResetEmail,
    validateImage,
} from "../utils/user.utils.js";

const userRegistration = asyncHandler(async (req, res) => {
    validateRequest(req);

    const { username, fullName, email, password } = req.body;

    if ([username, fullName, email, password].some((field) => field?.trim() === "")) {
        throw new apiError(400, "Field cannot be empty");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (existingUser) {
        throw new apiError(400, "Email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar is missing");
    }
    await validateImage(avatarLocalPath, 98, 98, 4);

    let coverImageLocalPath;
    if (req.files?.coverImage) {
        coverImageLocalPath = req.files.coverImage[0].path;
        await validateImage(coverImageLocalPath, 2048, 1152, 6);
    }
    const avatar = await uploadCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new apiError(400, "Avatar is required");
    }
    const coverImage = await uploadCloudinary(coverImageLocalPath);

    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    if (!user) {
        throw new apiError(400, "Something went wrong while registering user");
    }
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    res.status(201).json(new apiResponse(200, createdUser, "User successfully registered"));
});

//user login
const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    validateRequest(req);

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (!user) {
        throw new apiError(404, "User does not exist");
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new apiError(401, "Incorrect credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);
    const loggedInUser = user;
    delete loggedInUser.password;
    delete loggedInUser.refreshToken;

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "user logged in successfully"
            )
        );
});

//user logout
const logoutUser = asyncHandler(async (req, res) => {
    const user = req.user;
    await User.findByIdAndUpdate(
        user._id,
        {
            $set: { refreshToken: undefined },
        },
        {
            new: true,
        }
    );
    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "user logged out successfully"));
});

// updating controllers
const updateAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new apiError(401, "unauthorized request");
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decodedToken) {
        throw new apiError(401, "invalid refresh token");
    }
    const user = await User.findById(decodedToken).select("-password");

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user);

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new apiResponse(200, { accessToken, refreshToken: newRefreshToken }, "accessToken updated successfully"));
});

const updateUserPassword = asyncHandler(async (req, res) => {
    validateRequest(req);
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new apiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(new apiResponse(200, {}, "Password updated successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user;

    res.status(200).json(new apiResponse(200, { user }, "Current user fetched successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar is required");
    }
    await validateImage(avatarLocalPath, 98, 98, 4);
    const avatar = await uploadCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new apiError(400, "Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { avatar: avatar.url },
        },
        {
            new: true,
        }
    ).select("-password");
    res.status(200).json(new apiResponse(200, user, " Avatar updated successfully"));
});
const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new apiError(400, "CoverImage is required");
    }
    await validateImage(coverImageLocalPath, 2048, 1152, 6);

    const coverImage = await uploadCloudinary(coverImageLocalPath);
    if (!coverImage) {
        throw new apiError(400, "Error while uploading avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { coverImage: coverImage.url },
        },
        {
            new: true,
        }
    ).select("-password");
    res.status(200).json(new apiResponse(200, user, " Avatar updated successfully"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
    validateRequest(req);
    const { email, fullName } = req.body;

    let updateFields = {};
    if (fullName) {
        updateFields.fullName = fullName;
    }
    if (email) {
        updateFields.email = email;
    }
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: updateFields,
        },
        { new: true }
    ).select("-password");

    res.status(200).json(new apiResponse(200, user, "User details updated successfully"));
});

const forgetPasswordEmail = asyncHandler(async (req, res) => {
    validateRequest(req);
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new apiError(400, "No account with that email address exists");
    }
    const PasswordResetToken = await generatePasswordResetToken(user);
    const emailSent = await sendPasswordResetEmail(email, PasswordResetToken);
    if (!emailSent) {
        throw new apiError(400, "Error sending reset password email");
    }
    res.status(200).json(new apiResponse(200, {}, "A password reset email has been sent to your email address."));
});

const resetPassword = asyncHandler(async (req, res) => {
    validateRequest(req);
    const { passwordResetToken, newPassword } = req.body;
    if (!passwordResetToken || !newPassword) {
        throw new apiError(400, "Field cannot be empty");
    }
    const user = await User.findOne({
        passwordResetToken,
        passwordResetTokenExpiry: {
            $gt: Date.now(),
        },
    });
    if (!user) {
        throw new apiError(400, "Password reset token is invalid or has expired.");
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;

    await user.save({ validateBeforeSave: true });
    res.status(200).json(new apiResponse(200, {}, "Password has been reset successfully."));
});

export {
    userRegistration,
    loginUser,
    logoutUser,
    updateAccessToken,
    updateUserDetails,
    updateUserPassword,
    updateAvatar,
    updateCoverImage,
    getCurrentUser,
    forgetPasswordEmail,
    resetPassword,
};
