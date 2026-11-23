/**
 * dsh-yaoking-company-office / tools — team_hire（建岗）/ team_dispatch（派活）/ team_status（看进度）/ team_report（归档汇报）。
 *
 * 两条不可违反的运行时约束：
 *  1. 不静态 import 任何宿主内置包：`link:` 装的包不在 profile 的 node_modules 树内，
 *     静态 import 失败会让预设行 fiber 变 undefined，整个「开发团队」从模式下拉里静默消失。
 *     工具定义因此是手写的 ToolDefinition 字面量（注册表只校验 output.render / output.schema）。
 *  2. 宿主服务（workspaceRegistry / sessionController / workingDirectory）在调用点软取，
 *     取不到返回 typed error，绝不抛——抛出去会吃掉整个 turn。
 */
import { randomUUID } from 'node:crypto'
import { existsSync, statSync } from 'node:fs'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { grantFullAccess } from './permissions.js'
import { employeeAgentsMd, projectAgentsMd, runMarkdown, stamp, stateMd, taskBook } from './templates.js'

export const name = 'company-office-tools'
/** inject 只写确定存在的服务；其余软取。 */
export const inject = ['tools']

/**
 * 员工会话的预设 id。三处必须一致，改的时候一起改：
 *  - cordis.patch.yml 里 preset-company-office-staff 的 config.id
 *  - lib/client.js 的 PRESET_STAFF
 *  - 这里（team_dispatch 建员工会话时传的 agentPreset）
 * 员工预设自带 timed 版 ask_user_question（90s），所以员工不会无限期等人回答。
 */
const STAFF_PRESET = 'staff'

const ROLE_RE = /^[a-z0-9][a-z0-9-]{0,39}$/
const RESERVED = new Set(['team', 'runs', 'node_modules'])
const DEFAULT_LIMIT = 200
const MAX_LIMIT = 2_000
const PROMPT_MS = 30_000
const runsDir = (root) => join(root, 'team', 'runs')
const isDir = (path) => { try { return statSync(path).isDirectory() } catch { return false } }
const reasonOf = (error) => (error instanceof Error ? error.message : String(error))
const oneLine = (value) => String(value ?? '').replace(/[\r\n]+/g, ' ').trim()
const placeholder = (value) => !value || /^<.*>$/.test(value) || value.includes('…')

/** limit：正整数生效（超过 2000 截到 2000）；非数字/0/负数回落 200。 */
function limitOf(value) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) return DEFAULT_LIMIT
  return Math.min(value, MAX_LIMIT)
}

/** 取宿主服务：先试属性（inject 过的），再 ctx.get。 */
function service(ctx, key) {
  try { const direct = ctx[key]; if (direct) return direct } catch { /* 未注入直接访问会抛 */ }
  try { return ctx.get(key) ?? undefined } catch { return undefined }
}

/** exec.signal 与自身超时合并。 */
function deadline(exec, ms) {
  const own = AbortSignal.timeout(ms)
  const caller = exec?.signal
  return caller && typeof AbortSignal.any === 'function' ? AbortSignal.any([caller, own]) : own
}

/** 给不吃 AbortSignal 的 await（fs 等）加硬超时。 */
function withTimeout(promise, ms, label) {
  let timer
  const guard = new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms) })
  return Promise.race([promise, guard]).finally(() => clearTimeout(timer))
}

const noCwd = (detail) => ({
  error: 'no-cwd',
  message: `取不到调用方会话的工作目录（${detail}）；不用 process.cwd() 猜`,
  hint: '在项目工作区的会话里调用 team_*；若宿主没有 workingDirectory 服务，这是部署问题，不是参数问题',
})

