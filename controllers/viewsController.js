// controllers/viewsController.js

const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Middleware: 处理 alert 通知
 */
const alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking') {
    res.locals.alert =
      '✅ Booking successful! Check your email for confirmation.';
  }
  next();
};

/**
 * Render: 首页概览页
 */
const getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

/**
 * Render: 具体 tour 页面
 */
const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) return next(new AppError('Tour not found.', 404));

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

/**
 * Render: 登录表单
 */
const getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

/**
 * Render: 用户个人信息页
 */
const getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

/**
 * Render: 当前用户的所有已预订的 Tour
 */
const getMyTours = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tourIDs = bookings.map((b) => b.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});

/**
 * Handle: 更新当前用户数据
 */
const updateUserData = catchAsync(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    { new: true, runValidators: true },
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});

module.exports = {
  alerts,
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  getMyTours,
  updateUserData,
};
