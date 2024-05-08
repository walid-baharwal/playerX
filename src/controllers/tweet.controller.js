import { Tweet } from "../models/tweet.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    const tweet = await Tweet.create({
        owner: req.user._id,
        content,
    });
    if (!tweet) {
        throw new apiError(404, "Error while creating Tweet");
    }
    res.status(200).json(new apiResponse(200, tweet, "tweet created successfully"));
});
const updateTweet = asyncHandler(async (req, res) => {
    const { content, tweet_id } = req.body;
    const tweet = await Tweet.findByIdAndUpdate(
        tweet_id,
        {
            $set: { content },
        },
        { new: true }
    );
    if (!tweet) {
        throw new apiError(404, "Tweet not found");
    }
    res.status(200).json(new apiResponse(200, tweet, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { _id } = req.params;

    const tweet = await Tweet.findByIdAndDelete(_id);

    if (!tweet) {
        throw new apiError(404, "Tweet not found");
    }
    res.status(200).json(new apiResponse(200, {}, "tweet deleted successfully"));
});

export { createTweet, updateTweet, deleteTweet };
