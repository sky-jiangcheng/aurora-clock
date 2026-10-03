# Aurora Clock 隐私政策

[English](privacy-policy.md) | 简体中文

最后更新：2026 年 10 月 3 日

Aurora Clock 是一个 Chrome 扩展，用于显示模拟时钟、双日期、世界时钟与本地天气。本政策说明该扩展如何处理你的信息。本扩展只有一个用途 —— 显示时间与日期信息，以及你所在位置的天气 —— 所有数据仅用于该用途。

## 概要

- 本扩展不收集任何个人信息。
- 位置仅在你授权后用于加载本地天气。
- 你的坐标只会发送给 Open-Meteo 天气 API，不会发往其他地方。
- 开发者没有服务器，也不会收到你的任何数据。

## 扩展处理的信息

### 位置（可选）

打开 Weather 标签页时，扩展会通过 `navigator.geolocation` 以粗略精度向浏览器请求当前坐标。若你拒绝授权，仅不会加载天气，其余功能均可正常使用。

你的坐标会被：

- 发送给 Open-Meteo API，用于获取当地天气预报；
- 缓存在本机，以便刷新期间或无法定位时仍能显示最近一次结果。

坐标不会发送给开发者，也不会发送给 Open-Meteo 之外的任何第三方。

### 保存在浏览器中的设置

| 数据 | 存储区域 | 用途 |
| --- | --- | --- |
| 表盘风格 | `chrome.storage.sync` | 恢复你选择的表盘 |
| 12/24 小时制 | `chrome.storage.sync` | 恢复你的时间制式 |
| 深色 / 浅色模式 | `chrome.storage.sync` | 恢复你的主题 |
| 最近一次天气结果（含其对应的坐标） | `chrome.storage.local` | 刷新期间或无法定位时显示最近一次结果 |

`chrome.storage.sync` 中的内容由 Chrome 通过你自己的 Google 账号同步，适用[ Google 隐私政策](https://policies.google.com/privacy)，开发者无权访问。`chrome.storage.local` 中的数据仅保存在你的设备上。

### 本扩展不会做的事

- 不收集姓名、邮箱、账号等任何个人身份信息
- 不读取浏览记录、标签页或网页内容
- 不做统计、遥测或崩溃上报
- 不含广告、追踪像素或 Cookie
- 不向第三方出售或共享数据
- 没有任何后端服务器 —— 开发者不收集任何数据

世界时钟完全在浏览器内通过 `Intl.DateTimeFormat` 计算，仅显示固定城市列表，不发起任何网络请求。

## 第三方服务

| 服务 | 用途 | 发送的数据 | 条款 |
| --- | --- | --- | --- |
| [Open-Meteo](https://open-meteo.com/) | 天气预报 | 你的坐标，以及任何网络请求都会携带的 IP 地址 | [Terms & Privacy](https://open-meteo.com/en/terms) |

天气数据由 Open-Meteo 依据 CC-BY 4.0 许可提供；Open-Meteo 的免费 API 仅限非商业用途。

## 权限说明

| 权限 | 用途 |
| --- | --- |
| `storage` | 保存表盘风格、时间制式、主题与最近一次天气结果 |
| `geolocation` | 请求坐标，使 Weather 标签页可显示本地天气 |
| `https://api.open-meteo.com/*` | 允许向 Open-Meteo 发起天气请求 |

## 数据保留与你的选择

- 设置与缓存的天气结果会一直留在你的设备上，直到你修改、清除扩展数据或卸载扩展。
- 在 Chrome 中禁止本扩展使用位置后，所有天气请求都会停止。
- 卸载扩展会移除其在本机保存的全部数据。

## 儿童隐私

本扩展不面向儿童，也不收集任何人的个人信息。

## 政策变更

如有变更，将在本页面公布并更新日期。

## 联系方式

如对本政策有疑问：jiangcheng1806@gmail.com

项目地址：[https://github.com/sky-jiangcheng/aurora-clock](https://github.com/sky-jiangcheng/aurora-clock)
