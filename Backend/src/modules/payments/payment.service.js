import * as PaymentRepo from "./payment.repository.js";
import * as BookingRepo from "../bookings/booking.repository.js";
import { Types, startSession } from "mongoose";
import { ApiError } from "../../utils/apiError.js";
import Payment from "./payment.model.js";
import { razorpayInstance } from "../../config/razorpay.js";

const GRACE_MS = 2 * 60 * 1000;

//
// 🔹 CREATE PAYMENT
//
export const createPaymentService = async (userId, bookingId, key) => {
  const session = await startSession();

  try {
    session.startTransaction();

    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(bookingId)) {
      throw new ApiError(400, "Invalid IDs");
    }

    const bookingObjectId = new Types.ObjectId(bookingId);
    const userObjectId = new Types.ObjectId(userId);
    const now = new Date();

    // 🔥 Idempotency
    const existing = await PaymentRepo.findByIdempotencyKey(key, session);
    if (existing) {
      await session.commitTransaction();
      return existing;
    }

    // 🔥 Lock booking
    const booking = await BookingRepo.lockBookingForPayment(
      bookingObjectId,
      userObjectId,
      session
    );

    if (!booking) throw new ApiError(400, "Booking unavailable");

    if (booking.expiresAt < new Date(now.getTime() - GRACE_MS)) {
      throw new ApiError(400, "Booking expired");
    }

    // 🔥 Prevent duplicate
    const exists = await PaymentRepo.paymentExist(bookingObjectId, session);
    if (exists) throw new ApiError(400, "Payment already exists");

    const payment = await PaymentRepo.createPayment(
      {
        bookingId: bookingObjectId,
        userId: userObjectId,
        amount: booking.totalPrice,
        currency: "INR",
        status: "pending",
        expiresAt: booking.expiresAt,
        idempotencyKey: key,
      },
      session
    );

    await session.commitTransaction();
    return payment;

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

//
// 🔹 CREATE RAZORPAY ORDER
//
export const createRazorpayOrder = async (payment) => {
  const order = await razorpayInstance.orders.create({
    amount: payment.amount * 100,
    currency: payment.currency,
    receipt: `receipt_${payment._id}`,
    notes: {
      paymentId: payment._id.toString(),
      bookingId: payment.bookingId.toString(),
      userId: payment.userId.toString(),
    },
  });

  await Payment.updateOne(
    { _id: payment._id },
    { razorpayOrderId: order.id }
  );

  return order;
};

//
// 🔹 CONFIRM PAYMENT (WEBHOOK)
//
export const confirmPaymentService = async (
  internalPaymentId,
  razorpayPaymentId
) => {
  const session = await startSession();

  try {
    session.startTransaction();

    const now = new Date();

    // 🔥 Always trust internal ID FIRST
    let payment = null;

    if (internalPaymentId) {
      payment = await PaymentRepo.fetchPayment(internalPaymentId, session);
    }

    if (!payment && razorpayPaymentId) {
      payment = await PaymentRepo.findByRazorpayPaymentId(
        razorpayPaymentId,
        session
      );
    }

    if (!payment) throw new ApiError(404, "Payment not found");

    // 🔥 Idempotency (webhook retry safe)
    if (payment.status === "paid") {
      await session.commitTransaction();
      return payment;
    }

    if (payment.expiresAt < new Date(now.getTime() - GRACE_MS)) {
      throw new ApiError(400, "Payment expired");
    }

    const booking = await BookingRepo.getBookingById(
      payment.userId,
      payment.bookingId,
      session
    );

    if (!booking) throw new ApiError(404, "Booking not found");

    const updatedPayment = await PaymentRepo.updatePayment(
      payment._id,
      razorpayPaymentId,
      session
    );

    // 🔥 Handle duplicate webhook safely
    if (!updatedPayment) {
      const latest = await PaymentRepo.fetchPayment(payment._id, session);

      if (latest?.status === "paid") {
        await session.commitTransaction();
        return latest;
      }

      throw new ApiError(409, "Payment already processed");
    }

    const updatedBooking = await BookingRepo.updateBooking(
      payment.bookingId,
      payment.userId,
      session,
      payment._id
    );

    if (!updatedBooking) {
      throw new ApiError(409, "Booking update failed");
    }

    await session.commitTransaction();

    return {
      payment: updatedPayment,
      booking: updatedBooking,
    };

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

//
// 🔹 FAIL PAYMENT (WEBHOOK)
//
export const failPaymentService = async (
  internalPaymentId,
  razorpayPaymentId,
  failureData = {}
) => {
  const session = await startSession();

  try {
    session.startTransaction();

    let payment = null;

    // 🔥 Try internal ID first
    if (internalPaymentId) {
      payment = await PaymentRepo.fetchPayment(internalPaymentId, session);
    }

    // 🔥 fallback
    if (!payment && razorpayPaymentId) {
      payment = await PaymentRepo.findByRazorpayPaymentId(
        razorpayPaymentId,
        session
      );
    }

    if (!payment) throw new ApiError(404, "Payment not found");

    // 🔥 Idempotency
    if (payment.status !== "pending") {
      await session.commitTransaction();
      return payment;
    }

    const updatedPayment = await PaymentRepo.updateFailedPayment(
      payment._id,
      razorpayPaymentId,
      session
    );

    const updatedBooking = await BookingRepo.updateFailedBooking(
      payment.bookingId,
      payment.userId,
      session
    );

    await session.commitTransaction();

    return {
      payment: updatedPayment,
      booking: updatedBooking,
    };

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};