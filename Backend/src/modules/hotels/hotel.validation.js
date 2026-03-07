import Joi from "joi";

export const hotelSchema = Joi.object({
  hotelName: Joi.string()
    .trim()
    .min(2)
    .max(120)
    .required(),

  description: Joi.string()
    .trim()
    .max(2000)
    .allow("", null),

  address: Joi.object({
    street: Joi.string().trim().required(),
    city: Joi.string().trim().lowercase().required(),
    state: Joi.string().trim().required(),
    zipCode: Joi.string().trim().required(),
    country: Joi.string().trim().lowercase().required()
  }).required(),

  images: Joi.array()
    .items(Joi.string().uri())
    .max(10)
    .default([]),

  amenities: Joi.array()
    .items(Joi.string().trim())
    .default([]),

  totalRooms: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .required(),

  status: Joi.string()
    .valid("active", "inactive")
    .default("active")
});