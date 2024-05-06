import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { uploadCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { View } from "../models/view.model.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description, isPublished, duration } = req.body;
    if ([title, description, duration].some((field) => field?.trim() === "")) {
        throw new apiError(400, "Field cannot be empty");
    }
    const videoLocalPath = req.files?.video[0]?.path;
    if (!videoLocalPath) {
        throw new apiError(400, "video is missing");
    }
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if (!thumbnailLocalPath) {
        throw new apiError(400, "thumbnail is missing");
    }

    const video = await uploadCloudinary(videoLocalPath);
    if (!video) {
        throw new apiError(400, "error uploading video");
    }
    const thumbnail = await uploadCloudinary(thumbnailLocalPath);
    if (!thumbnail) {
        throw new apiError(400, "error uploading thumbnail");
    }

    const savedvideo = await Video.create({
        title,
        description,
        duration,
        videoFile: { url: video.url, public_id: video.public_id },
        thumbnail: { url: thumbnail.url, public_id: thumbnail.public_id },
        isPublished: isPublished ? true : false,
        owner: req.user._id,
    });

    res.status(200).json(new apiResponse(200, savedvideo, "video uploaded successfully"));
});

const toggleVideoPublish = asyncHandler(async (req, res) => {
    const { _id } = req.params;
    const video = await Video.findById(_id);

    if (!video) {
        throw new apiError(404, "Video not found");
    }

    // Toggle the isPublished status
    const newIsPublished = !video.isPublished;
    const updatedVideo = await Video.findByIdAndUpdate(
        _id,
        {
            $set: { isPublished: newIsPublished },
        },
        {
            new: true,
        }
    );
    res.status(200).json(
        new apiResponse(200, { updatedVideo }, `video ${newIsPublished ? "published" : "unPublished"} successfully`)
    );
});
const deleteVideo = asyncHandler(async (req, res) => {
    const { _id } = req.params;
    const video = await Video.findByIdAndDelete(_id);
    if (!video) {
        throw new apiError(404, "Video not found");
    }
    await deleteFromCloudinary(video.videoFile.public_id, "video");
    await deleteFromCloudinary(video.thumbnail.public_id, "image");
    res.status(200).json(new apiResponse(200, {}, "video deleted successfully"));
});

const getVideo = asyncHandler(async (req, res) => {
    const { _id } = req.params;
    if (!_id) {
        throw new apiError(400, " Video Id is missing");
    }
    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(_id),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers",
                        },
                    },
                    {
                        $addFields: {
                            subscribers: { $size: "$subscribers" },
                        },
                    },
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            "avatar.url": 1,
                            subscribers: 1,
                        },
                    },
                ],
            },
        },

        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            },
        },
        {
            $addFields: {
                likes: {
                    $size: "$likes",
                },
                owner: {
                    $first: "$owner",
                },
            },
        },
    ]);
    if (!video) {
        throw new apiError(400, " Video not found");
    }
    res.status(200).json(new apiResponse(200, video[0], "video details fetched successfully"));
});

const getAllVideos = asyncHandler(async (req, res) => {
    const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 20,
        sort: req.query.sort ? { createdAt: parseInt(req.query.sort) } : { createdAt: -1 },
    };
    const pipeline = Video.aggregate([
        {
            $match: {
                isPublished: true,
            },
        },
    ]);
    const videos = await Video.aggregatePaginate(pipeline, options);
    if (!videos) {
        throw new apiError(500, "Error fetching videos");
    }
    res.status(200).json(new apiResponse(200, videos, "Videos fetched successfully"));
});

const getSubscriptionVideos = asyncHandler(async (req, res) => {
    const _id = req.user._id;
    const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 20,
        sort: req.query.sort ? { createdAt: parseInt(req.query.sort) } : { createdAt: -1 },
    };
    const pipeline = Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(_id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "channel",
                foreignField: "owner",
                as: "subscriptionVideos",
            },
        },
        {
            $unwind: "$subscriptionVideos",
        },
        {
            $match: {
                "subscriptionVideos.isPublished": true,
            },
        },
        {
            $replaceRoot: { newRoot: "$subscriptionVideos" },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            "avatar.url": 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
            },
        },
        {
            $project: {
                "videoFile.url": 1,
                "thumbnail.url": 1,
                title: 1,
                duration: 1,
                views: 1,
                owner: 1,
                createdAt: 1,
            },
        },
    ]);
   
    const videos = await Subscription.aggregatePaginate(pipeline, options);
    if (!videos) {
        throw new apiError(500, "Error fetching videos");
    }
    res.status(200).json(new apiResponse(200, videos, "subscription Videos fetched successfully"));
});

const addVideoView = asyncHandler(async (req, res) => {
    const { user_id, video_id } = req.body;
    if (!video_id) {
        throw new apiError(400, "Video Id is required");
    }
    const video = await Video.findById(video_id);
    if (!video) {
        throw new apiError(400, "invalid Video Id is required");
    }
    if (user_id) {
        const user = await User.findById(user_id);
        if (!user.watchHistory.includes(video_id)) {
            user.watchHistory.push(video_id);
            await user.save();
        }
    }
    video.views += 1;
    await video.save();
    const viewBy = user_id ? user_id : null;
    const view = await View.create({
        viewBy,
        video: video._id,
    });

    if (view) {
        res.status(200).json(new apiResponse(200, {}, "view successfully added"));
    }
});
export { uploadVideo, toggleVideoPublish, deleteVideo, getAllVideos, getSubscriptionVideos, addVideoView, getVideo };
