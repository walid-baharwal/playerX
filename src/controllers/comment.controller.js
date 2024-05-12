import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";

const addVideoComment = asyncHandler(async (req, res) => {
    const { content, videoId, userId } = req.body;
    if (!content || !videoId) {
        throw new apiError(400, "Fiels can't be empty");
    }
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: userId,
    });

    if (!comment) {
        throw new apiError(400, "Something went wrong while adding video comment");
    }
    res.status(200).json(new apiResponse(200, comment, "Comment added successfully"));
});
const addTweetComment = asyncHandler(async (req, res) => {
    const { content, tweetId, userId } = req.body;
    if (!content || !tweetId) {
        throw new apiError(400, "Fiels can't be empty");
    }
    const tweet = await Comment.create({
        content,
        tweet: tweetId,
        owner: userId,
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

export { addVideoComment, addTweetComment, deleteComment };
