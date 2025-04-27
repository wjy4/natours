const path = require('path');

/**
 * 统一项目路径解析器
 * @param {string} relativePath 相对 starter 根目录的路径
 * @returns {string} 绝对路径
 */
const resolvePath = (relativePath) => {
  return path.join(__dirname, '..', relativePath);
};

module.exports = resolvePath;
