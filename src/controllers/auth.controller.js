const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const { sendEmail } = require('../utils/email');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

const FORGOT_PASSWORD_MESSAGE = 'If an account exists for that email, a reset code is on its way.';
const RESET_SELECT = '+tokenVersion +passwordResetCode +passwordResetExpires +passwordResetAttempts';

const signToken = (user) =>
  jwt.sign({ id: user._id, v: user.tokenVersion }, jwtSecret, { expiresIn: jwtExpiresIn });

// Express 5 forwards rejected promises to the error handler, so no try/catch needed.
const signup = async (req, res) => {
  const exists = await User.exists({ email: req.body.email });
  if (exists) throw new ApiError(409, 'Email is already registered');

  const user = await User.create(req.body);
  res.status(201).json({ token: signToken(user), user });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password +tokenVersion');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  res.json({ token: signToken(user), user });
};

// Always responds the same way so the endpoint can't be used to discover registered emails.
const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (user) {
    const code = await user.createPasswordResetCode();
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      to: user.email,
      subject: 'Your PreLink password reset code',
      text: `Your password reset code is ${code}. It expires in 15 minutes.`,
    });
  }

  res.json({ message: FORGOT_PASSWORD_MESSAGE });
};

// Same error for unknown email, wrong/expired code and too many attempts,
// so the response doesn't reveal which accounts exist.
const resetPassword = async (req, res) => {
  const { email, code, password } = req.body;
  const user = await User.findOne({ email }).select(RESET_SELECT);
  if (!user || !(await user.verifyPasswordResetCode(code))) {
    throw new ApiError(400, 'Reset code is invalid or has expired');
  }

  user.password = password;
  user.clearPasswordResetCode();
  user.tokenVersion += 1;
  await user.save();

  res.json({ message: 'Password has been reset. Please log in.' });
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { signup, login, forgotPassword, resetPassword, me };
