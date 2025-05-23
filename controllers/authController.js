const crypto = require('crypto');
const { promisify } = require('util');

// eslint-disable-next-line import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  //Remove the password from the output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'Success',
    token,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  try {
    let userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    };

    if (process.env.NODE_ENV === 'development') {
      userData = { ...req.body };
    } else {
      userData.role = 'user';
    }

    const newUser = await User.create(userData);

    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, res);
  } catch (err) {
    console.error('[SIGNUP ERROR]', err); // ⭐⭐ 打印出来具体错误
    next(err);
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) First to check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password ! ', 400));
  }

  //2) Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password ', 401));
  }
  //3) If everything is okay, send token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  res.status(200).json({ status: 'Success' });
};

// exports.protect = catchAsync(async (req, res, next) => {
//   //1) Get token from current user and check if its exist
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer ')
//   ) {
//     const parts = req.headers.authorization.split(' ');
//     if (parts.length === 2) {
//       token = parts[1];
//     }
//   } else if (req.cookies.jwt) {
//     token = req.cookies.jwt;
//   }

//   if (!token) {
//     return next(
//       new AppError('You are not logged in ! Please login to get access.', 401),
//     );
//   }
//   //2) Verification Token: make sure there are no change on token
//   const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//   //3) Check if user still exists
//   const currentUser = await User.findById(decoded.id);
//   if (!currentUser) {
//     return next(
//       new AppError(
//         'The user belonging to this token does no longer exist.',
//         401,
//       ),
//     );
//   }
//   //4) Check if user changed password after the JWT token was issued
//   if (currentUser.changePasswordAfter(decoded.iat)) {
//     return next(
//       new AppError('User recently changed password ! PLease login again', 401),
//     );
//   }

//   req.user = currentUser;
//   res.locals.user = currentUser;
//   next();
// });
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token from cookies or headers
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // 2) If token not found
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401),
    );
  }

  let decoded;
  try {
    // 3) Verify token
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid token. Please log in again.', 401));
  }

  // 4) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401),
    );
  }

  // 5) Check if password was changed after the token was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again.', 401),
    );
  }

  // 6) Grant access to protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

//Only for rendered pages, no errors !!
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies && req.cookies.jwt) {
    try {
      // 1) Verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the JWT was issued
      if (currentUser.changePasswordAfter(decoded.iat)) {
        return next();
      }

      // ✅ User is logged in
      res.locals.user = currentUser;
    } catch (err) {
      return next();
    }
  }
  return next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles is a array: [admin, lead-guide]
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action !',
          403,
        ),
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on Posted Email

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no User with the eamil address', 404));
  }
  //2) Generate the random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3) Send it to user email

  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email !',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Please try again later',
        500,
      ),
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get User based on the Token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });

  //2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired !', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();
  //3) Update changedPasswordAt Property for the user

  //4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get the user from collection
  const user = await User.findById(req.user.id).select('+password');
  //2) Check if the post password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your Current password is Wrong', 401));
  }
  //3) If so, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //4) Log the user in, sent JWT and login with the new password that is updates.
  createSendToken(user, 200, res);
});