/** 调用方 agent 的 cwd；取不到就失败——拿 process.cwd() 兜底会在错误位置建 team/ 与 <role>/。 */
async function callerCwd(ctx, exec) {
  const workingDirectory = service(ctx, 'workingDirectory')
  if (!workingDirectory?.ensure) return { failed: noCwd('宿主没有 workingDirectory.ensure') }
  if (!exec?.agent) return { failed: noCwd('调用方没有 agent 身份') }
  try {
    const cwd = await withTimeout(workingDirectory.ensure(exec.agent, deadline(exec, 10_000)), 12_000, 'workingDirectory.ensure')
    if (typeof cwd !== 'string' || !cwd.trim()) return { failed: noCwd('workingDirectory.ensure 返回空路径') }
    return { cwd }
  } catch (error) {
    return { failed: noCwd(reasonOf(error)) }
  }
}

/**
 * 从 from 向上找项目根：含 team/ 或 .git 的第一层，40 层封顶。
 * 都没标记时退回会话 cwd —— 空文件夹里开会话说「招个前端」就能直接开工，
 * 不必先手建 team/ 或 git init。cwd 本身是 / 或家目录时才放弃。
 */
function projectRootOf(from) {
  const start = resolve(from)
  for (let dir = start, depth = 0; depth < 40; depth += 1, dir = dirname(dir)) {
    if (existsSync(join(dir, 'team')) || existsSync(join(dir, '.git'))) return dir
    if (dirname(dir) === dir) break
  }
  if (start === '/' || start === homedir()) return undefined
  return start
}

/** 补齐 ledger：team/runs/ + 项目级 AGENTS.md / STATE.md 骨架（只在缺失时写）。 */
async function ensureProject(root) {
  await mkdir(runsDir(root), { recursive: true })
  const project = basename(root) || root
  const targets = [[join(root, 'AGENTS.md'), projectAgentsMd({ project })], [join(root, 'team', 'STATE.md'), stateMd({ project })]]
  for (const [file, text] of targets) {
    if (existsSync(file)) continue
    try { await withTimeout(writeFile(file, text, 'utf8'), 5_000, `write ${file}`) } catch { /* 便利性文件 */ }
  }
}

/** 写一条 runs 记录；同分钟撞名加 -2 -3，不覆盖。 */
async function writeRun(root, record, body) {
  const dir = runsDir(root)
  await mkdir(dir, { recursive: true })
  const base = `${stamp(record.at)}-${record.role}-${record.kind}`
  let file = join(dir, `${base}.md`)
  for (let n = 2; existsSync(file) && n < 60; n += 1) file = join(dir, `${base}-${n}.md`)
  await withTimeout(writeFile(file, runMarkdown({ ...record, body }), 'utf8'), 10_000, `write ${file}`)
  return file
}

/**
 * 只改 front-matter 的 status 行（不重写正文、不动别的字段）。
 * 派活投递失败时用它把 task 标成 undelivered，避免留下永远没人汇报的「幽灵任务」。
 */
async function updateRunStatus(file, status) {
  const text = await withTimeout(readFile(file, 'utf8'), 5_000, `read ${file}`)
  const end = text.startsWith('---') ? text.indexOf('\n---', 3) : -1
  if (end < 0) throw new Error(`${basename(file)} 没有 front-matter`)
  const head = text.slice(0, end)
  const line = `status: ${oneLine(status)}`
  const next = /^status:[ \t]*.*$/m.test(head)
    ? head.replace(/^status:[ \t]*.*$/m, () => line)
    : `${head}\n${line}`
  const updated = `${next}${text.slice(end)}`
  if (updated === text) return
  await withTimeout(writeFile(file, updated, 'utf8'), 5_000, `write ${file}`)
}

/**
 * 读 team/runs/ 的 .md 窗口：文件名排序后取最后 limit 个。
 * scanned = 实际尝试读的文件数；truncated = 是否被窗口截断（runs 比 limit 多）。
 */
