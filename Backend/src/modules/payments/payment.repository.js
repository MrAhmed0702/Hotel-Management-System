import Payment from "./payment.model.js";

// 🔹 Check if payment already exists (active ones only)
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

// 🔹 Idempotency lookup
export const findByIdempotencyKey = async (idempotencyKey, session) => {
    if (!idempotencyKey) return null;

    return await Payment.findOne({ idempotencyKey })
        .session(session)
        .lean();
};

// 🔹 Create payment (transaction-safe)
export const createPayment = async (paymentData, session) => {
    const [payment] = await Payment.create([paymentData], { session });

    return payment.toJSON(); // normalize output like schema transform
};

// 🔹 Find by booking ID (for race condition fallback)
export const findByBookingId = async (bookingId) => {
  return await Payment.findOne({
    bookingId,
    status: { $in: ["pending", "paid"] },
  })
    .sort({ createdAt: -1 })
    .lean();
};

export const fetchPayment = async (paymentId, session) => {
    return await Payment.findOne({
        _id: paymentId,
        isDeleted: false
    }).session(session).lean();
}

export const updatePayment = async (paymentId, session) => {
    return await Payment.findOneAndUpdate(
        {
            _id: paymentId,
            status: "pending",
        },
        {
            status: "paid"
        },
        {
            new: true,
            session,
            runValidators: true
        }
    ).lean();
}