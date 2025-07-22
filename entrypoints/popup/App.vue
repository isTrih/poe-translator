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
    translationUrlPrefix.value = savedPrefix || 'https://assets.checkpoint321.com/poe/translations/';
  } catch (error) {
    console.error('加载URL配置失败:', error);
    translationUrlPrefix.value = 'https://assets.checkpoint321.com/poe/translations/';
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
    configVersion.value = response?.version || '未知版本';
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
</script>

<template>
  <div class="container">
    <div>
      <button @click="openWealthyExileStash" class="cache-button">
        Wealthy Exile
      </button>
    </div>
    <h2>语言设置</h2>
    <div class="language-selector">
      <label class="radio-label">
        <input type="radio" value="simplified" v-model="selectedLanguage" @change="saveLanguagePreference" />
        简体中文
      </label>
      <label class="radio-label">
        <input type="radio" value="traditional" v-model="selectedLanguage" @change="saveLanguagePreference" />
        繁体中文
      </label>
    </div>
    <div class="url-config-section">
      <h3>翻译源配置</h3>
      <div class="input-group">
        <input type="text" v-model="translationUrlPrefix" placeholder="输入翻译文件URL前缀" />
        <button @click="saveUrlPrefixConfig" :disabled="isSaving">
          {{ isSaving ? '保存中...' : '保存配置' }}
        </button>
      </div>
      <p class="hint">配置示例: https://example.com/translations/</p>
      <!-- 添加版本信息显示 -->
      <div class="version-info">
        <span v-if="versionLoading">加载版本中...</span>
        <span v-else-if="versionError" class="error">{{ versionError }}</span>
        <span v-else>当前配置版本: {{ configVersion }}</span>
      </div>
    </div>

    <div class="info">
      <p>选择后页面将自动刷新</p>
    </div>
    <div class="cache-control">
      <a class="w-40 ml-30" href="https://afdian.tv/a/istrih" target="_blank">
        <img class="pl-4" width="160" src="https://pic1.afdiancdn.com/static/img/welcome/button-sponsorme.png"
          alt=""></a>
      <button @click="clearTranslationCache" class="cache-button">
        刷新翻译缓存
      </button>
    </div>
  </div>
</template>

<style scoped>
.container {
  min-width: 250px;
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

h2 {
  color: #333;
  font-size: 18px;
  margin-bottom: 15px;
  text-align: center;
}

.language-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.radio-label:hover {
  background-color: #f0f0f0;
}

.radio-label input {
  accent-color: #42b883;
}

.url-config-section {
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.input-group {
  display: flex;
  gap: 8px;
  margin: 10px 0;
}

input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.hint {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}

.cache-control {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.cache-button {
  background-color: #646cff;
}

.cache-button:hover {
  background-color: #535bf2;
}

/* 添加版本信息样式 */
.version-info {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}
.error {
  color: #ff4444;
}
</style>
