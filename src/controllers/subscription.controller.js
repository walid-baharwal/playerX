import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";

const channelSubscription = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const channelOwner = await User.findOne({ username });
    if (!channelOwner) {
        throw new apiError(400, "Channel not found");
    }
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelOwner._id,
    });

    if (existingSubscription) {
        throw new apiError(400, "Already subscribed");
    }
     await Subscription.create({
        subscriber: req.user._id,
        channel: channelOwner._id,
    });

    res.status(200).json(new apiResponse(200, {}, "Channel subscribed successfully"));
});

const unsubscribeChannel = asyncHandler(async (req, res) => {
    
    const {username} = req.params;
    const channelOwner = await User.findOne({ username });
    if (!channelOwner) {
        throw new apiError(400, "Channel not found");
    }
   
  const result =   await Subscription.deleteOne({
        subscriber: req.user._id,
        channel: channelOwner._id,
    })

  if(result.deletedCount === 0){
    throw new apiError(400,"subscription not found")
  }

    res.status(200).json(new apiResponse(200, {}," unsubscribe successfully"))
})

export { channelSubscription, unsubscribeChannel };
