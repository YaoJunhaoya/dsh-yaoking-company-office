/**
 * dsh-yaoking-company-office / tools — team_hire（建岗）/ team_dispatch（派活）/ team_status（看进度）。
 *
 * 两条不可违反的运行时约束：
 *  1. 不静态 import 任何 `@deepseek-ai/*`：`link:` 装的包不在 profile 的 node_modules 树内，
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

const ROLE_RE = /^[a-z0-9][a-z0-9-]{0,39}$/
const RESERVED = new Set(['team', 'runs', 'node_modules'])
const RUN_CAP = 200
const PROMPT_MS = 30_000
const runsDir = (root) => join(root, 'team', 'runs')
const isDir = (path) => { try { return statSync(path).isDirectory() } catch { return false } }
const reasonOf = (error) => (error instanceof Error ? error.message : String(error))

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

/** 调用方 agent 的 cwd；取不到退回 process.cwd()。 */
async function callerCwd(ctx, exec) {
  const workingDirectory = service(ctx, 'workingDirectory')
  if (!workingDirectory?.ensure || !exec.agent) return process.cwd()
  try { return await withTimeout(workingDirectory.ensure(exec.agent, deadline(exec, 10_000)), 12_000, 'workingDirectory.ensure') } catch { return process.cwd() }
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

/** 只解析首部 ---…--- 的扁平 YAML（我们自己写的字段），够 team_status 配对。 */
function frontMatter(text) {
  const end = text.startsWith('---') ? text.indexOf('\n---', 3) : -1
  if (end < 0) return {}
  const fields = {}
  for (const line of text.slice(3, end).split('\n')) {
    const match = /^([A-Za-z][\w-]*):[ \t]*(.*)$/.exec(line)
    if (!match) continue
    const raw = match[2].trim()
    const list = raw.startsWith('[') && raw.endsWith(']')
    const quoted = raw.length > 1 && (raw[0] === '"' || raw[0] === "'") && raw.at(-1) === raw[0]
    fields[match[1]] = list ? raw.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean) : quoted ? raw.slice(1, -1) : raw
  }
  return fields
}

const atLeast = (at, since) => !since || (Date.parse(at) || 0) >= (Date.parse(since) || 0)
const noProject = (cwd) => ({ error: 'no-project', cwd, message: `会话 cwd 是根目录或家目录（${cwd}），不能当项目根`, hint: '在项目目录里开会话后再调用：项目根决定 <role>/ 与 team/runs/ 的位置' })
const unavailable = (key) => ({ error: 'service-unavailable', service: key, message: `宿主的 ${key} 服务当前不可用；「开发团队」其余功能不受影响`, hint: '确认 dsh 版本与 profile 组合包含该服务；这是部署问题，不是参数问题' })
const params = (properties, required) => ({ type: 'object', properties, additionalProperties: false, ...(required ? { required } : {}) })

/** 三个工具共用的前置：校验 role、取调用方 cwd、定位项目根。 */
async function locate(ctx, exec, role) {
  if (!ROLE_RE.test(role)) return { failed: { error: 'bad-role', role, message: 'role 必须是单段 kebab：小写字母/数字/连字符，≤40 字符，不含 / . .. 与空格' } }
  if (RESERVED.has(role)) return { failed: { error: 'bad-role', role, message: `role 不能用保留名 ${role}` } }
  const cwd = await callerCwd(ctx, exec)
  const root = projectRootOf(cwd)
  if (!root) return { failed: noProject(cwd) }
  const marked = existsSync(join(root, 'team')) || existsSync(join(root, '.git'))
  return { cwd, root, marked }
}

