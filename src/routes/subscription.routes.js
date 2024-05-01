import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { channelSubscription, unsubscribeChannel } from "../controllers/subscription.controller.js";
import { validateUsername } from "../middlewares/validation.midlleware.js";
const router = Router();

//
router.route("/subscribe/:username").post(validateUsername,verifyJWT, channelSubscription);
router.route("/unsubscribe/:username").delete(validateUsername,verifyJWT, unsubscribeChannel);

export default router;
