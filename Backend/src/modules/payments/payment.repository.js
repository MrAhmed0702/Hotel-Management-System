import Payment from "./payment.model.js";
import { Types } from "mongoose";

export const paymentExist = async (bookingId, session) => {
  return Boolean(
    await Payment.findOne({
      bookingId,
      status: { $in: ["pending", "paid"] },
    }).session(session).lean()
  );
};

export const findByIdempotencyKey = async (key, session) => {
  if (!key) return null;

  return Payment.findOne({ idempotencyKey: key })
    .session(session)
    .lean();
};

export const createPayment = async (data, session) => {
  const [payment] = await Payment.create([data], { session });
  return payment.toJSON();
};

export const findByBookingId = async (bookingId) => {
  return Payment.findOne({
    bookingId,
    status: { $in: ["pending", "paid"] },
  })
    .sort({ createdAt: -1 })
    .lean();
};

export const findByRazorpayPaymentId = async (id, session) => {
  if (!id) return null;

  return Payment.findOne({ razorpayPaymentId: id })
    .session(session)
    .lean();
};

export const updatePayment = async (paymentId, razorpayPaymentId, session) => {
  return Payment.findOneAndUpdate(
    { _id: paymentId, status: "pending" },
    {
      status: "paid",
      razorpayPaymentId,
    },
    { new: true, session }
  ).lean();
};

export const updateFailedPayment = async (paymentId, razorpayPaymentId, session) => {
  return Payment.findOneAndUpdate(
    { _id: paymentId, status: "pending" },
    {
      status: "failed",
      razorpayPaymentId,
    },
    { new: true, session }
  ).lean();
};