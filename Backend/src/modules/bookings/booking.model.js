import { Schema, model, Types } from "mongoose";
import { BOOKING_STATUS } from "../../constants/status.js";

const bookingSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    hotelId: {
      type: Types.ObjectId,
      ref: "Hotel",
      required: true,
    },

    roomType: {
      type: String,
      enum: ["single", "double", "suite", "deluxe", "family"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },

    numberOfGuests: {
      type: Number,
      required: true,
    },

    checkIn: {
      type: Date,
      required: true,
    },

    checkOut: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },

    paymentStatus: {
      type: String,
      enum: ["none", "initiated", "paid", "failed", "refunded"],
      default: "none",
    },

    paymentId: {
      type: Types.ObjectId,
      ref: "Payment",
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    cancelReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    metadata: {
      type: Map,
      of: String,
    },

    isDeleted: {
      type: Boolean,
      default: false,
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

// Availability queries
bookingSchema.index({
  hotelId: 1,
  roomType: 1,
  status: 1,
  checkIn: 1,
  checkOut: 1,
});

bookingSchema.index({
  hotelId: 1,
  status: 1,
  createdAt: -1
});

bookingSchema.index(
  { status: 1, expiresAt: 1 },
  { partialFilterExpression: { status: BOOKING_STATUS.PENDING } }
);

// User history
bookingSchema.index({ userId: 1, createdAt: -1 });

bookingSchema.index({ paymentStatus: 1, status: 1 });

// Cleanup / filtering
bookingSchema.index({ expiresAt: 1 });
bookingSchema.index({ isDeleted: 1 });

// Global soft-delete filter for all find queries
bookingSchema.pre(/^find/, function () {
  this.where({ isDeleted: false });
}); 

export default model("Booking", bookingSchema);
