import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env",
});

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("app listening error", error);
            throw error;
        });
        app.listen(process.env.PORT || 5000, () => {
            console.log(` Server listening on ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.log("MongoDB connection error", error);
    });

  