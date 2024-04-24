import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { LIMIT } from "./constants.js";

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

app.use("/api/v1/users", userRouter);

export { app };
