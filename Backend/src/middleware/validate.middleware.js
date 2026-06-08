import { ApiError } from "../utils/apiError.js";

export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    return next(
      new ApiError(400, "Validation Error", error.details.map((err) => err.message))
    )
  }

  req.validatedData = value;
  next();
};