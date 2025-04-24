const express = require('express');
// const viewsController = require('../controllers/viewsController'); // ✅ 放在 console.log 之前

let viewsController;
try {
  viewsController = require('../controllers/viewsController');
  console.log('[DEBUG] viewsController =', viewsController);
} catch (err) {
  console.error('[ERROR] viewsController failed to load:', err);
}

const authController = require('../controllers/authController');

const router = express.Router();

router.use(viewsController.alerts);

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData,
);
console.log(
  '[DEBUG] viewsController.getOverview =',
  viewsController.getOverview,
);
console.log('[DEBUG] authController.isLoggedIn =', authController.isLoggedIn);

module.exports = router;
