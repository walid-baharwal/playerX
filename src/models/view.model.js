import mongoose, { Schema } from "mongoose";

const viewSchema = new Schema(
    {
        viewBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true,
        },
    },
    { timestamps: true }
);

export const View = mongoose.model("View", viewSchema);
