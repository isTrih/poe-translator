/**
 * 翻译映射表接口定义
 * 支持字符串索引访问翻译值
 */
export interface TranslationMap {
  [key: string]: string;
}
export interface TranslationMaps {
  simplified: TranslationMap;
  traditional: TranslationMap;
}