/**
 * 翻译文件合并工具
 * 功能：读取json目录下的zh_cn和zh_tw JSON文件，合并且生成translationMap.ts
 */
import fs from 'fs';
import path from 'path';
import json5 from 'json5';

// 定义翻译文件目录路径
const JSON_DIR = path.resolve(__dirname, 'json');
const ZH_CN_DIR = path.join(JSON_DIR, 'zh_cn');
const ZH_TW_DIR = path.join(JSON_DIR, 'zh_tw');
const OUTPUT_FILE = path.resolve(__dirname, 'translationMap.ts');
// 添加缓存文件路径
const CACHE_FILE = path.resolve(__dirname, '.cache.json');

/**
 * 读取目录下所有JSON文件并合并内容
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
    // 修改文件扩展名检查，同时支持.json和.json5
    const ext = path.extname(file);
    if (ext === '.json' || ext === '.json5') {
      const filePath = path.join(dir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      try {
        // 使用JSON5解析带注释的JSON文件
        const jsonData = json5.parse(fileContent);
        
        // 添加key小写转换逻辑
        const lowerCaseData: Record<string, string> = {};
        Object.entries(jsonData).forEach(([key, value]) => {
          const lowerKey = key.toLowerCase();
          // 检查是否有重复的key（转换为小写后）
          if (lowerCaseData[lowerKey]) {
            console.warn(`文件 ${file} 中存在重复键（转换为小写后）: ${key} -> ${lowerKey}，后者将覆盖前者`);
          }
          lowerCaseData[lowerKey] = String(value);
        });
        
        Object.assign(merged, lowerCaseData);
        console.log(`成功合并文件: ${file} (${Object.keys(jsonData).length}条翻译，转换为${Object.keys(lowerCaseData).length}条小写键)`);
      } catch (error) {
        console.error(`解析文件失败: ${file}`, error);
      }
    }
  });
  
  return merged;
}

/**
 * 保存翻译缓存到.cache.json文件
 */
function saveTranslationCache(simplified: Record<string, string>, traditional: Record<string, string>) {
  const cacheData = {
    timestamp: new Date().toISOString(),
    simplified,
    traditional
  };
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf-8');
  console.log(`翻译缓存已保存: ${CACHE_FILE}`);
}

/**
 * 生成translationMap.ts文件
 */
function generateTranslationMap() {
  console.log('开始合并翻译文件...');
  
  // 分别合并简体和繁体翻译文件
  const simplifiedTranslations = readAndMergeJsonFiles(ZH_CN_DIR);
  const traditionalTranslations = readAndMergeJsonFiles(ZH_TW_DIR);
  
  // 保存缓存
  saveTranslationCache(simplifiedTranslations, traditionalTranslations);
  
  // 生成输出内容
  const outputContent = `/**翻译关键词映射表
 * 包含简体中文和繁体中文的翻译对照
 * 由buildTranslations.ts自动生成，请勿手动修改*/
import { TranslationMaps } from './types';
export const translationMaps: TranslationMaps = {
  simplified: ${JSON.stringify(simplifiedTranslations, null, 2)},
  traditional: ${JSON.stringify(traditionalTranslations, null, 2)}
};
`;
  
  // 写入文件
  fs.writeFileSync(OUTPUT_FILE, outputContent, 'utf-8');
  console.log(`翻译文件已生成: ${OUTPUT_FILE}`);
  console.log(`简体翻译条目: ${Object.keys(simplifiedTranslations).length}`);
  console.log(`繁体翻译条目: ${Object.keys(traditionalTranslations).length}`);
}

// 执行生成
generateTranslationMap();