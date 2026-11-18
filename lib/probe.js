/**
 * 一次性诊断探针（排查完请删掉这一行）。
 *
 * 在宿主启动 5 秒后写一次 /tmp/company-office-probe.log，记录：
 *  1. 我们这个 bundle 的行有没有被挂载（能写文件 = 挂了）；
 *  2. agentPresets 注册表里有哪些 preset、「开发团队」在不在、broken 是什么；
 *  3. sessionController / workspaceRegistry / workingDirectory 能不能拿到。
 *
 * 延迟是必须的：apply 那一刻别的 bundle 的行可能还没挂完，早读会得到空表。
 * 用属性访问而不是 ctx.get()，因为后者在不同作用域下的语义不一样。
 */
import { appendFileSync } from 'node:fs'

export const name = 'company-office-probe'
export const inject = ['agentPresets']

const LOG = '/tmp/company-office-probe.log'

function record(payload) {
  try {
    appendFileSync(LOG, `${new Date().toISOString()} ${JSON.stringify(payload)}\n`)
  } catch {
    /* 诊断失败不影响启动 */
  }
}

export async function apply(ctx) {
  const timer = setTimeout(async () => {
    const probe = {}
    for (const key of ['sessionController', 'workspaceRegistry', 'workingDirectory', 'sessions', 'tools']) {
      let value
      try {
        value = ctx[key]
      } catch (error) {
        value = `throw:${error?.message}`
      }
      probe[key] = value === undefined || value === null ? 'missing' : typeof value
    }

    let presets
    try {
      const rows = await ctx.agentPresets.list()
      presets = rows.map((row) => ({ id: row.id, name: row.name, order: row.order, broken: row.broken }))
    } catch (error) {
      presets = { error: String(error?.message ?? error) }
    }

    record({ event: 'probe', services: probe, presetCount: Array.isArray(presets) ? presets.length : null, presets })
  }, 5000)

  timer.unref?.()
}
