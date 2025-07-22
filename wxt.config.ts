import { defineConfig } from 'wxt';
import tailwindcss from "@tailwindcss/vite";
import removeConsole from 'vite-plugin-remove-console';

/**
 * WXT配置文件
 * 声明插件所需的权限和功能
 */
export default defineConfig({
  vite: (configEnv) => ({
    plugins: [
      tailwindcss(),
      configEnv.mode === 'production'
        ? [removeConsole({ includes: ['log', 'warn'] })]
        : []],
  }),
  modules: ['@wxt-dev/module-vue', '@wxt-dev/auto-icons'],
  browser: 'edge',
  // 添加调试端口配置
  manifest: {
    name: 'Dend-POE助手',
    author: {
      email: 'istrih@icloud.com',
    },
    description:
      '为流放之路(Path of Exile)游戏打造的浏览器翻译扩展，支持实时翻译游戏界面文本、语言切换和自定义翻译源配置，采用暗黑破坏神风格UI设计。',
    version: '1.0.2',
    permissions: [
      "activeTab",
      "storage",
      "scripting",
    ], // 添加所有平台所需的网络权限
    host_permissions: ['<all_urls>'],
    // 允许内容脚本访问翻译文件
    web_accessible_resources: [{
      resources: ['icon.png', 'translations/*.json', 'version.json'], // 添加icon.png
      matches: ['<all_urls>']
    }]
  },
});
