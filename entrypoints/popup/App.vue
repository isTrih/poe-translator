<script lang="ts" setup>
import { ref, onMounted } from 'vue';

/**
 * 语言选择组件
 * 允许用户在简体中文和繁体中文之间切换
 * 并将选择保存到浏览器本地存储
 */
const selectedLanguage = ref<'simplified' | 'traditional'>('traditional');

/**
 * 从浏览器存储加载用户语言偏好
 */
async function loadLanguagePreference() {
  try {
    const { language } = await browser.storage.local.get('language');
    if (language && ['simplified', 'traditional'].includes(language)) {
      selectedLanguage.value = language as 'simplified' | 'traditional';
    }
  } catch (error) {
    console.error('加载语言设置失败:', error);
  }
}

/**
 * 保存用户语言选择到浏览器存储
 */
async function saveLanguagePreference() {
  try {
    await browser.storage.local.set({ language: selectedLanguage.value });
    // 通知content script刷新翻译
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (tabs[0].id) {
        browser.tabs.reload(tabs[0].id);
      }
    });
  } catch (error) {
    console.error('保存语言设置失败:', error);
  }
}


// URL配置相关
const translationUrlPrefix = ref('');
const isSaving = ref(false);

/**
 * 从存储加载URL前缀配置
 */
async function loadUrlPrefixConfig() {
  try {
    const { translationUrlPrefix: savedPrefix } = await browser.storage.local.get('translationUrlPrefix');
    translationUrlPrefix.value = savedPrefix || 'https://raw.githubusercontent.com/isTrih/poe-translator/refs/heads/main/public/translations/';
  } catch (error) {
    console.error('加载URL配置失败:', error);
    translationUrlPrefix.value = 'https://raw.githubusercontent.com/isTrih/poe-translator/refs/heads/main/public/translations/';
  }
}

/**
 * 保存URL前缀配置
 */
async function saveUrlPrefixConfig() {
  if (!translationUrlPrefix.value.trim()) return;

  isSaving.value = true;
  try {
    await browser.storage.local.set({
      translationUrlPrefix: translationUrlPrefix.value.trim()
    });
    // 清除缓存并刷新页面
    await browser.storage.local.remove(['translations_simplified', 'translations_traditional']);
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (tabs[0].id) browser.tabs.reload(tabs[0].id);
    });
    alert('URL配置已保存并生效');
  } catch (error) {
    console.error('保存URL配置失败:', error);
    alert('保存失败，请重试');
  } finally {
    isSaving.value = false;
  }
}

// 加载所有配置
onMounted(async () => {
  await loadLanguagePreference();
  await loadUrlPrefixConfig();
});

/**
 * 清除翻译缓存并刷新页面
 */
async function clearTranslationCache() {
  try {
    // 清除存储中的翻译缓存
    await browser.storage.local.remove(['translations_simplified', 'translations_traditional']);
    console.log('翻译缓存已清除');

    // 刷新当前页面以加载最新翻译
    browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
      if (tabs[0].id) {
        browser.tabs.reload(tabs[0].id);
      }
    });

    alert('翻译缓存已清除，页面将刷新以加载最新数据');
  } catch (error) {
    console.error('清除缓存失败:', error);
    alert('清除缓存失败，请重试');
  }
}

/**
 * 打开Wealthy Exile仓库页面
 */
const openWealthyExileStash = () => {
  window.open('https://wealthyexile.com/stash', '_blank');
};

// 添加版本信息相关状态
const configVersion = ref<string | null>(null);
const versionLoading = ref<boolean>(false);
const versionError = ref<string | null>(null);

/**
 * 从content script获取配置版本信息
 */
async function fetchConfigVersion() {
  versionLoading.value = true;
  versionError.value = null;
  try {
    // 获取当前活动标签页
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) {
      throw new Error('无法获取当前标签页ID');
    }

    // 向content script发送版本查询请求
    const response = await browser.tabs.sendMessage(tab.id, { action: 'getVersion' });
    configVersion.value = response?.version || '未知版本（或功能未开启）';
  } catch (error) {
    console.error('获取版本信息失败:', error);
    versionError.value = '无法获取版本信息';
  } finally {
    versionLoading.value = false;
  }
}

// 在加载配置后获取版本信息
onMounted(async () => {
  await loadLanguagePreference();
  await loadUrlPrefixConfig();
  // 获取版本信息
  await fetchConfigVersion();
});
// 版本更新检查相关状态
const localVersion = ref('');
const remoteVersion = ref('');
const updateAvailable = ref(false);
const checkUpdateLoading = ref(false);
const updateCheckError = ref(false);

/**
 * 从本地version.json文件获取当前版本
 */
