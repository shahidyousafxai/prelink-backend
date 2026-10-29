const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const { jwtSecret } = require('../config/env');

// Verifies the Bearer token and loads the user, so deleted users and tokens issued
// before a password reset (tokenVersion mismatch) are rejected.
const auth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Authentication required');
  }

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const user = await User.findById(payload.id).select('+tokenVersion');
  if (!user || user.tokenVersion !== payload.v) {
    throw new ApiError(401, 'Invalid or expired token');
  }

  req.user = user;
  next();
};

module.exports = auth;
