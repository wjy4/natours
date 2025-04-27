const express = require('express');
const bodyParser = require('body-parser');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

// 把 raw body 中间件先定义出来 ✅
const rawBodyMiddleware = bodyParser.raw({ type: 'application/json' });

// webhook 路由，使用 raw body 解析
router.post(
  '/webhook-checkout',
  rawBodyMiddleware,
  bookingController.webhookCheckout,
);

// 后面的路由正常使用 jwt 鉴权
router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
