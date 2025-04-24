const express = require('express');
const authController = require('../controllers/authController');
const viewsController = require('../controllers/viewsController'); // 确保正确导入控制器

const router = express.Router();

// 确保路由控制器被正常加载
console.log('[DEBUG] viewsController =', viewsController);

router.use(viewsController.alerts); // 使用 alert 中间件

// 用户登录状态处理
router.get('/', viewsController.getOverview); // 首页：查看所有旅游
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour); // 查看单个旅游详情
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm); // 登录页
router.get('/me', authController.protect, viewsController.getAccount); // 用户账户页面
router.get('/my-tours', authController.protect, viewsController.getMyTours); // 用户已预订的旅游

// 提交用户数据（例如更新个人信息）
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData,
);

console.log(
  '[DEBUG] viewsController.getOverview =',
  viewsController.getOverview,
);
console.log('[DEBUG] authController.isLoggedIn =', authController.isLoggedIn);

module.exports = router;
