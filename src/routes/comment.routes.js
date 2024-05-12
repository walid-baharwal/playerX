import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoComment, addTweetComment, deleteComment } from "../controllers/comment.controller.js";

const router = Router();

router.route("/vc").post(verifyJWT, addVideoComment);
router.route("/tc").post(verifyJWT, addTweetComment);
router.route("/delete/:_id").post(verifyJWT, deleteComment);

export default router;
