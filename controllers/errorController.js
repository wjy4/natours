const AppError = require('../utils/appError');

const handleCasteErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["']).*?\1 /)[0];
  const message = `Duplicate field value: ${value} Please use another value !`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. -- ${errors.join('.   --')}`;
  return new AppError(message, 400);
};

const handleJWTError = (err) =>
  new AppError('Invalid Token. Please log in again!', 401);

const handleJWTExpiredError = (err) =>
  new AppError('Your Token has expired ! Please Login again.', 401);

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  console.error('ERROR !!!!!', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went Wrong !!!! ',
    msg: err.message,
  });
};
const sendErrorProd = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      //Programming error or other unknown error: Dont leak the deatils
    }
    // 1) Log the error
    console.error('ERROR !!!!!', err);
    //2) Send gneric message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
  // B RENDERD WEBSITE
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went Wrong !!!! ',
      msg: err.message,
    });
    //Programming error or other unknown error: Dont leak the deatils
  }
  // 1) Log the error
  console.error('ERROR !!!!!', err);
  //2) Send gneric message
  return res.status(err.statusCode).render('error', {
    title: 'Something went Wrong !!!! ',
    msg: 'Please try again later',
  });

  //Operational, Trusted error : send message to client
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err);
    error.message = err.message;
    error.statusCode = err.statusCode;

    if (error.name === 'CastError') error = handleCasteErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError(error);
    sendErrorProd(error, req, res);
  }
};
