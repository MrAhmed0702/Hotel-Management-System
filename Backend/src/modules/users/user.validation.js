import Joi from "joi";

export const updateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50),

  lastName: Joi.string().trim().min(2).max(50),

  phoneNumber: Joi.string().pattern(/^[0-9]{10}$/),

  gender: Joi.string().valid("male", "female"),

  dateOfBirth: Joi.date().less("now"),

  profilePicture: Joi.string().uri().pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i),
}).min(1).unknown(false);