import { Types } from "mongoose";
import User from "../modules/users/user.model.js";
import { ApiError } from "../utils/apiError.js";

export const validateUserId = async (req, res, next, userId) => {
  try {
    if (!Types.ObjectId.isValid(userId)) {
      return next(new ApiError(400, "Invalid user ID"));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    req.targetUser = user;

    next();
  } catch (error) {
    next(error);
  }
};