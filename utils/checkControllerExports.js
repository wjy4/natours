const fs = require('fs');
const path = require('path');

const checkControllerExports = (controllerName) => {
  const filePath = path.join(__dirname, `../controllers/${controllerName}.js`);

  try {
    const controller = require(filePath);

    const failed = [];
    for (const [key, val] of Object.entries(controller)) {
      if (typeof val === 'undefined') {
        failed.push(key);
      }
    }

    if (failed.length > 0) {
      console.error(
        `❌ [CHECK FAILED] ${controllerName} exports undefined for:`,
        failed,
      );
    } else {
      console.log(`✅ [OK] All exports from ${controllerName} are valid`);
    }
  } catch (err) {
    console.error(
      `🔥 Error loading controller ${controllerName}: ${err.message}`,
    );
  }
};

// 批量检查你想要的 controller 文件
[
  'viewsController',
  'authController',
  'tourController',
  'userController',
  'bookingController',
].forEach(checkControllerExports);
