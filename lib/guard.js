/**
 * dsh-yaoking-company-office / guard — 宿主侧「会话守卫」。
 *
 * 目的：项目工作区里的会话自动 pin 成「完全权限」，并且审批请求自动放行，
 * 老板不用再手动点任何东西。
 *
 * 下面几条都是读宿主源码核对过的事实（不凭印象），且本文件**不静态 import 任何宿主
 * 内部包** —— 与 tools.js 头注释同一条规矩：`link:` 装的包不在 profile 的 node_modules
 * 树内，静态 import 失败会让整行插件变 broken，连带客户端注入一起消失。
 *
 * 1) `session/created(session)` 是 emit，宿主自己在用：dsh-schedule/lib/index.js:2031，
 *    并且显式传了 `{ global: true }`。dispatch 走 scopeTarget(session, …)
 *    （dsh-session/lib/index.js:1855），不带 global 时只有无 scope tag 或 scope 链上的
 *    监听者会被调用；守卫挂在 bundle 根部（cordis.patch.yml 里与 preset 行平级），
 *    理应无 tag，但显式 global 才是宿主验证过的写法。resume 也会走同一个 publish 事务
 *    （dsh-agent-loop/lib/index.js:1790-1794 的 enter + announce），所以老会话重新打开
 *    同样会触发，不只是「新建」。
 *
 * 2) `approval/request` 是 waterfall，签名 (request, next)
 *    （dsh-user-approval/lib/types/types.d.ts:81）；合法返回值只有
 *    allowed-once / rejected / cancelled / unavailable（同包 lib/index.js:29-34），
 *    分发点 :176，返回 allowed-once 即放行。waterfall 只认第一个不调 next() 的返回值
 *    （cordis/lib/index.js:317-328），而 Web UI 的审批桥在
 *    dsh-api-remotes/lib/index.js:165-173 更早注册、会直接把请求转发浏览器抢答，
 *    dsh-acp/lib/index.js:1158 也会；所以守卫必须 `{ prepend: true }` 抢到最前，
 *    否则永远轮不到它 —— 这一点决定了「自动放行」是不是真的生效。
 *    **前置闸门要记住**：ApprovalService.decide() 先看会话审批策略，`never` 直接
 *    rejected、根本不分发 waterfall（lib/index.js:172-176）。所以本守卫的 allowed-once
 *    只对 `ask` 策略的会话有意义；而「完全权限」preset 本身就是 sandbox
 *    danger-full-access + approval never（dsh-base/cordis.patch.yml:274-276），
 *    它根本不会弹审批。两条路互为兜底，不是二选一。
 *
 * 3) 会话 → 工作区路径：宿主侧**没有** `ctx.workspaces`（那是浏览器客户端服务，
 *    lib/client.js 里读的 `workspaces.list.getSnapshot()` 只在客户端存在）。宿主端的权威
 *    来源是 `session.header.cwd`：sessionController.create() 里 `cwd = workspace.path`
 *    （dsh-api-session-controller/lib/index.js:756-763），SessionHeader.cwd 的语义就是
 *    「会话创建时的绝对工作目录」（dsh-session/lib/types/types.d.ts:69-70）。退路是
 *    `ctx.workspaceRegistry.list()`（dsh-workspace/lib/types/index.d.ts:170-180，每项
 *    `{ id, path, sessionIds }`）按 sessionId 反查。客户端形状的快照只作为最后兜底保留，
 *    宿主上通常取不到 —— 拿不到就安静跳过，不猜。
 *
 * 4) 「项目会话」除目录 marker 外还有第二条判据：**PM 预设**。老板最常见的开场是
 *    「空目录 → 点面板『新建项目工作区』→ 立刻开 PM 会话」，这时 team/ 还不存在
 *    （要等 team_hire 招人才建），只按 marker 判会让那个 PM 会话拿不到完全权限。
 *    所以 preset 命中白名单（PROJECT_PRESETS，目前只有 devteam）也直接算项目会话，
 *    两条是「或」。preset 的读法都核过宿主源码，读不到就退回 marker，绝不猜：
 *      a. `ctx.sessionProjections.stateOf(session, 'agentPreset')` —— **当前值**的权威读法。
 *         投影定义在 dsh-agent-preset-registry/lib/index.js:48-55（init 取 header，之后吃
 *         `agent-preset/selected` 事件）；宿主自己就这么读：dsh-api-session-controller/lib/
 *         index.js:332 的 presetForSession()。投影未注册时 stateOf 返回 undefined
 *         （dsh-session-projection/lib/index.js:126-131）。
 *      b. `session.header.agentPreset` —— 创建事实，SessionHeader 字段
 *         （dsh-session/lib/types/types.d.ts:95）。createAgent 把 composition.agentPreset
 *         塞进 meta（dsh-api-session-controller/lib/index.js:518-522），SessionStore.prepare
 *         折进 header（dsh-session/lib/index.js:1827），而 announce 在 enter 之后才发
 *         session/created（dsh-agent-loop/lib/index.js:1790-1792），所以监听时已经可读。
 *         它不会随 blank 窗口里换 preset 更新，只作 a 的兜底。
 *    devteam 这个 id 来自本包 cordis.patch.yml:20；客户端同一常量在 lib/client.js:15（PRESET_PM）。
 *
 * 5) 「完全权限」：直接复用 ./permissions.js 的 grantFullAccess（catalog 里按 id 找
 *    danger-full-access，set 后用 current() 回读）。它本身永不抛，这里仍然再包一层。
 *
 * apply 里绝不抛：一抛这行插件就 broken，客户端注入和工具隔离会一起坏（结构红线）。
 */
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { grantFullAccess } from './permissions.js'

