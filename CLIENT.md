# dsh-yaoking-company-office 客户端半部（常驻左栏「团队项目」）

证据缩写：`$DSH` = `<node 全局安装>/node_modules/@deepseek-ai/dsh/node_modules/@deepseek-ai`；`$PROFILE` = `~/.dsh/profiles/web/node_modules`。

## 1 信封
- `window.__ModuleLoader__.load({ id, factory })`；`factory(require)` 里 `var module={exports:{}}`、只 `require("react")`，末尾 `exports.name/inject/apply; return module.exports`。证据：`$PROFILE/dsh-my-questions-outline/lib/client.js:13-20`、`:455-458`。
- `package.json` 不需要改：`dsh.client={platform:"web"}` + `exports["./client"]` 已经够 Loader 发现；`cordis.patch.yml` 末尾的 Loader 条目照旧。
- 零依赖、无构建步骤；classic script，不能有 ESM 语法。

## 2 挂载（改版：不再用 panellist）
- 只注册 `shell.overlay`（`kind:"list"`，`$DSH/dsh-client-ui-layout/lib/client.js:643`）：
  `ctx.slots.register({ name:"shell.overlay", id:"dsh-yaoking-company-office", order:100 }, () => h(Sidebar, props()))`，
  写法同 `$PROFILE/dsh-my-questions-outline/lib/client.js:447-451`。
- 删掉 `main` 与 `sidebar.panellist` 两个注册。布局会在面板列表变化时把失效的 `activePanelId` 归零
  （`$DSH/dsh-client-ui-layout/lib/client.js:411`），所以移除是安全的，不会卡在空主区。
- 容器 `.dt-root`：`position:fixed; left:0; width:var(--dt-width,236px); top:var(--dt-top,104px);
  bottom:var(--dt-bottom,56px); z-index:30`。overlay 层自身 `z-index:20` 且建了栈上下文
  （`$DSH/dsh-client-ui-layout/lib/client.js:73` 的 `.overlayLayer`），所以 30 只在层内比较：
  高于侧栏、低于 portal 弹窗。
- **不动** 原生 `ui-workspace`：`sidebar.workspaces` 仍渲染在面板底下，「新建会话选工作区」不受影响。
- 位置/宽度都留了 CSS 变量（`:root{--dt-top:...;--dt-bottom:...;--dt-width:...}` 即可微调）。

## 3 视觉规格
- 宽度默认 236、圆角 8、行高：项目/员工行 28、会话行 26、字号 12.5/13；缩进两层：行 20、会话 34（每层 14–16）。
- 自上而下：蓝色主按钮「＋ 新建项目工作区」→ 项目卡片（折叠箭头 + 圆形首字图标 + 名称 + 状态点 + `＋` / 滑杆两个小动作）
  → 「开启新分析会话 [New]」→「团队公共聊天群 N」→「员工列表 ⚲」→ 项目经理 👑 / 员工文件夹行 → 会话行（圆点 + 标题 + 相对时间）
  → 最后「原始工作区」，默认折叠。
- 折叠箭头用 CSS `transform: rotate(90deg)`（`.dt-caret-on`），收起时整块不渲染。
- 计数徽章：灰色数字；有 running 会话时 `.dt-count-run`（绿点 + 数字，`title` 里写「N 个会话，M 个在跑」）。
  状态点 `.dt-status-on` 用 `--dsw-alias-state-success-primary`；皇冠用 `--dsw-alias-state-warn-primary`。
- 配色全部走 DSH token：`--dsw-specific-sidebar-fill`（不透明底）、`--dsw-alias-label-primary/secondary/tertiary`、
  `--dsw-alias-border-l3`、`--dsw-alias-interactive-bg-hover`、`--dsw-alias-state-success-primary`、`--dsw-alias-state-warn-primary/label`。
- **注意**：本主题里 `--dsw-alias-brand-primary` / `--dsw-alias-button-primary-fill` 是**黑白**的（浅色 #0f1115、深色 #f9fafb），
  不是参考图那种蓝。蓝色主色要用 `--dsw-alias-button-info-fill`（#4176e6 / 深色 #7aaaff）与其 hover，文字用
  `--dsw-alias-label-primary-foreground`（浅色白、深色近黑），否则深色模式白字会看不见。`New` 标签是 info 蓝 14% 的
  `color-mix` 底 + info 蓝字，前面留了 `interactive-bg-hover-accent` 兜底。

