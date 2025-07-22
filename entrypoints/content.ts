import { TranslationMap } from '../utils/translationMap';
import "~/assets/tailwind.css";

// 添加缺失的变量声明
// 移除重复声明，下方已有变量定义
let translationVersion: string | null = null;

/**
 * 执行DOM翻译替换
 * @param lang 语言类型: 'simplified' 或 'traditional'
 */
/**
 * 加载指定语言的翻译文件（带本地缓存）
 * @param lang 语言类型: 'simplified' 或 'traditional'
 * @returns 翻译映射表Promise
 */
async function loadTranslations(lang: string): Promise<TranslationMap> {
  try {
    // 从存储获取URL前缀配置，使用默认值作为回退
    const { translationUrlPrefix } = await browser.storage.local.get('translationUrlPrefix');
    const baseUrl = translationUrlPrefix || 'https://raw.githubusercontent.com/isTrih/poe-translator/refs/heads/main/public/translations/';
    const url = `${baseUrl}${lang}.json`;

    // 检查本地缓存
    const cacheKey = `translations_${lang}`;
    const cachedData = await browser.storage.local.get(cacheKey);
    if (cachedData[cacheKey]) {
      console.log(`使用缓存的${lang}翻译数据`);
      // 从缓存中提取版本信息
      translationVersion = cachedData[cacheKey].url_version || null;
      return cachedData[cacheKey];
    }

    // 缓存未命中，从网络加载
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`加载翻译文件失败: ${response.statusText}`);
    }

    const translations = await response.json() as TranslationMap;
    // 提取并保存版本信息
    translationVersion = translations.url_version || null;
    // 保存到本地缓存（永久有效）
    await browser.storage.local.set({ [cacheKey]: translations });
    console.log(`已缓存${lang}翻译数据，版本: ${translationVersion}`);

    return translations;
  } catch (error) {
    console.error(`加载${lang}翻译失败:`, error);
    throw error;
  }
}

/**
 * 翻译页面内容的主函数 - 优先使用缓存翻译，回退到内置翻译
 * @param lang - 目标语言类型('simplified'或'traditional')
 * @param cachedTranslations - 从缓存/网络加载的翻译映射表
 */
