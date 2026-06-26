import Booking from "../modules/bookings/booking.model.js";
import Payment from "../modules/payments/payment.model.js";
import mongoose from "mongoose";
import { BOOKING_STATUS, PAYMENT_STATUS } from "../constants/status.js";

export const expireBookingsJob = async () => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const now = new Date();

    // Find all payments that are pending and expired
    const expiredPayments = await Payment.find({
      status: PAYMENT_STATUS.PENDING,
      expiresAt: { $lt: now },
    }).session(session);

    if (expiredPayments.length > 0) {
      const expiredPaymentIds = expiredPayments.map(p => p._id);
      const expiredBookingIds = expiredPayments.map(p => p.bookingId);

      // Mark payments as FAILED due to timeout
      await Payment.updateMany(
        { _id: { $in: expiredPaymentIds } },
        { status: PAYMENT_STATUS.FAILED, failureReason: "timeout" },
        { session }
      );

      // Reset paymentStatus to "none" for their bookings, IF they are pending and initiated
      await Booking.updateMany(
        {
          _id: { $in: expiredBookingIds },
          status: BOOKING_STATUS.PENDING,
          paymentStatus: "initiated",
        },
        { paymentStatus: "none" },
        { session }
      );
    }

    // Only expire bookings where payment hasn't been initiated yet (or has been reset to "none" above)
    await Booking.updateMany(
      {
        status: BOOKING_STATUS.PENDING,
        expiresAt: { $lt: now },
        paymentStatus: { $nin: ["initiated", "paid"] },
      },
      { status: BOOKING_STATUS.EXPIRED },
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