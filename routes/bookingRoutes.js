const express = require('express');
const bodyParser = require('body-parser');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

// 1️⃣ 提前定义好 middleware
const rawBodyMiddleware = bodyParser.raw({ type: 'application/json' });

/**
 * 注意！必须先声明中间件 function，再用！
 * 不能在 router.post 参数里直接 bodyParser.raw(...)
 */
router.post(
  '/webhook-checkout',
  rawBodyMiddleware,
  bookingController.webhookCheckout,
);

// 正常 jwt 保护后面的路由
router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

// routes/bookingRoutes.js
router
  .route('/:id')
  .get(authController.protect, bookingController.getBooking)
  .patch(authController.protect, bookingController.updateBooking)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    bookingController.deleteBooking,
  );

module.exports = router;
