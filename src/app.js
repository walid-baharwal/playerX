import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { LIMIT } from "./constants.js";
import { apiError } from "./utils/apiError.js";
import multer from "multer";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json({ limit: LIMIT }));
app.use(express.urlencoded({ extended: true, limit: LIMIT }));
app.use(cookieParser());

// Routes
import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import likeRouter from "./routes/like.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import commentRouter from "./routes/comment.routes.js";

app.use("/api/v1/u", userRouter);
app.use("/api/v1/sub", subscriptionRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/v", videoRouter);
app.use("/api/v1/tweet",tweetRouter);
app.use("/api/v1/comment",commentRouter);

//Error handling for all errors
app.use((err, req, res, next) => {
    if (err instanceof apiError) {
        console.log("Error: " + err.message);

        const { statusCode, message, errors } = err;

        res.status(statusCode).json({
            message,
            errors,
        });
    } else if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        res.status(400).json({ error: "Max Number of File Upload limit exceeded" });
    } else {
        console.error(err);

        res.status(500).json({
            message: "An unexpected error occurred",
        });
    }
});

export { app };
