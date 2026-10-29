const Joi = require('joi');

// Rules mirror the frontend zod schemas in prelink/src/validations.
const email = Joi.string().trim().lowercase().email().required();
const password = Joi.string().min(6).max(128).required();
const confirmPassword = Joi.any()
  .valid(Joi.ref('password'))
  .required()
  .strip()
  .messages({ 'any.only': 'Passwords do not match' });

const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email,
  password,
  confirmPassword,
});

const loginSchema = Joi.object({
  email,
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({ email });

const resetPasswordSchema = Joi.object({
  email,
  code: Joi.string()
    .trim()
    .pattern(/^\d{6}$/)
    .required()
    .messages({ 'string.pattern.base': 'Enter the 6-digit code' }),
  password,
  confirmPassword,
});

module.exports = { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };
