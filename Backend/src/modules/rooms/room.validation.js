import Joi from "joi";

export const createRoomSchema = Joi.object({
  roomNumber: Joi.number().integer().min(1).required(),

  type: Joi.string().valid("single", "double", "suite", "deluxe", "family").required(),

  description: Joi.string().trim().min(20).max(450).allow("", null),

  price: Joi.number().min(1).required(),

  capacity: Joi.number().min(1).required(),

  amenities: Joi.array().items(Joi.string().trim()).default([]),

  status: Joi.string()
    .valid("available", "maintenance", "inactive")
    .default("available"),
});