function translatePage(lang: 'simplified' | 'traditional', cachedTranslations: TranslationMap) {
  /**
   * 将文本中的数字替换为#，并记录原始数字
   * @param text - 原始文本
   * @returns 处理后的文本和数字列表
   */
  const replaceNumbersWithHashes = (text: string): { processedText: string; numbers: string[] } => {
    const numbers: string[] = [];
    const processedText = text.replace(/\d+(\.\d+)?/g, (match) => {
      numbers.push(match);
      return '#';
    });
    return { processedText, numbers };
  };

  /**
   * 将文本中的#还原为原始数字
   * @param text - 翻译后的文本
   * @param numbers - 原始数字列表
   * @returns 还原后的文本
   */
  const restoreNumbers = (text: string, numbers: string[]): string => {
    let result = text;
    for (const num of numbers) {
      result = result.replace('#', num);
    }
    return result;
  };

  /**
   * 提取文本中的特殊模式（数字L、-数字p、-数字s）
   * @param text - 原始文本
   * @returns 修改后的文本和提取的特殊模式
   */
  const extractSpecialPatterns = (text: string): { modifiedText: string; specialPattern: string } => {
    let specialPattern = '';
    // 按优先级匹配三种模式
    const patterns = [
      { regex: / (\d+)L$/, type: 'L' },
      { regex: /- (\d+)p$/, type: 'p' },
      { regex: / - (\d+)s$/, type: 's' }
    ];

    for (const { regex } of patterns) {
      const match = text.match(regex);
      if (match) {
        specialPattern = match[0];
        return { modifiedText: text.replace(regex, ''), specialPattern };
      }
    }
    return { modifiedText: text, specialPattern };
  };

  const walk = (node: Node) => {
    // 仅处理文本节点，排除脚本和样式标签
    if (node.nodeType === Node.TEXT_NODE && node.textContent && 
        node.parentNode?.nodeName !== 'SCRIPT' && node.parentNode?.nodeName !== 'STYLE') {
      // 第一步：读取DOM中的文字内容
      const originalText = node.textContent;
      // 第二步：去除首尾空格作为key，并转换为小写
      const trimmedText = originalText.trim().toLowerCase();
      // 获取内置翻译作为回退
      const builtinTranslations = translationMaps[lang];

      // 提取特殊模式
      const { modifiedText, specialPattern } = extractSpecialPatterns(trimmedText);
      // 处理数字替换
      const { processedText, numbers } = replaceNumbersWithHashes(modifiedText);
      const hasNumbers = numbers.length > 0;

      // 优先使用缓存翻译，如果缓存中没有则使用内置翻译
      let translatedValue = null;
      if (cachedTranslations && processedText in cachedTranslations) {
        translatedValue = cachedTranslations[processedText];
      } else if (builtinTranslations && processedText in builtinTranslations) {
        translatedValue = builtinTranslations[processedText];
      }

      if (translatedValue) {
        // 如果有数字需要还原，进行还原操作
        if (hasNumbers) {
          translatedValue = restoreNumbers(translatedValue, numbers);
        }
        // 恢复特殊模式
        if (specialPattern) {
          translatedValue += specialPattern;
        }

        // 计算原始文本的前导空格和尾随空格
        const leadingSpaces = originalText.match(/^\s*/)?.[0] || '';
        const trailingSpaces = originalText.match(/\s*$/)?.[0] || '';
        // 构建新文本：保留原始空格结构，替换中间内容
        const translatedText = leadingSpaces + translatedValue + trailingSpaces;
        // 更新文本内容
        node.textContent = translatedText;
      }
    }

    // 递归处理子节点
    if (node.nodeType === Node.ELEMENT_NODE) {
      // 处理input元素的placeholder翻译
      if (node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).tagName === 'INPUT') {
        const inputElement = node as HTMLInputElement;
        const placeholder = inputElement.placeholder;
        if (placeholder) {
          const trimmedPlaceholder = placeholder.trim().toLowerCase();
          const builtinTranslations = translationMaps[lang];

          // 提取特殊模式
          const { modifiedText: placeholderModifiedText, specialPattern: placeholderSpecialPattern } = extractSpecialPatterns(trimmedPlaceholder);
          // 处理数字替换
          const { processedText, numbers } = replaceNumbersWithHashes(placeholderModifiedText);
          const hasNumbers = numbers.length > 0;

          let translatedValue = null;
          if (cachedTranslations && processedText in cachedTranslations) {
            translatedValue = cachedTranslations[processedText];
          } else if (builtinTranslations && processedText in builtinTranslations) {
            translatedValue = builtinTranslations[processedText];
          }

          if (translatedValue) {
            // 如果有数字需要还原，进行还原操作
            if (hasNumbers) {
              translatedValue = restoreNumbers(translatedValue, numbers);
            }
            // 恢复特殊模式
            if (placeholderSpecialPattern) {
              translatedValue += placeholderSpecialPattern;
            }
            inputElement.placeholder = translatedValue;
          }
        }
      }

      Array.from(node.childNodes).forEach(walk);
    }
  };

  walk(document.body);
}

/**
 * 从存储中获取用户选择的语言偏好并执行翻译
 */
async function initTranslation() {
  try {
    const storageResult = await browser.storage.local.get('language');
    // console.log('从存储获取的语言设置:', storageResult);
    const { language = 'traditional' } = storageResult;
    // console.log('最终使用的语言设置:', language);
    
    // 加载翻译文件
    const translations = await loadTranslations(language);
    translatePage(language as 'simplified' | 'traditional', translations);
  } catch (error) {
    console.error('翻译初始化失败，错误详情:', error);
    // 出错时尝试加载默认语言
    try {
      const translations = await loadTranslations('traditional');
      translatePage('traditional', translations);
    } catch (defaultError) {
      // console.error('默认翻译加载失败:', defaultError);
    }
  }
}

/**
 * 确保存储中有默认语言设置
 */
