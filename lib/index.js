/**
 * 宿主半部 —— 本包刻意保持空实现。
 *
 * 这个文件的唯一职责，是给 `cordis.patch.yml` 里 `- id: company-office` 那行一个可挂载的
 * 宿主入口，好让 `@deepseek-ai/dsh-client-modules` 在扫描 Loader 条目时看到本包的
 * `dsh.client`，从而把 `lib/client.js`（左侧「团队」面板）注入浏览器。
 * 它不注册任何工具、不注入任何服务。
 *
 * 硬规矩没变：`team_*` 只能注册在「开发团队」preset 作用域内
 * （`cordis.patch.yml` 里 preset-company-office 的 team-tools 行）。一旦把工具挪到这里，
 * 它们会对所有会话可见 —— 员工也能派活，「单线汇报」的结构性隔离当场失效。
 * 所以本文件的 apply 永远不允许长出内容；需要宿主能力时另开 preset 作用域内的插件。
 */
export const name = 'company-office-host'

export function apply() {
  // 故意为空：只提供 Loader 条目身份，不提供任何能力。
}
