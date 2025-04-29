// controllers/billingController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getBillingPage = (req, res) => {
  res.status(200).render('billing', {
    title: 'Your Billing History',
  });
};

exports.getPaymentDetails = catchAsync(async (req, res, next) => {
  const { paymentIntentId } = req.params;

  if (!paymentIntentId)
    return next(new AppError('Payment Intent ID is required', 400));

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  res.status(200).json({
    status: 'success',
    data: {
      paymentIntent,
    },
  });
});
