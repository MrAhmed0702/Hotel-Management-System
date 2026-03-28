import Joi from "joi";

export const registerSchema = Joi.object({
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),

    email: Joi.string().email().required(),

    phoneNumber: Joi.string().required(),

    password: Joi.string().min(6).required(),

    dateOfBirth: Joi.date().required(),

    gender: Joi.string().valid("male", "female").required(),

    profilePicture: Joi.any().optional(),
})

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
})