async function ensureDefaultLanguageSetting() {
  try {
    const storageResult = await browser.storage.local.get('language');
    // 如果存储中没有语言设置，初始化默认值
    if (storageResult.language === undefined) {
      console.log('初始化默认语言设置为简体中文');
      await browser.storage.local.set({ language: 'simplified' });
    }
  } catch (error) {
    console.error('初始化语言设置失败:', error);
  }
}

// 在内容脚本加载时确保默认语言设置存在
ensureDefaultLanguageSetting();

/**
 * 替换页面上的Premium链接为赞助按钮
 */
function replacePremiumLink() {
  // 修改选择器以匹配任意以NavBar_link__开头的类名
  const premiumLink = document.querySelector('a[class^="NavBar_link__"][href="/profile/premium"]');
  if (!premiumLink) return;

  // 创建新的a标签
  const sponsorLink = document.createElement('a');
  sponsorLink.href = 'https://afdian.tv/a/istrih';
  sponsorLink.target = '_blank';
  // 转换Tailwind样式为内嵌style
  sponsorLink.style.width = '8rem'; // w-40 (40*0.25rem)
  // sponsorLink.style.marginLeft = '7.5rem'; // ml-30 (30*0.25rem)

  // 创建img标签
  const sponsorImg = document.createElement('img');
  sponsorImg.src = 'https://pic1.afdiancdn.com/static/img/welcome/button-sponsorme.png';
  sponsorImg.alt = '';
  sponsorImg.width = 120;
  // sponsorImg.style.paddingLeft = '1rem'; // pl-4 (4*0.25rem)

  // 组合元素并替换
  sponsorLink.appendChild(sponsorImg);
  premiumLink.parentNode?.replaceChild(sponsorLink, premiumLink);
}

/**
 * 在网页左下角固定显示赞助按钮
 * 采用固定定位，z-index: 99999确保显示在最上层
 */
function createFixedSponsorButton() {
  // 防止重复创建按钮
  if (document.getElementById('fixed-sponsor-button')) return;

  // 创建容器元素
  const container = document.createElement('div');
  container.id = 'fixed-sponsor-button';
  // 设置固定定位样式
  container.style.position = 'fixed';
  container.style.bottom = '20px'; // 距离底部20px
  container.style.left = '20px'; // 距离左侧20px
  container.style.zIndex = '99999'; // 设置最高层级
  container.style.padding = '10px'; // 添加内边距
  container.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; // 半透明白色背景
  container.style.borderRadius = '8px'; // 圆角边框
  container.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)'; // 添加阴影

  // 创建链接元素
  const sponsorLink = document.createElement('a');
  sponsorLink.href = 'https://afdian.tv/a/istrih';
  sponsorLink.target = '_blank';

  // 创建图片元素
  const sponsorImg = document.createElement('img');
  sponsorImg.src = 'https://pic1.afdiancdn.com/static/img/welcome/button-sponsorme.png';
  sponsorImg.alt = '赞助支持';
  sponsorImg.width = 120; // 设置图片宽度

  // 组合元素
  sponsorLink.appendChild(sponsorImg);
  container.appendChild(sponsorLink);

  // 添加到页面
  document.body.appendChild(container);
}

// 在页面加载完成后执行
if (document.readyState === 'complete') {
  createFixedSponsorButton();
} else {
  window.addEventListener('load', createFixedSponsorButton);
}
/**
 * 创建悬浮球DOM元素
 */