async function readRuns(root, limit) {
  const dir = runsDir(root)
  let names = []
  try { names = (await withTimeout(readdir(dir), 5_000, 'readdir')).filter((file) => file.endsWith('.md')).sort() } catch { names = [] }
  const total = names.length
  const window = total > limit ? names.slice(-limit) : names
  const records = []
  for (const file of window) {
    try { records.push({ file, ...frontMatter(await withTimeout(readFile(join(dir, file), 'utf8'), 5_000, `read ${file}`)) }) } catch { /* 单条坏就丢这一条 */ }
  }
  return { dir, records, scanned: window.length, truncated: total > window.length }
}

/** 只解析首部 ---…--- 的扁平 YAML（我们自己写的字段），够 team_status 配对。未加引号的值去掉行尾 # 注释。 */
function frontMatter(text) {
  const end = text.startsWith('---') ? text.indexOf('\n---', 3) : -1
  if (end < 0) return {}
  const fields = {}
  for (const line of text.slice(3, end).split('\n')) {
    const match = /^([A-Za-z][\w-]*):[ \t]*(.*)$/.exec(line)
    if (!match) continue
    let raw = match[2].trim()
    if (raw && raw[0] !== '"' && raw[0] !== "'") raw = raw.replace(/\s+#.*$/, '').trim()
    const list = raw.startsWith('[') && raw.endsWith(']')
    const quoted = raw.length > 1 && (raw[0] === '"' || raw[0] === "'") && raw.at(-1) === raw[0]
    fields[match[1]] = list ? raw.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean) : quoted ? raw.slice(1, -1) : raw
  }
  return fields
}

/** REPORT.md 的正文：front-matter 之后的部分；没有 front-matter 就整篇。 */
function bodyOf(text) {
  const end = text.startsWith('---') ? text.indexOf('\n---', 3) : -1
  return (end < 0 ? text : text.slice(end + 4)).trim()
}

const byTime = (left, right) => String(left.at ?? '').localeCompare(String(right.at ?? ''))
const atLeast = (at, since) => !since || (Date.parse(at) || 0) >= (Date.parse(since) || 0)

/** 最近还没汇报的 task（unknown-task 时给 PM 核对用）。 */
function openTasksOf(records, max = 5) {
  const reported = new Set(records.filter((record) => record.kind === 'report' && record.taskId).map((record) => record.taskId))
  return records
    .filter((record) => record.kind === 'task' && record.taskId && !reported.has(record.taskId))
    .sort((left, right) => byTime(right, left) || String(left.file).localeCompare(String(right.file)))
    .slice(0, max)
    .map((record) => ({ taskId: record.taskId, role: record.role, file: record.file, at: record.at, ...(record.title ? { title: record.title } : {}) }))
}

const noProject = (cwd) => ({ error: 'no-project', cwd, message: `会话 cwd 是根目录或家目录（${cwd}），不能当项目根`, hint: '在项目目录里开会话后再调用：项目根决定 <role>/ 与 team/runs/ 的位置' })
const unavailable = (key) => ({ error: 'service-unavailable', service: key, message: `宿主的 ${key} 服务当前不可用；「开发团队」其余功能不受影响`, hint: '确认 dsh 版本与 profile 组合包含该服务；这是部署问题，不是参数问题' })
const params = (properties, required) => ({ type: 'object', properties, additionalProperties: false, ...(required ? { required } : {}) })

/** 四个工具共用的前置：校验 role、取调用方 cwd、定位项目根。 */
async function locate(ctx, exec, role) {
  if (!ROLE_RE.test(role)) return { failed: { error: 'bad-role', role, message: 'role 必须是单段 kebab：小写字母/数字/连字符，≤40 字符，不含 / . .. 与空格' } }
  if (RESERVED.has(role)) return { failed: { error: 'bad-role', role, message: `role 不能用保留名 ${role}` } }
  const got = await callerCwd(ctx, exec)
  if (got.failed) return { failed: got.failed }
  const root = projectRootOf(got.cwd)
  if (!root) return { failed: noProject(got.cwd) }
  const marked = existsSync(join(root, 'team')) || existsSync(join(root, '.git'))
  return { cwd: got.cwd, root, marked }
}

