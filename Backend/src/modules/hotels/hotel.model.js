import { Schema, model, Types } from "mongoose";

const hotelSchema = new Schema(
  {
    hotelName: {
      type: String,
      required: [true, "Hotel name is required"],
      trim: true,
      minlength: 2,
      maxlength: 120,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      lowercase: true,
    },

    address: {
      street: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      zipCode: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      country: {
        type: String,
        required: true,
        lowercase: true,
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

    category: {
      type: String,
      enum: ["luxury", "budget", "business", "family"],
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
      set: (val) => {
        if (typeof val === "number") {
          return Math.round(val * 10) / 10;
        }

        return val;
      } 
    },

    owner: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    },

    approvedBy: {
      type: Types.ObjectId,
      ref: "User",
      default: null
    },

    status: {
      type: String,
      enum: [
        "pending",
        "active",
        "rejected",
        "inactive",
        "suspended"
      ],
      default: "pending"
    },

    isDeleted: {
      type: Boolean,
      default: false
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

hotelSchema.index({
  status: 1,
  createdAt: -1
});

hotelSchema.index({
  status: 1,
  averageRating: -1
})

hotelSchema.index({
  owner: 1,
  status: 1
})

hotelSchema.index(
  { hotelName: "text", description: "text", amenities: "text", category: "text" },
  {
    weights: {
      hotelName: 10,
      description: 5,
      amenities: 3,
      category: 1
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
