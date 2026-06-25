import Joi from "joi";

const addressSchema = Joi.object({
    street: Joi.string()
        .trim()
        .min(2)
        .max(200)
        .required(),

    city: Joi.string()
        .trim()
        .lowercase()
        .min(2)
        .max(100)
        .required(),

    state: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),

    zipCode: Joi.string()
        .trim()
        .min(3)
        .max(20)
        .required(),

    country: Joi.string()
        .trim()
        .lowercase()
        .min(2)
        .max(100)
        .required(),
});

export const hotelCreationSchema = Joi.object({
    hotelName: Joi.string()
        .trim()
        .min(2)
        .max(120)
        .required(),

    description: Joi.string()
        .trim()
        .max(1000)
        .allow("", null),

    address: addressSchema.required(),

    amenities: Joi.array()
        .items(
            Joi.string()
                .trim()
                .lowercase()
                .min(2)
                .max(50)
        )
        .unique()
        .max(50)
        .default([]),

    category: Joi.string()
        .valid(
            "luxury",
            "budget",
            "business",
            "family"
        )
        .required(),
})
    .required()
    .unknown(false);

export const hotelUpdateSchema = Joi.object({
    hotelName: Joi.string()
        .trim()
        .min(2)
        .max(120),

    description: Joi.string()
        .trim()
        .max(1000)
        .allow("", null),

    address: Joi.object({
        street: Joi.string()
            .trim()
            .min(2)
            .max(200),

        city: Joi.string()
            .trim()
            .lowercase()
            .min(2)
            .max(100),

        state: Joi.string()
            .trim()
            .min(2)
            .max(100),

        zipCode: Joi.string()
            .trim()
            .min(3)
            .max(20),

        country: Joi.string()
            .trim()
            .lowercase()
            .min(2)
            .max(100),
    }),

    amenities: Joi.array()
        .items(
            Joi.string()
                .trim()
                .lowercase()
                .min(2)
                .max(50)
        )
        .unique()
        .max(50),

    category: Joi.string()
        .valid(
            "luxury",
            "budget",
            "business",
            "family"
        ),

})
    .min(1)
    .unknown(false);

export const getOwnerHotelsSchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),

    search: Joi.string()
        .trim()
        .max(100)
}).unknown(false);