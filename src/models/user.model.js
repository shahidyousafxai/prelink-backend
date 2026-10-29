const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const LANGUAGES = ['en', 'ar', 'fr', 'ur'];
const RESET_CODE_TTL_MS = 15 * 60 * 1000;
const RESET_CODE_MAX_ATTEMPTS = 5;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['patient', 'caregiver', 'clinician'], default: 'patient' },
    language: { type: String, enum: LANGUAGES, default: 'en' },
    onboardingComplete: { type: Boolean, default: false },
    // Bumped on password reset so previously issued JWTs stop working.
    tokenVersion: { type: Number, default: 0, select: false },
    passwordResetCode: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    passwordResetAttempts: { type: Number, default: 0, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Returns the raw 6-digit code (to send to the user); only its bcrypt hash is stored.
// Requesting a new code replaces the old one and resets the attempt counter.
userSchema.methods.createPasswordResetCode = async function () {
  const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  this.passwordResetCode = await bcrypt.hash(code, 10);
  this.passwordResetExpires = new Date(Date.now() + RESET_CODE_TTL_MS);
  this.passwordResetAttempts = 0;
  return code;
};

// Requires the reset fields to be selected. Each wrong guess counts toward the limit;
// once it's reached the code is burned and the user must request a new one.
userSchema.methods.verifyPasswordResetCode = async function (code) {
  if (!this.passwordResetCode || !this.passwordResetExpires || this.passwordResetExpires <= new Date()) {
    return false;
  }
  if (this.passwordResetAttempts >= RESET_CODE_MAX_ATTEMPTS) return false;

  const isMatch = await bcrypt.compare(code, this.passwordResetCode);
  if (!isMatch) {
    this.passwordResetAttempts += 1;
    await this.save({ validateBeforeSave: false });
  }
  return isMatch;
};

userSchema.methods.clearPasswordResetCode = function () {
  this.passwordResetCode = undefined;
  this.passwordResetExpires = undefined;
  this.passwordResetAttempts = 0;
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.tokenVersion;
    delete ret.passwordResetCode;
    delete ret.passwordResetExpires;
    delete ret.passwordResetAttempts;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
module.exports.LANGUAGES = LANGUAGES;
