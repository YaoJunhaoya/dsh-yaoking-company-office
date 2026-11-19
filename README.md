# dsh-yaoking-company-office

[![npm version](https://img.shields.io/npm/v/dsh-yaoking-company-office.svg)](https://www.npmjs.com/package/dsh-yaoking-company-office)
[![license](https://img.shields.io/npm/l/dsh-yaoking-company-office.svg)](LICENSE)

> DeepSeek Harness（DSH）插件：把「我一个人跟一个 AI 聊」变成「我带着一个团队做事」。

装上之后，DSH 的模式下拉里会多一个 **「开发团队」**。选它新建会话，对面坐的是**项目经理**——他不写代码、不写文案，只做四件事：搞清楚要做什么、拆活、招人、验收。真正干活的是他招来的员工，而每个员工是**项目下的一个子工作区**：有自己的会话列表、能并行开会话、能自己派 subagent。

插件还会在左栏挂一块**团队面板**，把「项目 → 员工 → 会话」摊平给你看，不用在原生侧栏里翻。

- npm：<https://www.npmjs.com/package/dsh-yaoking-company-office>
- GitHub：<https://github.com/YaoJunhaoya/dsh-yaoking-company-office>
- 装法见 [三、安装](#三安装)，升级见同一节的「更新（已经装过的人）」。不会命令行：DSH 的「插件」页 → 安装第三方插件 → 贴包名 → 重启。会命令行，一条就够：`dsh plugin --profile web add dsh-yaoking-company-office`（Windows / macOS / Linux 通用）。

---

## 一、这套东西是怎么跑的

关键词是**星形结构**：

```
              你
               │  只跟项目经理论事
        ┌──────▼──────┐
        │  项目经理 PM │  ← 一个会话，管这个项目的全部方向
        └──┬───┬───┬──┘
    派活   │   │   │   验收
      ┌────▼┐ ┌▼───┐ ┌▼────┐
      │ 前端 │ │后端│ │ 测试 │  ← 每个是一个子工作区（不是 subagent）
      └──┬──┘ └─┬──┘ └──┬──┘
         └──────┴───────┘
            共享同一块磁盘：能互相读产出，
            但**没有**互相派活的通道，协调只能经 PM
```

为什么员工不做成 subagent，而是做成子工作区：

| | subagent | 子工作区（本项目） |
|---|---|---|
| 生命周期 | 跑完就没了 | 一直在，能接着干、能返工 |
| 会话数 | 一次一个 | 可并行多个 |
| 你自己能进去看/接管 | 不能 | 能，点一下就进去聊 |
| 上报路径 | 只能回给父 | 写 `REPORT.md`，PM 用 `team_report` 归档 |

PM 派活是**全自动**的：你在 PM 会话里说一句话，他调 `team_hire` 建岗、调 `team_dispatch` 派活，员工的会话在路由里就起来了。整个过程不需要你点任何按钮。

---

## 二、一个项目长这样

```
记账啊/                     ← 项目工作区（PM 的会话住在这里）
├── AGENTS.md               ← 项目规矩：技术栈、红线、目录约定
├── team/
│   ├── STATE.md            ← 做到哪、卡在哪、下一步（PM 独占写权）
│   └── runs/               ← 派活与汇报的流水账，按 taskId 配对
│       ├── 20261119-0130-fe-task.md
│       └── 20261119-0152-fe-report.md
├── fe/                     ← 员工①，一个独立的子工作区
│   ├── AGENTS.md           ← 岗位说明（谁写的：team_hire）
│   └── REPORT.md           ← 员工每次收工自己写的汇报
├── be/                     ← 员工②
└── code/                   ← 代码类项目才有
    ├── code-前端app/
    └── code-后端/
```

- **团队怎么组，不预设。** PM 的人设是「按产出物组队」：做 App 就招交互/前端/后端/测试，做提示词库就招提示词工程/评测/素材，做内容就招调研/写手/校对。他自己判断。
- **代码类项目**统一进 `code/`，每个写代码的岗位占一个 `code-<岗位>` 目录。非代码项目**不建** `code/`。
- **项目根只放账本和文档**，不放业务产出。

---

## 三、安装

DSH 插件装在**当前 profile** 里（默认 `~/.dsh/profiles/web`；Windows 是 `%USERPROFILE%\.dsh\profiles\web`）。下面四种装法按推荐顺序，任选其一。

### 方法 1：在 DSH 界面里点几下（推荐，跨平台）

DSH 自带第三方插件安装器，会**顺手把这个包加进 profile 的 bundle 列表**，不用手改配置文件。

1. 打开 DSH → 进入 **「插件」**（插件管理）
2. 点 **「安装第三方插件」**
3. 「包名或地址」填包名：

   ```
   dsh-yaoking-company-office
   ```

4. 「安装源」按网络选：国内选 **「淘宝镜像」**，海外选 **「npm 官方源」**
5. 装完按提示 **完全重启 DSH**（重启进程，不是刷新页面）

> 从 GitHub 装也一样：第 3 步贴 `https://github.com/YaoJunhaoya/dsh-yaoking-company-office`，代码是同一份。
> 安装器底层用 pnpm，若报 `pnpm-missing`，先 `npm i -g pnpm` 再装。
> 已经装过旧版、要升级时：团队面板会盖住原生侧栏的「插件」入口，先点 **「收起面板 ▴」** 再进去。

### 方法 2：终端一条命令（推荐给命令行党，Windows / macOS / Linux 通用）

DSH 本体是 Node 应用，`dsh plugin` 在 PowerShell、Windows Terminal、macOS / Linux 的终端里用法完全一样：

```bash
dsh plugin --profile web add dsh-yaoking-company-office
```

- 装完会**自动**把这个包追加到该 profile `package.json` 的 `dsh.profile.bundles` **末尾**，不用再手改配置。
- `dsh plugin` 后面的参数是**原样转发给 pnpm** 的，所以 pnpm 的参数可以直接跟在后面：`dsh plugin --profile web add <包名> --registry=<源>`。
- 装完**完全重启 DSH**（杀进程重开）。

> ⚠️ **国内镜像会滞后**。默认源指向国内镜像（`registry.npmmirror.com`）时，实测（2026-11-19）镜像还停在 **1.0.1**，官方源已是 **1.1.0**——镜像同步通常要等一段时间。想要刚发布的版本，就把源显式指过去：
>
> ```bash
> dsh plugin --profile web add dsh-yaoking-company-office --registry=https://registry.npmjs.org/
> ```
>
> 实测这条能装到官方源上的最新版（当时是 **1.1.0**），且 `lib/guard.js`（会话守卫）在包里。

**Windows 补充**：profile 路径是 `%USERPROFILE%\.dsh\profiles\web`；PowerShell 里进这个目录写 `cd $env:USERPROFILE\.dsh\profiles\web`。命令本身不用改，`dsh plugin …` 与 mac / Linux 一字不差。

（插件在 Windows 上跑起来会用到 pwsh 工具，preset 里已按平台切换 `disabled`，那是运行期的事，与安装无关。）

### 方法 3：`npm i` + 手工加 bundle

macOS / Linux：

```bash
cd ~/.dsh/profiles/web
npm i dsh-yaoking-company-office
```

Windows（PowerShell）：

```powershell
cd $env:USERPROFILE\.dsh\profiles\web
npm i dsh-yaoking-company-office
```

⚠️ **这样装完还要手工加 bundle**，否则包装上了但不加载——`npm i` 只写 `dependencies`，**不会**写 `dsh.profile.bundles`（这正是它不如方法 2 的地方）。

`~/.dsh/profiles/web/package.json`（Windows：`%USERPROFILE%\.dsh\profiles\web\package.json`）

```json
{
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "…别的插件…",
        "dsh-yaoking-company-office"
      ]
    }
  }
}
```

这一行必须加在**最后**：bundle 按顺序套用，本插件要叠在基础 bundle 之上。

### 方法 4：本地源码 `link:`（想改代码 / 离线装）

先把源码克隆到本地：

```bash
git clone https://github.com/YaoJunhaoya/dsh-yaoking-company-office.git
```

macOS / Linux：

```bash
cd ~/.dsh/profiles/web
npm i "link:/你克隆到的路径/dsh-yaoking-company-office"
```

Windows（PowerShell，路径按你实际克隆的位置改）：

```powershell
cd $env:USERPROFILE\.dsh\profiles\web
npm i "link:D:\code\dsh-yaoking-company-office"
```

同样要按方法 3 手工加 bundle。用 `link:` 装的好处是改完源码重启就生效，不用重装。

### 更新（已经装过的人）

装过一次以后，**不要重跑「方法 2」那条不带版本号的安装命令**：pnpm 看到 lockfile 里已有的旧版本（`^1.0.1` 或 `1.0.1`）就认为满足，直接跳过 resolution，终端显示 `Already up to date`，版本停在原地。

**主推写法（跨平台）**：把 `<版本号>` 换成 npm 页面上的最新版本号（本文写作时是 **1.1.2**，以 [npm 页面](https://www.npmjs.com/package/dsh-yaoking-company-office) 为准），显式带上版本：

```bash
dsh plugin --profile web add dsh-yaoking-company-office@1.1.2
```

国内默认源（`registry.npmmirror.com`）**滞后**，刚发布的版本常常还没同步。想拿刚发布的版本，显式走官方源：

```bash
dsh plugin --profile web add dsh-yaoking-company-office@1.1.2 --registry=https://registry.npmjs.org/
```

> 这条会同时把 `dependencies` 写成具体版本、把包装进 `node_modules`；`dsh.profile.bundles` 里本来就有本包，**不会重复登记**（实测仍只有一条）。

**备选写法（不想记版本号）**：绕过 dsh 包装，直接进 profile 目录用 pnpm 装 `@latest`。

macOS / Linux：

```bash
cd ~/.dsh/profiles/web
pnpm add dsh-yaoking-company-office@latest --registry=https://registry.npmjs.org/
```

Windows（PowerShell）：

```powershell
cd $env:USERPROFILE\.dsh\profiles\web
pnpm add dsh-yaoking-company-office@latest --registry=https://registry.npmjs.org/
```

> 这条路只更新 `node_modules` 与 `dependencies`，**不碰** `dsh.profile.bundles`——已经装过的人那里本来就有这一条，不用再加。

> pnpm 10.16 起默认把 **24 小时内新发布**的版本暂缓安装（`minimumReleaseAge=1440`，DSH 新建的 profile 也是这个默认）。所以包刚发布就跑 `@latest`，pnpm 会解析回旧版，终端显示 `Lockfile is up to date, resolution step is skipped`。要立刻拿到刚发布的版本，临时关掉这道暂缓（只影响这一次命令）：
>
> ```bash
> pnpm add dsh-yaoking-company-office@latest --registry=https://registry.npmjs.org/ --config.minimumReleaseAge=0
> ```
>
> 不急就等发布满 24 小时，用上面的原命令即可。

> ⚠️ **这两条别用**：`dsh plugin --profile web update dsh-yaoking-company-office --latest` 和 `dsh plugin --profile web add dsh-yaoking-company-office@latest` **当前都不会真的升级**——pnpm 认为 lockfile 里的版本范围已经满足，直接跳过 resolution，版本停在旧版（实测停在 1.0.1，`--registry` 带不带都一样）。所以升级要么带具体版本号（主推写法），要么直接跑 pnpm（备选写法）。

**更新完必须完全重启 DSH**：杀进程重开，刷新页面不算——宿主侧的会话守卫与 `team_report` 只在启动时注册。

更新**不会动你的项目数据**：`team/`、两份 `AGENTS.md` 都在项目目录里；会话存在 `~/.dsh/sessions/`（Windows：`%USERPROFILE%\.dsh\sessions\`）。插件只换代码。

**更新后自查三条**：

1. 「插件」页里 `dsh-yaoking-company-office` 的版本号变成新版本，且没有 `broken`；
2. 新建会话的模式下拉里 **「开发团队」** 还在；
3. 左栏 **「团队面板」** 正常出现（只剩一个小胶囊就点 **「▾ 展开团队」**）。

### 装完检查三件事

**任一种装法都要「完全重启」DSH：杀进程重开，刷新页面不算。**

> 1.1.0 起新增的宿主侧「会话守卫」和 `team_report` **只在启动时注册**：只刷新页面、只热加载都看不到，必须杀掉进程重开一次。

1. 「插件」页里能看到 `dsh-yaoking-company-office`，且没有 `broken`；
2. 新建会话的模式下拉里出现 **「开发团队」**；
3. 左栏出现 **「团队面板」**（如果只剩一个小胶囊，点 **「▾ 展开团队」**）。

---

## 四、第一次用：四步

1. **看一眼左栏的「团队面板」**。它默认是展开的；如果只剩一个小胶囊，点 **「▾ 展开团队」**。
2. **先建好项目文件夹**。插件不会替你建目录，先在 Finder 或终端里把这个项目的文件夹建好（放在哪都行，别放在插件源码目录里）。
3. **点面板上的「新建项目工作区」**，选中刚才那个文件夹。它会：把目录注册成工作区 → 记进面板的项目列表 → 顺手开一个项目经理会话。
4. **进项目经理会话。** 面板新建的会话已经带「开发团队」预设；权限不用手动设——会话守卫会把这个项目工作区里的会话自动切成「完全权限」，审批也自动放行。

   > 以前这一步要手动点「完全权限」，是因为新会话默认会停下来问审批，没人应答，他那一轮就永远停在那儿。守卫（`lib/guard.js`）就是把这步自动化了：顶部留了两个开关（`AUTO_FULL_ACCESS` / `AUTO_APPROVE`），关掉就退回手动点。

然后直接跟 PM 说你想做什么就行了。他不知道项目细节时会主动问你三个问题（做成什么样算能用 / 最在意什么 / 有什么不能碰），答完他就开始拆活招人。

---

## 五、注意事项

### 必须做

1. **先「展开团队」→ 建文件夹 → 点「新建项目工作区」选中它 → 预设选「开发团队」。** 顺序别倒：目录必须**先存在**才能被选中；「完全权限」由会话守卫自动设（见上一节第 4 步）。
2. **招人让 PM 来。** 不要自己手动建员工目录、不要自己套员工 AGENTS.md。`team_hire` 会把目录、岗位说明、工作区注册、`team/` 骨架一次做齐；手工建出来的目录 PM 认不出来。
3. **PM 招完人，扫一眼面板。** 员工会话和 PM 一样由守卫兜底：项目工作区（自身或上一层带 `team/` 或 `.git`，或会话本身是「开发团队」预设）里的会话，创建或恢复时都会自动切「完全权限」，审批请求也自动放行。宿主服务拿不到时守卫只记一条日志、安静跳过——只有这种情况才需要你手动补一次「完全权限」。员工长时间没动静时面板会标 `可能卡住? N分钟`（5 分钟没有新更新就标，30 秒自刷新），它只表示「可能」：权限已自动兜底，一般卡在模型或长命令上。
4. **想恢复正常使用，就「收起面板」或者关掉插件。** 收起后面板缩成一个小胶囊挂在左侧，原生侧栏（插件、自动化任务、归档、删除、右键菜单）全都回来。
5. **升级或卸载插件后要完全重启 dsh。**

### 别做

1. **别动专属项目的会话。** 面板里给每个会话提供了 `⌫ 归档`，但**不要删项目工作区、不要清空这些会话**——PM 的记忆、员工的上下文、`team/runs/` 的配对都挂在上面。要停就停，不要删。
2. **别让员工写 `../team/`。** 员工是「完全权限」，文件系统并不拦他；隔离只在工具通道（`team_*` 只注册给 PM 的预设），这条靠的是约定，不是权限。员工的汇报固定写在**自己目录的 `REPORT.md`**，由 PM 用 `team_report` 归档进 `team/runs/`。这条已经写进员工 AGENTS.md，你别去改。
3. **别手工编辑 `team/runs/` 里的 front-matter。** `taskId` 是 task 和 report 的**唯一**连接键，改坏了配对就断，员工看起来永远没交活。
4. **别删 `team/` 目录。** 面板靠 `team/` 判断「这是项目还是普通工作区」。删了，项目就掉回「原始工作区」分组里（不会丢文件，但你得重新登记）。
5. **别把这个插件装进多个 profile 后互相同步会话目录。** 会话是存在 `~/.dsh/sessions/`（Windows：`%USERPROFILE%\.dsh\sessions\`）下的，两个 DSH 实例同时跑同一批会话会互相踩。

### 一些我踩过的坑

- **`npm i` 只写 `dependencies`，不写 bundles 数组**——这也正是 `dsh plugin add` 存在的理由（它会自动追加到 `dsh.profile.bundles`）。用 `npm i` 装完模式没出现，八成是漏了方法 3 那步手工加 bundle。
- **`EPERM … package.json.lock`**：DSH 在跑的时候装插件可能抢锁，先关掉 dsh 再装。
- **面板盖住了原生侧栏的一部分**（插件、自动化任务那些行）。这是刻意的取舍——不盖就得接管整个单槽侧栏，那会把原生的归档/删除/拖拽排序全弄丢。用「收起面板」切回去。
- **看不到「项目 └ 员工」的嵌套**：原生侧栏要切 `View options → Group by → Workspace Tree`。面板里本来就是嵌套的。
- **成本**：PM 每轮都带全套工具定义，实测一轮在 8 万 token 量级。长任务跑之前看一眼余额。
- **员工之间能互相读文件，但没有互相派活的工具。** 这是结构性的（`team_*` 只注册在「开发团队」预设的作用域里，员工跑的是 standard），不是提示词纪律。所以「让前端去催后端」这种事只能经 PM。

---

## 六、四个工具（只对 PM 可见）

| 工具 | 参数 | 做什么 |
|---|---|---|
| `team_hire` | `role`（单段 kebab，如 `fe`）`duty`（必填）`title?` `readFirst?` | 建 `<项目>/<role>/`、写岗位 `AGENTS.md`（已存在不覆盖）、注册成工作区、补 `team/` 与项目 `AGENTS.md` 骨架 |
| `team_dispatch` | `role` `task` `title?` | 在员工工作区里新建 standard 会话 → 写 `team/runs/<时间>-<role>-task.md` → 把任务书投进去。**立刻返回，不等员工**。投递失败时把 task 标成 `status: undelivered`，返回 `delivered:false`（不重试、不删文件） |
| `team_status` | `role?` `since?` `limit?` | 读 `team/runs/` 的 front-matter，按 `taskId` 配对，返回未完成任务 + 最近汇报 + 谁在跑。`limit` 默认 200、最大 2000；返回 `scanned`（实际扫了几个文件）与 `truncated`。`since` 同时过滤 task 与 report |
| `team_report` | `role` `taskId?` `status?` `files?` | 读 `<role>/REPORT.md`，用 front-matter 的 `taskId`（或参数）匹配一条尚未汇报的 task，写 `team/runs/<时间>-<role>-report.md`。匹配不到 / 缺 taskId / 没有 REPORT.md 都拒绝且不写文件 |

`accepted: true` 只代表**投递成功**，不代表做完。验收永远要看 `team_status` 的 `lastReport`，以及 PM 自己打开文件看。

- `team_dispatch` 成功还会返回 `delivered: true`；失败是 `delivered: false` + `runFile`，那条 task 的 front-matter 已被改成 `status: undelivered`。
- `team_status` 的 `scanned` 是实际读取的 runs 文件数，`truncated` 表示是否因 `limit` 截断；`openTasks[].status` 可能是 `assigned` 或 `undelivered`——看到 `undelivered` 先重派或修会话，不要当员工在干活。
- `team_status` 不传 `since` 时看全窗口；传了 `since` 时 task 与 report 都按 `at` 过滤，窗口内没有对应 report 的 task 才算 open。
- `team_report` 的错误码：`unknown-task`（附最近 `openTasks`）、`missing-report`、`bad-request`（缺 taskId 或正文为空）、`already-reported`、`role-mismatch`、`no-cwd`、`run-write-failed`。
- `team_hire` 建目录/骨架失败现在返回 `ensure-failed`（以前误报 `path-conflict`），`message` 是原始错误。
- `team_report` 最多扫 2000 个 runs 文件；`unknown-task` 里的 `truncated: true` 表示可能被窗口截断，不是 taskId 一定错。

---

## 七、面板能点什么

| 位置 | 作用 |
|---|---|
| `＋ 新建项目工作区`（面板顶部） | 选目录 → 注册成工作区 → 归入项目列表 → 开一个项目经理（devteam）会话 |
| 项目行 | 点一下展开/收起它的员工和会话 |
| `＋ 新会话`（项目卡片顶部） | 给这个项目再开一个项目经理（devteam）会话。旧的卡片头 `＋` 图标与「开启新分析会话」行已合并到这一个入口 |
| `＋ 招员工`（项目卡片顶部） | 打开项目经理会话，并在提示条给一句可直接复制的原话（如「招一个前端，负责……」）；**不会**当场招人，招聘仍由 PM 的 `team_hire` 执行 |
| `第一次用？三步上手`（空项目） | 项目里没有员工也没有会话时默认展开：① 点「＋ 新会话」对 PM 说「招一个前端，负责……」 ② 等员工工作区出现 ③ 在员工行点 `＋` 派活、回来点会话看汇报。点标题可收起 |
| 员工行 | 展开它的会话；悬停出现 `＋`，给这个员工开一个 standard 的新会话 |
| `PM` / `员工`（会话行徽章） | 这个会话的 Agent 预设。取不到 `agentPreset` 时不显示徽章（不代表预设错） |
| 黄条「这个会话不是项目经理预设，没有 team_* 工具」 | 项目里出现非 devteam 的项目会话时显示。点「重建为项目经理会话」→ 新建 devteam 会话并打开、把旧会话归档；失败走顶部提示条 |
| `⌫`（会话行） | 归档这个会话 |
| `移除登记` | 目录被删/改名后，把它从面板和工作区注册里摘掉（**不动磁盘**） |
| `收起面板 ▴` | 缩成小胶囊，露出原生侧栏 |
| `可能卡住? N分钟` | 会话在跑但 5 分钟没有新更新（30 秒自刷新）。**可能**是长任务；权限已自动兜底，一般卡在模型/工具上 |

面板把你的工作区分成两组：**「原始工作区」**（没有 `team/` 的老项目，只是分组的显示，磁盘上不会被移动）和真正的**项目**。

> 徽章只读 `projectionValues.agentPreset`；会话尚未加载投影时没有徽章。黄条只针对**项目工作区自己的会话**——员工会话本来就是 `standard`，显示「员工」徽章是正常的。

---

## 八、卸载

**界面卸载（推荐）**：「插件」页里找到 `dsh-yaoking-company-office` → 移除 → 重启 DSH。

**命令行卸载**：

```bash
# 1. 从 profile 的 dsh.profile.bundles 里删掉这一行
#    macOS / Linux: ~/.dsh/profiles/web/package.json
#    Windows:       %USERPROFILE%\.dsh\profiles\web\package.json
# 2. 卸包
#    macOS / Linux
cd ~/.dsh/profiles/web && npm rm dsh-yaoking-company-office
#    Windows（PowerShell）
cd $env:USERPROFILE\.dsh\profiles\web; npm rm dsh-yaoking-company-office
# 3. 重启 dsh
```

卸载**不会**删你的东西：项目目录、两份 `AGENTS.md`、`team/`、所有会话、工作区注册全部原样留着（插件从不调 `workspaceRegistry.delete`）。只是模式下拉里不再有「开发团队」、面板不再出现。

要彻底清干净，手动删两处：项目文件夹 + `~/.dsh/sessions/<对应路径编码>/`（Windows：`%USERPROFILE%\.dsh\sessions\<对应路径编码>\`）。

---

## 九、已知边界

- 员工共享同一块磁盘，**没有沙箱**。隔离靠两份 `AGENTS.md` 的约定 + 工具作用域，不是权限系统。
- 「完全权限」是真的完全权限：员工能跑任意命令。这个模式本来就是给「我信任这台机器、我要它别停下来问我」的场景用的。
- 会话守卫只对**项目会话**生效：会话目录自身或再上一层父目录带 `team/` 或 `.git`，**或者**这个会话的 Agent 预设是「开发团队」（PM）。它会自动把会话切成「完全权限」，并在会话处于 `ask` 审批策略时自动放行请求——所以这些会话里需要审批的操作不会再问你。两个开关在 `lib/guard.js` 顶部。
- `approval: never` 的会话，审批请求**根本不会进 waterfall**（宿主先看策略就直接拒了），所以「自动放行」这条只在 `ask` 会话上有机会接管（比如你手动把权限切成「工作区写入」）。真正兜底的是**自动 pin 完全权限**，两条是互为保险，不是二选一。
- 老会话重新打开（resume）也会再触发一次守卫，同样会被 pin 成完全权限——不用为了拿权限重建会话。
- 空目录项目也认得出来：新建一个空文件夹、点「新建项目工作区」、立刻开的那个 PM 会话，会因为预设是 `devteam` 直接算项目会话，不必等 `team/` 建出来。
- PM 什么时候找你：方向性选择、要花钱/碰生产、同一件事员工连续两次没做成。其余时间他会安静推进。
- 上游 standard 预设的 22 行插件是**复制**过来的（cordis 没有「预设继承预设」）。DSH 升级后如果新增了内置能力，这个预设不会自动获得——需要手动 diff 一次。
- 没有群聊/作战室视图。员工之间靠文件和 PM 传递，不靠互相说话。

## 更新日志

### 1.1.2

- **文档修订（代码未动）**：「三、安装」新增「更新（已经装过的人）」，放在安装方法与「装完检查三件事」之间。主推 `dsh plugin --profile web add dsh-yaoking-company-office@<版本号>`（国内用官方源 `--registry=https://registry.npmjs.org/`）；备选进 profile 目录直接跑 `pnpm add dsh-yaoking-company-office@latest --registry=https://registry.npmjs.org/`，给出 macOS / Linux 与 Windows PowerShell 两种 `cd`。写明 `dsh plugin … update` 与 `… add <包名>@latest` 当前不会真的升级（pnpm 跳过 resolution）、更新后必须完全重启、更新不动项目数据，以及更新后自查三条。首部「装法见三、安装」补「升级见同一节的『更新』」。

### 1.1.1

- **文档修订（代码未动）**：「三、安装」重排成四节，新增「方法 2：终端一条命令」——`dsh plugin --profile web add dsh-yaoking-company-office` 会自动把包写进 `dsh.profile.bundles`，Windows / macOS / Linux 通用；补上 Windows 的 profile 路径（`%USERPROFILE%\.dsh\profiles\web`）、`cd $env:USERPROFILE\…` 与 `link:D:\…` 写法；标注国内镜像会滞后（默认源 1.0.1、官方源 1.1.0）及 `--registry=` 的用法。

### 1.1.0

- **自动权限守卫**：项目会话在创建/恢复时自动 pin「完全权限」，审批请求自动放行，不用再手动点（`lib/guard.js`，两个开关在文件顶部）。
- **面板可发现性**：项目卡片换成带文字的「＋ 新会话」「＋ 招员工」，会话行加 `PM` / `员工` 徽章，空项目有「三步上手」引导，卡住文案改成「可能卡住?」。
- **账本修复**：新增 `team_report` 归档工具；`team_status` 补 `limit` / `scanned` / `truncated`，`since` 同时过滤汇报；投递失败把 task 标成 `undelivered`，不再留幽灵任务。

## License

MIT
