import { Schema, model, Types } from "mongoose";
import { ROOM_TYPES } from "./room.constants.js";
import { ROOM_STATUS } from "../../constants/status.js";
import validator from "validator";

const roomSchema = new Schema(
  {
    hotelId: {
      type: Types.ObjectId,
      ref: "Hotel",
      required: [true, "Hotel ID is required"],
      index: true,
    },

    roomNumber: {
      type: String,
      required: [true, "Room number is required"],
      trim: true,
    },

    type: {
      type: String,
      enum: ROOM_TYPES,
      required: [true, "Room type is required"],
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 450,
      default: "",
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [1, "Price must be greater than 0"],
    },

    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be greater than 0"],
    },

    amenities: {
      type: [String],
      default: [],
    },

    operationalStatus: {
      type: String,
      enum: Object.values(ROOM_STATUS),
      default: ROOM_STATUS.AVAILABLE,
      index: true,
    },

    images: {
      type: [
        {
          type: String,
          trim: true,
          validate: {
            validator: (value) =>
              value.startsWith("http://") || value.startsWith("https://"),
              message: "Invalid image URL",
          },
        },
      ],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "Maximum 10 images allowed",
      },
    },

    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },

    deletedAt: {
      type: Date,
      default: null,
      select: false,
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

roomSchema.index(
  { hotelId: 1, roomNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  }
);

roomSchema.index({ hotelId: 1, createdAt: -1 });

roomSchema.index({ hotelId: 1, operationalStatus: 1 });

roomSchema.index({ hotelId: 1, type: 1, operationalStatus: 1 });

roomSchema.index({ hotelId: 1, operationalStatus: 1, price: 1 });

roomSchema.index({ hotelId: 1, operationalStatus: 1, capacity: 1 });

roomSchema.index({ hotelId: 1, amenities: 1 });

roomSchema.pre(/^find/, function () {
  this.where({ isDeleted: false });
});

export default model("Room", roomSchema);