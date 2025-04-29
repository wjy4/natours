// controllers/viewsController.js

const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const { formatDistanceToNow } = require('date-fns');

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

  // 在后端提前处理 startDateFormatted
  const toursWithFormattedDates = tours.map((tour) => {
    const tourObj = tour.toObject(); // 把 Mongoose 文档转成普通 JS 对象

    // 格式化第一个 startDate
    tourObj.startDateFormatted =
      tour.startDates && tour.startDates.length > 0
        ? new Date(tour.startDates[0]).toLocaleString('en-UK', {
            month: 'long',
            year: 'numeric',
          })
        : 'N/A';

    // 补上 locationsCount，如果需要
    tourObj.locationsCount = tour.locations ? tour.locations.length : 0;

    return tourObj;
  });

  res.status(200).render('overview', {
    title: 'All Tours',
    tours: toursWithFormattedDates,
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
// const getMyTours = catchAsync(async (req, res) => {
//   const bookings = await Booking.find({ user: req.user.id });

//   let tours = [];
//   let noBookings = false;

//   if (bookings.length === 0) {
//     noBookings = true;

//     // 如果没有 bookings, 给他推荐 top 5 tours
//     tours = await Tour.find()
//       .sort('-ratingsAverage price')
//       .limit(5)
//       .select(
//         'name price ratingsAverage summary difficulty imageCover slug startDates locations maxGroupSize ratingsQuantity',
//       );

//     tours = tours.map((tour) => {
//       const tourObj = tour.toObject();

//       tourObj.startDateFormatted =
//         tour.startDates && tour.startDates.length > 0
//           ? new Date(tour.startDates[0]).toLocaleString('en-UK', {
//               month: 'long',
//               year: 'numeric',
//             })
//           : 'Coming soon';

//       tourObj.locationsCount = tour.locations ? tour.locations.length : 0;

//       return tourObj;
//     });
//   } else {
//     const tourIDs = bookings.map((b) => b.tour);
//     const bookedTours = await Tour.find({ _id: { $in: tourIDs } });

//     tours = bookedTours.map((tour) => {
//       const tourObj = tour.toObject();

//       tourObj.startDateFormatted =
//         tour.startDates && tour.startDates.length > 0
//           ? new Date(tour.startDates[0]).toLocaleString('en-UK', {
//               month: 'long',
//               year: 'numeric',
//             })
//           : 'Coming soon';

//       tourObj.locationsCount = tour.locations ? tour.locations.length : 0;

//       return tourObj;
//     });
//   }

//   res.status(200).render('overview', {
//     title: noBookings ? 'Recommended Tours' : 'My Tours',
//     tours,
//     noBookings,
//     showReview: !noBookings, // ✅ 只有真正预订的用户才能评论
//   });
// });
const getMyTours = catchAsync(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id });

  let tours = [];
  let noBookings = false;

  if (bookings.length === 0) {
    noBookings = true;

    tours = await Tour.find()
      .sort('-ratingsAverage price')
      .limit(5)
      .select(
        'name price ratingsAverage summary difficulty imageCover slug startDates locations maxGroupSize ratingsQuantity',
      );

    tours = tours.map((tour) => {
      const tourObj = tour.toObject();

      tourObj.startDateFormatted = tour.startDates?.[0]
        ? new Date(tour.startDates[0]).toLocaleString('en-UK', {
            month: 'long',
            year: 'numeric',
          })
        : 'Coming soon';

      tourObj.locationsCount = tour.locations?.length || 0;

      return tourObj;
    });
  } else {
    const tourIDs = bookings.map((b) => b.tour);
    const bookedTours = await Tour.find({ _id: { $in: tourIDs } });

    const reviews = await Review.find({ user: req.user.id });

    tours = bookedTours.map((tour) => {
      const tourObj = tour.toObject();

      tourObj.startDateFormatted = tour.startDates?.[0]
        ? new Date(tour.startDates[0]).toLocaleString('en-UK', {
            month: 'long',
            year: 'numeric',
          })
        : 'Coming soon';

      tourObj.locationsCount = tour.locations?.length || 0;
      tourObj.hasReviewed = reviews.some(
        (r) => r.tour.toString() === tour._id.toString(),
      );

      return tourObj;
    });
  }

  res.status(200).render('overview', {
    title: noBookings ? 'Recommended Tours' : 'My Tours',
    tours,
    noBookings,
    showReview: !noBookings, // 用户有 booking 时允许评论
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

const getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Sign up for an account',
  });
};

const getManageTours = async (req, res, next) => {
  try {
    const tours = await Tour.find();
    res.status(200).render('manageTours', {
      title: 'Manage Tours',
      tours,
    });
  } catch (err) {
    next(err);
  }
};

const getCreateTour = (req, res) => {
  res.status(200).render('createTour', {
    title: 'Create New Tour',
    user: res.locals.user || null,
  });
};

const getUpdateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate({
    path: 'guides',
    select: '_id', // 指定需要返回的字段（一定包括 _id）
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).render('updateTour', {
    title: 'Update Tour',
    tour,
  });
});

const getMyReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id }).populate({
    path: 'tour',
    select: 'name slug imageCover',
  });
  const reviewsWithTime = reviews.map((r) => ({
    ...r.toObject(),
    relativeTime: formatDistanceToNow(new Date(r.createdAt), {
      addSuffix: true,
    }),
  }));

  res.status(200).render('myReviews', {
    title: 'My Reviews',
    reviews: reviewsWithTime,
    path: '/my-reviews',
  });
});

const getManageUsers = catchAsync(async (req, res) => {
  const users = await User.find().select('name email role photo');
  res.status(200).render('manageUsers', {
    title: 'Manage Users',
    users,
  });
});

const getManageReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find()
    .populate('user', 'name')
    .populate('tour', 'name');
  res.status(200).render('manageReviews', {
    title: 'Manage Reviews',
    reviews,
  });
});

const getManageBookings = catchAsync(async (req, res) => {
  const bookings = await Booking.find()
    .populate('user', 'name email')
    .populate('tour', 'name');
  res.status(200).render('manageBookings', {
    title: 'Manage Bookings',
    bookings,
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
  getSignupForm,
  getManageTours,
  getCreateTour,
  getUpdateTour,
  getMyReviews,
  getManageUsers,
  getManageReviews,
  getManageBookings,
};
