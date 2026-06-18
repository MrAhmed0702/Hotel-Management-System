import { ApiError } from "../utils/apiError.js";

export const validateOwnerBookingAccess = async (req, res, next) => {
  try {
    const booking = req.targetBooking;
    const owner = req.user.id.toString();

    if (booking.hotelId.owner.toString() !== owner) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }

    next();

  } catch (error) {
    next(error);
  }
};