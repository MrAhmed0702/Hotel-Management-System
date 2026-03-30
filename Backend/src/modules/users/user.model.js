import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
      minLength: [6, "Password must be at least 6 characters long"],
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },

    profilePicture: {
      type: String,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isDeleted: { 
      type: Boolean,
      default: false 
    },

    deletedAt: { 
      type: Date, 
      default: null 
    },
  },
  {
    timestamps: true,

    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;

        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.isDeleted;
        delete ret.deletedAt;

        return ret;
      },
    },
  },
);

userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    this.password = await bcrypt.hash(this.password, saltRounds);

    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.pre(/^find/, function() {
  this.where({ isDeleted: false });
});

userSchema.set("toObject", {
  transform: (doc, ret) => {
    ret.id = ret._id;

    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.isDeleted;
    delete ret.deletedAt;

    return ret;
  },
});

userSchema.index({ isDeleted: 1 });

export default model("User", userSchema);