import mongoose, { Schema } from "mongoose";
import { aggregatePaginate } from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile: {
            url: {
                type: String, //cloudinary upload video url
                required: true,
            },
            public_id: {
                type: String,
                required: true,
            },
        },
        thumbnail: {
            url: {
                type: String, //cloudinary
                required: true,
            },
            public_id: {
                type: String, //cloudinary upload thumbnail public_id
                required: true,
            },
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        duration: {
            type: String,
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

// videoSchema.plugin(aggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
