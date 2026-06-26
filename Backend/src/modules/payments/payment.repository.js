import Payment from "./payment.model.js";
import { PAYMENT_STATUS } from "../../constants/status.js";

// 🔹 Check if active payment already exists
export const existsActivePayment = async (bookingId, session) => {
  return Boolean(
    await Payment.findOne({
      bookingId,
      status: { $in: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PAID] },
    })
      .session(session)
      .lean()
  );
};

// 🔹 Idempotency
export const findByIdempotencyKey = async (key, session) => {
  if (!key) return null;

  return await Payment.findOne({ idempotencyKey: key })
    .session(session)
    .lean();
};

// 🔹 Create payment
export const createPayment = async (data, session) => {
  const [payment] = await Payment.create([data], { session });
  return payment;
};

// 🔹 Find latest payment for booking
export const findByBookingId = async (bookingId) => {
  return await Payment.findOne({
    bookingId,
    status: { $in: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.PAID] },
  })
    .sort({ createdAt: -1 })
    .lean();
};

// 🔹 Fetch payment by internal ID
export const findPaymentById = async (paymentId, session) => {
  return await Payment.findById(paymentId)
    .session(session)
    .lean();
};

// 🔹 Find by Razorpay payment ID
export const findByRazorpayPaymentId = async (id, session) => {
  if (!id) return null;

  return await Payment.findOne({ razorpayPaymentId: id })
    .session(session)
    .lean();
};

// 🔹 Find by Razorpay order ID
export const findByRazorpayOrderId = async (id, session) => {
  if (!id) return null;

  return await Payment.findOne({ razorpayOrderId: id })
    .session(session)
    .lean();
};

// 🔹 Mark payment as PAID
export const updatePayment = async (paymentId, razorpayPaymentId, session) => {
  return await Payment.findOneAndUpdate(
    {
      _id: paymentId,
      status: PAYMENT_STATUS.PENDING, // 🔥 ensures idempotency
    },
    {
      $set: {
        status: PAYMENT_STATUS.PAID,
        razorpayPaymentId,
      },
      $unset: { expiresAt: "" }
    },
    {
      returnDocument: "after",
      session,
      runValidators: true,
    }
  );
};

// 🔹 Mark payment as FAILED
export const updateFailedPayment = async (paymentId, razorpayPaymentId, failureData, session) => {
  return await Payment.findOneAndUpdate(
    {
      _id: paymentId,
      status: PAYMENT_STATUS.PENDING,
    },
    {
      status: PAYMENT_STATUS.FAILED,
      razorpayPaymentId,
      failureReason: failureData?.reason,
      gatewayResponse: failureData?.metadata
    },
    {
      returnDocument: "after",
      session,
      runValidators: true,
    }
  );
};

export const markOrderCreationFailed = async (paymentId) => {
  await Payment.updateOne(
    {
      _id: paymentId,
    },
    {
      status: PAYMENT_STATUS.FAILED,
      failureReason: "razorpay_order_creation_failed",
    }
  );
};

export const getExistingOrder = async (payment) => {
  return payment.razorpayOrderId
    ? {
      id: payment.razorpayOrderId,
      amount: payment.amount,
      currency: payment.currency
    }
    : null;
};

export const getMyPayments = async (userId) => {
  return await Payment.find({ userId }).sort({ createdAt: -1 }).lean();
}

export const findByIdAndUser = async (paymentId, userId) => {
  return await Payment.findOne({
    _id: paymentId,
    userId,
  })
    .populate("bookingId", "userId hotelId")
    .populate("userId", "firstName lastName email")
    .lean();
};