/** 手写 ToolDefinition：不经 defineTool，也不 import 任何 @deepseek-ai 包。 */
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
      return { error: 'path-conflict', path: roleDir, message: reasonOf(error) }
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
    '给员工派活：在 <role>/ 工作区新建一个 standard 预设的会话，把任务书当第一条消息投进去，并在 team/runs/ 写一条 task。'
    + '建好后会顺便把该会话设成「完全权限」（preset danger-full-access，即不再弹人工审批）；设不上只在返回值里记 degraded，不影响派活。'
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
      const created = await withTimeout(sessions.create({ workspaceId: workspace.id, agentPreset: 'standard' }), 20_000, 'sessionController.create')
      sessionId = created?.sessionId
      if (!sessionId) throw new Error('create 没有返回 sessionId')
    } catch (error) {
      const presetIssue = /preset/i.test(reasonOf(error))
      return { error: presetIssue ? 'preset-unavailable' : 'create-failed', taskId, message: reasonOf(error), hint: presetIssue ? 'standard 预设未注册或已 broken；不降级、不重试——先修好预设再派活' : '会话没建起来，没有派活；先试 team_status 确认角色与工作区仍在' }
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
      runFile = await writeRun(spot.root, { kind: 'task', taskId, role, status: 'assigned', at, session: sessionId, title, files: [] }, `## 任务书\n\n${task}\n\n本次会话：${sessionId}（standard 预设，工作区 ${workspace.id}${permission?.preset ? `，权限 ${permission.preset}` : ''}）`)
    } catch (error) {
      return { error: 'run-write-failed', taskId, sessionId, message: reasonOf(error), hint: '会话已建但流水账写不进去，先查 team/runs/ 权限' }
    }
    try {
      await withTimeout(sessions.prompt({ requestId: randomUUID(), sessionId, mode: 'queue', content: [{ type: 'text', text: taskBook({ taskId, role, root: spot.root, task }) }] }, deadline(exec, PROMPT_MS)), PROMPT_MS + 5_000, 'sessionController.prompt')
    } catch (error) {
      return { error: 'prompt-rejected', taskId, sessionId, runFile, message: reasonOf(error), hint: '未重试（避免重复投递）；会话已存在，可直接打开它确认，或用 team_status 观察' }
    }
    return {
      taskId, sessionId, runFile, accepted: true,
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
    + 'running 来自会话快照（拿不到服务→degraded:"session-state-unavailable"，会话查不到→"session-state-unknown"）。可选 role 只看一个岗位，since 只看该时间之后的记录。',
  parameters: params({
    role: ROLE_PARAM,
    since: { type: 'string', description: 'ISO 时间；只统计 at 不早于它的 task/report' },
  }),
  async execute(args, exec) {
    const cwd = await callerCwd(ctx, exec)
    const root = projectRootOf(cwd)
    if (!root || !existsSync(join(root, 'team'))) return { error: 'no-team', cwd, message: '没找到 team/ 目录', hint: '先 team_hire 招一个岗位（会顺带建 team/runs/）' }
    const dir = runsDir(root)
    let names = []
    try { names = (await withTimeout(readdir(dir), 5_000, 'readdir')).filter((file) => file.endsWith('.md')).sort().slice(-RUN_CAP) } catch { names = [] }
    const records = []
    for (const file of names) {
      try { records.push({ file, ...frontMatter(await withTimeout(readFile(join(dir, file), 'utf8'), 5_000, `read ${file}`)) }) } catch { /* 单条坏就丢这一条 */ }
    }
    const since = typeof args.since === 'string' ? args.since.trim() : ''
    const wanted = typeof args.role === 'string' ? args.role.trim() : ''
    const byTime = (left, right) => String(left.at ?? '').localeCompare(String(right.at ?? ''))
    const tasks = records.filter((record) => record.kind === 'task' && record.taskId && atLeast(record.at, since))
    const reports = new Map()
    for (const record of records) {
      if (record.kind !== 'report' || !record.taskId) continue
      const seen = reports.get(record.taskId)
      if (!seen || byTime(seen, record) <= 0) reports.set(record.taskId, record)
    }
    const sessions = service(ctx, 'sessionController')
    let running
    if (sessions?.list) {
      try {
        const listed = await withTimeout(sessions.list({}, deadline(exec, 8_000)), 10_000, 'sessionController.list')
        running = new Map((listed?.items ?? []).map((item) => [String(item.sessionId), Boolean(item.running)]))
      } catch { running = undefined }
    }
    const roles = [...new Set(tasks.map((record) => String(record.role ?? '')).filter((role) => role && (!wanted || role === wanted)))]
    const members = roles.map((role) => {
      const own = tasks.filter((record) => String(record.role) === role).sort(byTime)
      const openTasks = own.filter((record) => !reports.has(record.taskId)).map((record) => ({ taskId: record.taskId, file: record.file, at: record.at, ...(record.title ? { title: record.title } : {}) }))
      const report = own.map((record) => reports.get(record.taskId)).filter(Boolean).sort(byTime).at(-1)
      const sessionId = String(report?.session ?? own.at(-1)?.session ?? '')
      return { role, running: running && sessionId ? running.get(sessionId) ?? null : null, openTasks, ...(report ? { lastReport: { file: report.file, at: report.at, status: report.status, taskId: report.taskId } } : {}) }
    })
    const degraded = !running ? 'session-state-unavailable' : members.some((member) => member.running === null) ? 'session-state-unknown' : undefined
    return { projectRoot: root, runs: dir, members, ...(degraded ? { degraded } : {}) }
  },
})

/** 注册三个工具；`ctx.tools` 由 inject 保证存在。 */
export function apply(ctx) {
  for (const build of [hire, dispatch, status]) ctx.tools.register(build(ctx))
}
