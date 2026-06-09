import Joi from "joi";

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