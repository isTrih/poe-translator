# POE Translator

<div align="center">
  <!-- 为徽标添加外边距，使其下方有更多空间 -->
  <img src="assets/icon.png" width="120" alt="POE Translator Logo" style="margin-bottom: 1rem;">
  <!-- 为描述文本设置字体大小和外边距 -->
  <p style="font-size: 1.2rem; margin-bottom: 1.5rem;">🌐 为流放之路(Path of Exile)打造的浏览器翻译扩展</p>
  <!-- 为徽章容器添加间距，优化布局 -->
  <div style="display: flex; gap: 1rem; justify-content: center;">
    <a href="https://github.com/isTrih/poe-translator"><img src="https://img.shields.io/github/stars/isTrih/poe-translator?style=social" alt="GitHub Stars"></a>
    <a href="https://afdian.tv/a/istrih"><img src="https://img.shields.io/badge/爱发电-支持作者-orange" alt="爱发电支持"></a>
    <a href="https://www.gnu.org/licenses/agpl-3.0.html"><img src="https://img.shields.io/badge/License-AGPLv3-blue.svg" alt="AGPLv3 License"></a>
  </div>
  <!-- 添加贡献者模块 -->
</div>

### 贡献者
<!-- readme: contributors -start -->
<!-- readme: contributors -end -->

## ✨ 功能特性

- 🔄 实时翻译游戏界面文本
- 🌍 支持简体中文/繁体中文切换
- ⚙️ 自定义翻译源配置
- 💾 翻译缓存管理，提升加载速度
- 🎨 暗黑破坏神风格UI界面
- 🔧 支持自定义翻译文件URL
- 🚀 轻量高效，不影响游戏性能

## 📦 安装方法

### 前提条件
- Node.js 16+ 或 Bun
- Chrome/Firefox 浏览器

### 本地开发
```bash
# 克隆仓库
git clone https://github.com/isTrih/poe-translator.git
cd poe-translator

# 安装依赖
bun install

# 开发模式
bun run dev

# 构建扩展
bun run build
```
### 构建翻译文件
```bash
# 构建翻译文件
bun run build:translations
```
### 打包扩展
```bash
# 打包扩展
bun run zip
```
### 浏览器加载
1. 构建完成后，在浏览器中打开扩展管理页面
2. 启用"开发者模式"
3. 选择"加载已解压的扩展"
4. 选择项目中的`dist`文件夹

## 🖥️ 使用说明

1. 安装扩展后，点击浏览器工具栏中的扩展图标
2. 在弹出的设置面板中选择目标语言
3. 配置翻译源（可选）
4. 页面将自动刷新并应用翻译
5. 如需更新翻译，点击"刷新缓存"按钮

## 🛠️ 技术栈
- **前端框架**: Vue 3
- **构建工具**: Bun
- **扩展框架**: WXT
- **样式解决方案**: Tailwind CSS
- **编程语言**: TypeScript
- **许可证**: AGPLv3

## 🤝 贡献指南
1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开Pull Request

## ❗ 故障排除
- **扩展无法加载**: 确保已启用开发者模式并选择正确的`dist`文件夹
- **翻译不生效**: 检查网络连接，尝试清除缓存
- **界面显示异常**: 确认Tailwind CSS已正确加载
- **性能问题**: 尝试禁用其他扩展，减少冲突

## 📄 许可证
本项目采用AGPLv3许可证 - 详见<mcfile name="LICENSE" path="/Users/trih/Downloads/poeProject/poe-translator/LICENSE"></mcfile>文件。

## 🙏 鸣谢与支持
- 感谢所有为本项目贡献代码的开发者
- 特别感谢流放之路社区提供的翻译资源
- 支持作者: <mcurl name="爱发电" url="https://afdian.tv/a/istrih"></mcurl>
- 作者主页: <mcurl name="踩蘑菇" url="https://www.caimogu.cc/author/istrih"></mcurl>

