import { Router } from "express";
import {
    userRegistration,
    loginUser,
    logoutUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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
    userRegistration
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
