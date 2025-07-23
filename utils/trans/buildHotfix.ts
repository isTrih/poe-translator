/**
 * 生成翻译热修复文件工具
 * 功能：对比缓存翻译与最新翻译，生成差异文件到public/translations目录
 */
import fs from 'fs';
import path from 'path';
import json5 from 'json5'; // 添加json5依赖
// 移除translationMap依赖
// import { translationMaps } from './translationMap';

// 定义路径常量
const CACHE_FILE = path.resolve(__dirname, '.cache.json');
const VERSION_FILE = path.resolve(__dirname, '../../public/version.json');
const PUBLIC_TRANSLATIONS_DIR = path.resolve(__dirname, '../../public/translations');
const HOTFIX_COUNTER_FILE = path.resolve(__dirname, '.hotfix-counter.json');
// 添加json目录路径
const JSON_DIR = path.resolve(__dirname, 'json');
const ZH_CN_DIR = path.join(JSON_DIR, 'zh_cn');
const ZH_TW_DIR = path.join(JSON_DIR, 'zh_tw');

/**
 * 读取目录下所有JSON文件并合并内容，将key转换为小写并检测冲突
 * @param dir 目录路径
 * @returns 合并后的翻译对象
 */
function readAndMergeJsonFiles(dir: string): Record<string, string> {
  const merged: Record<string, string> = {};
  
  // 检查目录是否存在
  if (!fs.existsSync(dir)) {
    console.warn(`目录不存在: ${dir}`);
    return merged;
  }

  // 读取目录下所有文件
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const ext = path.extname(file);
    if (ext === '.json' || ext === '.json5') {
      const filePath = path.join(dir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      try {
        const jsonData = json5.parse(fileContent);
        const lowerCaseData: Record<string, string> = {};
        
        // 转换key为小写并检测冲突
        Object.entries(jsonData).forEach(([key, value]) => {
          const lowerKey = key.toLowerCase();
          if (lowerCaseData[lowerKey]) {
            console.warn(`文件 ${file} 中存在重复键（转换为小写后）: ${key} -> ${lowerKey}，后者将覆盖前者`);
          }
          lowerCaseData[lowerKey] = String(value);
        });
        
        // 合并到结果对象并检测跨文件冲突
        Object.entries(lowerCaseData).forEach(([key, value]) => {
          if (merged[key]) {
            console.warn(`跨文件重复键: ${key}，将使用最后出现的值`);
          }
          merged[key] = value;
        });
        
        console.log(`成功合并文件: ${file} (${Object.keys(jsonData).length}条翻译，转换为${Object.keys(lowerCaseData).length}条小写键)`);
      } catch (error) {
        console.error(`解析文件失败: ${file}`, error);
      }
    }
  });

  return merged;
}

/**
 * 获取当前版本号
 */
function getBaseVersion() {
  const versionContent = fs.readFileSync(VERSION_FILE, 'utf-8');
  const versionData = JSON.parse(versionContent);
  return versionData.version;
}

/**
 * 获取并递增hotfix计数器
 */
function getHotfixCounter() {
  let counter = 1;
  if (fs.existsSync(HOTFIX_COUNTER_FILE)) {
    const counterContent = fs.readFileSync(HOTFIX_COUNTER_FILE, 'utf-8');
    const counterData = JSON.parse(counterContent);
    const baseVersion = getBaseVersion();
    
    // 如果版本号变更，重置计数器
    if (counterData.baseVersion !== baseVersion) {
      counter = 1;
    } else {
      counter = counterData.counter + 1;
    }
  }
  
  // 保存计数器
  fs.writeFileSync(HOTFIX_COUNTER_FILE, JSON.stringify({
    baseVersion: getBaseVersion(),
    counter
  }, null, 2), 'utf-8');
  
  return counter;
}

/**
 * 比较新旧翻译内容，返回差异部分
 */
function getTranslationDifferences(newTranslations: Record<string, string>, oldTranslations: Record<string, string>) {
  const differences: Record<string, string> = {};
  
  // 检查新增或修改的翻译
  Object.entries(newTranslations).forEach(([key, value]) => {
    if (!oldTranslations[key] || oldTranslations[key] !== value) {
      differences[key] = value;
    }
  });
  
  return differences;
}

/**
 * 生成热修复翻译文件
 */
function generateHotfixTranslations() {
  console.log('开始生成翻译热修复文件...');
  
  // 读取并合并最新翻译文件
  const newSimplifiedTranslations = readAndMergeJsonFiles(ZH_CN_DIR);
  const newTraditionalTranslations = readAndMergeJsonFiles(ZH_TW_DIR);
  
  // 检查缓存文件是否存在
  if (!fs.existsSync(CACHE_FILE)) {
    console.error('缓存文件不存在，请先运行buildTranslations生成缓存');
    process.exit(1);
  }
  
  // 读取缓存文件
  const cacheContent = fs.readFileSync(CACHE_FILE, 'utf-8');
  const cacheData = JSON.parse(cacheContent);
  
  // 获取差异内容
  const simplifiedDifferences = getTranslationDifferences(
    newSimplifiedTranslations, // 使用新合并的翻译内容
    cacheData.simplified
  );
  
  const traditionalDifferences = getTranslationDifferences(
    newTraditionalTranslations, // 使用新合并的翻译内容
    cacheData.traditional
  );
  
  // 如果没有差异，不需要生成热修复
  if (Object.keys(simplifiedDifferences).length === 0 && Object.keys(traditionalDifferences).length === 0) {
    console.log('没有发现翻译差异，不需要生成热修复文件');
    return;
  }
  
  // 生成URL版本
  const baseVersion = getBaseVersion();
  const hotfixCounter = getHotfixCounter();
  
  // 添加版本信息到差异内容
  simplifiedDifferences.url_version = `${baseVersion} SC hotfix-${hotfixCounter}`;
  traditionalDifferences.url_version = `${baseVersion} TC hotfix-${hotfixCounter}`;
  
  // 确保输出目录存在
  if (!fs.existsSync(PUBLIC_TRANSLATIONS_DIR)) {
    fs.mkdirSync(PUBLIC_TRANSLATIONS_DIR, { recursive: true });
  }
  
  // 写入差异文件
  const simplifiedPath = path.join(PUBLIC_TRANSLATIONS_DIR, 'simplified.json');
  const traditionalPath = path.join(PUBLIC_TRANSLATIONS_DIR, 'traditional.json');
  
  fs.writeFileSync(simplifiedPath, JSON.stringify(simplifiedDifferences, null, 2), 'utf-8');
  fs.writeFileSync(traditionalPath, JSON.stringify(traditionalDifferences, null, 2), 'utf-8');
  
  console.log(`热修复文件已生成：`);
  console.log(`简体中文: ${simplifiedPath} (${Object.keys(simplifiedDifferences).length}条差异)`);
  console.log(`繁体中文: ${traditionalPath} (${Object.keys(traditionalDifferences).length}条差异)`);
}

// 执行生成
generateHotfixTranslations();