## 4 数据层（复用，未重写）
- `ctx.get("workspaces").list` / `ctx.get("sessions").list` 的 snapshot（`getSnapshot/subscribe`）经 `useSnapshot` 订阅。
- `team/` 探测一字未改：`probeOf` 先 `remote.workspaceFiles.list(sessionId,".")`，再回退 `remote.directoryPicker.list(path)`
  （macOS 本地只挂 native picker 时后者 unavailable，见 `$DSH/dsh-api-workspace-controller/lib/index.js:497`）。
- 分组判定一行未改：`team/` 存在 = 项目；项目路径之下的已注册工作区 = 员工（最长前缀）；其余 = 原始工作区；项目自身会话 = 项目经理。
- 唯一新增探测是 `team/runs/` 文件数：复用同一个 `useTeamDirs` hook，路径换成 `team/runs`，只数 `entries[].type==="file"`
  （`$DSH/dsh-api-workspace-files/lib/types/types.d.ts:83`）。拿不到（无会话作用域/目录不存在）就不显示徽章，不报错。

## 5 交互
- `＋ 新建项目工作区`：`uiWorkspace.pickDirectory()`（`$DSH/dsh-client-ui-workspace/lib/client.js:1559`）→
  `ctx.get("workspaces").create({ path })`（`$DSH/dsh-api-workspace-controller/lib/client.js:393`）；pickDirectory 不存在时回退 `remote.directoryPicker.pick()`；都没有就提示用原生 ＋。
- `开启新分析会话` 与卡片 `＋`：`uiWorkspace.startSession(workspaceId)`（`:1500`；内部即原生「新会话」流程）；
  不存在时回退 `openWorkspace(workspaceId)`（返回 Promise，失败会被 catch 成提示）。
- 点会话 → `uiWorkspace.openSession(id)`（`:1470`）。
- `团队公共聊天群`：宿主没有 `openFolder` / 文件面板 API（`uiWorkspace` 只有 pick/list/createDirectory），按约定渲染成**不可点**，
  `title` 显示 `<project>/team/runs` 绝对路径；没有 runs 计数时也不可点。
- 卡片滑杆（⚙ 位）：提示「重命名或删除请用原生侧栏的工作区菜单」，不做破坏性操作。
- 失败只提示：面板底部一行 `.dt-hint`，4.2s 自动消失；所有 click 处理都包 try/catch 或 Promise catch，从不抛。

## 6 已知视觉风险（按安装版源码算出来的）
1. **`--dt-top:104px` 可能压住原生「新会话」按钮**。原生侧栏栈：浏览器下 `padding 6 + logoRow(60+4) + 按钮 38`，
   按钮占 y=70–108（`$DSH/dsh-client-ui-sidebar/lib/client.js:91` 的 CSS）；桌面端还会多 52px 的 `topStrip`，按钮占 116–154。
   104 会切掉按钮底边（浏览器约 4px，桌面端约 50px）。要完整保留就设 `--dt-top:116px`（浏览器）/`170px`（桌面端）。
2. **236px 盖不满原生侧栏**。布局默认侧栏 280px（`$DSH/dsh-client-ui-layout/lib/client.js:239`），右侧会露出 44px 原生列表；
   `:root{--dt-width:280px}` 可整条盖住。
3. 侧栏收起成 48px 窄条时本面板不隐藏（按需求跳过了宽度感知；未做 `[data-sidebar-collapsed]` 联动）。

## 7 降级
- 拿不到 `workspaces`/`sessions`：一行「宿主没有提供…」说明；空工作区：「还没有注册任何工作区。」；探测中：「正在读取…」。
  没有项目但存在工作区时，仍渲染「原始工作区」段落，不空白。
- 整体渲染 `renderBody()` 包 try/catch，抛错也只换成一行 `.dt-err`，`.dt-root` 与主按钮仍在。
- 归档会话、blank 草稿会话不列出；`displayTitle` 缺失退回 sessionId；相对时间：刚刚 / N分钟 / N小时 / N天。
- 「＋ 招人」仍不在客户端做：招聘走 preset 内的 `team_hire` 工具，客户端调不到宿主工具。
