import { ApiError } from "../utils/apiError.js";

export const validateHotelOwnership = async (req, res, next) => {
  try {
    const hotel = req.targetHotel;

    if (!hotel) {
      throw new ApiError(
        500,
        "Hotel resource not loaded"
      );
    }

    if (hotel.owner.toString() !== req.user.id) {
      throw new ApiError(
        403,
        "Unauthorized to access this hotel"
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};