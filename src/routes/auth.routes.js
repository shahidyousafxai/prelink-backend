const { Router } = require('express');
const validate = require('../middlewares/validate');
const auth = require('../middlewares/auth');
const {
  loginLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
} = require('../middlewares/rateLimit');
const {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validations/auth.validation');
const authController = require('../controllers/auth.controller');

const router = Router();

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  '/reset-password',
  resetPasswordLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword
);
router.get('/me', auth, authController.me);

module.exports = router;
