import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleVideolike, toggleCommentLike, toggleTweetLike, getLikedVideos } from "../controllers/like.controller.js";

const router = Router();

router.route("/vl/:videoId").post(verifyJWT, toggleVideolike);
router.route("/cl/:commentId").post(verifyJWT, toggleCommentLike);
router.route("/tl/:tweetId").post(verifyJWT, toggleTweetLike);

router.route("/liked-videos").get(verifyJWT, getLikedVideos);

export default router;
