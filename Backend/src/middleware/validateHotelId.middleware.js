import { Types } from "mongoose"
import { ApiError } from "../utils/apiError"
import Hotel from "../modules/hotels/hotel.model.js"

export const validateHotelId = async (req, res, next, hotelId) => {
    try {
        if (!Types.ObjectId.isValid(hotelId)) {
            throw new ApiError(400, "Invalid Hotel ID")
        }

        const hotel = await Hotel.findById(hotelId);

        if (!hotel) {
            throw new ApiError(404, "Hotel Not Found")
        }

        req.targetHotel = hotel;

        next();
    } catch (error) {
        next(error)
    }
}