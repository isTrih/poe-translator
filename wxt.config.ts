import { defineConfig } from 'wxt';

/**
 * WXT配置文件
 * 声明插件所需的权限和功能
 */
export default defineConfig({
  modules: ['@wxt-dev/module-vue','@wxt-dev/auto-icons'],
  browser: 'edge',
  // 添加调试端口配置
  manifest: {
    name: 'Dend-POE助手',
        author: {
      email: 'istrih@icloud.com',
    },
    description:
      '用于翻译一些流放之路常见的网站',
    version: '0.1.1',
    permissions: ['storage', 'tabs'],
    host_permissions: ['*://wealthyexile.com/*'],
    // 允许内容脚本访问翻译文件
    web_accessible_resources: [{
      resources: ['translations/*.json'],
      matches: ['*://wealthyexile.com/*']
    }]
  },
});
