import Booking from "../modules/bookings/booking.model.js";
import Payment from "../modules/payments/payment.model.js";
import mongoose from "mongoose";

export const expireBookingsJob = async () => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const now = new Date();

    await Booking.updateMany(
      { status: "pending", expiresAt: { $lt: now } },
      { status: "expired" },
      { session }
    );

    await Payment.updateMany(
      { status: "pending", expiresAt: { $lt: now } },
      { status: "failed", failureReason: "expired" },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};