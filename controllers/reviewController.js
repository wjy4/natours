const Review = require('../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const factory = require('./handlerFactory');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createReview = catchAsync(async (req, res, next) => {
  const { tour, user } = req.body;

  const booking = await Booking.findOne({ tour, user });

  if (!booking) {
    return next(
      new AppError('You can only review tours you have actually booked!', 403),
    );
  }

  // 检查是否已经评论过
  const existingReview = await Review.findOne({ tour, user });
  if (existingReview) {
    return next(
      new AppError(
        'You have already submitted a review for this tour. Please edit your existing review instead.',
        400,
      ),
    );
  }

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourID;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });

  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  // ✅ 查出该用户对这些 tour 的所有 review
  const reviews = await Review.find({
    user: req.user.id,
    tour: { $in: tourIDs },
  });

  // 🧠 做一个 Map，记录每个 tour 是否已经评论过
  const reviewedTourIDs = new Set(reviews.map((rev) => rev.tour.toString()));

  // ✅ 给每个 tour 添加一个字段：是否已被评论
  const toursWithReviewStatus = tours.map((tour) => {
    const hasReviewed = reviewedTourIDs.has(tour._id.toString());
    return {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      ...tour._doc,
      hasReviewed,
    };
  });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours: toursWithReviewStatus,
  });
});

// controller/reviewController.js
exports.renderReviewForm = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).render('submit-review', {
    title: `Review ${tour.name}`,
    tour,
    user: req.user,
  });
});

exports.getMyAccount = catchAsync(async (req, res, next) => {
  // Get user data
  const user = await User.findById(req.user.id);

  // ✅ Get all reviews by current user
  const reviews = await Review.find({ user: req.user.id }).populate('tour');

  res.status(200).render('account', {
    title: 'Your account',
    user,
    reviews, // 👈 传给页面
  });
});

// controllers/reviewController.js
exports.renderMyReviews = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  const [reviews, totalReviews] = await Promise.all([
    Review.find({ user: req.user.id })
      .populate('tour', 'name slug imageCover')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt'),
    Review.countDocuments({ user: req.user.id }),
  ]);

  const totalPages = Math.ceil(totalReviews / limit);

  res.status(200).render('my-reviews', {
    title: 'My Reviews',
    reviews,
    currentPage: page,
    totalPages,
  });
});

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReviews = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
