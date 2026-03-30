export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: error.details.map((err) => err.message),
    });
  }

  req.validatedData = value;
  next();
};