function createFloatingBall() {
  // 主容器
  const container = document.createElement('div');
  container.id = 'poe-translator-floating-container';
  // 固定右下角定位
  container.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; z-index: 999999; cursor: pointer;
  `;
  
  // 主悬浮球
  const mainBall = document.createElement('div');
  mainBall.id = 'poe-translator-main-ball';
  // 增强视觉效果：增大尺寸、增强阴影、添加hover动画
  mainBall.className = 'w-12 h-12 rounded-full bg-cover shadow-lg shadow-blue-500/30 border-2 border-blue-500 bg-white bg-opacity-20 transition-all duration-300 relative hover:scale-110 hover:shadow-xl';
  mainBall.style.backgroundImage = `url('${browser.runtime.getURL('/icon.png')}')`;
  
  // 添加hover提示框
  const tooltip = document.createElement('div');
  // 将bottom改为top-full并添加margin-top，确保提示框显示在悬浮球下方
  tooltip.className = 'absolute bottom-12px right-6px transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 transition-opacity duration-200 whitespace-nowrap mt-2';
  tooltip.textContent = '点击开关插件';
  mainBall.appendChild(tooltip);
  
  // 添加hover事件监听
  mainBall.addEventListener('mouseover', () => {
    tooltip.style.opacity = '1';
  });
  mainBall.addEventListener('mouseout', () => {
    tooltip.style.opacity = '0';
  });
  
  // 状态指示小球 - 改为常显示并添加脉冲动画
  const statusBall = document.createElement('div');
  statusBall.id = 'poe-translator-status-ball';
  // 增强视觉效果：添加脉冲动画和边框
  statusBall.className = 'w-5 h-5 rounded-full bg-green-500 border-2 border-white shadow-md absolute top-[-5px] right-[-5px] flex items-center justify-center text-xs animate-pulse';
  statusBall.textContent = '✅';
  
  // 组合元素 - 移除面板容器
  mainBall.appendChild(statusBall);
  container.appendChild(mainBall);
  document.body.appendChild(container);
  
  return { container, mainBall, statusBall };
}


/**
 * 初始化悬浮球功能
 */
async function initFloatingBall() {
    const { mainBall, statusBall } = createFloatingBall();
    
    // 加载翻译启用状态
    const { translationEnabled = true } = await browser.storage.local.get('translationEnabled');
    updateStatusBall(statusBall, translationEnabled);
    
    // 创建统一的切换翻译状态函数
    const toggleTranslation = async () => {
        // 检查是否正在拖动，如果是则不执行切换        
        const { translationEnabled = true } = await browser.storage.local.get('translationEnabled');
        const newState = !translationEnabled;
        
        // 先更新状态球显示（给用户即时反馈）
        updateStatusBall(statusBall, newState);
        
        // 再更新存储状态
        await browser.storage.local.set({ translationEnabled: newState });
        
        // 刷新页面使更改生效
        window.location.reload();
    };
    
    // 添加版本更新检查
    checkVersionUpdate(statusBall);
    
    // 更新状态球显示的辅助函数
    function updateStatusBall(ball: HTMLElement, enabled: boolean) {
        ball.textContent = enabled ? '✅' : '❌';
        ball.style.backgroundColor = enabled ? 'rgba(0,255,0,0.7)' : 'rgba(255,0,0,0.7)';
    }
    
    // 为主球和状态球添加点击事件监听
    mainBall.addEventListener('click', toggleTranslation);
    statusBall.addEventListener('click', toggleTranslation);
}

/**
 * 初始化翻译功能（仅当启用状态为true时执行）
 */
async function initializeTranslationIfEnabled() {
  const { translationEnabled = true } = await browser.storage.local.get('translationEnabled');
  
  if (translationEnabled) {
    // 页面加载完成后执行翻译和元素替换
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initTranslation();
        replacePremiumLink();
      });
    } else {
      initTranslation();
      replacePremiumLink();
    }

    // 监听页面动态内容变化
    if (typeof window !== 'undefined' && 'MutationObserver' in window) {
      const observer = new MutationObserver(mutations => {
        let timeoutId: number;
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              clearTimeout(timeoutId);
              timeoutId = window.setTimeout(() => {
                initTranslation();
                replacePremiumLink();
              }, 300);
            }
          });
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  } else {
    console.log('翻译功能已禁用');
    replacePremiumLink();
  }
}

// // 监听页面动态内容变化
// // 添加浏览器环境检查，避免在非浏览器环境执行
// if (typeof window !== 'undefined' && 'MutationObserver' in window) {
//   const observer = new MutationObserver(mutations => {
//     // 添加防抖处理，避免频繁翻译
//     let timeoutId: number;
//     mutations.forEach(mutation => {
//       mutation.addedNodes.forEach(node => {
//         if (node.nodeType === Node.ELEMENT_NODE) {
//           clearTimeout(timeoutId);
//           timeoutId = window.setTimeout(() => {
//             initTranslation();
//             replacePremiumLink(); // 添加元素替换
//           }, 300);
//         }
//       });
//     });
//   });

//   observer.observe(document.body, {
//     childList: true,
//     subtree: true
//   });
// }

// 监听来自popup的消息，刷新翻译
browser.runtime.onMessage.addListener((message) => {
  if (message.action === 'refreshTranslation') {
    initTranslation();
  }
});

// 扩展消息监听器以支持版本查询
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'refreshTranslation') {
    initTranslation();
  } else if (message.action === 'getVersion') {
    // 返回当前版本信息
    sendResponse({ version: translationVersion });
  }
  // 保持消息通道开放以支持异步响应
  return true;
});

// 扩展消息监听器以支持版本查询
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getVersion') {
    sendResponse({ version: translationVersion });
  }
  return true;
});

/**
 * 获取应用版本号（从version.json读取）
 * @returns 版本号字符串
 */
async function getAppVersion(): Promise<string> {
    try {
        // 使用runtime.getURL获取扩展内部资源路径
        const response = await fetch(browser.runtime.getURL('/version.json'), {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        const versionData = await response.json();
        return versionData.version || '1.0.0';
    } catch (error) {
        console.error('读取版本文件失败:', error);
        return '1.0.0';
    }
}

/**
 * 检查版本更新并处理与background脚本的通信
 * @param statusBall 状态球DOM元素，用于显示版本检查状态
 */
async function checkVersionUpdate(statusBall: HTMLElement) {
    try {
        const localVersion = await getAppVersion();
        console.log(`[版本检查] 本地版本: ${localVersion}，请求远程版本...`);
        
        const response = await browser.runtime.sendMessage({
            action: 'checkVersion'
        });
        
        console.log('[版本检查] 收到background响应:', response);
        
        // 添加响应有效性检查
        if (!response) {
            throw new Error('未收到响应数据');
        }
        
        if (!response.success) {
            throw new Error(`版本请求失败: ${response.error || '未知错误'}`);
        }
        
        const remoteVersion = response.version;
        console.log(`[版本检查] 远程版本: ${remoteVersion}，来源: ${response.source || '直接请求'}`);
        
        // 比较版本号并显示更新提示
        if (isNewVersionAvailable(localVersion, remoteVersion)) {
             // 创建版本更新通知框（使用Tailwind CSS类）
            const updateNotification = document.createElement('div');
            updateNotification.className = 'fixed top-5 right-5 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse z-9999';
            updateNotification.innerHTML = `
                <span>插件有新版本可用！</span>
                <a href="https://github.com/isTrih/poe-translator/releases" target="_blank" class="underline hover:text-blue-200 transition-colors">前去下载</a>
            `;
            document.body.appendChild(updateNotification);
            
        } else {
            // 版本已是最新，显示正常状态
            statusBall.textContent = '✓';
            statusBall.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
            statusBall.title = `当前已是最新版本 (${localVersion})`;
        }
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[版本检查] 完整错误: ${error}`);
        
        // 显示错误状态
        statusBall.textContent = '⚠️';
        statusBall.title = `版本检查失败: ${errorMsg}`;
        statusBall.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
    }
}

/**
 * 比较版本号判断是否有更新
 * @param currentVersion 当前版本
 * @param newVersion 新版本
 * @returns 是否有更新
 */
function isNewVersionAvailable(currentVersion: string, newVersion: string): boolean {
    const currentParts = currentVersion.split('.').map(Number);
    const newParts = newVersion.split('.').map(Number);
    
    for (let i = 0; i < Math.max(currentParts.length, newParts.length); i++) {
        const current = currentParts[i] || 0;
        const newPart = newParts[i] || 0;
        
        if (newPart > current) return true;
        if (newPart < current) return false;
    }
    
    return false; // 版本相同
}

// 确保默认导出在文件末尾，且不在任何条件语句内
export default defineContentScript({
  // 只匹配目标网站
  matches: ['<all_urls>'],
  main() {
    document.documentElement.setAttribute('translate', 'no');
    document.documentElement.setAttribute('lang', 'zh_cn');

    // 初始化悬浮球（无论翻译是否启用都需要显示）
    initFloatingBall();
    
    // 初始化翻译功能（根据启用状态决定）
    initializeTranslationIfEnabled();
  }
});