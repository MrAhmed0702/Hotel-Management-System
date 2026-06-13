import Joi from "joi";

export const getHotelsSchema = Joi.object({
    city: Joi.string().trim(),

    country: Joi.string().trim(),

    search: Joi.string().trim().max(100),

    category: Joi.string().valid(
        "luxury",
        "budget",
        "business",
        "family"
    ),

    amenities: Joi.string().trim().custom((value) =>
        [...new Set(
            value
                .split(",")
                .map(item => item.trim().toLowerCase())
                .filter(Boolean)
        )]
    ),

    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),

    sort: Joi.string()
        .valid(
            "rating",
            "newest",
            "oldest"
        )
}).unknown(false);
