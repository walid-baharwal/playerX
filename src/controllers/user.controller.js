import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const validateEmail = (email) => {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

const userRegistration = asyncHandler(async (req, res) => {
    const { username, fullName, email, password } = req.body;

    if (
        [username, fullName, email, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new apiError(400, "Field cannot be empty");
    }

    if (!validateEmail(email)) {
        throw new apiError(400, "Invalid email format");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (existingUser) {
        throw new apiError(400, "Email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coverImageLocalPath;
    if (req.files?.coverImage) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar is missing");
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
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    res.status(201).json(
        new apiResponse(200, createdUser, "User successfully registered")
    );
});

const generateAccessAndRefreshTokens = async (user) => {
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new apiError(
            500,
            "Something went wrong while generating access and refresh tokens"
        );
    }
};

//user login
const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new apiError(400, "username or email required");
    }
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

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user);
    const loggedInUser = user.select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
    };

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
    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "user logged out successfully"));
});

export { userRegistration, loginUser, logoutUser };
