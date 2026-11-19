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
- 容器 `.dt-root`：`position:fixed; left:0; width:var(--dt-width,280px); top:var(--dt-top,204px);
  bottom:var(--dt-bottom,64px); z-index:30`。overlay 层自身 `z-index:20` 且建了栈上下文
  （`$DSH/dsh-client-ui-layout/lib/client.js:73` 的 `.overlayLayer`），所以 30 只在层内比较：
  高于侧栏、低于 portal 弹窗。
- **不动** 原生 `ui-workspace`：`sidebar.workspaces` 仍渲染在面板底下，「新建会话选工作区」不受影响。
- 位置/宽度都留了 CSS 变量（`:root{--dt-top:...;--dt-bottom:...;--dt-width:...}` 即可微调）。

## 3 视觉规格
- 尺寸：宽度默认 280（`--dt-width`）、顶 204（`--dt-top`）、底 64（`--dt-bottom`）；圆角 8、行高：项目/员工行 28、会话行 26、字号 12.5/13；缩进两层：行 20、会话 34（每层 14–16）。
- 自上而下：蓝色主按钮「＋ 新建项目工作区」→ 项目卡片头（折叠箭头 + 圆形首字图标 + 名称 + 状态点 + `移除登记`；
  旧的 `＋` / 滑杆两个图标已移除）→ 展开后先看到 `.dt-actions`：「＋ 新会话」（`.dt-btn-main`）/「＋ 招员工」（`.dt-btn`）
  →「团队公共聊天群 N」→「员工列表 ⚲」→ 项目经理 👑 / 员工文件夹行（悬停出现 `＋`）
  → 会话行（圆点 + 标题 + `.dt-badge` PM/员工 + 相对时间 + `⌫`）→ 最后「原始工作区」，默认折叠。
- 空项目（没有员工、也没有会话）在卡片体最上方先渲染 `.dt-guide`「第一次用？三步上手」：默认展开，
  点标题可收起/展开，收起状态只在内存（刷新后回到展开）。
- 非 devteam 的项目会话在动作行下方渲染 `.dt-warn`：标题「这个会话不是项目经理预设，没有 team_* 工具」+
  会话标题（`.dt-warn-sub`，超长省略）+「重建为项目经理会话」按钮。
- 卡住行：`.dt-row-ses-stuck`（warn 10% 浅底）+ 时间文字 `.dt-stuck`（现有 warn 色、600 字重），不新造重效果。
- 折叠箭头用 CSS `transform: rotate(90deg)`（`.dt-caret-on`），收起时整块不渲染。
- 计数徽章：灰色数字；有 running 会话时 `.dt-count-run`（绿点 + 数字，`title` 写成「N 个会话，M 个在跑」；没有 running 时 title 只有「N 个会话」）。
  状态点 `.dt-status-on` 用 `--dsw-alias-state-success-primary`；皇冠用 `--dsw-alias-state-warn-primary`。
- 配色全部走 DSH token：`--dsw-specific-sidebar-fill`（不透明底）、`--dsw-alias-label-primary/secondary/tertiary`、
  `--dsw-alias-border-l3`、`--dsw-alias-interactive-bg-hover`、`--dsw-alias-state-success-primary`、`--dsw-alias-state-warn-primary/label`。
- **注意**：本主题里 `--dsw-alias-brand-primary` / `--dsw-alias-button-primary-fill` 是**黑白**的（浅色 #0f1115、深色 #f9fafb），
  不是参考图那种蓝。蓝色主色要用 `--dsw-alias-button-info-fill`（#4176e6 / 深色 #7aaaff）与其 hover，文字用
  `--dsw-alias-label-primary-foreground`（浅色白、深色近黑），否则深色模式白字会看不见。`PM` 徽章是 info 蓝 14% 的
  `color-mix` 底 + info 蓝字，前面留了 `interactive-bg-hover-accent` 兜底。
- 新增 `.dt-actions` / `.dt-btn` / `.dt-btn-main`、`.dt-badge` / `.dt-badge-pm` / `.dt-badge-staff`、
  `.dt-warn` / `.dt-warn-title` / `.dt-warn-sub` / `.dt-warn-act`、`.dt-guide` / `.dt-guide-head` / `.dt-guide-list`、
  `.dt-pip`、`.dt-row-ses-stuck`。颜色全部走 DSH token（info 蓝 / warn / label / border / interactive），
  不新增硬编码色值；`color-mix` 都带 token 兜底（badge 的 info 底色先写了 `interactive-bg-hover-accent`）。

## 4 数据层（复用，未重写）
- `ctx.get("workspaces").list` / `ctx.get("sessions").list` 的 snapshot（`getSnapshot/subscribe`）经 `useSnapshot` 订阅。
- `team/` 探测一字未改：`probeOf` 先 `remote.workspaceFiles.list(sessionId,".")`，再回退 `remote.directoryPicker.list(path)`
  （macOS 本地只挂 native picker 时后者 unavailable，见 `$DSH/dsh-api-workspace-controller/lib/index.js:497`）。
- 分组判定：`team/` 存在**或**目录被面板声明过（见下条）= 项目；项目路径之下的已注册工作区 = 员工（最长前缀）；
  其余 = 原始工作区；项目自身会话 = 项目经理。
- 「声明」是纯客户端标记：`localStorage["dsh-yaoking-company-office:projects"]` 存路径数组，旧包名的
  `dsh-devteam:projects` 读到会迁到新键。作用是空目录刚建项目、`team/` 还没出现时也先归进项目组，不掉进「原始工作区」；
  `＋ 新建项目工作区` 成功后写一次。它只在浏览器本地，换机器/清缓存后要重新登记。
