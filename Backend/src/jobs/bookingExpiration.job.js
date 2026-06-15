import Booking from "../modules/bookings/booking.model.js";
import Payment from "../modules/payments/payment.model.js";

export const expireBookingsJob = async () => {

  const now = new Date();

  try {

    const expiredBookings =
      await Booking.updateMany(
        {
          status: "pending",
          expiresAt: { $lt: now }
        },
        {
          status: "expired"
        }
      );

    const expiredPayments =
      await Payment.updateMany(
        {
          status: "pending",
          expiresAt: { $lt: now }
        },
        {
          status: "failed",
          failureReason: "expired"
        }
      );

    console.log(
      `Expired bookings: ${expiredBookings.modifiedCount}`
    );

    console.log(
      `Expired payments: ${expiredPayments.modifiedCount}`
    );

  } catch (error) {

    console.error(
      "Expiration Job Error",
      error
    );

  }
};