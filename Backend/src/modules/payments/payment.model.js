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
      enum: ["cash", "card", "upi", "netbanking", "wallet"],
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },

    expiresAt: {
      type: Date,
      required: true,
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

paymentSchema.index({ bookingId: 1 }, { unique: true });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ idempotencyKey: 1 }, { unique: true });
paymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model("Payment", paymentSchema);