#!/bin/bash

# 脚本名称: deploy-heroku.sh
# 作用: 自动检查controllers并部署到Heroku
export $(cat config.env | xargs)

echo "🚀 Running Controller Checks..."

# 执行 controller 检查
node utils/checkControllerExports.js
node utils/checkRouteHandlers.js

# 检查上一条命令是否成功
if [ $? -ne 0 ]; then
  echo "❌ Controller export check failed. Fix the issues before deploying!"
  exit 1
fi

echo "✅ Controller export check passed."

echo "🚀 Adding files to Git..."

# 添加所有更改
git add .

# 提交更改
git commit -m "chore: auto deploy to heroku with precheck" || echo "⚠️ No new changes to commit."

echo "🚀 Pushing to Heroku..."

# 推送到 Heroku
git push heroku main

echo "✅ Deployment Complete!"