async function getLocalVersion() {
  try {
    const response = await fetch('/version.json', {
      cache: 'no-store' // 不缓存本地文件
    });
    const data = await response.json();
    localVersion.value = data.version || '';
    return data.version || '';
  } catch (error) {
    console.error('获取本地版本失败:', error);
    localVersion.value = '未知版本';
    return '';
  }
}

/**
 * 从远程服务器获取最新版本信息
 * @returns 远程版本号
 */

// 定义版本检查响应接口
// 在函数外部添加接口定义
interface VersionCheckRequest {
  action: 'checkVersion';
}

interface VersionCheckResponse {
  success: boolean;
  version?: string;
  error?: string;
}

async function getRemoteVersion() {
  try {
    console.log('Popup发送版本请求...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // 使用Promise.race实现超时控制，移除sendMessage的signal参数
    const response: VersionCheckResponse = await Promise.race([
      browser.runtime.sendMessage<VersionCheckRequest, VersionCheckResponse>({
        action: 'checkVersion'
      }),
      new Promise<never>((_, reject) => {
        controller.signal.addEventListener('abort', () => {
          reject(new Error('版本请求超时'));
        });
      })
    ]);
    
    clearTimeout(timeoutId);
    console.log('Popup收到响应:', response);
    
    if (!response) {
      throw new Error('未收到Background响应');
    }
    
    if (response.success) {
      remoteVersion.value = response.version || '';
      return response.version || '';
    } else {
      console.error('版本请求失败:', response.error);
      updateCheckError.value = true;
      return '';
    }
  } catch (error) {
    // 错误处理逻辑
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('版本请求超时');
      } else {
        console.error('Popup通信错误:', error.message);
      }
    } else {
      console.error('未知错误:', error);
    }
    updateCheckError.value = true;
    return '';
  }
}

/**
 * 比较两个版本号
 * @param local - 本地版本号
 * @param remote - 远程版本号
 * @returns 如果远程版本更新则返回true
 */
function isNewVersionAvailable(local: string, remote: string): boolean {
  if (!local || !remote) return false;

  const localParts = local.split('.').map(Number);
  const remoteParts = remote.split('.').map(Number);

  // 比较每个版本段
  for (let i = 0; i < Math.max(localParts.length, remoteParts.length); i++) {
    const localPart = localParts[i] || 0;
    const remotePart = remoteParts[i] || 0;

    if (remotePart > localPart) return true;
    if (remotePart < localPart) return false;
  }

  return false; // 版本相同
}

/**
 * 检查是否有新版本可用
 */
async function checkForUpdates() {
  checkUpdateLoading.value = true;
  updateCheckError.value = false;
  updateAvailable.value = false;

  try {
    // 并行获取本地和远程版本
    const [local, remote] = await Promise.all([
      getLocalVersion(),
      getRemoteVersion()
    ]);

    // 比较版本
    updateAvailable.value = isNewVersionAvailable(local, remote);
  } finally {
    checkUpdateLoading.value = false;
  }
}

// 在组件挂载时检查更新
onMounted(async () => {
  await loadLanguagePreference();
  await loadUrlPrefixConfig();
  await fetchConfigVersion();
  await checkForUpdates(); // 添加版本检查
});

/**
 * 下载当前网站的未翻译文本文件
 */
async function downloadUntranslated() {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) {
      alert('无法获取当前标签页');
      return;
    }
    
    const response = await browser.tabs.sendMessage(tab.id, { action: 'downloadUntranslated' });
    const untranslatedData = response?.data || {};
    
    if (Object.keys(untranslatedData).length === 0) {
      alert('没有未翻译的文本');
      return;
    }
    
    // 获取当前域名并生成文件名
    const url = new URL(tab.url || 'https://unknown.com');
    const domain = url.hostname.replace(/^www\./, '');
    const fileName = `UN_${domain}.json`;
    
    // 构建JSON数据
    const jsonData = JSON.stringify({ [fileName]: untranslatedData }, null, 2);
    
    // 创建下载链接
    const blob = new Blob([jsonData], { type: 'application/json' });
    const urlObject = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = urlObject;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(urlObject);
    }, 0);
    
  } catch (error) {
    console.error('下载未翻译文本失败:', error);
    alert('下载失败，请重试');
  }
}
</script>

