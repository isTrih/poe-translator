# Changelog

## [1.1.1](https://github.com/isTrih/poe-translator/compare/v1.1.0...v1.1.1) (2025-08-01)


### Bug Fixes

* **translation:** 添加翻译功能开关检查并优化悬浮球交互 ([fdf6266](https://github.com/isTrih/poe-translator/commit/fdf6266a355fb517feb15193a9252078e3523e3d))

## [1.1.0](https://github.com/isTrih/poe-translator/compare/v1.0.2...v1.1.0) (2025-08-01)


### Features

* **trans:** 添加翻译文件构建工具和热修复功能 ([b3efa2f](https://github.com/isTrih/poe-translator/commit/b3efa2fe52efd569f10059434b02efa7896515d3))
* 优化翻译缓存机制和状态球显示 ([c0c0d87](https://github.com/isTrih/poe-translator/commit/c0c0d87a66a15605ae1c6649f717ccbe4abd0d30))
* 初始化POE翻译助手项目 ([7a4a65b](https://github.com/isTrih/poe-translator/commit/7a4a65b1cc97e04cae3771527c6fcd64b6a95009))
* 实现翻译插件核心功能与悬浮球控制界面 ([0639055](https://github.com/isTrih/poe-translator/commit/06390551b8daee022513ec0264ae96def69241db))
* 实现翻译插件核心功能与悬浮球控制界面 ([4001c53](https://github.com/isTrih/poe-translator/commit/4001c53a8765a8818e62b4fa28c032ed490f90e1))
* **扩展:** 添加扩展功能开关支持 ([b5a2574](https://github.com/isTrih/poe-translator/commit/b5a2574c4298d298f9e9cdf973215c1c7db08637))
* 添加Tailwind CSS支持并优化UI样式 ([f928f01](https://github.com/isTrih/poe-translator/commit/f928f018e665813ed70fc3f44413fab84c2b8898))
* **翻译:** 添加佣兵模式翻译并支持版本查询 ([deeeded](https://github.com/isTrih/poe-translator/commit/deeededb8cd141927f019b27f5b054efd9720eb7))
* **翻译:** 添加未翻译文本收集和导出功能 ([e35f28c](https://github.com/isTrih/poe-translator/commit/e35f28c4674901acdbe085ef9a2777bef29285a9))


### Bug Fixes

* **popup:** 恢复版本检查功能并移除废弃代码 ([f8ebbf2](https://github.com/isTrih/poe-translator/commit/f8ebbf2f898e0e71029ee99ce779271b1c83ba2d))
* **translations:** 修复未翻译文本保存时的数字还原问题 ([c0c0d87](https://github.com/isTrih/poe-translator/commit/c0c0d87a66a15605ae1c6649f717ccbe4abd0d30))
* 在.gitignore中添加action token注释 ([616a421](https://github.com/isTrih/poe-translator/commit/616a421cd6ef6dda24bbe7864caae3771dea20e7))
* 更新 release-please-action 至 v4 并简化配置 ([5be7afb](https://github.com/isTrih/poe-translator/commit/5be7afba249dfa65a688e0f59cce9e0c920ed3cc))
* 更新 release.yml 配置以支持 standard-version 和更多变更类型 ([eaaaf4e](https://github.com/isTrih/poe-translator/commit/eaaaf4eac35c28aca2f98d1fe6ff32622d10b70c))
* 更新版本号至1.0.4 ([78d774a](https://github.com/isTrih/poe-translator/commit/78d774a97f9c980b34e373c09ad873de52cc9daa))


### Docs

* **contributor:** contrib-readme-action has updated readme ([73ce8db](https://github.com/isTrih/poe-translator/commit/73ce8db89bfef16ab837c5664a27097675889b00))
* 在README中添加打包扩展的说明 ([c0c0d87](https://github.com/isTrih/poe-translator/commit/c0c0d87a66a15605ae1c6649f717ccbe4abd0d30))
* 更新README文档和翻译文件URL ([f928f01](https://github.com/isTrih/poe-translator/commit/f928f018e665813ed70fc3f44413fab84c2b8898))


### Styling

* **status-ball:** 移除状态球的硬编码样式和文本 ([c0c0d87](https://github.com/isTrih/poe-translator/commit/c0c0d87a66a15605ae1c6649f717ccbe4abd0d30))
* 移除旧样式文件并应用Tailwind样式 ([f928f01](https://github.com/isTrih/poe-translator/commit/f928f018e665813ed70fc3f44413fab84c2b8898))


### Code Refactoring

* **content:** 将Tailwind类替换为内联样式以提升兼容性 ([56a73f8](https://github.com/isTrih/poe-translator/commit/56a73f8a84979a2cc8c28f319bf3e520c25caf07))
* **popup:** 使用pkginfo替代fetch获取本地版本信息 ([4cc1b1c](https://github.com/isTrih/poe-translator/commit/4cc1b1c131c078fa832d70da922457cb8a1bff65))
* **translations:** 为翻译缓存添加30分钟有效期检查 ([c0c0d87](https://github.com/isTrih/poe-translator/commit/c0c0d87a66a15605ae1c6649f717ccbe4abd0d30))
* 移除创建赞助按钮的自动执行逻辑 ([5e6eb21](https://github.com/isTrih/poe-translator/commit/5e6eb216a8ebd6e4b26cacd3db063ad8121b3da2))
* 移除调试日志并更新版本检查API ([1e7e5ff](https://github.com/isTrih/poe-translator/commit/1e7e5ffba86b5974a611a403a178993a2b0e82fd))
* 重构翻译逻辑以支持特殊模式匹配 ([f928f01](https://github.com/isTrih/poe-translator/commit/f928f018e665813ed70fc3f44413fab84c2b8898))


### Build System

* 添加Tailwind相关依赖和配置 ([f928f01](https://github.com/isTrih/poe-translator/commit/f928f018e665813ed70fc3f44413fab84c2b8898))


### CI

* 添加 GitHub Actions 工作流配置 ([d5c9bf3](https://github.com/isTrih/poe-translator/commit/d5c9bf3c827a8e74183eadffa553fb58faf345d5))

## [1.0.2](https://github.com/isTrih/poe-translator/compare/v1.0.1...v1.0.2) (2025-08-01)


### Bug Fixes

* **popup:** 恢复版本检查功能并移除废弃代码 ([f8ebbf2](https://github.com/isTrih/poe-translator/commit/f8ebbf2f898e0e71029ee99ce779271b1c83ba2d))


### Code Refactoring

* **popup:** 使用pkginfo替代fetch获取本地版本信息 ([4cc1b1c](https://github.com/isTrih/poe-translator/commit/4cc1b1c131c078fa832d70da922457cb8a1bff65))

## [1.0.1](https://github.com/isTrih/poe-translator/compare/v1.0.0...v1.0.1) (2025-08-01)


### Bug Fixes

* 更新 release-please-action 至 v4 并简化配置 ([5be7afb](https://github.com/isTrih/poe-translator/commit/5be7afba249dfa65a688e0f59cce9e0c920ed3cc))
* 更新 release.yml 配置以支持 standard-version 和更多变更类型 ([eaaaf4e](https://github.com/isTrih/poe-translator/commit/eaaaf4eac35c28aca2f98d1fe6ff32622d10b70c))

## 1.0.0 (2025-08-01)


### Features

* **trans:** 添加翻译文件构建工具和热修复功能 ([b3efa2f](https://github.com/isTrih/poe-translator/commit/b3efa2fe52efd569f10059434b02efa7896515d3))
* 优化翻译缓存机制和状态球显示 ([c0c0d87](https://github.com/isTrih/poe-translator/commit/c0c0d87a66a15605ae1c6649f717ccbe4abd0d30))
* 初始化POE翻译助手项目 ([7a4a65b](https://github.com/isTrih/poe-translator/commit/7a4a65b1cc97e04cae3771527c6fcd64b6a95009))
* 实现翻译插件核心功能与悬浮球控制界面 ([0639055](https://github.com/isTrih/poe-translator/commit/06390551b8daee022513ec0264ae96def69241db))
* 实现翻译插件核心功能与悬浮球控制界面 ([4001c53](https://github.com/isTrih/poe-translator/commit/4001c53a8765a8818e62b4fa28c032ed490f90e1))
* **扩展:** 添加扩展功能开关支持 ([b5a2574](https://github.com/isTrih/poe-translator/commit/b5a2574c4298d298f9e9cdf973215c1c7db08637))
* 添加Tailwind CSS支持并优化UI样式 ([f928f01](https://github.com/isTrih/poe-translator/commit/f928f018e665813ed70fc3f44413fab84c2b8898))
* **翻译:** 添加佣兵模式翻译并支持版本查询 ([deeeded](https://github.com/isTrih/poe-translator/commit/deeededb8cd141927f019b27f5b054efd9720eb7))
* **翻译:** 添加未翻译文本收集和导出功能 ([e35f28c](https://github.com/isTrih/poe-translator/commit/e35f28c4674901acdbe085ef9a2777bef29285a9))


### Bug Fixes

* **translations:** 修复未翻译文本保存时的数字还原问题 ([c0c0d87](https://github.com/isTrih/poe-translator/commit/c0c0d87a66a15605ae1c6649f717ccbe4abd0d30))
* 在.gitignore中添加action token注释 ([616a421](https://github.com/isTrih/poe-translator/commit/616a421cd6ef6dda24bbe7864caae3771dea20e7))
* 更新版本号至1.0.4 ([78d774a](https://github.com/isTrih/poe-translator/commit/78d774a97f9c980b34e373c09ad873de52cc9daa))


### Docs

* **contributor:** contrib-readme-action has updated readme ([73ce8db](https://github.com/isTrih/poe-translator/commit/73ce8db89bfef16ab837c5664a27097675889b00))
* 在README中添加打包扩展的说明 ([c0c0d87](https://github.com/isTrih/poe-translator/commit/c0c0d87a66a15605ae1c6649f717ccbe4abd0d30))
* 更新README文档和翻译文件URL ([f928f01](https://github.com/isTrih/poe-translator/commit/f928f018e665813ed70fc3f44413fab84c2b8898))


### Styling

* **status-ball:** 移除状态球的硬编码样式和文本 ([c0c0d87](https://github.com/isTrih/poe-translator/commit/c0c0d87a66a15605ae1c6649f717ccbe4abd0d30))
* 移除旧样式文件并应用Tailwind样式 ([f928f01](https://github.com/isTrih/poe-translator/commit/f928f018e665813ed70fc3f44413fab84c2b8898))


### Code Refactoring

* **content:** 将Tailwind类替换为内联样式以提升兼容性 ([56a73f8](https://github.com/isTrih/poe-translator/commit/56a73f8a84979a2cc8c28f319bf3e520c25caf07))
* **translations:** 为翻译缓存添加30分钟有效期检查 ([c0c0d87](https://github.com/isTrih/poe-translator/commit/c0c0d87a66a15605ae1c6649f717ccbe4abd0d30))
* 移除创建赞助按钮的自动执行逻辑 ([5e6eb21](https://github.com/isTrih/poe-translator/commit/5e6eb216a8ebd6e4b26cacd3db063ad8121b3da2))
* 移除调试日志并更新版本检查API ([1e7e5ff](https://github.com/isTrih/poe-translator/commit/1e7e5ffba86b5974a611a403a178993a2b0e82fd))
* 重构翻译逻辑以支持特殊模式匹配 ([f928f01](https://github.com/isTrih/poe-translator/commit/f928f018e665813ed70fc3f44413fab84c2b8898))


### Build System

* 添加Tailwind相关依赖和配置 ([f928f01](https://github.com/isTrih/poe-translator/commit/f928f018e665813ed70fc3f44413fab84c2b8898))


### CI

* 添加 GitHub Actions 工作流配置 ([d5c9bf3](https://github.com/isTrih/poe-translator/commit/d5c9bf3c827a8e74183eadffa553fb58faf345d5))

## [1.0.4] - 2025-08-01

### Features

- **扩展**: 添加扩展功能开关支持
  - 实现扩展全局开关功能，包括：
    - 在 popup 界面添加开关控件
    - 通过 storage 保存开关状态
    - 通知 content script 状态变化
    - 根据开关状态启用/禁用翻译功能
    - 清理相关 DOM 元素和效果

### Refactor

- **content**: 将 Tailwind 类替换为内联样式以提升兼容性
- 移除调试日志并更新版本检查 API
  - 修改版本检查 API 地址为新的 CDN 端点
  - 移除所有 console 调试日志输出以精简生产环境代码
- 移除创建赞助按钮的自动执行逻辑

## [1.0.3] - 2025-07-23

### Features

- **翻译**: 添加未翻译文本收集和导出功能
  - 实现未翻译文本的自动收集和存储功能，使用 IndexedDB 按域名保存未翻译文本
  - 新增点击版权信息导出当前网站未翻译文本的功能

### Improvements

- 优化翻译逻辑，添加文本过滤规则避免无效内容保存
  - 仅保存英文内容，过滤包含中文字符的文本
  - 排除纯符号和 emoji 内容，只保留带有字母的文本
- 增强 IndexedDB 操作的类型安全和错误处理
- 添加环境检测，确保在非浏览器环境下优雅降级

## [1.0.2] - 2025-7-23

### Features

- 实现翻译插件核心功能，包括语言切换、动态翻译和元素替换
- 新增悬浮球控制界面，支持启用/禁用翻译功能
- 实现版本更新检查机制，通过 GitHub API 获取最新版本
- 扩展 manifest 配置，增加权限和资源访问范围
- 优化 UI 样式，添加暗黑风格主题和响应式设计

### Bug Fixes

- 修复大小写敏感问题，实现文本统一小写处理
- 解决动态内容加载后翻译不生效的问题
- 修复翻译缓存机制偶尔失效的 bug

## [0.2.0] - 2025-7-22

### Features

- 添加翻译映射表管理工具
- 实现翻译内容本地缓存功能
- 新增翻译状态持久化存储

### Improvements

- 优化翻译性能，减少 DOM 操作次数
- 增强错误处理机制

## [0.1.0] - 2025-7-21

### Features

- 项目初始化，建立基础架构
- 实现基本翻译功能
- 添加核心配置文件
- 创建翻译映射表初始版本

### Documentation

- 添加项目 README.md
- 完善代码注释
