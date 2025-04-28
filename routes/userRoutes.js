const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// ✅ signup - 这里使用 userController 的 uploadUserPhoto 和 resizeUserPhoto 中间件
router.post(
  '/signup',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  authController.signup,
);

// ✅ login/logout
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// ✅ Forgot password and Reset password
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// ✅ protect middleware after this line
router.use(authController.protect);

// ✅ user self routes
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);
router.delete('/deleteMe', userController.deleteMe);

// ✅ admin-only
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