/** 手写 ToolDefinition：不经 defineTool，也不 import 任何宿主内置包。 */
function tool({ name, description, parameters, execute }) {
  return { name, description, parameters, output: { schema: {}, render: (_args, value) => [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }] }, execute }
}

const ROLE_PARAM = { type: 'string', description: '单段 kebab 岗位名（fe / qa / back-end）；不能是 team' }

const hire = (ctx) => tool({
  name: 'team_hire',
  description:
    '招一个员工：在项目根下建 <role>/ 目录、写该岗位的 AGENTS.md、并把它注册成 DSH 工作区（员工就是子工作区）。'
    + '项目根 = 从你的 cwd 向上第一个含 team/ 或 .git 的目录；没有就用 cwd 本身（空文件夹里也能直接开工）。'
    + 'AGENTS.md 已存在时不覆盖，返回 agentsMd:"kept"。同一个 role 可重复调用（幂等）。',
  parameters: params({
    role: ROLE_PARAM,
    title: { type: 'string', description: '中文岗位名（如 前端），用于 AGENTS.md 标题与工作区标题' },
    duty: { type: 'string', description: '职责与边界：干什么、不干什么、产出放哪。会原样写进 AGENTS.md，越具体越好' },
    readFirst: { type: 'array', items: { type: 'string' }, description: '动手前先读哪些文件（相对项目根），依次写进「先读」段' },
  }, ['role', 'duty']),
  async execute(args, exec) {
    const role = String(args.role ?? '').trim()
    const spot = await locate(ctx, exec, role)
    if (spot.failed) return spot.failed
    const duty = String(args.duty ?? '').trim()
    if (!duty) return { error: 'bad-request', message: 'duty 不能为空：写清这个岗位干什么、不干什么、产出放哪' }
    const registry = service(ctx, 'workspaceRegistry')
    if (!registry?.resolveByPath || !registry?.create) return unavailable('workspaceRegistry')
    const title = typeof args.title === 'string' && args.title.trim() ? args.title.trim() : role
    const roleDir = join(spot.root, role)
    if (existsSync(roleDir) && !isDir(roleDir)) return { error: 'path-conflict', path: roleDir, message: '同名文件已存在，无法建员工目录' }
    try {
      await mkdir(roleDir, { recursive: true })
      await ensureProject(spot.root)
    } catch (error) {
      return { error: 'ensure-failed', path: roleDir, message: reasonOf(error), hint: '目录或 team/ 骨架没建起来；先查项目根权限与磁盘' }
    }
    const agentsPath = join(roleDir, 'AGENTS.md')
    let agentsMd = 'kept'
    if (!existsSync(agentsPath)) {
      try {
        await withTimeout(writeFile(agentsPath, employeeAgentsMd({ role, title, duty, readFirst: args.readFirst }), 'utf8'), 5_000, 'write AGENTS.md')
        agentsMd = 'created'
      } catch (error) {
        return { error: 'write-failed', path: agentsPath, message: reasonOf(error) }
      }
    }
    let workspaceId = null
    let degraded
    try {
      const existing = await withTimeout(registry.resolveByPath(roleDir), 10_000, 'resolveByPath')
      const workspace = existing ?? (await withTimeout(registry.create(roleDir, title), 10_000, 'workspaceRegistry.create'))
      workspaceId = workspace?.id ?? null
    } catch (error) {
      degraded = `workspace-register-failed: ${reasonOf(error)}`
    }
    return {
      role, path: roleDir, projectRoot: spot.root, workspaceId, agentsMd, created: agentsMd === 'created',
      ...(degraded ? { degraded } : {}),
      ...(spot.marked ? {} : { marked: false, warning: '没找到 team/ 或 .git 标记，项目根取自会话 cwd；如果这不是项目目录，先确认会话工作区再招人' }),
      hint: '侧栏 View options → Group by → Workspace Tree 才看得到项目下的子工作区；默认 WorkSpace 是平铺',
    }
  },
})

