export const validateHotelId = async (
  req,
  res,
  next
) => {
  try {
    const { hotelId } = req.params;

    if (!Types.ObjectId.isValid(hotelId)) {
      throw new ApiError(
        400,
        "Invalid Hotel ID"
      );
    }

    const hotel = await Hotel.findById(
      hotelId
    );

    if (!hotel) {
      throw new ApiError(
        404,
        "Hotel Not Found"
      );
    }

    req.targetHotel = hotel;

    next();
  } catch (error) {
    next(error);
  }
};