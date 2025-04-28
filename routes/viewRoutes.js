// routes/viewRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const viewsController = require('../controllers/viewsController'); // 确保路径正确
const tourController = require('../controllers/tourController');

const router = express.Router();

// 使用 alert 中间件
router.use(viewsController.alerts);

// 路由配置
router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);

router.get('/signup', viewsController.getSignupForm);
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData,
);

router.get(
  '/manage-tours',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  viewsController.getManageTours,
);
router.get(
  '/create-tour',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  viewsController.getCreateTour,
);
router.post(
  '/submit-tour-data',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  tourController.uploadTourImages,
  tourController.resizeTourImages,
  tourController.createTour,
);

module.exports = router;
