import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { channelSubscription } from "../controllers/subscription.controller.js";

const router = Router();

//
router.route("/subscribe").post(verifyJWT, channelSubscription);

export default router;
