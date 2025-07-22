import { TranslationMap } from '../utils/translationMap';

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
    const baseUrl = translationUrlPrefix || 'https://assets.checkpoint321.com/poe/translations/';
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

  const walk = (node: Node) => {
    // 仅处理文本节点，排除脚本和样式标签
    if (node.nodeType === Node.TEXT_NODE && node.textContent && 
        node.parentNode?.nodeName !== 'SCRIPT' && node.parentNode?.nodeName !== 'STYLE') {
      // 第一步：读取DOM中的文字内容
      const originalText = node.textContent;
      // 第二步：去除首尾空格作为key
      const trimmedText = originalText.trim();
      // 获取内置翻译作为回退
      const builtinTranslations = translationMaps[lang];

      // 处理数字替换
      const { processedText, numbers } = replaceNumbersWithHashes(trimmedText);
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
          const trimmedPlaceholder = placeholder.trim();
          const builtinTranslations = translationMaps[lang];

          // 处理数字替换
          const { processedText, numbers } = replaceNumbersWithHashes(trimmedPlaceholder);
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

export default defineContentScript({
  // 只匹配目标网站
  matches: ['*://wealthyexile.com/*'],
  main() {

    document.documentElement.setAttribute('translate', 'no');
    document.documentElement.setAttribute('lang', 'zh_cn');

    // 页面加载完成后执行翻译和元素替换
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initTranslation();
        replacePremiumLink(); // 添加元素替换
      });
    } else {
      initTranslation();
      replacePremiumLink(); // 添加元素替换
    }

    // 监听页面动态内容变化
    const observer = new MutationObserver(mutations => {
      // 添加防抖处理，避免频繁翻译
      let timeoutId: number;
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => {
              initTranslation();
              replacePremiumLink(); // 添加元素替换
            }, 300);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 监听来自popup的消息，刷新翻译
    browser.runtime.onMessage.addListener((message) => {
      if (message.action === 'refreshTranslation') {
        initTranslation();
      }
    });
  },
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
