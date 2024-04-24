import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { apiError } from "../utils/apiError.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new apiError(401, "unauthorized request");
        }

        const decodedToken = jwt.verify(
            "accessToken",
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new apiError(401, "Invalid access token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new apiError(401, error?.message || "Invalid access token");
    }
});