<template>
  <div
    class="container w-82 bg-gray-950 text-red-100 shadow-[0_0_20px_rgba(120,0,0,0.4)] overflow-hidden border-2 border-gray-800">
    <!-- 头部装饰条 -->
    <div class="h-1.5 bg-gradient-to-r from-red-900 via-red-700 to-amber-700"></div>
    <div v-if="updateAvailable"
      class="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
      <span>有新版本可用！</span>
      <a href="https://github.com/isTrih/poe-translator/releases" target="_blank" class="text-white underline">立即下载</a>
    </div>
    <div class="pl-4 pt-4 pr-4 pb-3">
      <!-- Wealthy Exile 按钮 -->
      <div class="mb-5">
        <button @click="openWealthyExileStash"
          class="w-full cursor-pointer bg-gray-900/90 hover:bg-gray-800 border border-red-900/50 text-amber-300 py-2.5 px-3 rounded-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_8px_rgba(180,0,0,0.3)] hover:shadow-[0_0_12px_rgba(180,0,0,0.5)]">
          <span class="text-red-500">⚔️</span> Wealthy Exile（大宗交易所）
        </button>
      </div>

      <!-- 语言设置区域 -->
      <div class="mb-6">
        <h2 class="text-xl font-bold text-red-500 mb-2 text-shadow">语言设置
          <span class="text-xs text-red-400/60 text-center mt-1">（选择后页面将自动刷新）</span>
        </h2>

        <div class="language-selector flex flex-col gap-2.5">
          <label
            class="radio-label flex items-center p-3 bg-gray-900/70 border border-gray-800 cursor-pointer hover:border-red-800 transition duration-300 hover:bg-gray-800/70">
            <input type="radio" value="simplified" v-model="selectedLanguage" @change="saveLanguagePreference"
              class="accent-red-600 mr-3 h-4 w-4" />
            <span class="text-amber-200">简体中文</span>
          </label>
          <label
            class="radio-label flex items-center p-3 bg-gray-900/70 border border-gray-800 cursor-pointer hover:border-red-800 transition duration-300 hover:bg-gray-800/70">
            <input type="radio" value="traditional" v-model="selectedLanguage" @change="saveLanguagePreference"
              class="accent-red-600 mr-3 h-4 w-4" />
            <span class="text-amber-200">繁体中文</span>
          </label>
        </div>
      </div>

      <!-- 翻译源配置区域 -->
      <div class="mb-5 bg-gray-900/60 p-3.5 rounded-sm border border-gray-800 shadow-inner">
        <h3 class="text-lg font-semibold text-red-400 mb-2.5">自定义翻译源配置</h3>
        <div class="input-group flex gap-2.5 mb-2.5">
          <input type="text" v-model="translationUrlPrefix" placeholder="输入翻译文件URL前缀"
            class="flex-1 bg-gray-900 border border-gray-800 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-red-600 text-red-200" />
          <button @click="saveUrlPrefixConfig" :disabled="isSaving"
            class="bg-red-900/80 cursor-pointer hover:bg-red-800 px-4 py-2.5 text-sm rounded-sm transition duration-300 disabled:bg-gray-800 text-amber-300 border border-red-900/50">
            {{ isSaving ? '保存中...' : '保存' }}
          </button>
        </div>
        <p class="hint text-xs text-red-500/90">配置示例: https://example.com/translations/</p>

        <!-- 版本信息 -->
        <div class="version-info mt-3 text-xs text-red-400/80">
          <span v-if="versionLoading">加载版本中...</span>
          <span v-else-if="versionError" class="text-red-500">{{ versionError }}</span>
          <span v-else>当前翻译版本: {{ configVersion }}</span>
        </div>
        <div class="version-info mt-3 text-xs text-red-400/80">
          <span>当前版本: {{ localVersion }}</span>
        </div>
                <div class="version-info mt-3 text-xs text-red-400/80">
          <span>最新版本: {{ remoteVersion }}</span>
        </div>
      </div>

      <!-- 底部按钮区域 -->
      <div class="cache-control flex gap-2.5">
        <button @click="clearTranslationCache"
          class="flex-1 bg-gray-900/80 hover:bg-gray-800 text-sm py-2.5 px-3 rounded-sm border border-gray-800 transition duration-300 text-red-200">
          刷新缓存
        </button>
        <a href="https://afdian.tv/a/istrih" target="_blank"
          class="w-16 h-10 flex items-center justify-center bg-gray-900/80 hover:bg-gray-800 rounded-sm border border-gray-800 transition duration-300 text-amber-300">
          <span class="text-red-500">赞助我</span>
        </a>
      </div>
    </div>

    <!-- 信息提示 -->
    <p class="text-xs text-red-400 mb-1.5 text-center">
      <a href="https://www.caimogu.cc/user/1297700.html" target="_blank"
        class="hover:text-amber-400 transition-colors">踩蘑菇主页</a>
      <span class="mx-1">|</span>
      <a href="https://github.com/isTrih/poe-translator" target="_blank"
        class="hover:text-amber-400 transition-colors">项目Github</a>
    </p>
    <p class="text-xs text-red-500/80 mb-2.5 text-center" @click="downloadUntranslated">三氢超正经©copyright</p>
  </div>
</template>

<style scoped>
/* 暗黑破坏神风格文字阴影 */
.text-shadow {
  text-shadow: 0 0 5px rgba(180, 0, 0, 0.7), 0 0 2px rgba(255, 215, 0, 0.5);
}
</style>

