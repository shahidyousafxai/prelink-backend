const { Router } = require('express');
const authRoutes = require('./auth.routes');
const onboardingRoutes = require('./onboarding.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/onboarding', onboardingRoutes);

module.exports = router;
