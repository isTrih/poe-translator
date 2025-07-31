export default defineBackground(() => {
  console.log('Background脚本初始化成功');

  // 确保权限正确加载
  console.log('扩展权限:', browser.runtime.getManifest().permissions);

  // 存储最新版本信息供fallback使用
  let latestVersion: string | null = null;
  let versionCheckTimestamp = 0;

  // 独立的版本检查函数
  /**
   * 独立的版本检查函数，使用GitHub API避免CORS问题
   * @returns 版本检查结果对象，包含成功状态、版本号或错误信息
   */
  const fetchVersion = async (): Promise<{success: boolean, version?: string, error?: string}> => {
    try {
      const response = await fetch(
        'https://assets.checkpoint321.com/poe/translations/version.json',
        {
          method: 'GET',
          headers: {
          },
          signal: AbortSignal.timeout(10000)
        }
      );
            // 'Accept': 'application/vnd.github.v3.raw' // 请求原始文件内容

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP错误 ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      latestVersion = data.version;
      versionCheckTimestamp = Date.now();
      return {
        success: true,
        version: data.version
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  };

  // 立即执行一次版本检查并缓存结果
  fetchVersion().then(result => {
    console.log('初始版本检查结果:', result);
  });

  // 消息监听器 - 基础保障
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('收到消息:', message.action, '来自:', sender.tab?.url);

    // 删除这部分同步响应代码
    // sendResponse({
    //   status: 'received',
    //   action: message.action
    // });

    if (message.action === 'checkVersion') {
      // 使用缓存结果（如果5分钟内有效）
      if (latestVersion && Date.now() - versionCheckTimestamp < 5 * 60 * 1000) {
        console.log('使用缓存版本信息:', latestVersion);
        sendResponse({
          success: true,
          version: latestVersion,
          source: 'cache'
        });
        return;
      }

      // 异步处理实际请求
      (async () => {
        try {
          const result = await fetchVersion();
          sendResponse(result);
        } catch (error) {
          sendResponse({
            success: false,
            error: '异步处理失败: ' + (error instanceof Error ? error.message : String(error))
          });
        }
      })();
      return true; // 保持通道开放
    }
  });

  // 存储监听 - 冗余保障
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.requestVersionCheck) {
      const request = changes.requestVersionCheck.newValue;
      if (request) {
        fetchVersion().then(result => {
          browser.storage.local.set({
            versionCheckResult: result,
            requestVersionCheck: false
          });
        });
      }
    }
  });
});
