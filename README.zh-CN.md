# aurora-clock

[English](README.md) | 简体中文

一个 Chrome 扩展，提供桌面级表盘时钟，支持多种表盘风格、公历与农历双日期显示，以及实时天气。

当前版本：**1.2.1**

## 界面截图

| 经典 | 霓虹 | 海洋 |
| :---: | :---: | :---: |
| ![经典表盘](docs/screenshots/clock-classic.png) | ![霓虹表盘](docs/screenshots/clock-neon.png) | ![海洋表盘](docs/screenshots/clock-ocean.png) |

| 浅色模式 | 世界时钟 |
| :---: | :---: |
| ![浅色模式](docs/screenshots/clock-light.png) | ![世界时钟](docs/screenshots/world.png) |

## 功能特性

- 多种表盘风格：经典、现代、极简、复古、霓虹、海洋
- 指针平滑走动的模拟时钟
- 双日期显示：公历与农历（1900-2049）
- 12 小时制 / 24 小时制切换
- 世界时钟，同时显示本地与主要城市时间
- 基于浏览器定位的 Open-Meteo 实时天气
- 键盘快捷键：`Ctrl+Shift+O`（Windows/Linux）或 `Command+Shift+O`（Mac）打开弹窗，`Escape` 关闭
- 通过 `chrome.commands` 管理自定义快捷键
- 深色 / 浅色模式切换
- 精细的金属外圈与表圈质感
- 适配不同弹窗尺寸的响应式布局

## 技术栈

- HTML5
- CSS3（表盘风格、主题、响应式布局）
- JavaScript（时钟逻辑、日期换算、天气请求）
- Chrome Extension API（Manifest V3）

## 安装

### 从 Chrome 应用商店安装

待发布后可用。

### 本地开发安装

1. 克隆或下载本项目
2. 打开 Chrome，进入 `chrome://extensions/`
3. 打开右上角的「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择本项目文件夹
6. 安装完成，工具栏会出现时钟图标

## 使用说明

### 打开时钟

- 点击工具栏中的时钟图标
- 或使用快捷键 `Ctrl+Shift+O`（Windows/Linux）/ `Command+Shift+O`（Mac）

### 切换表盘风格

- 点击左上角的六个风格圆点
- 从左到右依次为：经典、现代、极简、复古、霓虹、海洋
- 切换立即生效，并在下次打开时恢复

### 查看日期与时间

- 左侧为模拟时钟
- 右侧为公历日期、农历日期与数字时间

### 切换时间制式

- 点击标题栏中的制式按钮，在 `24H` 与 `12H` 之间切换
- 该设置同时作用于数字时间与世界时钟，并在下次打开时恢复

### 查看世界时钟

- 打开 World 标签页
- 每行显示一个城市及其当前本地时间
- `+1d` / `-1d` 标记表示该城市与本地不在同一日历日

### 查看天气

- 打开 Weather 标签页
- 首次使用 Chrome 会请求定位权限，允许后即可加载本地天气
- 若拒绝定位，则显示上一次缓存的结果

### 自定义快捷键

- 打开扩展的选项页
- 点击「Set Shortcut」，然后按下包含 Ctrl、Command 或 Alt 的组合键
- 按 Escape 取消

## 权限与隐私

- `storage`：保存主题、表盘风格与最近一次天气结果
- `geolocation`：仅用于请求坐标以获取天气
- Host 权限 `https://api.open-meteo.com/*`：用于天气请求
- 位置信息仅发送给 Open-Meteo 用于获取天气，不收集其他数据

## 项目结构

```
├── icons/              # 扩展图标
├── manifest.json       # 扩展配置（Manifest V3）
├── popup.html          # 弹窗页面结构
├── popup.js            # 时钟、日期、天气与 UI 逻辑
├── styles.css          # 主题、表盘风格、响应式布局
├── options.html        # 快捷键选项页结构
├── options.js          # 快捷键命令更新
├── docs/
│   ├── screenshots/    # 弹窗截图（420x420）
│   └── store/          # Chrome 应用商店素材（1280x800）
├── README.md           # 文档（英文）
└── README.zh-CN.md     # 文档（简体中文）
```

## 实现说明

### 时钟

- 通过 `Date` 对象获取当前时间
- 使用 CSS transform 旋转指针
- 使用 `requestAnimationFrame`，秒针平滑走动

### 日期

- 使用 `toLocaleDateString` 格式化公历日期
- 基于紧凑年份表，将公历日期换算为 1900-2049 年的农历日期
- 每分钟刷新一次日期显示

### 天气

- 调用 Open-Meteo 天气预报 API（无需 API Key）
- 通过浏览器定位 API 获取坐标
- 缓存最近一次成功结果，定位不可用时回退使用

### 世界时钟

- 使用 `Intl.DateTimeFormat` 与 IANA 时区，为每个城市渲染一行
- 对比每个城市与本地的日历日，显示 `+1d` / `-1d` 标记
- 跟随当前的 12/24 小时制设置

### 主题

- 通过 `body.light` 类切换深浅色，并存入 `chrome.storage.sync`
- 通过类名切换表盘风格并保存选择

## 浏览器支持

- Chrome 88+（支持 Manifest V3）
- Edge 88+
- 其他基于 Chromium 的浏览器

## 开发计划

- [x] 基于 Open-Meteo 的实时天气
- [x] 快捷键自定义选项页
- [x] 深色 / 浅色模式切换
- [x] 更多表盘风格
- [x] 24 小时 / 12 小时制切换
- [x] 世界时钟

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request。

## 作者

- 项目地址：[https://github.com/sky-jiangcheng/aurora-clock](https://github.com/sky-jiangcheng/aurora-clock)
- 联系方式：jiangcheng1806@gmail.com
