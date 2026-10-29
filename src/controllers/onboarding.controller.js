// Idempotent: calling it again after onboarding is done just returns the user.
const complete = async (req, res) => {
  const user = req.user;
  if (!user.onboardingComplete) {
    user.onboardingComplete = true;
    await user.save();
  }
  res.json({ user });
};

module.exports = { complete };
