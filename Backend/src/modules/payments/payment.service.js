import * as PaymentRepo from "./payment.repository.js";
import { Types, startSession } from "mongoose";
import { ApiError } from "../../utils/apiError.js";
import * as BookingRepo from "../bookings/booking.repository.js";

export const createPaymentService = async (
  userId,
  bookingId,
  idempotencyKey
) => {
  const session = await startSession();

  try {
    session.startTransaction();

    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(bookingId)) {
      throw new ApiError(400, "Invalid userId or bookingId");
    }

    const bookingObjectId = new Types.ObjectId(bookingId);
    const userObjectId = new Types.ObjectId(userId);
    const now = new Date();

    // 🔥 1️⃣ Idempotency FIRST
    const existingByKey = await PaymentRepo.findByIdempotencyKey(
      idempotencyKey,
      session
    );

    if (existingByKey) {
      if (existingByKey.bookingId.toString() !== bookingObjectId.toString()) {
        throw new ApiError(409, "Idempotency key conflict");
      }

      await session.commitTransaction();
      return existingByKey;
    }

    // 🔥 2️⃣ Lock booking
    const booking = await BookingRepo.lockBookingForPayment(
      bookingObjectId,
      userObjectId,
      session
    );

    if (!booking) {
      throw new ApiError(400, "Booking not available for payment");
    }

    // 🔥 3️⃣ Validate booking
    if (booking.status !== "pending") {
      throw new ApiError(400, "Booking is not in pending state");
    }

    if (booking.expiresAt < now) {
      throw new ApiError(400, "Booking has expired");
    }

    // 🔥 4️⃣ Prevent duplicate payment
    const paymentExists = await PaymentRepo.paymentExist(
      bookingObjectId,
      session
    );

    if (paymentExists) {
      throw new ApiError(400, "Payment already exists for this booking");
    }

    if (!booking.totalPrice || booking.totalPrice <= 0) {
      throw new ApiError(400, "Invalid booking amount");
    }

    // 🔥 5️⃣ Create payment
    const payment = await PaymentRepo.createPayment(
      {
        bookingId: bookingObjectId,
        userId: userObjectId,
        amount: booking.totalPrice,
        currency: "INR",
        status: "pending",
        expiresAt: booking.expiresAt,
        idempotencyKey,
      },
      session
    );

    await session.commitTransaction();
    return payment;

  } catch (error) {
    await session.abortTransaction();

    // 🔥 Race condition fallback
    if (error.code === 11000) {
      const existing =
        (idempotencyKey &&
          (await PaymentRepo.findByIdempotencyKey(idempotencyKey))) ||
        (await PaymentRepo.findByBookingId(new Types.ObjectId(bookingId)));

      if (existing) return existing;
    }

    throw error;

  } finally {
    session.endSession();
  }
};

export const confirmPaymentService = async (userId, paymentId) => {
  const session = await startSession();

  try {
    session.startTransaction();

    if(!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(paymentId)){
      throw new ApiError(400, "Invalid userId or PaymentId");
    }

    const paymentObjectId = new Types.ObjectId(paymentId)
    const userObjectId = new Types.ObjectId(userId);
    const now = new Date();

    const payment = await PaymentRepo.fetchPayment(paymentObjectId, session);

    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }

    if(payment.status === "paid"){
      await session.abortTransaction();
      return payment;
    }

     if(payment.status !== "pending"){
      throw new ApiError(400, "Invalid payment status");
    }

    if(payment.expiresAt < now){
      throw new ApiError(400, "Payment has expired");
    }

    const booking = await BookingRepo.getBookingById2(userObjectId, payment.bookingId, session);

    if(!booking){
      throw new ApiError(404, "Booking Not Found");
    }

    if(booking.status !== "pending"){
      throw new ApiError(400, "Booking is not in pending state");
    }

    if(booking.paymentStatus !== "initiated"){
      throw new ApiError(400, "Payment is not in initiated state");
    }

    if(booking.expiresAt < now){
      throw new ApiError(400, "Booking has expired");
    }

    const updatedPayment = await PaymentRepo.updatePayment(paymentObjectId, session);

    if (!updatedPayment) {
      const latest = await PaymentRepo.fetchPayment(paymentObjectId);
      if (latest?.status === "paid") {
        await session.commitTransaction();
        return latest;
      }

      throw new ApiError(409, "Payment already processed");
    }

    const updatedBooking = await BookingRepo.updateBooking(payment.bookingId, userObjectId, session);

    if (!updatedBooking) {
      throw new ApiError(409, "Booking update failed");
    }

    await session.commitTransaction();

    return {
      payment: updatePayment,
      booking: updateBooking
    }
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}