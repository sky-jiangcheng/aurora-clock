# 更改日志

本项目所有显著更改都将记录在此文件中。

此文件遵循 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) 格式，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/spec/v2.0.0.html)。

## [未发布]

## [v1.4.3] - 2026-10-06
### 已修复
- 发布工作流改为校验并上传仓库中已提交的 `aurora-clock.zip`，不再自行重打：
  原重打步骤遗漏了 `background.js`、`offscreen.html`、`offscreen.js`，
  导致其发布的 v1.4.2 包无法安装（商店以 "Not providing promised
  functionality" 拒审）。本版本不含产品代码变更。

## [v1.4.2] - 2026-10-06
### 更改
- 品牌名统一规范为 "Aurora Clock"，覆盖 manifest、界面与全部文档
  （原为 "auroraClock"）。仓库名与文件名（`aurora-clock`）保持不变。
- 隐私披露如实描述定位流程：安装或更新后进行一次后台定位读取、点击
  「使用我的位置」时获取新坐标、打开 Weather 标签页仅读取本地缓存。
  权限表同时补上 `offscreen` 与 geocoding host 权限。

### 已修复
- 开发指南：重打包命令改为在仓库根目录执行。原命令（`cd aurora-clock && zip ...`）
  会用旧的部署副本打 zip，导致根目录的修改进不了包。
- 商店文案：补上必需的 `offscreen` 权限声明，并修正 `geolocation` 声明。

## [v1.4.1] - 2026-10-06
### 已修复
- CI 工作流程现在验证已提交的 `aurora-clock.zip`，而不是重新构建，
  防止在上传的软件包中遗漏文件（`background.js`、`offscreen.html`、`offscreen.js`）。

## [v1.4.0] - 2026-10-05
### 新增
- 通过 service worker + offscreen 文档实现自动地理位置（MV3 兼容），
  使得弹窗打开时即可显示本地天气，且不会因权限提示而关闭弹窗。
- 背景地理位置逻辑的单元测试（`test/background.test.js`）。

### 变更
- 版本号升至 1.4.0。

### 修复
- 错误处理现在会暴露真实原因（超时、网络、无匹配），而不是通用的
  “城市搜索失败”（`describeError`）。
- 移除临时 harness 文件。

## [v1.3.0] - 2026-10-05
### 新增
- 通过 Open-Meteo 地理位置 API 进行城市搜索。
- 清单版本 v1.3.0。

### 修复
- （无功能更改；仅为清单更新而进行的版本号提升。）

## [v1.2.1] - 2026-10-03
### 新增
- README 中的真实截图。
- 对 `https://geocoding-api.open-meteo.com/*` 的主机权限。

## [v1.2.0] - 2026-10-03
### 新增
- 初始版本。
