/**
 * dsh-yaoking-company-office / permissions — 把员工会话切成「完全权限」（尽力而为，绝不抛）。
 *
 * 下面三条都是读宿主源码得到的事实，不是猜的：
 *
 * 1) 「完全权限」对应的 preset id 是 `danger-full-access`。中文 label 只活在客户端 i18n 里：
 *    `PRESET_LABEL_KEYS` 把 `danger-full-access` 映到 `preset.fullAccess`，中文表里是「完全权限」
 *    （dsh-client-ui-permission-presets/lib/client.js:231,237,261-263）。宿主端 catalog() 只给
 *    { value, name, description }（dsh-permission-presets/lib/types/types.d.ts:12-19,24-31），
 *    而这个部署里 preset 的 name 就是 id 本身（dsh-permission-presets/lib/index.js:151-156，
 *    dsh-base/cordis.patch.yml:274-276 显式配了同名三条），所以这里一律按 id 取、不按 label 猜。
 *    该 preset 的捆绑是 sandbox `danger-full-access` + approval `never`，即不再弹审批。
 *
 * 2) `Session` 只能从 sessionId 反查：`ctx.sessions.get(id)`（dsh-session/lib/types/index.d.ts:491）；
 *    退路是 `ctx.agents.get(id).session`（dsh-agent/lib/types/index.d.ts:343 +
 *    dsh-agent/lib/types/runtime-types.d.ts:143）。`SessionCreateRequest` 没有 permission 字段
 *    （dsh-api-session-controller/lib/types/types.d.ts:284-293），所以只能在 create 之后补。
 *
 * 3) 不需要等会话 attach：`sessionController.create()` 内部走 agents.create →
 *    `sessions.enter()` → `sessions.announce()` 之后才 resolve（dsh-agent-loop/lib/index.js:1790-1794），
 *    而 permission-presets 的初始 pin 就挂在 `session/created` 上
 *    （dsh-permission-presets/lib/index.js:202-203）。也就是 create 一返回，会话已经 live、
 *    初始权限也已经落盘，随后的 set 覆盖它就是最终值。set 本身只 append 日志
 *    （lib/index.js:344-360 + dsh-sandbox-policy/lib/index.js:40-42 +
 *    dsh-user-approval/lib/index.js:63-66），与客户端/附件状态无关。
 *    这里仍留一小段有界重试，纯粹防未来版本的发布顺序漂移；超时（约 120ms）就降级，不拖住派活。
 */

/** 「完全权限」的 preset id。 */
export const FULL_ACCESS_PRESET = 'danger-full-access'

/** 派生状态，永远不是切换目标；`auto` 的 bundle 是 danger-full-access + ask（逐调用审查）。 */
const RESERVED = new Set(['auto', 'custom'])
const ATTEMPTS = 3
const DELAY_MS = 40

const reasonOf = (error) => (error instanceof Error ? error.message : String(error))
const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms) })

/** 取宿主服务：与 tools.js 同一条规矩（属性优先，再 ctx.get），取不到返回 undefined。 */
function service(ctx, key) {
  try { const direct = ctx[key]; if (direct) return direct } catch { /* 未注入直接访问会抛 */ }
  try { return ctx.get(key) ?? undefined } catch { return undefined }
}

/** sessionId → Session：先 session store，再用 agent 反查。 */
function sessionOf(ctx, sessionId) {
  const sessions = service(ctx, 'sessions')
  const live = sessions?.get?.(sessionId)
  if (live) return live
  return service(ctx, 'agents')?.get?.(sessionId)?.session
}

/**
 * 按 id 找 preset；万一部署把 id 改名，再退到 bundle 形状（danger-full-access + never）。
 * 两种都没找到就返回 undefined —— 不猜、不硬编一个不存在的名字去喂 set()。
 */
function pickFullAccess(permissionPresets) {
  let catalog
  try { catalog = permissionPresets.catalog() } catch { return undefined }
  const names = [...new Set([...(catalog?.options ?? []), ...(catalog?.defaultOptions ?? [])]
    .map((option) => String(option?.value ?? ''))
    .filter((value) => value && !RESERVED.has(value)))]
  if (names.includes(FULL_ACCESS_PRESET)) return FULL_ACCESS_PRESET
  for (const name of names) {
    let spec
    try { spec = permissionPresets.resolve(name) } catch { continue }
    if (spec?.sandbox === FULL_ACCESS_PRESET && spec?.approval === 'never') return name
  }
  return undefined
}

/**
 * 尽力把会话设成完全权限。
 * @param ctx - 宿主 ctx（软取 sessions / agents / permissionPresets）。
 * @param sessionId - 刚 create 出来的会话 id。
 * @returns `{ preset }` 成功；`{ reason }` 失败。永不抛。
 */
export async function grantFullAccess(ctx, sessionId) {
  const presets = service(ctx, 'permissionPresets')
  if (typeof presets?.set !== 'function' || typeof presets?.catalog !== 'function') return { reason: 'permissionPresets 服务不可用' }
  const target = pickFullAccess(presets)
  if (!target) return { reason: `permission catalog 里没有 ${FULL_ACCESS_PRESET}，也没有 sandbox=${FULL_ACCESS_PRESET}+approval=never 的 preset` }
  let session
  for (let attempt = 0; attempt < ATTEMPTS && !session; attempt += 1) {
    session = sessionOf(ctx, sessionId)
    if (!session && attempt + 1 < ATTEMPTS) await sleep(DELAY_MS)
  }
  if (!session) return { reason: `会话 ${sessionId} 不在 session store 里（重试 ${ATTEMPTS} 次仍未出现）` }
  try {
    presets.set(session, target)
  } catch (error) {
    return { reason: `permissionPresets.set 失败: ${reasonOf(error)}` }
  }
  // 回读一次：current() 不可用（projection 没注册）只算未知，不算失败。
  let applied
  try { applied = presets.current(session) } catch { applied = undefined }
  if (applied !== undefined && applied !== target) return { reason: `set 之后 current() 仍是 ${applied}` }
  return { preset: target }
}
