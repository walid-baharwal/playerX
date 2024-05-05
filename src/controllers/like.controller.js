import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";

const toggleVideolike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new apiError(400, "videoId is required");
    }
    const existingLike = await Like.findOneAndDelete({
        video: videoId,
        likeBy: req.user._id,
    });

    if (existingLike) {
        res.status(200).json(new apiResponse(200, {}, "Video Like removed Successfully"));
    } else {
        await Like.create({
            video: videoId,
            likeBy: req.user._id,
        });

        res.status(200).json(new apiResponse(200, {}, "Video Liked Successfully"));
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!commentId) {
        throw new apiError(400, "commentId is required");
    }
    const existingLike = await Like.findOneAndDelete({
        comment: commentId,
        likeBy: req.user._id,
    });
    if (existingLike) {
        res.status(200).json(new apiResponse(200, {}, "comment Like removed Successfully"));
    } else {
        await Like.create({
            comment: commentId,
            likeBy: req.user._id,
        });

        res.status(200).json(new apiResponse(200, {}, "comment Liked Successfully"));
    }
});
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!tweetId) {
        throw new apiError(400, "tweetId is required");
    }
    const existingLike = await Like.findOneAndDelete({
        tweet: tweetId,
        likeBy: req.user._id,
    });
    if (existingLike) {
        res.status(200).json(new apiResponse(200, {}, "tweet Like removed Successfully"));
    } else {
        await Like.create({
            tweet: tweetId,
            likeBy: req.user._id,
        });

        res.status(200).json(new apiResponse(200, {}, "tweet Liked Successfully"));
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likeBy: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                pipeline: [
                    {
                        $project: {
                            thumbnail: 1,
                            title: 1,
                            duration: 1,
                            views: 1,
                            createdAt: 1,
                            owner: 1,
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
                                    $project: {
                                        fullName: 1,
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
                ],
            },
        },
        {
            $addFields: {
                likedVideo: {
                    $first: "$likedVideo",
                },
            },
        },
        {
            $project: {
                likedVideo: 1,
            },
        },
    ]);

    res.status(200).json(new apiResponse(200, likedVideos, " liked videos fetched successfully"));
});

export { toggleVideolike, toggleCommentLike, toggleTweetLike, getLikedVideos };
