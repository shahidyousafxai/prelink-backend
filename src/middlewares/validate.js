const ApiError = require('../utils/ApiError');

// Validates req[property] against a Joi schema and replaces req.body with the sanitized value.
// In Express 5, req.query is read-only, so validated query/params are exposed on req.validated.
const validate =
  (schema, property = 'body') =>
  (req, res, next) => {
    const { value, error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => ({ field: d.path.join('.'), message: d.message }));
      return next(new ApiError(400, 'Validation failed', details));
    }

    if (property === 'body') req.body = value;
    req.validated = { ...req.validated, [property]: value };
    next();
  };

module.exports = validate;
