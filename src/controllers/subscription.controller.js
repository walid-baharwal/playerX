import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";

const channelSubscription = asyncHandler(async (req, res) => {
    const { channelOwnerUsername } = req.body;

    if (!channelOwnerUsername) {
        throw new apiError(400, "ChannelOwner is required");
    }
    const channelOwnerDetails = await User.findOne({ username: channelOwnerUsername });
    if (!channelOwnerDetails) {
        throw new apiError(400, "Channel not found");
    }
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelOwnerDetails._id,
    });

    if (existingSubscription) {
        throw new apiError(400, "Already subscribed");
    }
    const channelSubscribed = await Subscription.create({
        subscriber: req.user._id,
        channel: channelOwnerDetails._id,
    });

    res.status(200).json(new apiResponse(200, {}, "Channel subscribed successfully"));
});

export { channelSubscription };
