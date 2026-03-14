import Joi from "joi";

export const createBookingSchema = Joi.object({
  roomType: Joi.string()
    .valid("single", "double", "suite", "deluxe", "family")
    .required()
    .messages({
      "any.required": "Room type is required",
      "any.only":
        "Room type must be one of single, double, suite, deluxe, family",
    }),

  quantity: Joi.number().integer().min(1).max(20).required().messages({
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),

  checkIn: Joi.date().min("now").iso().required().messages({
    "date.min": "Check-in date cannot be in the past",
    "any.required": "Check-in date is required",
  }),

  checkOut: Joi.date().greater(Joi.ref("checkIn")).iso().required().messages({
    "date.greater": "Check-out date must be after check-in date",
    "any.required": "Check-out date is required",
  }),

  numberOfGuests: Joi.number().integer().min(1).required().messages({
    "number.min": "Number of guests must be at least 1",
    "any.required": "Number of guests is required",
  }),
}).unknown(false);