export const name = 'company-office-guard'
/**
 * 不声明任何依赖：所有宿主服务都在调用点软取（ctx.get + try/catch）。
 * 声明 inject 会让 cordis 等依赖就绪才 apply，注册监听晚于别的事件监听者，
 * 反而可能漏掉启动早期创建的会话；依赖缺失时也不需要整行不生效。
 */
export const inject = []

/**
 * ── 开关（改这里，完全重启 DSH 生效；本文件不引入任何配置依赖）──────────────
 * AUTO_FULL_ACCESS = false → 不再自动切「完全权限」，退回手动点权限；
 * AUTO_APPROVE     = false → 不再自动放行审批，弹出来要自己点。
 * 两个都关 = 守卫只剩启动日志，等于不存在。
 */
const AUTO_FULL_ACCESS = true
const AUTO_APPROVE = true

/** 项目工作区标记：与 preset 里 agent-instructions 的 projectRootMarkers 同一口径。 */
const PROJECT_MARKERS = ['.git', 'team']
/**
 * 视为「项目会话」的 agent preset 白名单（与 marker 判定是「或」）。
 * 只放项目经理预设：老板「空目录 → 新建项目工作区 → 立刻开 PM 会话」时 team/ 还不存在，
 * 不放这条，那个 PM 会话就仍然要手动点一次完全权限。
 * 值来自本包 cordis.patch.yml:20（`id: devteam`）；客户端同名常量 lib/client.js:15（PRESET_PM）。
 * standard（team_dispatch 给员工用的预设）与自定义 preset 都不在表里 —— 普通工作目录里的
 * standard 会话仍然只按 marker 判，不会被这条放宽误伤。
 */
const PROJECT_PRESETS = new Set(['devteam'])
/**
 * 除工作区自身外，最多再往上找几层：1 = 覆盖 team_dispatch 建出来的员工子工作区
 * （`<项目根>/<岗位>`）。不往更上层找 —— 免得「家目录里有个 .git（dotfiles）」
 * 把家目录下所有工作区都误判成项目。
 */
const MAX_ANCESTOR_LEVELS = 1
/** 审批放行的返回值。取值来自 dsh-user-approval 的 OUTCOMES，别写别的字符串。 */
const ALLOW_ONCE = 'allowed-once'
const LOG_PREFIX = 'company-office-guard'

const reasonOf = (error) => {
  try { return error instanceof Error ? error.message : String(error) } catch { return 'unknown error' }
}

