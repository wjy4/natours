const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = catchAsync(async (req, res, next) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { review },
    });
  } catch (err) {
    if (err.code === 11000) {
      return next(new AppError('You have already reviewed this tour.', 400));
    }
    next(err);
  }
});

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
