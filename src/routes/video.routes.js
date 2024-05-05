import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, addVideoView, toggleVideoPublish, uploadVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/upload").post(
    upload.fields([
        {
            name: "video",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    verifyJWT,
    uploadVideo
);
router.route("/p/:_id").put(verifyJWT, toggleVideoPublish);
router.route("/d/:_id").delete(verifyJWT, deleteVideo);
router.route("/view").post(addVideoView)


export default router;