const dispatch = (ctx) => tool({
  name: 'team_dispatch',
  description:
    '给员工派活：在 <role>/ 工作区用员工预设 staff 新建一个会话，把任务书当第一条消息投进去，并在 team/runs/ 写一条 task。'
    + '建好后会顺便把该会话设成「完全权限」（preset danger-full-access，即不再弹人工审批）；设不上只在返回值里记 degraded，不影响派活。'
    + '投递失败会把已写的 task 改成 status: undelivered 并返回 delivered:false（不重试、不删文件）。'
    + '返回 accepted:true 只表示「已投递」，不代表做完——绝不等待员工完成。做完与否看 team_status 与 team/runs/*-report.md。'
    + '任务书必须自包含：做什么、参考什么、产出放哪、怎么算完。',
  parameters: params({
    role: ROLE_PARAM,
    task: { type: 'string', description: '任务书正文（会连同岗位与收工约定一起投给员工）' },
    title: { type: 'string', description: '一句话任务名，写进 task 记录的 front-matter' },
  }, ['role', 'task']),
  async execute(args, exec) {
    const role = String(args.role ?? '').trim()
    const spot = await locate(ctx, exec, role)
    if (spot.failed) return spot.failed
    const task = String(args.task ?? '').trim()
    if (!task) return { error: 'bad-request', message: 'task 不能为空：写清做什么、参考什么、产出放哪、怎么算完' }
    const roleDir = join(spot.root, role)
    if (!isDir(roleDir)) return { error: 'unknown-role', role, message: `没有 ${role}/ 目录，先招人`, hint: `先 team_hire("${role}", duty:"…")` }
    const registry = service(ctx, 'workspaceRegistry')
    const sessions = service(ctx, 'sessionController')
    if (!registry?.resolveByPath || !registry?.create) return unavailable('workspaceRegistry')
    if (!sessions?.create || !sessions?.prompt) return unavailable('sessionController')
    let workspace
    try {
      workspace = await withTimeout(registry.resolveByPath(roleDir), 10_000, 'resolveByPath')
      if (!workspace) workspace = await withTimeout(registry.create(roleDir, role), 10_000, 'workspaceRegistry.create')
    } catch (error) {
      return { error: 'unknown-role', role, message: reasonOf(error), hint: `先 team_hire("${role}", duty:"…")` }
    }
    if (!workspace?.id) return { error: 'unknown-role', role, message: `${role}/ 还没有对应工作区` }
    const taskId = randomUUID()
    const at = new Date()
    const title = typeof args.title === 'string' ? args.title.trim() : ''
    let sessionId
    try {
      const created = await withTimeout(sessions.create({ workspaceId: workspace.id, agentPreset: STAFF_PRESET }), 20_000, 'sessionController.create')
      sessionId = created?.sessionId
      if (!sessionId) throw new Error('create 没有返回 sessionId')
    } catch (error) {
      const presetIssue = /preset/i.test(reasonOf(error))
      return { error: presetIssue ? 'preset-unavailable' : 'create-failed', taskId, message: reasonOf(error), hint: presetIssue ? `${STAFF_PRESET} 预设未注册或已 broken；不降级、不重试——先修好预设再派活` : '会话没建起来，没有派活；先试 team_status 确认角色与工作区仍在' }
    }
    // 会话已经在 store 里、初始权限也已 pin（dsh-agent-loop/lib/index.js:1790-1794 先 enter+announce 才 resolve），
    // 所以这里立刻覆盖成完全权限；设不上只降级，绝不让派活失败。
    let permission
    try {
      permission = await withTimeout(grantFullAccess(ctx, sessionId), 10_000, 'permissionPresets.set')
    } catch (error) {
      permission = { reason: reasonOf(error) }
    }
    const degraded = permission?.reason ? `full-access-not-set: ${permission.reason}` : undefined
    let runFile
    try {
      runFile = await writeRun(spot.root, { kind: 'task', taskId, role, status: 'assigned', at, session: sessionId, title, files: [] }, `## 任务书\n\n${task}\n\n本次会话：${sessionId}（${STAFF_PRESET} 预设，工作区 ${workspace.id}${permission?.preset ? `，权限 ${permission.preset}` : ''}）`)
    } catch (error) {
      return { error: 'run-write-failed', taskId, sessionId, message: reasonOf(error), hint: '会话已建但流水账写不进去，先查 team/runs/ 权限' }
    }
    let delivered = true
    try {
      await withTimeout(sessions.prompt({ requestId: randomUUID(), sessionId, mode: 'queue', content: [{ type: 'text', text: taskBook({ taskId, role, root: spot.root, task }) }] }, deadline(exec, PROMPT_MS)), PROMPT_MS + 5_000, 'sessionController.prompt')
    } catch (error) {
      delivered = false
      // 事务化：task 已经落盘，投递失败就把它标成 undelivered，避免留下永远没人汇报的「幽灵任务」。
      let marked = true
      try { await updateRunStatus(runFile, 'undelivered') } catch { marked = false }
      return {
        error: 'prompt-rejected', taskId, sessionId, runFile, delivered: false, ...(marked ? {} : { statusUpdated: false }),
        message: reasonOf(error),
        hint: marked
          ? '未重试（避免重复投递）；task 已标 undelivered，会话已存在，可直接打开它确认，或用 team_status 观察'
          : '未重试（避免重复投递）；task 已写但 status 没改成 undelivered（statusUpdated:false），请人工核对这条 task',
      }
    }
    return {
      taskId, sessionId, runFile, accepted: true, delivered,
      ...(permission?.preset ? { permission: permission.preset } : {}),
      ...(degraded ? { degraded } : {}),
      hint: 'accepted 只表示已投递。不要把它当成功：用 team_status 看 running 与 lastReport，验收要自己读文件',
    }
  },
})

