import { Router } from "express";
import {
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
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    validateUserRegistration,
    validateUserLogin,
    validateUserUpdatingDetails,
    validateEmail,
    validateUpdatePassword,
    validateUsername
} from "../middlewares/validation.midlleware.js";

const router = Router();

router.route("/registration").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    validateUserRegistration,
    userRegistration
);

router.route("/login").post(validateUserLogin, loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/access-token").post(updateAccessToken);
router.route("/get-user").get(verifyJWT, getCurrentUser);

//updating routes
router.route("/update-user-details").put(validateUserUpdatingDetails, verifyJWT, updateUserDetails);
router.route("/update-user-password").put(validateUpdatePassword, verifyJWT, updateUserPassword);

router.route("/update-avatar").put(verifyJWT,upload.single("avatar"), updateAvatar);
router.route("/update-coverimage").put(verifyJWT,upload.single("coverImage"), updateCoverImage);

//forget Password
router.route("/forget-password").post(validateEmail, forgetPasswordEmail);
router.route("/reset-password").put(validateUpdatePassword, resetPassword);

router.route("/c/:username").get(validateUsername,verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT,getWatchHistory)

export default router;
