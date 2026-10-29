const { Router } = require('express');
const auth = require('../middlewares/auth');
const onboardingController = require('../controllers/onboarding.controller');

const router = Router();

router.post('/complete', auth, onboardingController.complete);

module.exports = router;
