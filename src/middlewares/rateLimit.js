const { rateLimit, ipKeyGenerator, MINUTE } = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

const TOO_MANY = 'Too many attempts. Please try again later.';

// Runs before Joi validation, so normalize the email the same way the schema does.
const emailKey = (req) => String(req.body?.email ?? '').trim().toLowerCase();

const createLimiter = ({ windowMs, limit, keyGenerator, skipSuccessfulRequests }) =>
  rateLimit({
    windowMs,
    limit,
    keyGenerator,
    skipSuccessfulRequests,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res, next) => next(new ApiError(429, TOO_MANY)),
  });

// Per-IP limit stops one client hammering many accounts; per-email limit stops
// many IPs targeting one account. Each route gets its own counters.
const authLimit = ({ perIp, perEmail, windowMs = 15 * MINUTE, skipSuccessfulRequests = false }) => [
  createLimiter({ windowMs, limit: perIp, keyGenerator: (req) => ipKeyGenerator(req.ip), skipSuccessfulRequests }),
  createLimiter({ windowMs, limit: perEmail, keyGenerator: emailKey, skipSuccessfulRequests }),
];

module.exports = {
  // Only failed logins count, so normal use never hits the limit.
  loginLimiter: authLimit({ perIp: 20, perEmail: 10, skipSuccessfulRequests: true }),
  forgotPasswordLimiter: authLimit({ perIp: 10, perEmail: 3 }),
  resetPasswordLimiter: authLimit({ perIp: 20, perEmail: 10 }),
};
