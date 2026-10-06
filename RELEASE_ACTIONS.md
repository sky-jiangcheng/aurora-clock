# GitHub Release（v1.4.1）— 手动创建指南

由于仓库的 GitHub Token 已失效，自动创建 Release 需要用户自行操作。

## 一、已有资产
- Tag `v1.4.1` 已推送，指向提交 `4c8c5d8`
- 该 tag 内的 `aurora-clock.zip` 是正确构建的包（含 `background.js`、`offscreen.html`、`offscreen.js` 等全部文件）
- 可直接从以下 URL 下载：
  https://github.com/sky-jiangcheng/aurora-clock/releases/download/v1.4.1/aurora-clock.zip
（此 URL 只有在 Release 创建后才会生效；下面的步骤会创建 Release 并上传此同一文件。）

## 二、通过网页创建（推荐）
1. 打开 https://github.com/sky-jiangcheng/aurora-clock/releases/new
2. 选择 Tag version：`v1.4.1`
   - Release title 建议填：`auroraClock v1.4.1`
   - 描述可以直接复制 `CHANGELOG.md` 中对应片段
3. 在 “Attach binaries by dragging & dropping” 框里，把本地的 `aurora-clock.zip` 拖进去
   （该文件即仓库根目录下已提交的 `aurora-clock.zip`，与 tag 内容完全一致）
4. 勾选 “This is a pre-release” 如需（目前均为稳定版）
5. 点击 “Publish release”

## 三、通过命令行（若你有效的 token）
如果你拥有有效的 Personal Access Token（具备 `repo` 权限），可执行：

```bash
# 1. 确认本地 tag 已经是最新
git fetch --tags origin
git checkout v1.4.1

# 2. 创建 release并上传已有的 zip（避免重复构建）
gh release create v1.4.1 aurora-clock.zip \
  --title "auroraClock v1.4.1" \
  --notes "$(sed -n '/^## \[v1.4.1\]/,/^## \[/p' CHANGELOG.md | sed '$d')"
```

> 注意：上述 `gh release create` 默认会先删除同名 release（如果存在），请先确认没有重要数据。

## 四、验证
Release 发布后，以下链接将可用：
- Release 页：https://github.com/sky-jiangcheng/aurora-clock/releases/tag/v1.4.1
- ZIP  下载：https://github.com/sky-jiangcheng/aurora-clock/releases/download/v1.4.1/aurora-clock.zip

这份说明也会随仓库一起保存，文件为 `RELEASE_ACTIONS.md`。