/** 取宿主服务：先试属性（可能未注入而抛），再 ctx.get；取不到返回 undefined。 */
function service(ctx, key) {
  try { const direct = ctx[key]; if (direct) return direct } catch { /* 未注入直接访问会抛 */ }
  try { return ctx.get(key) ?? undefined } catch { return undefined }
}

/**
 * 记一行结构化日志（JSON 单行：时间 + 事件 + 现场字段）。
 * 日志自身失败也绝不冒泡：守卫不能因为 logger 不可用把宿主带崩。
 */
function log(ctx, level, event, fields) {
  let line
  try {
    line = JSON.stringify({ event, at: new Date().toISOString(), ...fields })
  } catch {
    line = `${event} (fields 无法序列化)`
  }
  try {
    const logger = service(ctx, 'logger')
    const method = logger?.[level]
    if (typeof method === 'function') {
      method.call(logger, `${LOG_PREFIX}: ${line}`)
      return
    }
  } catch { /* 落到 console */ }
  try {
    const write = level === 'error' ? console.error : console.log
    write(`${LOG_PREFIX}: ${line}`)
  } catch { /* 彻底没有日志通道就算了 */ }
}

/** session → sessionId；取不到返回 undefined。 */
function sessionIdOf(session) {
  try {
    if (typeof session?.id === 'string' && session.id !== '') return session.id
    const id = session?.header?.id
    return typeof id === 'string' && id !== '' ? id : undefined
  } catch { return undefined }
}

/** session → 创建时的 cwd（= 注册时的工作区路径）。 */
function cwdOf(session) {
  try {
    const cwd = session?.header?.cwd
    return typeof cwd === 'string' && cwd !== '' ? cwd : undefined
  } catch { return undefined }
}

/**
 * session → agent preset id；读不到返回 undefined（绝不猜）。
 * 两条读法都核过宿主源码，顺序见文件头 4)：
 *   1. sessionProjections 投影（当前值，权威；投影未注册时 stateOf 返回 undefined）；
 *   2. session.header.agentPreset（创建事实，兜底）。
 */
function presetOf(ctx, session) {
  const projections = service(ctx, 'sessionProjections')
  if (typeof projections?.stateOf === 'function') {
    try {
      const value = projections.stateOf(session, 'agentPreset')
      if (typeof value === 'string' && value !== '') return value
    } catch { /* 退回 header */ }
  }
  try {
    const value = session?.header?.agentPreset
    return typeof value === 'string' && value !== '' ? value : undefined
  } catch { return undefined }
}

/**
 * 这个 preset 是不是「项目经理预设」。
 * 只有白名单里的 id 算；standard / 自定义 preset 一律不算（见 PROJECT_PRESETS 注释）。
 */
function isProjectPreset(preset) {
  return typeof preset === 'string' && PROJECT_PRESETS.has(preset)
}

/**
 * 项目会话判定：目录带 marker（自身或上一层）**或**会话跑在项目 preset 上。
 * @returns `{ isProject, via }`；via 只用于日志（marker / preset / marker+preset）。
 */
function projectVerdict(root, preset) {
  const byPreset = isProjectPreset(preset)
  if (root !== undefined) return { isProject: true, via: byPreset ? 'marker+preset' : 'marker' }
  return byPreset ? { isProject: true, via: 'preset' } : { isProject: false, via: undefined }
}

/**
 * sessionId → 工作区路径。三条路按可靠性排序：
 *   1. session.header.cwd（宿主 create 时就是 workspace.path，最权威，announce 时就已经有）；
 *   2. ctx.workspaceRegistry.list() 按 sessionIds 反查（会话被 attach 之后才有，属退路）；
 *   3. 客户端形状的 ctx.workspaces.list.getSnapshot()（宿主通常没有，纯兜底）。
 */
