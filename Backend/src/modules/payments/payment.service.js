import * as PaymentRepo from "./payment.repository.js";
import * as BookingRepo from "../bookings/booking.repository.js";
import { Types, startSession } from "mongoose";
import { ApiError } from "../../utils/apiError.js";
import Payment from "./payment.model.js";
import { razorpayInstance } from "../../config/razorpay.js";
import crypto from "crypto";
import { PAYMENT_STATUS } from "../../constants/status.js";
import { TIMEOUTS } from "../../config/timeouts.js";

const GRACE_MS = TIMEOUTS.GRACE_PERIOD_MS;

//
// 🔹 CREATE PAYMENT
//
export const createPaymentService = async (userId, bookingId, key) => {
  const session = await startSession();

  let payment;

  try {
    session.startTransaction();

    const bookingObjectId = new Types.ObjectId(bookingId);
    const userObjectId = new Types.ObjectId(userId);
    const now = new Date();

    // 🔥 Idempotency
    const existing = await PaymentRepo.findByIdempotencyKey(key, session);
    if (existing) {
      await session.commitTransaction();
      return {
        payment: existing,
        order: await PaymentRepo.getExistingOrder(existing)
      };
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

    // Check if there is already a paid payment for this booking
    const hasPaid = await Payment.exists({
      bookingId: bookingObjectId,
      status: PAYMENT_STATUS.PAID,
    }).session(session);

    if (hasPaid) throw new ApiError(400, "Booking already paid");

    // Invalidate any pending payment attempts for this booking
    await Payment.updateMany(
      {
        bookingId: bookingObjectId,
        status: PAYMENT_STATUS.PENDING,
      },
      {
        status: PAYMENT_STATUS.FAILED,
        failureReason: "superseded_by_retry",
      },
      { session }
    );

    payment = await PaymentRepo.createPayment(
      {
        bookingId: bookingObjectId,
        userId: userObjectId,
        amount: booking.totalPrice,
        currency: "INR",
        status: PAYMENT_STATUS.PENDING,
        expiresAt: new Date(now.getTime() + TIMEOUTS.PAYMENT_TIMEOUT_MS),
        idempotencyKey: key,
      },
      session
    );

    await session.commitTransaction();

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  try {
    const order = await createRazorpayOrder(payment);
    return { payment, order };
  } catch (err) {
    await PaymentRepo.markOrderCreationFailed(payment._id);
    await BookingRepo.resetPaymentStatus(payment.bookingId);
    throw err;
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
      payment = await PaymentRepo.findPaymentById(internalPaymentId, session);
    }

    if (!payment && razorpayPaymentId) {
      payment = await PaymentRepo.findByRazorpayPaymentId(
        razorpayPaymentId,
        session
      );
    }

    if (!payment) throw new ApiError(404, "Payment not found");

    // 🔥 Explicit State Machine checks
    if (payment.status === PAYMENT_STATUS.PAID) {
      await session.commitTransaction();
      return payment;
    }
    
    if (payment.status !== PAYMENT_STATUS.PENDING) {
      throw new ApiError(400, `Cannot transition payment from ${payment.status} to paid`);
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
      const latest = await PaymentRepo.findPaymentById(payment._id, session);

      if (latest?.status === PAYMENT_STATUS.PAID) {
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
export const failPaymentService = async (internalPaymentId, razorpayPaymentId, failureData = {}) => {
  const session = await startSession();

  try {
    session.startTransaction();

    let payment = null;

    // 🔥 Try internal ID first
    if (internalPaymentId) {
      payment = await PaymentRepo.findPaymentById(internalPaymentId, session);
    }

    // 🔥 fallback
    if (!payment && razorpayPaymentId) {
      payment = await PaymentRepo.findByRazorpayPaymentId(
        razorpayPaymentId,
        session
      );
    }

    if (!payment) throw new ApiError(404, "Payment not found");

    // 🔥 Explicit State Machine checks
    if (payment.status === PAYMENT_STATUS.FAILED) {
      await session.commitTransaction();
      return payment;
    }
    
    if (payment.status !== PAYMENT_STATUS.PENDING) {
      throw new ApiError(400, `Cannot transition payment from ${payment.status} to failed`);
    }

    const updatedPayment = await PaymentRepo.updateFailedPayment(
      payment._id,
      razorpayPaymentId,
      failureData,
      session
    );

    const updatedBooking = await BookingRepo.resetBookingAfterFailedPayment(
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

export const getPaymentsService = async (userId) => {
  const payments = await PaymentRepo.getMyPayments(userId);

  if(!payments) throw new ApiError(404, "Payments not found");

  return payments
}

export const getPaymentByIdService = async (paymentId, userId) => {
  const payment = await PaymentRepo.findByIdAndUser(paymentId, userId);

  if (!payment) throw new ApiError(404, "Payment not found");

  return payment;
};

export const verifyPaymentService = async (userId, verifyData) => {
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = verifyData;
  if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    throw new ApiError(400, "Missing verification parameters");
  }

  // 1. Verify Signature
  const text = razorpayOrderId + "|" + razorpayPaymentId;
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    throw new ApiError(400, "Payment signature verification failed");
  }

  // 2. Delegate to confirmPaymentService
  const payment = await PaymentRepo.findByRazorpayOrderId(razorpayOrderId);
  if (!payment) throw new ApiError(404, "Payment record not found");

  if (payment.userId.toString() !== userId.toString()) {
    throw new ApiError(403, "Forbidden");
  }

  return await confirmPaymentService(payment._id, razorpayPaymentId);
};