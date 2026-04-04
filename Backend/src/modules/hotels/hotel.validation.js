import Joi from "joi";

export const createHotelSchema = Joi.object({
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
    .items(Joi.string().trim().lowercase())
    .default([]),

  category: Joi.string()
    .valid("luxury", "budget", "business", "family")
    .required(),

  totalRooms: Joi.number()
    .integer()
    .min(1)
    .max(10000)
    .required(),

  status: Joi.string()
    .valid("active", "inactive")
    .default("active")
});

export const updateHotelSchema = Joi.object({
  hotelName: Joi.string().trim().min(2).max(120),

  description: Joi.string().trim().max(2000).allow("", null),

  amenities: Joi.array()
    .items(Joi.string().trim())
    .default([]),

  category: Joi.string()
    .valid("luxury", "budget", "business", "family"),

  address: Joi.object({
    street: Joi.string().trim(),
    city: Joi.string().trim().lowercase(),
    state: Joi.string().trim(),
    zipCode: Joi.string().trim(),
    country: Joi.string().trim().lowercase()
  }),

  images: Joi.array()
    .items(Joi.string().uri())
    .max(10)
    .default([]),

  totalRooms: Joi.number().min(1).max(10000),

  status: Joi.string().valid("active", "inactive").default("active")
})