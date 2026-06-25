import Joi from "joi";

export const getUsersSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim(),
  sort: Joi.string().valid("createdAt", "firstName", "lastName", "email").default("createdAt"),
  order: Joi.string().valid("asc", "desc").default("desc")
}).unknown(false);

export const updateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50),

  lastName: Joi.string().trim().min(2).max(50),

  email: Joi.string().email().lowercase(),

  phoneNumber: Joi.string().trim().pattern(/^[0-9]{10}$/),

  password: Joi.string().min(6).max(100),

  gender: Joi.string().valid("male", "female"),

  dateOfBirth: Joi.date().less("now"),

  isVerified: Joi.boolean()

}).min(1).unknown(false);

export const updateRoleSchema = Joi.object({
  role: Joi.string()
    .valid("user", "owner", "admin")
    .required()
}).unknown(false);

export const hotelStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "pending",
      "active",
      "rejected",
      "suspended",
      "inactive"
    ).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
}).unknown(false);

export const updateHotelStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "pending",
      "active",
      "rejected",
      "suspended",
      "inactive"
    )
    .required(),

  reason: Joi.string()
    .trim()
    .max(500)
    .allow("")
}).unknown(false);

export const getAdminBookingsSchema = Joi.object({
  status: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "cancelled",
      "expired"
    )
    .optional(),

  paymentStatus: Joi.string()
    .valid(
      "none",
      "initiated",
      "paid",
      "failed",
      "refunded"
    )
    .optional(),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
}).unknown(false);