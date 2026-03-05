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
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
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
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS);

  this.password = await bcrypt.hash(this.password, saltRounds);

  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default model("User", userSchema);