const status = (ctx) => tool({
  name: 'team_status',
  description:
    '读 team/runs/，按 front-matter 的 taskId 配对 task 与 report，回每个岗位的摘要：openTasks（有 task 无 report）与'
    + 'lastReport 的 front-matter（file/at/status/taskId）。只回摘要，报告正文要自己读文件。'
    + 'limit 控制扫描窗口（默认 200，最大 2000），返回 scanned（实际扫了几个文件）与 truncated（是否被截断）。'
    + 'since 同时过滤 task 与 report，避免「任务被滤掉、lastReport 却更早」的自相矛盾。'
    + 'running 取该岗位最新 task 的 session（没有 task 才退到 report 的）；拿不到服务→degraded:"session-state-unavailable"，会话查不到→"session-state-unknown"。',
  parameters: params({
    role: ROLE_PARAM,
    since: { type: 'string', description: 'ISO 时间；只统计 at 不早于它的 task/report' },
    limit: { type: 'integer', description: '最多扫多少个 runs 文件（默认 200，最大 2000；超过 2000 截到 2000，非整数/≤0 回落 200）' },
  }),
  async execute(args, exec) {
    const got = await callerCwd(ctx, exec)
    if (got.failed) return got.failed
    const root = projectRootOf(got.cwd)
    if (!root || !existsSync(join(root, 'team'))) return { error: 'no-team', cwd: got.cwd, message: '没找到 team/ 目录', hint: '先 team_hire 招一个岗位（会顺带建 team/runs/）' }
    const limit = limitOf(args.limit)
    const { dir, records, scanned, truncated } = await readRuns(root, limit)
    const since = typeof args.since === 'string' ? args.since.trim() : ''
    const wanted = typeof args.role === 'string' ? args.role.trim() : ''
    // since 同时过滤 task 与 report：配对只在这个窗口内成立，避免「任务被滤掉、lastReport 却更早」的自相矛盾。
    const inWindow = (record) => atLeast(record.at, since)
    const tasks = records.filter((record) => record.kind === 'task' && record.taskId && inWindow(record))
    const taskById = new Map()
    for (const record of records) {
      if (record.kind !== 'task' || !record.taskId) continue
      const seen = taskById.get(record.taskId)
      if (!seen || byTime(seen, record) <= 0) taskById.set(record.taskId, record)
    }
    const reports = records.filter((record) => record.kind === 'report' && record.taskId && inWindow(record))
    const reportsByTask = new Map()
    for (const record of reports) {
      const seen = reportsByTask.get(record.taskId)
      if (!seen || byTime(seen, record) <= 0) reportsByTask.set(record.taskId, record)
    }
    // report 的归属：task 还在扫描窗口里就用 task 的 role（taskId 是唯一键）；task 被挤出窗口才退到 report 自己的 role。
    const ownerRole = (record) => String(taskById.get(record.taskId)?.role ?? record.role ?? '')
    const sessions = service(ctx, 'sessionController')
    let running
    if (sessions?.list) {
      try {
        const listed = await withTimeout(sessions.list({}, deadline(exec, 8_000)), 10_000, 'sessionController.list')
        running = new Map((listed?.items ?? []).map((item) => [String(item.sessionId), Boolean(item.running)]))
      } catch { running = undefined }
    }
    const roles = new Set()
    for (const record of tasks) if (record.role) roles.add(String(record.role))
    for (const record of reports) { const role = ownerRole(record); if (role) roles.add(role) }
    const members = [...roles].filter((role) => !wanted || role === wanted).map((role) => {
      const ownTasks = tasks.filter((record) => String(record.role) === role).sort(byTime)
      const ownReports = reports.filter((record) => ownerRole(record) === role).sort(byTime)
      const openTasks = ownTasks
        .filter((record) => !reportsByTask.has(record.taskId))
        .map((record) => ({ taskId: record.taskId, file: record.file, at: record.at, ...(record.status ? { status: record.status } : {}), ...(record.title ? { title: record.title } : {}) }))
      const report = ownReports.at(-1)
      // 先取最新 task 的 session；没有 task 才退到 report 的 session（之前是反的）。
      const sessionId = String(ownTasks.at(-1)?.session ?? report?.session ?? '')
      return { role, running: running && sessionId ? running.get(sessionId) ?? null : null, openTasks, ...(report ? { lastReport: { file: report.file, at: report.at, status: report.status, taskId: report.taskId } } : {}) }
    })
    const degraded = !running ? 'session-state-unavailable' : members.some((member) => member.running === null) ? 'session-state-unknown' : undefined
    return { projectRoot: root, runs: dir, limit, scanned, truncated, members, ...(degraded ? { degraded } : {}) }
  },
})

