import Payment from "./payment.model.js";

// 🔹 Check if payment already exists
export const paymentExist = async (bookingId, session) => {
  return Boolean(
    await Payment.findOne({
      bookingId,
      status: { $in: ["pending", "paid"] },
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
  return payment.toJSON();
};

// 🔹 Find latest payment for booking
export const findByBookingId = async (bookingId) => {
  return await Payment.findOne({
    bookingId,
    status: { $in: ["pending", "paid"] },
  })
    .sort({ createdAt: -1 })
    .lean();
};

// 🔹 🔥 FIXED: Fetch payment by internal ID
export const fetchPayment = async (paymentId, session) => {
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

// 🔹 Mark payment as PAID
export const updatePayment = async (paymentId, razorpayPaymentId, session) => {
  return await Payment.findOneAndUpdate(
    {
      _id: paymentId,
      status: "pending", // 🔥 ensures idempotency
    },
    {
      status: "paid",
      razorpayPaymentId,
    },
    {
      new: true,
      session,
      runValidators: true,
    }
  ).lean();
};

// 🔹 Mark payment as FAILED
export const updateFailedPayment = async (
  paymentId,
  razorpayPaymentId,
  session
) => {
  return await Payment.findOneAndUpdate(
    {
      _id: paymentId,
      status: "pending",
    },
    {
      status: "failed",
      razorpayPaymentId,
    },
    {
      new: true,
      session,
      runValidators: true,
    }
  ).lean();
};