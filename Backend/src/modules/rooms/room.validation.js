import Joi from "joi";
import { ROOM_TYPES } from "./room.constants.js";
import { ROOM_STATUS } from "../../constants/status.js";

const amenitiesSchema = Joi.array()
    .items(
        Joi.string()
            .trim()
            .lowercase()
            .min(2)
            .max(50)
  )
  .unique()
  .max(50)
  .default([]);

const descriptionSchema = Joi.string()
  .trim()
  .max(450)
  .custom((value, helpers) => {
    if (!value) return value;
    const words = value.trim().split(/\s+/).filter(Boolean).length;
    if (words < 10) {
      return helpers.message("Description must have at least 10 words");
    }
    return value;
  })
  .allow("", null);

export const createRoomSchema = Joi.object({
  roomNumber: Joi.string()
    .trim()
    .pattern(/^[A-Za-z0-9-]+$/)
    .min(1)
    .max(20)
    .required(),

  type: Joi.string()
    .trim()
    .lowercase()
    .valid(...ROOM_TYPES)
    .required(),

  description: descriptionSchema,

  price: Joi.number()
    .positive()
    .precision(2)
    .required(),

  capacity: Joi.number()
    .integer()
    .positive()
    .required(),

  amenities: amenitiesSchema.default([]),

  operationalStatus: Joi.string()
    .trim()
    .lowercase()
    .valid(...Object.values(ROOM_STATUS))
    .default(ROOM_STATUS.AVAILABLE),
})
  .required()
  .options({
    abortEarly: false,
    stripUnknown: true,
  });

export const updateRoomSchema = Joi.object({
  type: Joi.string()
    .trim()
    .lowercase()
    .valid(...ROOM_TYPES),

  description: descriptionSchema,

  price: Joi.number()
    .positive()
    .precision(2),

  capacity: Joi.number()
    .integer()
    .positive(),

  amenities: amenitiesSchema,

  operationalStatus: Joi.string()
    .trim()
    .lowercase()
    .valid(...Object.values(ROOM_STATUS)),
})
  .min(1)
  .options({
    abortEarly: false,
    stripUnknown: true,
  });

  export const getRoomsSchema = Joi.object({
  type: Joi.string().trim().lowercase().valid(...ROOM_TYPES),

  minPrice: Joi.number().min(0),

  maxPrice: Joi.number().min(Joi.ref("minPrice")),

  capacity: Joi.number().integer().positive(),

  operationalStatus: Joi.string().trim().lowercase().valid(...Object.values(ROOM_STATUS)),

  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(100).default(10),
}).unknown(false);