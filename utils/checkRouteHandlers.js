// utils/checkRouteHandlers.js

const fs = require('fs');
const path = require('path');

const ROUTE_DIR = path.join(__dirname, '../routes');
const CONTROLLER_DIR = path.join(__dirname, '../controllers');

const isValidHandler = (handler) =>
  typeof handler === 'function' || Array.isArray(handler);

const checkRouteHandlers = () => {
  const routeFiles = fs
    .readdirSync(ROUTE_DIR)
    .filter((file) => file.endsWith('.js'));

  routeFiles.forEach((file) => {
    const filePath = path.join(ROUTE_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    const requires = {};
    const requirePattern =
      /const\s+(\w+)\s*=\s*require\(['"](\.\.\/controllers\/\w+)['"]\);?/g;
    let match;

    while ((match = requirePattern.exec(content)) !== null) {
      const [_, alias, controllerPath] = match;
      const absPath = path.join(__dirname, '../', controllerPath) + '.js';
      try {
        requires[alias] = require(absPath);
      } catch (e) {
        console.error(`🔥 Failed to load ${controllerPath}: ${e.message}`);
        process.exit(1);
      }
    }

    // 匹配所有像 controller.someFunc 的调用
    const handlerPattern =
      /(?:router\.(?:get|post|patch|put|delete))\([^,]+,\s*([^)]+)\)/g;
    while ((match = handlerPattern.exec(content)) !== null) {
      const handlerGroup = match[1];
      const handlerNames = handlerGroup
        .split(',')
        .map((h) => h.trim())
        .filter((h) => h.includes('.'));

      handlerNames.forEach((h) => {
        const [controllerName, funcName] = h.split('.');
        const controller = requires[controllerName];

        if (!controller || !isValidHandler(controller[funcName])) {
          console.error(
            `❌ [ROUTE ERROR] ${file}: Handler "${h}" is not defined or not a function`,
          );
          process.exit(1);
        }
      });
    }

    console.log(`✅ [OK] Route handlers in ${file} are valid`);
  });
};

checkRouteHandlers();
