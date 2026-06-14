import Joi from "joi";
import { ROOM_TYPES, ROOM_OPERATIONAL_STATUSES } from "./room.constants.js";

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

  description: Joi.string()
    .trim()
    .min(20)
    .max(450)
    .allow(""),

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
    .valid(...ROOM_OPERATIONAL_STATUSES)
    .default("available"),
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

  description: Joi.string()
    .trim()
    .min(20)
    .max(450)
    .allow(""),

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
    .valid(...ROOM_OPERATIONAL_STATUSES),
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

  operationalStatus: Joi.string().trim().lowercase().valid(...ROOM_OPERATIONAL_STATUSES),

  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(100).default(10),
}).unknown(false);