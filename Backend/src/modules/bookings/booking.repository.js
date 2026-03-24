import Booking from "./booking.model.js";
import Room from "../rooms/room.model.js";
import Hotel from "../hotels/hotel.model.js";

const now = new Date();

export const hotelExists = async (hotelId, session) => {
  return Boolean(
    await Hotel.exists({ _id: hotelId, isDeleted: false }).session(session),
  );
};

export const roomExists = async (hotelId, roomType, session) => {
  return await Room.findOne({
    hotelId,
    type: roomType,
    isDeleted: false,
  })
    .select("price capacity")
    .session(session)
    .lean();
};

export const countOverlappingBookings = async (
  hotelId,
  roomType,
  checkIn,
  checkOut,
  now,
  session,
) => {
  const result = await Booking.aggregate([
    {
      $match: {
        hotelId,
        roomType,
        isDeleted: false,
        status: { $in: ["confirmed", "pending"] },
        expiresAt: { $gt: now },
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

export const getBookings = async (userId, page = 1, limit = 10) => {
  const [data, total] = await Promise.all([
    Booking.find({
      userId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean(),

    Booking.countDocuments({
      userId,
      isDeleted: false,
    }),
  ]);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getBookingById = async (userId, bookingId) => {
  return await Booking.findOne({
    _id: bookingId,
    userId,
    isDeleted: false,
  }).lean();
};

export const cancelBooking = async (bookingId, userId) => {

  return await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      userId,
      status: { $in: ["pending", "confirmed"] },
      paymentStatus: "none",
      expiresAt: { $gt: now },
      isDeleted: false,
    },
    {
      status: "cancelled",
    },
    {
      new: true,
      runValidators: true,
    },
  ).lean();
};

export const markPaymentInitiated = async (bookingId, userId, session) => {
  return await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      userId,
      status: "pending",
      paymentStatus: "none",
      expiresAt: { $gt: now },
    },
    {
      paymentStatus: "initiated",
    },
    {
      new: true,
      session,
    }
  ).lean();
};

export const lockBookingForPayment = async (bookingId, userId, session) => {
  return await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      userId,
      status: "pending",
      paymentStatus: { $in: ["none", "initiated"] },
      expiresAt: { $gt: now },
    },
    {
      paymentStatus: "initiated",
    },
    {
      new: true,
      session,
    }
  ).lean();
};

export const getBookingById2 = async (userId, bookingId, session) => {
  return await Booking.findOne({
    _id: bookingId,
    userId,
    isDeleted: false,
  }).session(session).lean();
};

export const updateBooking = async (bookingId, userId, session) => {
  return await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      userId,
      status: "pending",
      paymentStatus: "initiated",
      expiresAt: { $gt: now },
    },
    {
      status: "confirmed",
      paymentStatus: "paid"
    },
    {
      new: true,
      session,
      runValidators: true
    }
  ).lean();
}