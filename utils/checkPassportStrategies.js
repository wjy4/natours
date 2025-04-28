const passport = require('passport');
require('./passport'); // 确保这里加载了你的 Google Strategy

const strategies = Object.keys(passport._strategies);

if (!strategies.includes('google')) {
  console.error('❌ [Passport Check] Google strategy is NOT registered!');
  process.exit(1); // 退出，阻止部署
}

console.log('✅ [Passport Check] Google strategy is registered.');
