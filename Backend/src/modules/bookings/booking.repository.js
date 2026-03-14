import Booking from "./booking.model.js";
import Room from "../rooms/room.model.js";
import Hotel from "../hotels/hotel.model.js";

export const hotelExists = async (hotelId, session) => {
  return Hotel.exists({ _id: hotelId }).session(session);
};

export const roomExists = async (hotelId, roomType) => {
    return await Room.exists({
        hotelId,
        type: roomType,
        status: "available"
    }).select("price capacity").session(session);
};

export const countRoomsByType = async (hotelId, roomType) => {
    return await Room.countDocuments({
        hotelId,
        type: roomType
    }).session(session);
};

export const countOverlappingBookings = async (hotelId, roomType, checkIn, checkOut) => {
    const result = await Booking.aggregate([
        {
            $match: {
                hotelId,
                roomType,
                status: { $in: ["confirmed", "pending"] },
                expiresAt: { $gt: new Date() },
                checkIn: { $lt: checkOut },
                checkOut: { $gt: checkIn }
            }
        },
        {
            $group: {
                _id: null,
                totalBooked: { $sum: "$quantity" }
            }
        }
    ]).session(session);

    return result.length > 0 ? result[0].totalBooked : 0;
}

export const createBooking = async (bookingData, session) => {
  const booking = await Booking.create([bookingData], { session });
  return booking[0];
};