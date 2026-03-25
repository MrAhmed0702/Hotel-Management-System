import Booking from "./booking.model.js";
import Room from "../rooms/room.model.js";
import Hotel from "../hotels/hotel.model.js";

const GRACE_MS = 2 * 60 * 1000;

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
      $group: {
        _id: null,
        totalBooked: { $sum: "$quantity" },
      },
    },
  ]).session(session);

  return result.length ? result[0].totalBooked : 0;
};

export const countRoomsByType = async (hotelId, roomType, session) => {
  return Room.countDocuments({
    hotelId,
    type: roomType,
    isDeleted: false,
  }).session(session);
};

export const createBooking = async (data, session) => {
  const [booking] = await Booking.create([data], { session });
  return booking;
};

export const getBookings = async (userId, page, limit) => {
  const [data, total] = await Promise.all([
    Booking.find({ userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Booking.countDocuments({ userId, isDeleted: false }),
  ]);

  return { data, total, page, limit };
};

export const getBookingById = async (userId, bookingId, session = null) => {
  const query = Booking.findOne({
    _id: bookingId,
    userId,
    isDeleted: false,
  });

  if (session) query.session(session);

  return query.lean();
};

export const cancelBooking = async (bookingId, userId) => {
  return Booking.findOneAndUpdate(
    {
      _id: bookingId,
      userId,
      status: { $in: ["pending", "confirmed"] },
      paymentStatus: { $in: ["none"] },
    },
    { status: "cancelled" },
    { new: true },
  ).lean();
};

export const lockBookingForPayment = async (bookingId, userId, session) => {
  const now = new Date();

  return Booking.findOneAndUpdate(
    {
      _id: bookingId,
      userId,
      status: "pending",
      paymentStatus: { $in: ["none", "initiated"] },
      expiresAt: { $gt: new Date(now.getTime() - GRACE_MS) },
    },
    { paymentStatus: "initiated" },
    { new: true, session },
  ).lean();
};

export const updateBooking = async (bookingId, userId, session, paymentId) => {
  const now = new Date();

  return Booking.findOneAndUpdate(
    {
      _id: bookingId,
      userId,
      status: "pending",
      paymentStatus: "initiated",
      expiresAt: { $gt: new Date(now.getTime() - GRACE_MS) },
    },
    {
      status: "confirmed",
      paymentStatus: "paid",
      paymentId,
    },
    { new: true, session },
  ).lean();
};

export const updateFailedBooking = async (bookingId, userId, session) => {
  const now = new Date();

  return Booking.findOneAndUpdate(
    {
      _id: bookingId,
      userId,
      status: "pending",
      paymentStatus: "initiated",
      expiresAt: { $gt: new Date(now.getTime() - GRACE_MS) },
    },
    {
      status: "cancelled",
      paymentStatus: "failed",
    },
    { new: true, session },
  ).lean();
};
