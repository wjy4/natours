// eslint-disable-next-line import/no-extraneous-dependencies
const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// 配置 multer
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an Image! Please upload only images.', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// 处理上传的图片并保存
// exports.resizeTourImages = catchAsync(async (req, res, next) => {
//   if (!req.files) return next();

//   const tourId = req.params.id || req.body.id;
//   if (!tourId) {
//     return next(new AppError('Missing tour ID when processing images.', 400));
//   }

//   // 处理封面图
//   if (req.files.imageCover) {
//     const imageCoverFilename = `tour-${tourId}-${Date.now()}-cover.jpeg`;
//     await sharp(req.files.imageCover[0].buffer)
//       .resize(2000, 1333)
//       .toFormat('jpeg')
//       .jpeg({ quality: 90 })
//       .toFile(`public/img/tours/${imageCoverFilename}`);
//     req.body.imageCover = imageCoverFilename;
//   }

//   // 处理其他多图
//   if (req.files.images) {
//     req.body.images = [];
//     await Promise.all(
//       req.files.images.map(async (file, i) => {
//         const filename = `tour-${tourId}-${Date.now()}-${i + 1}.jpeg`;
//         await sharp(file.buffer)
//           .resize(2000, 1333)
//           .toFormat('jpeg')
//           .jpeg({ quality: 90 })
//           .toFile(`public/img/tours/${filename}`);

//         req.body.images.push(filename);
//       }),
//     );
//   }

//   next();
// });
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  // 这里不再需要 TourId
  // const tourId = req.params.id || req.body.id;

  // 处理封面图
  if (req.files.imageCover) {
    const imageCoverFilename = `tour-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${imageCoverFilename}`);
    req.body.imageCover = imageCoverFilename;
  }

  // 处理多张图
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${Date.now()}-${i + 1}.jpeg`;
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
      }),
    );
  }

  next();
});

// 解析前端传来的 startLocation 和 locations
exports.parseTourFields = (req, res, next) => {
  try {
    if (typeof req.body.startLocation === 'string') {
      req.body.startLocation = JSON.parse(req.body.startLocation);
    }
    if (typeof req.body.locations === 'string') {
      req.body.locations = JSON.parse(req.body.locations);
    }
    next();
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid JSON format for startLocation or locations',
    });
  }
};

// 其他基本路由逻辑
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);

// exports.updateTour = catchAsync(async (req, res, next) => {
//   console.log('Request body:', req.body);

//   const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!updatedTour) {
//     return next(new AppError('No tour found with that ID.', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       data: updatedTour,
//     },
//   });
// });
// exports.updateTour = catchAsync(async (req, res, next) => {
//   console.log('Incoming Request body:', req.body);

//   // 处理 guides 字段，把对象转成 ObjectId
//   if (req.body.guides && Array.isArray(req.body.guides)) {
//     req.body.guides = req.body.guides
//       .map((guide) => {
//         if (typeof guide === 'object' && guide._id) {
//           return guide._id; // 如果是对象，取_id
//         }
//         if (typeof guide === 'string') {
//           return guide; // 如果已经是ID字符串，直接返回
//         }
//         return null;
//       })
//       .filter(Boolean); // 过滤掉空值
//   }

//   const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!updatedTour) {
//     return next(new AppError('No tour found with that ID.', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       data: updatedTour,
//     },
//   });
// });
exports.updateTour = catchAsync(async (req, res, next) => {
  console.log('Incoming Request body:', req.body);

  // 处理 guides 字段，只取 _id
  if (req.body.guides && Array.isArray(req.body.guides)) {
    req.body.guides = req.body.guides
      .map((guide) => {
        if (typeof guide === 'object' && guide._id) {
          return guide._id; // 如果是对象，取_id
        }
        if (typeof guide === 'string') {
          return guide; // 如果已经是ID字符串，直接用
        }
        return null;
      })
      .filter(Boolean);
  }

  // 处理 locations 字段，只保留必要字段
  if (req.body.locations && Array.isArray(req.body.locations)) {
    req.body.locations = req.body.locations.map((loc) => {
      if (typeof loc === 'object') {
        return {
          type: loc.type || 'Point',
          coordinates: loc.coordinates,
          description: loc.description,
          day: loc.day,
        };
      }
      return loc;
    });
  }

  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedTour) {
    return next(new AppError('No tour found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: updatedTour,
    },
  });
});

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { numTourStarts: -1 } },
    { $limit: 12 },
  ]);

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: { plan },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in format lat,lng.',
        400,
      ),
    );
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng * 1, lat * 1], radius] },
    },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { data: tours },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude and longitude in format lat,lng.',
        400,
      ),
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: { data: distances },
  });
});
