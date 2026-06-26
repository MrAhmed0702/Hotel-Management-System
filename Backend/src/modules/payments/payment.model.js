import { Schema, model, Types } from "mongoose";
import { PAYMENT_STATUS } from "../../constants/status.js";

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
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
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

    // ⏱ Expiry for pending payments only — NOT a deletion trigger
    expiresAt: {
      type: Date,
    },

    // 📦 Metadata (flexible)
    gatewayMetadata: {
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

paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ status: 1, expiresAt: 1 });

export default model("Payment", paymentSchema);