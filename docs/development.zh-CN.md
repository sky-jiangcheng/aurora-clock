# 开发流程

如何改代码、重新打包、部署到 Chrome。

## 唯一原则

**仓库根目录是唯一的源码来源（source of truth）。**

其余都是衍生物：

| 路径 | 角色 | 是否入库 |
|---|---|---|
| `manifest.json`、`popup.*`、`styles.css`、`options.*`、`icons/` | **源码** —— 改这些 | 是 |
| `aurora-clock.zip` | 发布产物，由源码打包而来 | 是 |
| `aurora-clock/` | zip 的解压副本，供 Chrome「加载已解压的扩展程序」使用 | 否 |

`aurora-clock/` 已列入 `.gitignore`。它是部署目标，不是你要改的代码。**绝不要在它里面修 bug** —— 下次重新打包时改动就丢了。

## 操作流程

1. 在**仓库根目录**改文件。
2. 改 `manifest.json` 里的 `version`。Chrome 会在 `chrome://extensions` 显示它，这也是区分新旧包唯一可靠的办法。同时同步更新中英双语 README 的版本号那一行。
3. 重新打包：

   ```bash
   cd aurora-clock && zip -r -X ../aurora-clock.zip \
     manifest.json popup.html popup.js styles.css options.html options.js LICENSE icons/ \
     -x "*.DS_Store"
   ```

   这条命令要在 `aurora-clock/` **目录内**执行。压缩包内的文件必须位于根层级，不能再套一层 `aurora-clock/` 文件夹 —— Chrome 会拒绝这种结构。

4. 刷新 Chrome 实际加载的那份解压副本：

   ```bash
   rm -rf aurora-clock && unzip -q aurora-clock.zip -d aurora-clock
   ```

5. 打开 `chrome://extensions`（**开发者模式**开启 → 对 Aurora Clock 点「重新加载」）。路径没变，不必重新选目录。

6. 验证：`manifest.json` 显示新版本号、弹窗能打开、各标签页正常渲染。

## 为什么版本号很重要

Chrome 会按目录缓存已解压的扩展。如果点了重新加载却分不清新代码到底有没有生效，就把 `chrome://extensions` 上的版本号和 `manifest.json` 对一下。每次都递增版本号，可以省掉全部猜测。

## 常见故障：「我改了代码，但什么都没变」

这几乎总是意味着改动没有传到 Chrome 真正加载的那个目录。按顺序排查这条链路：

```
改了根目录文件
  → 重新打了 aurora-clock.zip
    → 解压进 aurora-clock/
      → 在 chrome://extensions 点了「重新加载」
```

逐环校验：

```bash
# 1. 根目录与解压副本一致
cmp popup.js aurora-clock/popup.js && echo "in sync"

# 2. zip 与解压副本一致
mkdir -p /tmp/ac-check && unzip -q aurora-clock.zip -d /tmp/ac-check
diff -rq /tmp/ac-check aurora-clock -x ".DS_Store" && echo "zip in sync"
rm -rf /tmp/ac-check
```

## 常见故障：Weather 标签页什么都不显示

有两个独立的成因，实践中都遇到过：

**定位权限弹窗会杀掉弹窗。** 在弹窗内请求地理位置会让 Chrome 直接关闭该弹窗，请求随之中断。绝不要在弹窗打开时调用 `getCurrentPosition()` —— 现有代码刻意只在打开时加载缓存数据，定位是用户主动点定位按钮才触发。首次定位时弹窗被关闭一次属于 Chrome 的正常行为，不是 bug；之后重新打开，天气仍会用缓存正常渲染。

**缺少主机权限会表现为静默失败。** manifest 里没声明某个源时，`fetch` 会直接 reject 且不给有用的报错信息。代码只调用两个端点，两个都必须在 manifest 中声明：

| 端点 | 用途 | manifest 声明 |
|---|---|---|
| `api.open-meteo.com/v1/forecast` | 天气 | `https://api.open-meteo.com/*` |
| `geocoding-api.open-meteo.com/v1/search` | 城市搜索 | `https://geocoding-api.open-meteo.com/*` |

少了 geocoding 那条权限，城市搜索会静默失败。每次改完 manifest 建议审计一遍：

```bash
grep -oE "https://[a-z0-9.-]+/[a-z0-9/_-]*" popup.js | sort -u
python3 -c "import json;[print(h) for h in json.load(open('manifest.json'))['host_permissions']]"
```

第一条命令列出的每个端点，都需要第二条命令里有对应的匹配模式。

## 调试

- 在弹窗上**右键 → 检查**，打开弹窗自身的 DevTools（不是扩展管理页）。
- Network 面板能看出天气请求究竟有没有发出，以及是不是被权限拦下来了。
- `chrome.storage.local` 里的缓存键是 `weatherCache`；UI 显示陈旧但代码看着没问题时，清掉它是排查的第一步。