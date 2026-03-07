import { Schema, model, Types } from "mongoose";

const hotelSchema = new Schema(
  {
    hotelName: {
      type: String,
      required: [true, "Hotel name is required"],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    address: {
      street: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      zipCode: {
        type: String,
        required: true,
        trim: true,
      },

      country: {
        type: String,
        required: true,
        trim: true,
      },
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "Maximum 10 images allowed",
      },
    },

    amenities: {
      type: [String],
      default: [],
    },

    totalRooms: {
      type: Number,
      required: [true, "Total rooms is required"],
      min: [1, "Hotel must have at least 1 room"],
      max: [10000, "Total rooms cannot exceed 10000"],
    },

    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      set: (val) => Math.round(val * 10) / 10,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,

    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;

        delete ret._id;
        delete ret.__v;
        delete ret.isDeleted;
        delete ret.deletedAt;

        return ret;
      },
    },
  },
);

hotelSchema.index({
  "address.city": 1,
  "address.country": 1,
  averageRating: -1,
});

hotelSchema.index(
  {
    hotelName: "text",
    description: "text",
    amenities: "text",
  },
  {
    weights: {
      hotelName: 10,
      description: 5,
      amenities: 2,
    },
  },
);

hotelSchema.index(
  { hotelName: 1, "address.city": 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

hotelSchema.pre(/^find/, function () {
  this.where({ isDeleted: false });
});

export default model("Hotel", hotelSchema);
