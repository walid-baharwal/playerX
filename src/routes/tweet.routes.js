import { Router } from "express";
import { createTweet, updateTweet, deleteTweet } from "../controllers/tweet.controller.js";
import { validateContent } from "../middlewares/validation.midlleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/create").post(verifyJWT, validateContent, createTweet);
router.route("/update").put(verifyJWT, validateContent, updateTweet);
router.route("/delete/:_id").delete(verifyJWT, deleteTweet);

export default router;