const report = (ctx) => tool({
  name: 'team_report',
  description:
    '把员工 <role>/REPORT.md 归档成 team/runs/<时间>-<role>-report.md：读 REPORT.md 的 front-matter，'
    + 'taskId 优先取参数、其次取 front-matter，必须是 team/runs/ 里一条还没汇报的 task。'
    + '匹配不到、REPORT.md 不存在或缺 taskId 都返回 typed error 且不写文件（unknown-task 会附最近 openTasks）。'
    + 'status 取参数 > front-matter > done，正文取 front-matter 之后的部分；同一 task 只归档一次。',
  parameters: params({
    role: ROLE_PARAM,
    taskId: { type: 'string', description: 'taskId；不传则用 REPORT.md front-matter 里的' },
    status: { type: 'string', description: '汇报状态（done / blocked）；不传则用 front-matter，再缺省 done' },
    files: { type: 'array', items: { type: 'string' }, description: '本次产出文件（相对项目根）；不传则用 front-matter 的 files' },
  }, ['role']),
  async execute(args, exec) {
    const role = String(args.role ?? '').trim()
    const spot = await locate(ctx, exec, role)
    if (spot.failed) return spot.failed
    const sourceFile = join(spot.root, role, 'REPORT.md')
    if (!existsSync(sourceFile)) {
      return { error: 'missing-report', role, sourceFile, message: `没有 ${role}/REPORT.md`, hint: '员工收工时写本目录 REPORT.md；没写汇报就不要归档' }
    }
    let text
    try { text = await withTimeout(readFile(sourceFile, 'utf8'), 5_000, 'read REPORT.md') } catch (error) {
      return { error: 'read-failed', sourceFile, message: reasonOf(error) }
    }
    const meta = frontMatter(text)
    const taskId = oneLine(args.taskId) || oneLine(meta.taskId)
    if (!taskId) {
      return { error: 'bad-request', sourceFile, message: '缺少 taskId：参数和 REPORT.md 的 front-matter 里都没有', hint: 'taskId 在 team_dispatch 的返回里；照抄进 REPORT.md 的 front-matter' }
    }
    const runs = await readRuns(spot.root, MAX_LIMIT)
    const task = runs.records.filter((record) => record.kind === 'task' && record.taskId === taskId).sort(byTime).at(-1)
    if (!task) {
      return {
        error: 'unknown-task', taskId, sourceFile, scanned: runs.scanned, truncated: runs.truncated,
        openTasks: openTasksOf(runs.records),
        message: `team/runs/ 里找不到 taskId ${taskId} 对应的 task`,
        hint: '核对 taskId 是否抄错；openTasks 是最近还没汇报的任务',
      }
    }
    const existing = runs.records.filter((record) => record.kind === 'report' && record.taskId === taskId).sort(byTime).at(-1)
    if (existing) {
      return { error: 'already-reported', taskId, sourceFile, existingReport: existing.file, message: '这条 task 已经归档过汇报，不重复写', hint: '要重写先人工处理已有的 report 记录；本工具不覆盖' }
    }
    if (task.role && String(task.role) !== role) {
      return { error: 'role-mismatch', taskId, role, taskRole: task.role, sourceFile, message: `task 属于 ${task.role}，但这次按 ${role} 归档`, hint: '检查 REPORT.md 是否放错岗位目录，或 taskId 抄错' }
    }
    const body = bodyOf(text)
    if (!body) {
      return { error: 'bad-request', taskId, sourceFile, message: 'REPORT.md 只有 front-matter，没有正文', hint: '正文写三段：做了什么 / 文件在哪 / 卡在哪' }
    }
    const metaStatus = oneLine(meta.status)
    const status = oneLine(args.status) || (placeholder(metaStatus) ? '' : metaStatus) || 'done'
    const files = Array.isArray(args.files)
      ? args.files.map((file) => oneLine(file)).filter(Boolean)
      : Array.isArray(meta.files) ? meta.files.map((file) => oneLine(file)).filter((file) => !placeholder(file)) : []
    const session = placeholder(oneLine(meta.session)) ? oneLine(task.session) : oneLine(meta.session)
    let reportFile
    try {
      reportFile = await writeRun(spot.root, { kind: 'report', taskId, role, status, at: new Date(), session, files }, body)
    } catch (error) {
      return { error: 'run-write-failed', taskId, sourceFile, message: reasonOf(error), hint: 'REPORT.md 没问题，但 team/runs/ 写不进去；先查目录权限' }
    }
    return { reportFile, taskId, status, paired: true }
  },
})

/** 注册四个工具；`ctx.tools` 由 inject 保证存在。 */
export function apply(ctx) {
  for (const build of [hire, dispatch, status, report]) ctx.tools.register(build(ctx))
}