- 唯一新增探测是 `team/runs/` 文件数：复用同一个 `useTeamDirs` hook，路径换成 `team/runs`，只数 `entries[].type==="file"`
  （`$DSH/dsh-api-workspace-files/lib/types/types.d.ts:83`）。拿不到（无会话作用域/目录不存在）就不显示徽章，不报错。

## 5 交互
- `＋ 新建项目工作区`：`uiWorkspace.pickDirectory()`（`$DSH/dsh-client-ui-workspace/lib/client.js:1559`）→
  `ctx.get("workspaces").create({ path })`（`$DSH/dsh-api-workspace-controller/lib/client.js:393`）；pickDirectory 不存在时回退 `remote.directoryPicker.pick()`；都没有就提示用原生 ＋。
- `＋ 新会话`（项目卡片顶部，`dt-actions` 左）：`uiWorkspace.startSession(workspaceId, preset ? { agentPreset: preset } : undefined)`
  （宿主 `dsh-client-ui-workspace/lib/client.js:1499` 起，`options.agentPreset` 一路传到 `openWorkspace`）。
  项目传 `devteam`，员工传 `standard`。**宿主 `startSession` 是 void 且内部 console.warn + notify 吞错，成功也返回
  `undefined`，所以 `undefined` 视为成功**——不能当失败再走 `sessions.create`，否则一次点击会建出两个会话。
  宿主抛错 / 明确返回 `false` / 返回 rejected Promise / 没有 `startSession` / 旧宿主只声明一个参数时，回退
  `sessions.create({ workspaceId, agentPreset })` → `openSession(id)`；再没有 `create` 时才退回 `openWorkspace(workspaceId)`。
- `＋ 招员工`（`dt-actions` 右）：不是招聘。优先打开项目第一个 `devteam` 会话（没有则第一个会话），
  顶部提示条给可复制原话「招一个前端，负责……」，并说明招人由 PM 的 `team_hire` 执行；没有会话时提示先开一个。
- 员工行 `＋`：悬停出现（`.dt-pip`，与 `⌫` 同一套显隐），`newSession(workspace, 'standard')` 走同一条预设透传，打开新会话。
- 会话行徽章：`projectionValues.agentPreset === 'devteam'` → `PM`；`'standard'` → `员工`；
  其它或缺失不显示。徽章的 `title` 写明“开发团队预设（项目经理，带 team_* 工具）”/“standard 预设（员工）”。
- 非 devteam 项目会话：`presetWarning` 渲染黄条；「重建为项目经理会话」先用
  `sessions.create({ workspaceId, agentPreset: 'devteam' })` 拿到新 id、`openSession` 打开，成功后才
  `archiveSession(旧)`；新建失败不动旧会话，归档失败走提示条。不强制 `stopActivity`，运行中的旧会话可能归档失败，会如实提示。
- 空项目引导：`guideBlock`，只在 `!employees.length && !sessions.length` 时出现；三步；默认展开；`isOpen('guide:<workspaceId>', true)`，
  状态只在内存。
- `可能卡住?`：`running && now - updatedAt > 5 分钟`。`useNow(30_000)` 每 30 秒 setState 一次，`relTime` / `stuckOf`
  都收 `now`；卸载时 `clearInterval`。`title` 原文：“可能卡住：5 分钟没有新动静；也可能是长任务。权限已自动兜底，一般是卡在模型/工具上。”
- 点会话 → `uiWorkspace.openSession(id)`（`:1470`）。
- `团队公共聊天群`：宿主没有 `openFolder` / 文件面板 API（`uiWorkspace` 只有 pick/list/createDirectory），按约定渲染成**不可点**，
  `title` 显示 `<project>/team/runs` 绝对路径；没有 runs 计数时也不可点。
- 失败只提示：面板顶部 `.dt-flash` 一行（错误 `role=alert`、提示 `role=status`），6s 自动消失，点击可关闭；所有 click 处理都包 try/catch 或 Promise catch，从不抛。

## 6 已知视觉风险（按安装版源码算出来的）
1. **`--dt-top` 与原生「新会话」按钮**。原生侧栏栈：浏览器下 `padding 6 + logoRow(60+4) + 按钮 38`，
   按钮占 y=70–108（`$DSH/dsh-client-ui-sidebar/lib/client.js:91` 的 CSS）；桌面端还会多 52px 的 `topStrip`，按钮占 116–154。
   当前默认 `--dt-top:204px` 已经让开这条（早期的 104 会切掉按钮底边）；要更贴紧可下调，但别低于 116（浏览器）/170（桌面端）。
2. **`--dt-width` 与原生侧栏宽度**。布局默认侧栏 280px（`$DSH/dsh-client-ui-layout/lib/client.js:239`），
   当前默认 `--dt-width:280px` 正好整条盖住；改小会在右侧露出原生列表（早期的 236 会露 44px）。
3. 侧栏收起成 48px 窄条时本面板不隐藏（按需求跳过了宽度感知；未做 `[data-sidebar-collapsed]` 联动）。

## 7 降级
- 拿不到 `workspaces`/`sessions`：一行「宿主没有提供…」说明；空工作区：「还没有注册任何工作区。」；探测中：「正在读取…」。
  没有项目但存在工作区时，仍渲染「原始工作区」段落，不空白。
- 整体渲染 `renderBody()` 包 try/catch，抛错也只换成一行 `.dt-err`，`.dt-root` 与主按钮仍在。
- 归档会话、blank 草稿会话不列出；`displayTitle` 缺失退回 sessionId；相对时间：刚刚 / N分钟 / N小时 / N天。
- 「＋ 招员工」仍不在客户端招人：它只打开项目经理会话并给一句可复制原话；招聘走 preset 内的 `team_hire` 工具，
  客户端调不到宿主工具。
