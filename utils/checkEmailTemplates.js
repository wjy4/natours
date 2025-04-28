const fs = require('fs');
const path = require('path');
const pug = require('pug');

// 这里是你 email 模板存放的目录
const templatesDir = path.join(__dirname, '..', 'views', 'email');

// 这里是你要检测的模板列表
const templatesToCheck = ['welcome', 'passwordReset'];

function checkTemplate(templateName) {
  const templatePath = path.join(templatesDir, `${templateName}.pug`);

  try {
    // 检查文件是否存在
    if (!fs.existsSync(templatePath)) {
      console.error(`❌ 模板不存在: ${templateName}.pug`);
      return;
    }

    // 测试能否渲染
    pug.renderFile(templatePath, {
      firstName: 'Test',
      url: 'https://example.com',
      subject: 'Test Subject',
    });

    console.log(`✅ 模板通过: ${templateName}.pug`);
  } catch (err) {
    console.error(`❌ 渲染出错: ${templateName}.pug`);
    console.error(err.message);
  }
}

function checkAllTemplates() {
  console.log('开始检测所有邮件模板...');

  templatesToCheck.forEach((templateName) => {
    checkTemplate(templateName);
  });

  console.log('✅ 检测完成');
}

checkAllTemplates();
