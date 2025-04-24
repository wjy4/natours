const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly, please come back later.";
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  const formattedTours = tours.map((tour) => {
    return {
      ...tour.toObject(),
      startDateFormatted: tour.startDates?.[0]
        ? new Date(tour.startDates[0]).toLocaleString('en-uk', {
            month: 'long',
            year: 'numeric',
          })
        : 'N/A',
      locationsCount: tour.locations?.length || 0,
    };
  });

  res.status(200).render('overview', {
    title: 'All Tours',
    tours: formattedTours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;
  console.log(`[DEBUG] Searching for tour with slug: ${slug}`); // ✅ 打印请求的 slug

  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) {
    console.log(`[ERROR] No tour found for slug: ${slug}`); // ✅ 打印未找到的 slug
    return next(new AppError('There is no tour with that name.', 404));
  }

  console.log(`[DEBUG] Found tour: ${tour.name}`); // ✅ 确认找到的 Tour
  res.status(200).render('tour', { title: `${tour.name} Tour`, tour });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser,
  });
});