function workspacePathOf(ctx, session, sessionId) {
  const cwd = cwdOf(session)
  if (cwd !== undefined) return cwd
  if (sessionId === undefined) return undefined

  const registry = service(ctx, 'workspaceRegistry')
  if (typeof registry?.list === 'function') {
    try {
      const rows = registry.list()
      if (Array.isArray(rows)) {
        const row = rows.find((item) => Array.isArray(item?.sessionIds) && item.sessionIds.includes(sessionId))
        if (row !== undefined && typeof row.path === 'string' && row.path !== '') return row.path
      }
    } catch { /* 走下一层退路 */ }
  }

  const workspaces = service(ctx, 'workspaces')
  if (typeof workspaces?.list?.getSnapshot === 'function') {
    try {
      const snapshot = workspaces.list.getSnapshot()
      const items = Array.isArray(snapshot?.items) ? snapshot.items : []
      const row = items.find((item) => Array.isArray(item?.sessionIds) && item.sessionIds.includes(sessionId))
      if (row !== undefined && typeof row.path === 'string' && row.path !== '') return row.path
    } catch { /* 忽略 */ }
  }
  return undefined
}

/** 这个目录本身带不带项目标记（team/ 或 .git）。 */
function hasProjectMarker(path) {
  for (const marker of PROJECT_MARKERS) {
    try { if (existsSync(join(path, marker))) return true } catch { /* 单个标记失败不影响别的 */ }
  }
  return false
}

/**
 * 从工作区路径往上找「项目根」：自身或至多 MAX_ANCESTOR_LEVELS 层父目录带 marker。
 * 家目录与文件系统根永远不当项目根（防止 dotfiles 仓库把整个家目录变成项目）。
 * 找不到返回 undefined —— 不是项目会话，守卫什么都不做。
 */
function projectRootOf(path) {
  let dir
  try { dir = resolve(path) } catch { return undefined }
  let home
  try { home = homedir() } catch { home = undefined }
  for (let level = 0; level <= MAX_ANCESTOR_LEVELS; level += 1) {
    if (dir === home) return undefined
    if (hasProjectMarker(dir)) return dir
    const parent = dirname(dir)
    if (parent === dir) return undefined
    dir = parent
  }
  return undefined
}

/** 一次性解析某个会话的项目归属：{ sessionId, path, root, preset }，任何一步失败都是 undefined。 */
function locate(ctx, session) {
  const sessionId = sessionIdOf(session)
  const path = workspacePathOf(ctx, session, sessionId)
  const root = path === undefined ? undefined : projectRootOf(path)
  const preset = presetOf(ctx, session)
  return { sessionId, path, root, preset }
}

/**
 * session/created：项目会话自动 pin 完全权限。
 * 必须 fire-and-forget —— announce 不 await 监听者，但 reject 会被记成 warn
 * （dsh-session/lib/index.js:1913-1918）；这里自己吃掉异常，别让「尽力而为」变成噪音。
 */
function onSessionCreated(ctx, session) {
  if (!AUTO_FULL_ACCESS) return
  const { sessionId, path, root, preset } = locate(ctx, session)
  if (sessionId === undefined) {
    log(ctx, 'debug', 'session/skip', { sessionId, reason: 'no-session-id' })
    return
  }
  // 项目会话 = 目录带 marker（员工子工作区看上一层）**或** PM 预设会话（空目录新建项目）。
  const verdict = projectVerdict(root, preset)
  if (!verdict.isProject) {
    // 没有路径就无从判断是不是项目会话：静默跳过（debug 级，默认不打扰）。
    if (path === undefined) log(ctx, 'debug', 'session/skip', { sessionId, reason: 'no-workspace-path' })
    return
  }
  const fields = { sessionId, path, root, agentPreset: preset, via: verdict.via }

  Promise.resolve()
    .then(() => grantFullAccess(ctx, sessionId))
    .then((result) => {
      if (typeof result?.preset === 'string') {
        log(ctx, 'info', 'session/full-access', { ...fields, preset: result.preset })
      } else {
        log(ctx, 'warn', 'session/full-access-failed', { ...fields, reason: result?.reason ?? 'unknown' })
      }
    })
    .catch((error) => {
      log(ctx, 'warn', 'session/full-access-failed', { ...fields, reason: reasonOf(error) })
    })
}

