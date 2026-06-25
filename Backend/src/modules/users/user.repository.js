import User from "./user.model.js";
import Booking from "../bookings/booking.model.js"

export const findUserById = (id) => User.findById(id);

export const updateUser = (user) => user.save();

export const softDeleteUser = (user) => {
  user.isDeleted = true;
  user.deletedAt = new Date();
  return user.save();
};

export const restoreUser = (user) => {
  user.isDeleted = false;
  user.deletedAt = null;
  return user.save();
};

export const findBookingsByUser = async (userId, page, limit) => {

  const skip = (page - 1) * limit;

  const [totalCount, bookings] = await Promise.all([
    Booking.countDocuments({ userId, isDeleted: false }),
    Booking.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "hotelId",
        select: "hotelName images address"
      })
      .lean(),
  ]);

  return { bookings, totalCount };
};