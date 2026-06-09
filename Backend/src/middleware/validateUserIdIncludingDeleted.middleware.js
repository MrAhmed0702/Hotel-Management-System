import { Types } from "mongoose";
import User from "../modules/users/user.model.js";
import { ApiError } from "../utils/apiError.js";

export const validateUserIdIncludingDeleted = async (req, res, next, userId) => {
  try {
    if (!Types.ObjectId.isValid(userId)) {
      return next(new ApiError(400, "Invalid user ID"));
    }

    const user = await User.findById(userId).setOptions({ includeDeleted: true });

    if (!user) {
      return next(new ApiError(404, "User not found"));
    }

    req.targetUserIncludingDeleted = user;

    next();
  } catch (error) {
    next(error);
  }
};