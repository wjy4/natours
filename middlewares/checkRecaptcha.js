// middlewares/checkRecaptcha.js

const axios = require('axios');

module.exports = async (req, res, next) => {
  try {
    const recaptchaToken = req.body.recaptchaToken;

    if (!recaptchaToken) {
      return res.status(400).json({ message: 'Recaptcha token is missing' });
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;

    const response = await axios.post(verifyUrl);

    if (!response.data.success) {
      return res.status(400).json({ message: 'Recaptcha verification failed' });
    }

    next();
  } catch (err) {
    console.error('[Recaptcha Error]', err);
    res.status(500).json({ message: 'Recaptcha verification failed' });
  }
};
