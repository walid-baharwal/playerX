import Queue from "bull";
import { User } from "../models/user.model.js";

const passwordResetQueue = new Queue("passwordResetQueue", {
    redis: {
        host: "127.0.0.1",
        port: 6379,
        maxRetriesPerRequest: 3,
    },
});
passwordResetQueue.process("passwordReset", async (job) => {
    const { userId } = job.data;

    const user = await User.findById(userId);

    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
});

passwordResetQueue.once("ready", () => {
    console.log("Connected to Redis server");
});

passwordResetQueue.on("completed", (job, result) => {
    console.log(`Job ${job.id} completed with result ${result}`);
});

passwordResetQueue.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed with error: ${err}`);
});

passwordResetQueue.on("stalled", (job) => {
    console.warn(`Job ${job.id} stalled and may need attention`);
});

export { passwordResetQueue };
