// routes/viewRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const viewsController = require('../controllers/viewsController'); // 确保路径正确
const tourController = require('../controllers/tourController');
const reviewController = require('../controllers/reviewController');
const billingController = require('../controllers/billingController');

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
router.post(
  '/reviews',
  authController.protect, // 确保登录
  reviewController.createReview,
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

router.get(
  '/update-tour/:id',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  viewsController.getUpdateTour,
);

router.post(
  '/submit-tour-data',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  tourController.uploadTourImages,
  tourController.resizeTourImages,
  tourController.parseTourFields,
  tourController.createTour,
);

// viewRoutes.js
router.get('/my-reviews', authController.protect, viewsController.getMyReviews);
// routes/viewRoutes.js
router.delete(
  '/delete-review/:id',
  authController.protect,
  reviewController.deleteReview,
);
router.get(
  '/billing',
  authController.protect,
  billingController.getBillingPage,
);

// Optionally: 获取付款详情的 API
router.get(
  '/api/v1/billing/payment/:paymentIntentId',
  authController.protect,
  billingController.getPaymentDetails,
);

router.get(
  '/manage-users',
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.getManageUsers,
);
router.get(
  '/manage-reviews',
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.getManageReviews,
);
router.get(
  '/manage-bookings',
  authController.protect,
  authController.restrictTo('admin'),
  viewsController.getManageBookings,
);

module.exports = router;
