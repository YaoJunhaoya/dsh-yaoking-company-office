/** dsh-yaoking-company-office / templates — 纯字符串模板：两份 AGENTS.md、STATE.md、runs front-matter、派活任务书。无 I/O。 */
/*
 * 员工不是「写不了 ../team/」：派活时会被设成完全权限（danger-full-access + approval:never），
 * 文件系统不隔离，哪儿都能写。隔离只在工具通道（team_* 只注册给 PM 的 preset），
 * 所以下面「不要写 team/」的措辞一律是约定，不是权限拦截。
 */
const pad = (n) => String(n).padStart(2, '0')
const quote = (value) => JSON.stringify(String(value).replace(/\s+/g, ' ').trim())

/** 本地 `YYYYMMDD-HHMM`，runs 文件名前缀。 */
export function stamp(date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`
}

/** 本地带偏移 ISO，例 `2026-11-18T20:10+08:00`（front-matter 的 at）。 */
export function isoLocal(date) {
  const offset = -date.getTimezoneOffset()
  const abs = Math.abs(offset)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}${offset >= 0 ? '+' : '-'}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
}

/** 员工级 AGENTS.md：我是谁、先读什么、产出放哪、不做什么。 */
export function employeeAgentsMd({ role, title, duty, readFirst = [] }) {
  const label = title && title.trim() ? `${title.trim()}（${role}）` : role
  const reads = [
    '../AGENTS.md（项目规矩：技术栈、红线、怎么算做完）',
    '../team/STATE.md（项目经理维护的当前状态）',
    ...(Array.isArray(readFirst) ? readFirst : []).map((item) => String(item).trim()).filter(Boolean),
  ]
  return `# ${label}

你是${label}。只写本目录 ${role}/；可以读整个项目（包括别人的产出），但不改别人的目录。

## 先读
${reads.map((item) => `- ${item}`).join('\n')}

## 职责
${String(duty ?? '').trim()}

## 产出
- 代码与文档放本目录 ${role}/。
- 每次收工（做完或卡住）写 **本目录下的 REPORT.md**（覆盖上一份）。不要写 ../team/：账本由项目经理独占；你有完全权限，文件系统拦不住你，这条只靠约定。汇报由项目经理归档进 team/runs/。前缀用当时的本地时间：

~~~yaml
taskId: <照抄派给你的 task 文件里的 taskId>
role: ${role}
kind: report
status: done        # done 或 blocked
at: <本地时间，例 2026-11-18T20:10+08:00>
session: <你的会话 id>
files: [${role}/…]
~~~

  正文三段：做了什么 / 文件在哪 / 卡在哪（无则写「无」）。

## 不做
- 不给别的员工派活：你没有这个工具，也没有这个通道。要协调就写进汇报，让项目经理去派。
- 不改 ../team/ 下的任何文件（STATE.md 与 runs/ 都是项目经理的）。你的产出和 REPORT.md 只留在自己目录里。
`
}

/** 项目级 AGENTS.md 骨架（只在缺失时写，不覆盖用户已有的）。 */
export function projectAgentsMd({ project }) {
  return `# ${project}

> 这份文件由项目经理在开工前和老板一起填。填空之前它只是骨架，不构成约束。

## 这是什么
<一句话：做的是什么，给谁用，交付物是什么形态（App / 网站 / 服务 / 提示词库 / 文案 / 其它）>

## 怎么算做完
<做成什么样算能用。写得越具体越好：能跑通哪条路径、达到什么指标、交付哪几个文件>

## 最在意
<快 / 稳 / 好看 / 省钱，选一到两个；有冲突时听谁的>

## 不能碰
- <红线：预算、生产数据、合规、密钥、不可逆操作>
- 产出只写自己的岗位目录，不覆盖别人的目录。

## 目录
各岗位目录都是一个独立工作区；team/ 是流水账（task / report）；项目根只放账本与文档。

## 收工
每次收工写自己目录下的 REPORT.md，正文三段：做了什么 / 文件在哪 / 卡在哪。项目经理负责归档到 team/runs/。
`
}

/** team/STATE.md 骨架（PM 独占写权；员工只读）。 */
export function stateMd({ project }) {
  return `# STATE — ${project}

项目经理独占写权，员工只读。

## 目标
<一句话：这个项目要做成什么>

## 现在
<一行：现在到哪一步了>

## 进行中
- [ ] <taskId> <role> <一句话>

## 阻塞
无

## 下一步
- <一句话>
`
}

/** team/runs/<YYYYMMDD-HHMM>-<role>-<kind>.md 全文：front-matter 六~八行 + 正文。 */
export function runMarkdown({ kind, taskId, role, status, at, session, title, files = [], body }) {
  const head = [
    '---',
    `taskId: ${taskId}`,
    `role: ${role}`,
    `kind: ${kind}`,
    `status: ${status}`,
    `at: ${isoLocal(at)}`,
    ...(session ? [`session: ${session}`] : []),
    ...(title ? [`title: ${quote(title)}`] : []),
    `files: [${files.map((file) => String(file).replace(/[\n,]/g, ' ').trim()).filter(Boolean).join(', ')}]`,
    '---',
  ]
  return `${head.join('\n')}\n\n${String(body).trim()}\n`
}

/** 派活时投进员工会话的第一条消息：自包含任务书 + 岗位 + 收工约定。 */
export function taskBook({ taskId, role, root, task }) {
  return `# 任务 ${taskId}

${String(task).trim()}

## 你的岗位
先读 \`${role}/AGENTS.md\` 与项目根 \`AGENTS.md\`（以及它们指向的文件），再动手。只写 \`${role}/\`，可以读整个项目。

## 收工（必须做）
做完或卡住，立刻写本目录下的 \`REPORT.md\`（第一行就是 \`---\`）。**不要写 ${root}/team/runs/**：账本由项目经理归档；工具通道已隔离（你没有 team_* 工具），文件系统不隔离，这条只靠约定。格式：

~~~yaml
---
taskId: ${taskId}
role: ${role}
kind: report
status: done        # done 或 blocked
at: <本地时间，例 2026-11-18T20:10+08:00>
session: <你的会话 id>
files: [${role}/…]
---
~~~

正文三段：做了什么 / 文件在哪 / 卡在哪（无则写「无」）。写完就结束本轮，不要等项目经理确认。
`
}