/**
 * 判断一个审批请求是不是项目会话发来的。
 * 纯读取 + 自己吞异常：**任何失败都按「不是项目会话」处理**，交给下游正常审批，
 * 绝不因为守卫判断失败把请求吞掉。
 * @returns `{ allow: false }` 或 `{ allow: true, sessionId, path, root, agentPreset, via, tool }`
 */
function judgeApproval(ctx, request) {
  try {
    const session = request?.agent?.session
    const { sessionId, path, root, preset } = locate(ctx, session)
    const verdict = projectVerdict(root, preset)
    if (!verdict.isProject) return { allow: false }
    const tool = typeof request?.toolName === 'string' ? request.toolName : undefined
    return { allow: true, sessionId, path, root, agentPreset: preset, via: verdict.via, tool }
  } catch (error) {
    log(ctx, 'warn', 'approval/guard-error', { reason: reasonOf(error) })
    return { allow: false }
  }
}

/** 调下游 next()：只调一次；它同步抛就回 fail-closed，绝不二次调用。 */
function passDown(next) {
  try { return next() } catch { return Promise.resolve('unavailable') }
}

/**
 * approval/request：项目会话直接 allowed-once；其余原样交给下游。
 * 先做完全同步的判断再决定「自己答」还是 next()（waterfall 里这是硬要求），
 * 并且 next() 最多只调一次。
 */
function onApprovalRequest(ctx, request, next) {
  if (!AUTO_APPROVE) return passDown(next)
  const verdict = judgeApproval(ctx, request)
  if (!verdict.allow) return passDown(next)
  log(ctx, 'info', 'approval/allowed', {
    sessionId: verdict.sessionId,
    tool: verdict.tool,
    path: verdict.path,
    root: verdict.root,
    agentPreset: verdict.agentPreset,
    via: verdict.via,
    // 说明这不是人点的：审计时能和真的「允许一次」区分开。
    by: 'company-office-guard',
  })
  return Promise.resolve(ALLOW_ONCE)
}

export function apply(ctx) {
  try {
    if (!AUTO_FULL_ACCESS && !AUTO_APPROVE) {
      log(ctx, 'warn', 'guard/disabled', { flags: { AUTO_FULL_ACCESS, AUTO_APPROVE } })
    } else {
      log(ctx, 'info', 'guard/enabled', {
        flags: { AUTO_FULL_ACCESS, AUTO_APPROVE },
        markers: PROJECT_MARKERS,
        projectPresets: [...PROJECT_PRESETS],
        maxAncestorLevels: MAX_ANCESTOR_LEVELS,
      })
    }

    // global: true —— 宿主 dsh-schedule 对 session/created 的写法（见文件头 1）。
    ctx.on('session/created', (session) => {
      try { onSessionCreated(ctx, session) } catch (error) {
        log(ctx, 'warn', 'session/guard-error', { reason: reasonOf(error) })
      }
    }, { global: true })

    // approval/request 是 waterfall：**必须 prepend**。waterfall 只认第一个不调 next() 的返回值
    // （cordis/lib/index.js:317-328），而 Web UI 的审批桥在 dsh-api-remotes/lib/index.js:165-173
    // 注册、dsh-acp/lib/index.js:1158 也会抢答；它们都比本 bundle 先加载，不 prepend 就永远轮不到守卫。
    // prepend 后守卫先跑：项目会话自己答 allowed-once，非项目会话 next() 原样交还给 UI 桥。
    // onApprovalRequest 内部已经把判断与 next() 都包住了，这里只留最后一道保险，
    // 且失败走 fail-closed —— 不会再调一次 next()。
    ctx.on('approval/request', (request, next) => {
      try { return onApprovalRequest(ctx, request, next) } catch (error) {
        log(ctx, 'warn', 'approval/guard-error', { reason: reasonOf(error) })
        return Promise.resolve('unavailable')
      }
    }, { prepend: true })
  } catch (error) {
    // apply 抛出 = 整行 broken（结构红线）。宁可不工作，也不能把 bundle 弄坏。
    log(ctx, 'error', 'guard/apply-failed', { reason: reasonOf(error) })
  }
}
