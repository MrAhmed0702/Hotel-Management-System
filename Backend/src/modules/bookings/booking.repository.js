import Booking from "./booking.model.js";
import Room from "../rooms/room.model.js";
import Hotel from "../hotels/hotel.model.js";

export const hotelExists = async (hotelId, session) => {
  return Boolean(await Hotel.exists({ _id: hotelId, isDeleted: false }).session(session));
};

export const roomExists = async (hotelId, roomType, session) => {
  return await Room.findOne({
    hotelId,
    type: roomType,
    isDeleted: false,
  }).select("price capacity").session(session);
};

export const countOverlappingBookings = async (
  hotelId,
  roomType,
  checkIn,
  checkOut,
  session,
) => {
  const result = await Booking.aggregate([
    {
      $match: {
        hotelId,
        roomType,
        isDeleted: false,
        status: { $in: ["confirmed", "pending"] },
        expiresAt: { $gt: new Date() },
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn },
      },
    },
    {
      $project: {
        quantity: 1,
      },
    },
    {
      $group: {
        _id: null,
        totalBooked: { $sum: "$quantity" },
      },
    },
  ]).session(session);

  return result.length > 0 ? result[0].totalBooked : 0;
};

export const countRoomsByType = async (hotelId, roomType, session) => {
  return await Room.countDocuments({
    hotelId,
    type: roomType,
    isDeleted: false,
  }).session(session);
};

export const createBooking = async (bookingData, session) => {
  const booking = await Booking.create([bookingData], { session });
  return booking[0];
};
