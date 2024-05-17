import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

const addVideoComment = asyncHandler(async (req, res) => {
    const { content, videoId } = req.body;
    if (!content || !videoId) {
        throw new apiError(400, "Fiels can't be empty");
    }
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id,
    });

    if (!comment) {
        throw new apiError(400, "Something went wrong while adding video comment");
    }
    res.status(200).json(new apiResponse(200, comment, "Comment added successfully"));
});
const addTweetComment = asyncHandler(async (req, res) => {
    const { content, tweetId } = req.body;
    if (!content || !tweetId) {
        throw new apiError(400, "Fiels can't be empty");
    }
    const tweet = await Comment.create({
        content,
        tweet: tweetId,
        owner: req.user._id,
    });

    if (!tweet) {
        throw new apiError(400, "Something went wrong while adding tweet comment");
    }
    res.status(200).json(new apiResponse(200, tweet, "Comment added successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { _id } = req.params;

    const comment = await Comment.findByIdAndDelete(_id);
    if (!comment) {
        throw new apiError(404, "comment not found");
    }
    res.status(200).json(new apiResponse(200, {}, "Comment deleted successfully"));
});

const getVideoComments = asyncHandler(async (req, res) => {
    const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 20,
        sort: req.query.sort ? { createdAt: parseInt(req.query.sort) } : { createdAt: -1 },
    };
    const { videoId } = req.body;
    const pipeline = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
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
                            username: 1,
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
    ]);
    const comments = await Comment.aggregatePaginate(pipeline, options);
    if (!comments) {
        throw new apiError(500, "Error fetching Comments");
    }
    res.status(200).json(new apiResponse(200, comments, "Video Comments fetched successfully"));
});
const getTweetComments = asyncHandler(async (req, res) => {
    const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 20,
        sort: req.query.sort ? { createdAt: parseInt(req.query.sort) } : { createdAt: -1 },
    };
    const { tweetId } = req.body;
    const pipeline = Comment.aggregate([
        {
            $match: {
                tweet: new mongoose.Types.ObjectId(tweetId),
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
                            username: 1,
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
    ]);
    const comments = await Comment.aggregatePaginate(pipeline, options);
    if (!comments) {
        throw new apiError(500, "Error fetching Comments");
    }
    res.status(200).json(new apiResponse(200, comments, "Tweets Comments fetched successfully"));
});

export { addVideoComment, addTweetComment, deleteComment, getVideoComments, getTweetComments };
