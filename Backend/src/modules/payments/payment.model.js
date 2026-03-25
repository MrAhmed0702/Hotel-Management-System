import { Schema, model, Types } from "mongoose";

const paymentSchema = new Schema(
  {
    bookingId: {
      type: Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled", "refunded"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet"],
    },

    // 🔥 Razorpay integration fields
    razorpayOrderId: {
      type: String,
    },

    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
    },

    razorpaySignature: {
      type: String,
    },

    // 🔁 Idempotency
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },

    // ⏱ Expiry (logical, not deletion trigger)
    expiresAt: {
      type: Date,
      required: true,
    },

    // 📦 Metadata (flexible)
    metadata: {
      type: Map,
      of: String,
    },

    // 🧾 Failure/debug info
    failureReason: {
      type: String,
    },

    gatewayResponse: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,

    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

paymentSchema.index({ bookingId: 1, status: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

export default model("Payment", paymentSchema);