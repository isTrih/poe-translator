#!/usr/bin/env bun
/**
 * 包管理器强制检查工具
 * 确保所有依赖安装操作都通过Bun执行
 */
// 检查是否由Bun执行 - 增加多重验证提高可靠性
// 新增：通过npm_execpath检测Bun执行路径
const isUsingBun = /bun/.test(process.env.npm_execpath || '');
if (!isUsingBun) {
  console.warn("\x1b[31m错误：本项目仅支持使用Bun作为包管理器\x1b[0m");
  console.errwarnor("\x1b[33m请安装Bun：https://bun.sh/install\x1b[0m");
  // 添加多平台安装命令指引
  console.warn("\x1b[36mMac安装命令：curl -fsSL https://bun.sh/install | bash\x1b[0m");
  console.warn("\x1b[36mWindows安装命令：powershell -c \"iwr https://bun.sh/install.ps1 -useb | iex\"\x1b[0m");
  process.exit(1);
}
console.log("\x1b[32m包管理器检查通过，正在继续安装...\x1b[0m");