// dsh-yaoking-company-office — 客户端半部（classic-script CJS bundle，无构建步骤，宿主按 classic script 加载）。
// 信封同 dsh-my-questions-outline/lib/client.js:13-20、455-458；挂载改用 shell.overlay 的常驻
// 左栏（fixed 容器，同 $PROFILE/dsh-my-questions-outline/lib/client.js:447-451），不再注册
// sidebar.panellist / main，也不动原生 ui-workspace。
window.__ModuleLoader__.load({
  id: "dsh-yaoking-company-office",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    var React = require("react");
    var h = React.createElement;
    var STYLE_ID = "dsh-yaoking-company-office-style";
    // Agent preset id：PRESET_PM 必须与 cordis.patch.yml 的 preset id 一致（项目经理，带 team_* 工具）。
    // PRESET_STAFF 是 v1.3 起的员工预设（cordis.patch.yml 里的 staff：timed 提问 + 员工人设）；
    // 老会话、以及宿主还没注册 staff 时建出来的员工会话记的是 standard —— 两个都算「员工」，
    // 判定统一走 isStaffPreset()，别让历史会话掉徽章。
    var PRESET_PM = "devteam";
    var PRESET_STAFF = "staff";
    var PRESET_STAFF_LEGACY = "standard";
    var STUCK_MS = 5 * 60 * 1000;
    var NOW_TICK_MS = 30 * 1000;
    var ICONS = {
      chevron: ["M9 5l6 7-6 7"], plus: ["M12 5v14", "M5 12h14"], filter: ["M4 6h16", "M7 12h10", "M10 18h4"], sliders: ["M4 7h9", "M17 7h3", "M4 17h4", "M12 17h8", "M15 4.5v5", "M9 14.5v5"],
      folder: ["M4 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"], person: ["M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7", "M5 20c0-3.2 3.1-5.5 7-5.5s7 2.3 7 5.5"],
      chat: ["M4 6.5h16v9H9l-5 3.5v-3.5H4z"], users: ["M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6", "M3 20c0-3 2.7-5 6-5s6 2 6 5", "M16 6.6a2.4 2.4 0 0 1 0 4.8", "M17.6 15.4c2 .6 3.4 2.2 3.4 4.6"], crown: ["M4 18h16", "M4 6l4 4 4-6 4 6 4-4v12H4z"]
    };
    var CSS = [
      ".dt-root{position:fixed;left:0;top:var(--dt-top,204px);bottom:var(--dt-bottom,64px);width:var(--dt-width,280px);z-index:30;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden;background:var(--dsw-specific-sidebar-fill,var(--dsw-alias-bg-base));border-right:1px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary);font-size:12.5px;line-height:18px}.dt-root,.dt-root *{box-sizing:border-box}.dt-top{flex:none;padding:10px 10px 4px}.dt-add{width:100%;height:30px;padding:0;border:0;border-radius:8px;background:var(--dsw-alias-button-info-fill,var(--dsw-alias-brand-primary));color:var(--dsw-alias-label-primary-foreground,#fff);font:inherit;font-size:12.5px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:5px;cursor:pointer}.dt-add:hover{background:var(--dsw-alias-button-info-hover,var(--dsw-alias-button-primary-hover))}.dt-add:focus-visible,.dt-head:focus-visible,.dt-row:focus-visible,.dt-act:focus-visible,.dt-rm:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));outline-offset:-2px}.dt-scroll{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:6px 8px 10px}.dt-card{margin:0 0 6px;padding-bottom:6p",
      "x;border-bottom:1px solid var(--dsw-alias-border-l1)}.dt-card-last{margin-bottom:0;padding-bottom:0;border-bottom:0}.dt-headrow{display:flex;align-items:center;gap:1px;min-height:30px;padding-right:2px;border-radius:7px}.dt-headrow:hover,.dt-head:hover{background:var(--dsw-alias-interactive-bg-hover)}.dt-head{flex:1;min-width:0;display:flex;align-items:center;gap:6px;height:30px;padding:0 2px 0 4px;border:0;border-radius:7px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}.dt-head .dt-name{font-size:13px;font-weight:600}.dt-caret{flex:none;display:inline-flex;align-items:center;justify-content:center;width:12px;height:12px;color:var(--dsw-alias-label-tertiary);transition:transform .16s var(--ds-ease-in-out,ease)}.dt-caret-on{transform:rotate(90deg)}.dt-avatar{flex:none;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-button-info-fill,var(--dsw-alias-brand-primary));color:var(--dsw-alias-label-primary-foreground,#fff);font-size:9px;font-weight:700;line-height:16px;text-align:center;text-transform:uppercase}.dt-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dt-status{flex:none;width:6px;height:6px;border-radius:50%;margin:0 3px 0 1px;box-s",
      "hadow:inset 0 0 0 1px var(--dsw-alias-label-tertiary)}.dt-status-on{background:var(--dsw-alias-state-success-primary);box-shadow:none}.dt-act{flex:none;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;opacity:.7}.dt-act:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);opacity:1}.dt-act-on{color:var(--dsw-alias-button-info-fill,var(--dsw-alias-brand-primary));opacity:1}.dt-row{display:flex;align-items:center;gap:6px;width:100%;min-height:28px;padding:0 6px 0 20px;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;font-size:12.5px;line-height:18px;text-align:left;cursor:pointer}.dt-row:hover{background:var(--dsw-alias-interactive-bg-hover)}.dt-row-static{cursor:default}.dt-row-static:hover{background:transparent}.dt-row-ses{min-height:26px;padding-left:34px;font-size:12px;color:var(--dsw-alias-label-secondary)}.dt-ico{flex:none;display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;color:var(--dsw-alias-label-secondary)}.dt-bubble{color:var(--dsw-alias-button-info-fill,var(--dsw-ali",
      "as-brand-primary))}.dt-pill{flex:none;height:15px;padding:0 4px;border-radius:4px;font-size:10px;font-weight:500;line-height:15px;color:var(--dsw-alias-button-info-fill,var(--dsw-alias-brand-primary));background:var(--dsw-alias-interactive-bg-hover-accent);background:color-mix(in srgb,var(--dsw-alias-button-info-fill,#4176e6) 14%,transparent)}.dt-count{flex:none;min-width:22px;text-align:right;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}.dt-count-run{display:inline-flex;align-items:center;justify-content:flex-end;color:var(--dsw-alias-state-success-primary);font-variant-numeric:tabular-nums}.dt-count-run:before{content:'';flex:none;width:5px;height:5px;margin-right:4px;border-radius:50%;background:currentColor}.dt-count-run-n{flex:none;color:var(--dsw-alias-state-success-primary)}.dt-count-total{flex:none;color:var(--dsw-alias-label-tertiary)}.dt-crown{flex:none;display:inline-flex;color:var(--dsw-alias-state-warn-primary)}.dt-sdot{flex:none;width:5px;height:5px;border-radius:50%;box-shadow:inset 0 0 0 1px var(--dsw-alias-label-tertiary)}.dt-sdot-on{background:var(--dsw-alias-state-success-primary);box-shadow:none}.dt-time{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}.dt-seclabel{display:flex;align-items:center;gap:4px;height:24px;margin-top:2px;padding:0 2px 0 20px;color:var(--dsw-alias-label-tert",
      "iary);font-size:11px;letter-spacing:.03em}.dt-note{margin:4px 2px;padding:2px 6px 2px 20px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:17px}.dt-mini{bottom:auto;height:auto;left:8px;right:auto;width:126px;padding:4px;border:1px solid color-mix(in srgb,var(--dsw-alias-button-info-fill) 50%,transparent);border-radius:8px;background:var(--dsw-specific-sidebar-fill,var(--dsw-alias-bg-base))}.dt-mini-btn{height:26px;font-size:12px}.dt-mini-toggle{margin:0;width:100%;height:26px;display:flex;align-items:center;justify-content:center;gap:6px;line-height:1;border:1px solid color-mix(in srgb,var(--dsw-alias-button-info-fill) 50%,transparent);border-radius:9px;background:color-mix(in srgb,var(--dsw-alias-button-info-fill) 16%,transparent);color:var(--dsw-alias-button-info-fill);font:inherit;font-size:13px;font-weight:700;letter-spacing:.02em;cursor:pointer}.dt-mini-toggle:hover{background:color-mix(in srgb,var(--dsw-alias-button-info-fill) 28%,transparent)}.dt-mini-toggle:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.dt-stuck{color:var(--dsw-alias-state-warn-primary);font-weight:600}.dt-arch{flex:none;margin-left:2px;width:18px;height:18px;padding:0;border:0;display:inline-flex;align-items:center;justify-content:center;border-radius:4px;background:transparent;opacity:0;pointer-events:none;font:inherit;font-size:11px;color:var(--dsw-alias-label-tertiary);cursor:pointer}.dt-row-ses:hover .dt-arch,.dt-arch:focus-visible{opacity:.8;pointer-events:auto}.dt-arch:hover{background:var(--dsw-alias-state-error-primary);color:#fff;opacity:1}.dt-rowwrap{position:relative;display:flex;align-items:center;gap:2px}.dt-rowwrap>.dt-row{flex:1;min-width:0}.dt-rm{flex:none;hei",
      "ght:20px;padding:0 4px;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:10px;line-height:20px;white-space:nowrap;cursor:pointer;opacity:0;pointer-events:none}.dt-headrow:hover .dt-rm,.dt-rowwrap:hover .dt-rm,.dt-rm:focus-visible{opacity:1;pointer-events:auto}.dt-rm:hover{background:var(--dsw-alias-state-error-primary);color:#fff;opacity:1}.dt-stale{opacity:.55;filter:grayscale(1)}.dt-gone{flex:none;font-size:10px;color:var(--dsw-alias-state-warn-primary);white-space:nowrap}.dt-flash{flex:none;margin:8px 10px 0;padding:6px 8px;border:1px solid var(--dsw-alias-border-l3);border-radius:7px;background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 14%,var(--dsw-specific-sidebar-fill,#fff));color:var(--dsw-alias-label-primary);font-size:11.5px;line-height:16px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.16);word-break:break-word}.dt-flash-bad{border-color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 16%,var(--dsw-specific-sidebar-fill,#fff));color:var(--dsw-alias-state-error-primary)}.dt-err{margin:6px 2px;padding:2px 6px;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:17px}",
      ".dt-pick-mask{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.34)}.dt-pick{display:flex;flex-direction:column;width:min(620px,100%);max-height:min(560px,calc(100dvh - 32px));overflow:hidden;border:1px solid var(--dsw-alias-border-l3);border-radius:10px;background:var(--dsw-specific-sidebar-fill,var(--dsw-alias-bg-base));color:var(--dsw-alias-label-primary);box-shadow:0 12px 40px rgba(0,0,0,.3);font-size:12.5px;line-height:18px}.dt-pick-head{flex:none;display:flex;flex-direction:column;gap:6px;padding:14px 16px 8px;border-bottom:1px solid var(--dsw-alias-border-l3)}.dt-pick-title{margin:0;font-size:15px;font-weight:600;line-height:22px}.dt-pick-crumbs{display:flex;align-items:center;flex-wrap:wrap;gap:4px;min-height:22px}.dt-pick-crumb{max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 2px;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:12.5px;cursor:pointer}.dt-pick-crumb:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.dt-pick-sep{flex:none;color:var(--dsw-alias-label-tertiary)}.dt-pick-edit{flex:none;margin-left:auto;padding:0 5px;border:1px solid transparent;border-radius:5px;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:11.5px;line-height:20px;cursor:pointer}.dt-pick-edit:hover{border-color:var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary)}.dt-pick-pathrow{display:flex;align-items:center;gap:6px;min-height:26px}.dt-pick-path{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary);font-size:12px}.dt-pick-pathbtn{padding:0;border:0;background:transparent;font:inherit;font-size:12px;text-align:left;cursor:text}.dt-pick-pathbtn:hover{color:var(--dsw-alias-label-primary)}.dt-pick-input{flex:1;min-width:0;height:26px;padding:0 6px;border:1px solid var(--dsw-alias-border-l3);border-radius:5px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px}.dt-pick-input:focus{outline:2px solid var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));outline-offset:-2px}.dt-pick-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:6px 8px 10px}.dt-pick-row{display:flex;align-items:center;gap:6px;width:100%;min-height:28px;padding:0 6px;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;font-size:12.5px;text-align:left;cursor:pointer}.dt-pick-row:hover{background:var(--dsw-alias-interactive-bg-hover)}.dt-pick-row:focus-visible,.dt-pick-crumb:focus-visible,.dt-pick-btn:focus-visible,.dt-pick-edit:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));outline-offset:-2px}.dt-pick-row-hidden{opacity:.62}.dt-pick-rowico{flex:none;display:inline-flex;color:var(--dsw-alias-label-secondary)}.dt-pick-rowname{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dt-pick-hint{flex:none;font-size:10px;color:var(--dsw-alias-label-tertiary)}.dt-pick-note{margin:4px 6px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:17px}.dt-pick-err{margin:4px 6px;padding:5px 7px;border:1px solid color-mix(in srgb,var(--dsw-alias-state-error-primary) 45%,transparent);border-radius:6px;background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 12%,transparent);color:var(--dsw-alias-state-error-primary);font-size:11.5px;line-height:17px;word-break:break-word}.dt-pick-foot{flex:none;display:flex;align-items:center;flex-wrap:wrap;gap:8px;padding:10px 16px;border-top:1px solid var(--dsw-alias-border-l3)}.dt-pick-gap{flex:1}.dt-pick-create{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.dt-pick-btn{height:28px;padding:0 11px;border:1px solid var(--dsw-alias-border-l3);border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;white-space:nowrap;cursor:pointer}.dt-pick-btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.dt-pick-btn:disabled{opacity:.5;cursor:default}.dt-pick-primary{color:var(--dsw-alias-label-primary-foreground,#fff);border-color:transparent;background:var(--dsw-alias-button-info-fill,var(--dsw-alias-brand-primary));font-weight:600}.dt-pick-primary:hover{color:var(--dsw-alias-label-primary-foreground,#fff);background:var(--dsw-alias-button-info-hover,var(--dsw-alias-button-primary-hover))}",
      ".dt-actions{display:flex;gap:4px;margin:2px 0 4px;padding-left:20px}.dt-btn{flex:1;min-width:0;height:26px;padding:0 6px;border:1px solid var(--dsw-alias-border-l3);border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11.5px;line-height:24px;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:4px;cursor:pointer}.dt-btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l2)}.dt-btn-main{color:var(--dsw-alias-button-info-fill,var(--dsw-alias-brand-primary));border-color:color-mix(in srgb,var(--dsw-alias-button-info-fill,#4176e6) 45%,transparent)}.dt-btn-main:hover{color:var(--dsw-alias-label-primary);background:color-mix(in srgb,var(--dsw-alias-button-info-fill,#4176e6) 12%,transparent)}.dt-badge{flex:none;height:15px;padding:0 4px;border-radius:4px;font-size:10px;font-weight:600;line-height:15px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-interactive-bg-hover)}.dt-badge-pm{color:var(--dsw-alias-button-info-fill,var(--dsw-alias-brand-primary));background:var(--dsw-alias-interactive-bg-hover-accent);background:color-mix(in srgb,var(--dsw-alias-button-info-fill,#4176e6) 14%,transparent)}.dt-badge-staff{color:var(--dsw-alias-label-tertiary)}.dt-warn{display:flex;flex-direction:column;gap:3px;margin:3px 2px 4px 20px;padding:5px 7px;border:1px solid color-mix(in srgb,var(--dsw-alias-state-warn-primary) 45%,transparent);border-radius:7px;background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 9%,transparent);font-size:11.5px;line-height:16px}.dt-warn-title{color:var(--dsw-alias-state-warn-label);font-weight:600}.dt-warn-sub{color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dt-warn-act{align-self:flex-start;height:22px;padding:0 7px;border:1px solid color-mix(in srgb,var(--dsw-alias-state-warn-primary) 55%,transparent);border-radius:5px;background:transparent;color:var(--dsw-alias-state-warn-primary);font:inherit;font-size:11px;font-weight:600;cursor:pointer}.dt-warn-act:hover{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 16%,transparent)}.dt-guide{margin:3px 2px 5px 20px;padding:5px 7px 6px;border:1px solid var(--dsw-alias-border-l3);border-radius:7px;background:color-mix(in srgb,var(--dsw-alias-button-info-fill,#4176e6) 6%,transparent)}.dt-guide-head{display:flex;align-items:center;gap:4px;width:100%;padding:0;border:0;border-radius:4px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;font-weight:600;line-height:17px;text-align:left;cursor:pointer}.dt-guide-head:hover{background:var(--dsw-alias-interactive-bg-hover)}.dt-guide-list{margin:3px 0 0;padding-left:16px;color:var(--dsw-alias-label-secondary);font-size:11.5px;line-height:17px}.dt-guide-list li{margin:0 0 2px;padding-left:1px}.dt-pip{flex:none;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:14px;line-height:1;cursor:pointer;opacity:0;pointer-events:none}.dt-rowwrap:hover .dt-pip,.dt-pip:focus-visible{opacity:.8;pointer-events:auto}.dt-pip:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-button-info-fill,var(--dsw-alias-brand-primary));opacity:1}.dt-row-ses-stuck{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 10%,transparent)}.dt-row-ses-wait{background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 12%,transparent)}.dt-waiting{flex:none;color:var(--dsw-alias-state-warn-primary);font-weight:600;white-space:nowrap}.dt-btn:focus-visible,.dt-pip:focus-visible,.dt-warn-act:focus-visible,.dt-guide-head:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));outline-offset:-2px}"
    ].join("\n");
    function injectCss() {
      if (typeof document === "undefined" || document.getElementById(STYLE_ID)) return;
      var tag = document.createElement("style"); tag.id = STYLE_ID; tag.textContent = CSS; (document.head || document.body).appendChild(tag);
    }
    function icon(name, size) {
      var paths = ICONS[name] || [], kids = [];
      for (var i = 0; i < paths.length; i++) kids.push(h("path", { key: i, d: paths[i] }));
      return h("svg", { width: size || 13, height: size || 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false" }, kids);
    }
    function caret(open) { return h("span", { className: "dt-caret" + (open ? " dt-caret-on" : "") }, icon("chevron", 12)); }
    function note(text, key) { return h("div", { className: "dt-note", key: key }, text); }
    function messageOf(error) {
      return error && typeof error.message === "string" && error.message ? error.message : String(error);
    }
    function initialOf(name) { var text = String(name || "").trim(); return text ? text.charAt(0) : "·"; }
    // now 由 useNow(30s) 传进来，相对时间和「可能卡住」不再依赖快照变化。
    function relTime(ms, now) {
      if (typeof ms !== "number" || !isFinite(ms) || ms <= 0) return "";
      var current = typeof now === "number" && isFinite(now) ? now : Date.now();
      var diff = current - ms, minutes = Math.floor(diff / 6e4), hours = Math.floor(minutes / 60);
      if (diff < 6e4) return "刚刚";
      if (minutes < 60) return minutes + "分钟";
      return hours < 24 ? hours + "小时" : Math.floor(hours / 24) + "天";
    }
    function serviceOf(ctx, name) { try { return ctx.get(name) || null; } catch (error) { return null; } }
    // browse 后端的 ui.listDirectory 在 native 平台上会抛 DirectoryBrowseError("directory-picker/unavailable")。
    // 只认这一个 code：其它错误是「这个目录读不了」，要留在对话框里显示，不能偷偷换成系统面板。
    function isBrowseUnavailable(error) {
      if (!error) return false;
      var code = (error.rpcError && error.rpcError.code) || error.code;
      if (code === "directory-picker/unavailable") return true;
      return /directory-picker\/unavailable/.test(messageOf(error));
    }
    // 目录选择结果归一成字符串：native 返回 result.value，不同版本可能直接给路径或带 path 的对象。
    function pathOfPicked(pickedValue) {
      return typeof pickedValue === "string" ? pickedValue
        : pickedValue && (pickedValue.path || (pickedValue.value && pickedValue.value.path));
    }
    // workspaces.create 的返回值归一成 workspace 对象：
    // 有的宿主给 {ok, value:{workspace}}（wire 层），有的直接给 workspace 对象（客户端控制器层，
    // @deepseek-ai/dsh-api-workspace-controller/lib/client.js 里 create 成功就 `return result.value.workspace`）。
    function workspaceOf(result) {
      if (!result) return null;
      if (typeof result.workspaceId === "string" || typeof result.path === "string") return result;
      if (result.workspace) return result.workspace;
      if (result.value && result.value.workspace) return result.value.workspace;
      return null;
    }
    // 面包屑折叠：当前目录在 home 之下时，home 及其之前折叠成一个「主目录」按钮（与 DSH 原生浏览器一致）。
    function displayCrumbsOf(listing) {
      var crumbs = (listing && listing.crumbs) || [], homeIndex = -1;
      for (var i = 0; i < crumbs.length; i++) if (crumbs[i] && crumbs[i].path === listing.home) { homeIndex = i; break; }
      if (homeIndex < 0) return crumbs;
      return [{ name: "主目录", path: listing.home, hidden: false }].concat(crumbs.slice(homeIndex + 1));
    }
    function readOf(source) { try { return source && typeof source.getSnapshot === "function" ? source.getSnapshot() : null; } catch (error) { return null; } }
    // ObservableSnapshot（getSnapshot/subscribe）→ React state；读失败一律降级为 null。
    function useSnapshot(source) {
      var state = React.useState(function () { return readOf(source); });
      React.useEffect(function () {
        if (!source) { state[1](null); return undefined; }
        var sync = function () { state[1](readOf(source)); }; sync();
        var stop = typeof source.subscribe === "function" ? source.subscribe(sync) : null;
        return function () { if (typeof stop === "function") stop(); };
      }, [source]);
      return state[0];
    }
    // 30s 一次的本地时钟：让相对时间与「可能卡住」自己走；组件卸载时清定时器。
    function useNow(intervalMs) {
      var state = React.useState(function () { return Date.now(); });
      var setNow = state[1];
      React.useEffect(function () {
        var timer = setInterval(function () { setNow(Date.now()); }, intervalMs);
        return function () { clearInterval(timer); };
      }, [intervalMs, setNow]);
      return state[0];
    }
    // ── 面板宽度跟随原生左栏 ────────────────────────────────────────────────────
    // 宿主 AppFrame 把「左栏当前宽度」写成内联 gridTemplateColumns 的第一段
    // （$DSH/dsh-client-ui-layout/lib/client.js 的 AppFrame style），拖分隔条时 React 每次渲染
    // 都会重写这条内联样式 —— 所以盯 frame 的 style 属性就能实时跟随，不用轮询。
    // frame 的拿法：面板根节点 closest('[data-shell-overlay]').parentElement（overlay 层铺满 frame），
    // 拿不到再退回 document.querySelector('[data-shell-overlay]').parentElement。
    // 全程 typeof 判空 + try/catch：测试 shim / 老宿主 / 非浏览器环境任何一步失败都静默回退 280，不抛错。
    var FALLBACK_SIDEBAR = 280;
    // "320px" → 320；空串 / 非数字 / 负数 → null。只用 Number，不依赖宿主注入 parseFloat。
    function pxOf(value) {
      var text = String(value === undefined || value === null ? "" : value).trim().replace(/px$/i, "");
      if (!text) return null;
      var px = Number(text);
      return isFinite(px) && px >= 0 ? px : null;
    }
    function frameOf(node) {
      try {
        if (node && typeof node.closest === "function") {
          var layer = node.closest("[data-shell-overlay]");
          if (layer && layer.parentElement) return layer.parentElement;
        }
      } catch (error) { /* 老宿主 / shim 没有 closest：走下面的兜底 */ }
      try {
        if (typeof document !== "undefined" && document && typeof document.querySelector === "function") {
          var found = document.querySelector("[data-shell-overlay]");
          if (found && found.parentElement) return found.parentElement;
        }
      } catch (error) { /* 拿不到就当没有 frame */ }
      return null;
    }
    function computedOf(node) {
      try {
        if (typeof window !== "undefined" && window && typeof window.getComputedStyle === "function") return window.getComputedStyle(node);
      } catch (error) { /* 落下一个来源 */ }
      try {
        if (typeof getComputedStyle === "function") return getComputedStyle(node);
      } catch (error) { /* 没有就算了 */ }
      return null;
    }
    // 宽度优先级：gridTemplateColumns 第一段 → frame 里实测 sidebarCol → null（调用方回退 280）。
    // 不把带构建 hash 的 class 当唯一依据：先读 grid，读不到才量列宽，且用 [class*=] 而不是精确类名。
    function sidebarWidthOf(frame) {
      if (!frame) return null;
      var view = computedOf(frame);
      if (view) {
        var px = pxOf(String(view.gridTemplateColumns || "").split(" ")[0]);
        if (px !== null) return px;
      }
      try {
        var column = typeof frame.querySelector === "function" ? frame.querySelector('[class*="sidebarCol"]') : null;
        if (column && typeof column.getBoundingClientRect === "function") {
          var rect = column.getBoundingClientRect();
          var measured = rect && typeof rect.width === "number" ? rect.width : null;
          if (measured !== null && isFinite(measured) && measured >= 0) return measured;
        }
      } catch (error) { /* 量不到就用默认宽度 */ }
      return null;
    }
    // 收起判定：frame 带 data-sidebar-collapsed（rail / 窄屏 / 手动关）或量出来宽度 <= 0。
    function sidebarStateOf(frame) {
      if (!frame) return { width: FALLBACK_SIDEBAR, collapsed: false };
      var collapsed = false;
      try { collapsed = typeof frame.hasAttribute === "function" && frame.hasAttribute("data-sidebar-collapsed"); } catch (error) { collapsed = false; }
      var width = sidebarWidthOf(frame);
      if (width === null) return { width: FALLBACK_SIDEBAR, collapsed: collapsed };
      if (width <= 0) return { width: 0, collapsed: true };
      return { width: width, collapsed: collapsed };
    }
    function mutationCtor() {
      try { if (typeof MutationObserver === "function") return MutationObserver; } catch (error) { /* 落到 window 上找 */ }
      try { if (typeof window !== "undefined" && window && typeof window.MutationObserver === "function") return window.MutationObserver; } catch (error) { /* 没有就算了 */ }
      return null;
    }
    // 追踪原生左栏宽度：MutationObserver 盯 frame 的 style / data-sidebar-collapsed（拖拽必经之路）
    // + window.resize + 挂载后同步一次。返回值里的 width 直接写进根节点的 --dt-width。
    function useSidebarWidth(rootRef) {
      var pair = React.useState(function () { return { width: FALLBACK_SIDEBAR, collapsed: false }; });
      var state = pair[0], setState = pair[1];
      // 宿主是 React 18/19：useLayoutEffect 能让首帧就对齐；测试 shim / 老 React 没有就用 useEffect。
      var layoutEffect = typeof React.useLayoutEffect === "function" ? React.useLayoutEffect : React.useEffect;
      layoutEffect(function () {
        var live = true, frame = null, observer = null;
        function apply(node) {
          if (!live) return;
          var target = node || frame || frameOf(rootRef && rootRef.current);
          frame = target;
          var next = sidebarStateOf(target);
          setState(function (previous) {
            return previous.width === next.width && previous.collapsed === next.collapsed ? previous : next;
          });
        }
        function watch(node) {
          var Ctor = mutationCtor();
          if (observer || !node || !Ctor) return;
          try {
            observer = new Ctor(function () { apply(node); });
            observer.observe(node, { attributes: true, attributeFilter: ["style", "data-sidebar-collapsed"] });
          } catch (error) { observer = null; }
        }
        apply(null);
        watch(frame);
        // 拖的是高度很低的窗口边 / 换显示器：resize 时重新找一次 frame 并重量。
        function onResize() {
          var node = frameOf(rootRef && rootRef.current);
          if (node && node !== frame) { frame = node; watch(node); }
          apply(node);
        }
        try { if (typeof window !== "undefined" && window && typeof window.addEventListener === "function") window.addEventListener("resize", onResize); } catch (error) { /* 没有 resize 也能靠 style 观察 */ }
        return function () {
          live = false;
          try { if (observer) observer.disconnect(); } catch (error) { /* 已经断开 */ }
          try { if (typeof window !== "undefined" && window && typeof window.removeEventListener === "function") window.removeEventListener("resize", onResize); } catch (error) { /* 没有监听 */ }
        };
      }, []);
      return state;
    }
    // 新建项目工作区时声明过的目录：还没有 team/ 也先归为项目，避免刚建的项目掉进原始工作区。
    var DECLARED_KEY = "dsh-yaoking-company-office:projects";
    // 旧版包名（dsh-devteam）留下的同名登记：读到就搬到新键，升级后原有项目不会掉回「原始工作区」。
    var DECLARED_LEGACY_KEY = "dsh-devteam:projects";
    function declaredPaths() {
      try {
        var raw = window.localStorage.getItem(DECLARED_KEY) || window.localStorage.getItem(DECLARED_LEGACY_KEY);
        var arr = raw ? JSON.parse(raw) : [];
        var list = Array.isArray(arr) ? arr.filter(function (item) { return typeof item === "string" && item; }) : [];
        if (list.length && !window.localStorage.getItem(DECLARED_KEY)) window.localStorage.setItem(DECLARED_KEY, JSON.stringify(list));
        return list;
      } catch (error) { return []; }
    }
    function markDeclared(path) {
      try {
        var arr = declaredPaths();
        if (arr.indexOf(path) < 0) { arr.push(path); window.localStorage.setItem(DECLARED_KEY, JSON.stringify(arr)); }
        return true;
      } catch (error) { return false; }
    }
    // 「这个会话我最近一次点进去看的时间」：localStorage["dt-viewed-at"] = { [sessionId]: ms }。
    // 只用来把「可能卡住?」的计时起点从 updatedAt 推到 max(updatedAt, viewedAt)：看过一眼就立刻不再显示，
    // 再过 STUCK_MS 没有新动静才重新提醒（不是永久静音，也不是已读标记）。
    // 写入时机：① 点会话行（openSession 成功）；② 该会话成为当前活动会话（retainedBy.mainView，
    // 宿主自己就是这么判断 current 的，见 dsh-client-ui-workspace/lib/client.js:89）。
    // 归零时机：归档成功、会话从列表消失（prune）。全程 try/catch：localStorage 不可用就当没记过。
    var VIEWED_KEY = "dt-viewed-at";
    // 上限：记满 200 个会话就按时间清掉最旧的一半，避免 localStorage 无限长（正常用几年也到不了）。
    var VIEWED_MAX = 200;
    function viewedMap() {
      try {
        var raw = window.localStorage.getItem(VIEWED_KEY);
        var value = raw ? JSON.parse(raw) : null;
        return value && typeof value === "object" && !Array.isArray(value) ? value : {};
      } catch (error) { return {}; }
    }
    function viewedAtOf(sessionId) {
      if (!sessionId) return 0;
      var at = viewedMap()[String(sessionId)];
      return typeof at === "number" && isFinite(at) ? at : 0;
    }
    function markViewed(sessionId) {
      if (!sessionId) return false;
      try {
        var map = viewedMap(), keys = Object.keys(map);
        map[String(sessionId)] = Date.now();
        if (keys.length >= VIEWED_MAX) {
          keys.sort(function (left, right) { return (Number(map[left]) || 0) - (Number(map[right]) || 0); });
          for (var i = 0; i < keys.length - VIEWED_MAX / 2; i++) if (keys[i] !== String(sessionId)) delete map[keys[i]];
        }
        window.localStorage.setItem(VIEWED_KEY, JSON.stringify(map));
        return true;
      } catch (error) { return false; }
    }
    function forgetViewed(sessionId) {
      if (!sessionId) return false;
      try {
        var map = viewedMap();
        if (!(String(sessionId) in map)) return true;
        delete map[String(sessionId)];
        window.localStorage.setItem(VIEWED_KEY, JSON.stringify(map));
        return true;
      } catch (error) { return false; }
    }
    // 只留还在列表里的会话：归档/删掉的会话顺手清掉，不留垃圾键。
    function pruneViewed(keepIds) {
      try {
        var map = viewedMap(), keys = Object.keys(map), live = keepIds && typeof keepIds === "object" ? keepIds : null, changed = false;
        if (!live) return false;
        for (var i = 0; i < keys.length; i++) if (!live[keys[i]]) { delete map[keys[i]]; changed = true; }
        if (changed) window.localStorage.setItem(VIEWED_KEY, JSON.stringify(map));
        return changed;
      } catch (error) { return false; }
    }
    // team/ 探测：先 remote.workspaceFiles.list(sessionId, ".")，再回退 remote.directoryPicker.list
    // （见 probeOf）。true=有 team/；false=确认没有；null=拿不到 → 结构兜底。
    function useTeamDirs(listDir, paths) {
      var key = paths.join("\n"), state = React.useState({ map: {}, ready: false }), set = state[1], latest = React.useRef(listDir);
      latest.current = listDir;
      React.useEffect(function () {
        var live = true, todo = key ? key.split("\n") : [];
        set({ map: {}, ready: !todo.length });
        if (!todo.length) return undefined;
        Promise.all(todo.map(function (path) { return Promise.resolve().then(function () { return latest.current(path); }).then(null, function () { return null; }); })).then(function (values) {
          if (!live) return;
          var map = {};
          for (var i = 0; i < todo.length; i++) map[todo[i]] = values[i];
          set({ map: map, ready: true });
        }, function () { if (live) set({ map: {}, ready: true }); });
        return function () { live = false; };
      }, [key]);
      return state[0];
    }
    // 交互反馈统一走面板顶部的一次性提示条（不随滚动），6s 自动消失；任何失败都不抛。
    function useHint() {
      var state = React.useState(null), set = state[1], timer = React.useRef(null);
      var stop = function () { if (timer.current !== null) clearTimeout(timer.current); timer.current = null; };
      var show = React.useCallback(function (text, bad) {
        stop(); var value = String(text || "");
        // 调用点历史上一直传字符串 "bad"；只认 true 会让所有错误提示都渲染成成功样式（绿色）。
        set(value ? { text: value, bad: bad === true || bad === "bad" } : null);
        if (value) timer.current = setTimeout(function () { timer.current = null; set(null); }, 6000);
      }, []);
      React.useEffect(function () { return stop; }, []);
      return [state[0], show];
    }
    // 目录存在性：true=确认不存在；false=存在；null=拿不到（不猜，只给移除入口）。
    function useMissing(probe, items, leadOf) {
      var key = items.map(function (w) { return w.workspaceId + ":" + (leadOf[pathOf(w)] || ""); }).join("\n"), state = React.useState({}), set = state[1];
      React.useEffect(function () {
        var live = true, todo = items.filter(function (w) { return leadOf[pathOf(w)]; });
        Promise.all(todo.map(function (w) {
          var path = pathOf(w);
          return Promise.resolve().then(function () { return probe(leadOf[path]); }).then(function (missing) { return [path, missing]; }, function () { return [path, null]; });
        })).then(function (pairs) {
          if (!live) return;
          var map = {}; for (var i = 0; i < pairs.length; i++) map[pairs[i][0]] = pairs[i][1]; set(map);
        });
        return function () { live = false; };
      }, [key]);
      return state[0];
    }
    function isUnder(child, parent) {
      if (typeof child !== "string" || typeof parent !== "string" || child === parent) return false;
      return child.indexOf(parent.charAt(parent.length - 1) === "/" ? parent : parent + "/") === 0;
    }
    function pathOf(workspace) { return workspace && typeof workspace.path === "string" ? workspace.path : ""; }
    // 会话快照的 projectionValues.agentPreset（与宿主 dsh-client-ui-workspace:1453 同源）。
    // 取不到就返回空串：不猜预设，也不显示徽章/警告。
    function presetOf(session) {
      var values = session && session.projectionValues;
      var id = values && values.agentPreset;
      return typeof id === "string" ? id : "";
    }
    // 「员工」预设有两个 id：新的 staff，历史的 / 宿主还没注册 staff 时的 standard。
    function isStaffPreset(preset) {
      return preset === PRESET_STAFF || preset === PRESET_STAFF_LEGACY;
    }
    // 一行里的待答提问。读不出来时 giveup 到「没有待答」，调用方照旧显示「可能卡住?」。
    // 数据来源两档，都只读一次快照、不挂 subscribe：
    //   ① 会话正被打开（mainView 持有）时，binding.session.projections.faceOf("userQuestions")
    //      的实时快照最准（同 $DSH/.../dsh-client-ui-goal/lib/client.js:590 的读法）；
    //   ② 没打开的会话拿不到 binding，退到列表行自带的 projectionValues.userQuestions
    //      （SessionProjectionMap 里有这个键，宿主会带缓存值下发）。
    // 只有 state === "open" 才算「在等回答」：open = 前台还在等（阻塞中，人不去接就真卡着）；
    // continued = 员工预设 timed/90s 已经超时、agent 自己往下跑了，答复是可选的，不该常亮橙色。
    // continued 不丢，只降级成弱提示：那一行同时命中「可能卡住?」时，title 里补一句（见 CONTINUED_HINT），
    // 不命中卡住就什么都不加（不做第二个常亮徽章）。
    // 任何一步抛错/字段缺失都静默降级：面板绝不因为投影读不到白屏或抛错。
    // questionsOfSnapshot：形状认不出来（没读到）返回 null；读到了就返回 { count, question, continued }，
    // count 只数 open（=0 表示「确实没有人还在等」），continued 单独计数只用于那句弱提示。
    function questionsOfSnapshot(snapshot) {
      if (!snapshot || typeof snapshot !== "object") return null;
      var active = Array.isArray(snapshot.active) ? snapshot.active
        : snapshot.questions && Array.isArray(snapshot.questions.active) ? snapshot.questions.active : null;
      if (!active) return null;
      var count = 0, continued = 0, first = null;
      for (var i = 0; i < active.length; i++) {
        var row = active[i];
        if (!row) continue;
        if (row.state === "continued") { continued++; continue; }
        if (row.state !== "open") continue;
        count++;
        if (!first) first = (row.questions && row.questions[0]) || null;
      }
      return { count: count, question: first, continued: continued };
    }
    // 返回 { read, pending, continued }：read=false = 两档来源都没读到（投影未注册 / 抛错 / 字段缺失）；
    // pending 只来自 open 的提问；continued 是「问过但已超时继续」的条数（两个来源取较大值，弱提示用）。
    function pendingQuestionsOf(sessions, session) {
      var id = session && session.id;
      var read = false, pending = null, continued = 0;
      if (id) {
        try {
          var binding = sessions && typeof sessions.binding === "function" ? sessions.binding(id) : null;
          var projections = binding && binding.session && binding.session.projections;
          var face = projections && typeof projections.faceOf === "function" ? projections.faceOf("userQuestions") : null;
          var snapshot = face && typeof face.getSnapshot === "function" ? face.getSnapshot() : null;
          var found = questionsOfSnapshot(snapshot);
          if (found) {
            read = true;
            if (found.count) pending = found;
            if (found.continued > continued) continued = found.continued;
          }
        } catch (error) { /* 没读到 */ }
      }
      try {
        var listed = questionsOfSnapshot(session && session.projectionValues && session.projectionValues.userQuestions);
        if (listed) {
          read = true;
          if (listed.count && !pending) pending = listed;
          if (listed.continued > continued) continued = listed.continued;
        }
      } catch (error) { /* 没读到 */ }
      return { read: read, pending: pending, continued: continued };
    }
    // title 文案：header 优先，否则 question 前 60 字；多问一句「点进去选一个就继续」。
    var WAIT_TEXT_MAX = 60;
    function waitTipOf(pending, session) {
      var question = pending && pending.question;
      var header = question && typeof question.header === "string" ? question.header.trim() : "";
      var text = header || (question && typeof question.question === "string" ? question.question.trim() : "");
      if (text.length > WAIT_TEXT_MAX) text = text.slice(0, WAIT_TEXT_MAX) + "…";
      var head = text ? "等你回答：" + text + "。" : "等你回答。";
      if (pending && pending.count > 1) head += "（共 " + pending.count + " 个提问）";
      var name = session && (session.displayTitle || session.id);
      return head + "点进去选一个就继续。" + (name ? " · " + name : "");
    }
    // 分组规则沿用旧面板（不改判定）：team/ 存在 = 项目；项目路径之下的工作区 = 员工；
    // 其余 = 原始工作区；项目自身工作区的会话 = 项目经理。
    function buildModel(wsSnap, sesSnap, dirs) {
      var items = (wsSnap && wsSnap.items) || [], byId = (sesSnap && sesSnap.byId) || {}, archived = {};
      var archivedIds = (wsSnap && wsSnap.archivedSessionIds) || [];
      for (var a = 0; a < archivedIds.length; a++) archived[archivedIds[a]] = true;
      // 最近活动时间：与宿主原生侧栏一致——updatedAt 优先，缺失/非数字退回 createdAt，都没有当 0。
      function recencyOf(session) {
        if (session && typeof session.updatedAt === "number" && isFinite(session.updatedAt)) return session.updatedAt;
        if (session && typeof session.createdAt === "number" && isFinite(session.createdAt)) return session.createdAt;
        return 0;
      }
      // 排序只影响展示顺序（对齐宿主 orderByRecency，dsh-client-ui-workspace/lib/client.js:886-900）：
      // updatedAt 倒序，新的在前；时间完全相等时按 workspace 里的会话 id 升序做稳定 tie-break，
      // 保证同一份快照每次渲染顺序不变。过滤规则、runningOf 计数、leadOf 判定都不在这里改。
      function sessionsOf(workspace) {
        var picked = [], out = [], ids = (workspace && workspace.sessionIds) || [];
        for (var i = 0; i < ids.length; i++) {
          var summary = byId[ids[i]];
          if (summary && !summary.blank && !archived[ids[i]]) picked.push({ id: String(ids[i]), summary: summary });
        }
        picked.sort(function (left, right) {
          var gap = recencyOf(right.summary) - recencyOf(left.summary);
          if (gap) return gap;
          if (left.id === right.id) return 0;
          return left.id < right.id ? -1 : 1;
        });
        for (var j = 0; j < picked.length; j++) out.push(picked[j].summary);
        return out;
      }
      function runningOf(list) { var count = 0; for (var i = 0; i < list.length; i++) if (list[i].running) count++; return count; }
      var hasChild = {};
      for (var i = 0; i < items.length; i++) for (var j = 0; j < items.length; j++) if (isUnder(pathOf(items[j]), pathOf(items[i]))) { hasChild[pathOf(items[i])] = true; break; }
      var declared = declaredPaths();
      var projects = [], projectIds = {};
      for (var i = 0; i < items.length; i++) {
        var path = pathOf(items[i]), known = dirs.map[path];
        if (declared.indexOf(path) < 0 && known !== true && (known === false || hasChild[path] !== true)) continue;
        projects.push({ workspace: items[i], employees: [], sessions: sessionsOf(items[i]) });
        projectIds[items[i].workspaceId] = true;
      }
      var raw = [];
      for (var i = 0; i < items.length; i++) {
        var workspace = items[i], owner = null;
        if (projectIds[workspace.workspaceId]) continue;
        for (var p = 0; p < projects.length; p++) {
          if (!isUnder(pathOf(workspace), pathOf(projects[p].workspace))) continue;
          if (!owner || pathOf(projects[p].workspace).length > pathOf(owner.workspace).length) owner = projects[p];
        }
        if (owner) owner.employees.push(workspace); else raw.push(workspace);
      }
      projects.sort(function (left, right) {
        return String(left.workspace.title || "").localeCompare(String(right.workspace.title || ""));
      });
      return { projects: projects, raw: raw, sessionsOf: sessionsOf, runningOf: runningOf };
    }

    // ── 自绘选目录对话框（browse 后端）─────────────────────────────────────────
    // native 后端的 pickDirectory() 在 macOS 上弹 NSOpenPanel（脚本宿主里侧栏会被沙箱/TCC 判灰），
    // 所以 macOS 固定 browse 后端，这里用 ui.listDirectory / ui.createDirectory 自己画一个
    // 应用内目录浏览器：面包屑可编辑 + 子目录列表 + 新建文件夹。样式沿用 dt- 前缀与 DSH token。
    function PickerDialog(props) {
      var ui = props.ui, initial = props.initial || null;
      var listingPair = React.useState(initial), listing = listingPair[0], setListing = listingPair[1];
      var errorPair = React.useState(props.initialError || ""), error = errorPair[0], setError = errorPair[1];
      var busyPair = React.useState(!initial && !props.initialError), busy = busyPair[0], setBusy = busyPair[1];
      var editPair = React.useState(!initial && !!props.initialError), editing = editPair[0], setEditing = editPair[1];
      var draftPair = React.useState(initial && initial.path ? initial.path : ""), draft = draftPair[0], setDraft = draftPair[1];
      var createPair = React.useState(false), creating = createPair[0], setCreating = createPair[1];
      var namePair = React.useState(""), folderName = namePair[0], setFolderName = namePair[1];
      var createErrPair = React.useState(""), createError = createErrPair[0], setCreateError = createErrPair[1];
      var createBusyPair = React.useState(false), createBusy = createBusyPair[0], setCreateBusy = createBusyPair[1];
      var canCreate = !!(ui && typeof ui.createDirectory === "function");

      // 读一层目录；path 省略 = 宿主主目录。所有失败都落在对话框内（error / createError），不抛。
      function load(path) {
        if (!ui || typeof ui.listDirectory !== "function") { setBusy(false); setError("宿主没有提供目录浏览接口"); return Promise.resolve(); }
        setBusy(true); setError("");
        return Promise.resolve().then(function () { return ui.listDirectory(path); }).then(function (next) {
          if (next && typeof next.path === "string") { setListing(next); setDraft(next.path); }
          setBusy(false); setEditing(false);
        }, function (reason) {
          setBusy(false); setError(messageOf(reason));
        });
      }
      React.useEffect(function () {
        if (!listing && !props.initialError) load();
      }, []);
      function go(path) { if (!creating) load(path); }
      function startEdit() { setDraft(listing && listing.path ? listing.path : ""); setError(""); setEditing(true); }
      function submitPath() {
        var text = String(draft || "").trim();
        if (!text) { setError("请输入绝对路径"); return; }
        load(text);
      }
      function openCreate() { setCreating(true); setCreateError(""); setFolderName(""); }
      function closeCreate() { setCreating(false); setCreateError(""); setFolderName(""); }
      // 成功：刷新列表并进到新目录（它就是新的「当前目录」，即被选中的目录）。
      function submitCreate() {
        var name = String(folderName || "").trim();
        if (!name) { setCreateError("文件夹名不能为空"); return; }
        if (!listing) { setCreateError("当前目录还没读出来"); return; }
        if (!canCreate) { setCreating(false); return; }
        setCreateBusy(true); setCreateError("");
        Promise.resolve().then(function () { return ui.createDirectory(listing.path, name); }).then(function (created) {
          setCreateBusy(false); setCreating(false); setFolderName("");
          return load(typeof created === "string" && created ? created : listing.path);
        }, function (reason) {
          setCreateBusy(false); setCreateError(messageOf(reason));
        });
      }
      function confirm() { if (listing && !busy) props.onConfirm(listing.path); }
      function onKeyDown(event) {
        var key = event.key;
        if (key === "Escape") { event.preventDefault(); event.stopPropagation(); props.onCancel(); return; }
        if (key !== "Enter") return;
        var tag = event.target && event.target.tagName;
        // 按钮的 Enter 由浏览器转成 click（取消/新建/面包屑/目录行各自处理），这里不重复响应。
        if (tag === "BUTTON") return;
        if (tag === "INPUT" || tag === "TEXTAREA") {
          event.preventDefault(); event.stopPropagation();
          if (editing) submitPath(); else if (creating) submitCreate(); else confirm();
          return;
        }
        event.preventDefault();
        if (editing) submitPath(); else if (creating) submitCreate(); else confirm();
      }

      var crumbs = displayCrumbsOf(listing), crumbNodes = [];
      for (var c = 0; c < crumbs.length; c++) {
        if (c) crumbNodes.push(h("span", { className: "dt-pick-sep", key: "sep:" + c }, "/"));
        crumbNodes.push(h("button", {
          type: "button", key: "crumb:" + c, className: "dt-pick-crumb", title: crumbs[c].path,
          onClick: (function (path) { return function () { go(path); }; })(crumbs[c].path)
        }, crumbs[c].name));
      }

      var body = [];
      if (error) body.push(h("div", { className: "dt-pick-err", key: "err", role: "alert" }, error));
      if (busy && !listing) body.push(h("div", { className: "dt-pick-note", key: "loading" }, "正在读取目录…"));
      if (listing) {
        if (listing.truncated) body.push(h("div", { className: "dt-pick-note", key: "trunc" }, "目录过多，只显示前 " + ((listing.entries || []).length) + " 个"));
        var entries = listing.entries || [];
        if (!entries.length) body.push(h("div", { className: "dt-pick-note", key: "empty" }, "（没有子目录）"));
        for (var e = 0; e < entries.length; e++) {
          body.push(h("button", {
            type: "button", key: "entry:" + entries[e].path,
            className: "dt-pick-row" + (entries[e].hidden ? " dt-pick-row-hidden" : ""),
            title: entries[e].path, onClick: (function (path) { return function () { go(path); }; })(entries[e].path)
          },
            h("span", { className: "dt-pick-rowico" }, icon("folder", 13)),
            h("span", { className: "dt-pick-rowname" }, entries[e].name),
            entries[e].hidden ? h("span", { className: "dt-pick-hint" }, "隐藏") : null));
        }
      }
      if (createError) body.push(h("div", { className: "dt-pick-err", key: "cerr", role: "alert" }, createError));

      var footActions = [];
      if (creating) {
        footActions.push(h("span", { className: "dt-pick-create", key: "create" },
          h("input", {
            className: "dt-pick-input", value: folderName, autoFocus: true, placeholder: "新文件夹名",
            "aria-label": "新文件夹名", onChange: function (event) { setFolderName(event.target.value); }
          }),
          h("button", { type: "button", className: "dt-pick-btn", disabled: createBusy, onClick: submitCreate }, createBusy ? "创建中…" : "创建"),
          h("button", { type: "button", className: "dt-pick-btn", onClick: closeCreate }, "取消新建")));
      } else if (canCreate) {
        footActions.push(h("button", { type: "button", className: "dt-pick-btn", key: "newdir", title: "在「" + (listing ? listing.path : "") + "」下新建文件夹", onClick: openCreate }, "新建文件夹"));
      }
      footActions.push(h("span", { className: "dt-pick-gap", key: "gap" }));
      footActions.push(h("button", { type: "button", className: "dt-pick-btn", key: "cancel", onClick: props.onCancel }, "取消"));
      footActions.push(h("button", {
        type: "button", className: "dt-pick-btn dt-pick-primary", key: "ok", autoFocus: true,
        disabled: !listing || busy, onClick: confirm
      }, "选这个目录"));

      return h("div", {
        className: "dt-pick-mask",
        onClick: function (event) { if (event.target === event.currentTarget) props.onCancel(); }
      },
        h("div", { className: "dt-pick", role: "dialog", "aria-modal": "true", "aria-label": "选择项目目录", onKeyDown: onKeyDown },
          h("div", { className: "dt-pick-head" },
            h("h2", { className: "dt-pick-title" }, "选择项目目录"),
            h("div", { className: "dt-pick-crumbs" },
              crumbNodes,
              h("button", { type: "button", className: "dt-pick-edit", title: "编辑路径", "aria-label": "编辑路径", onClick: startEdit }, "编辑路径")),
            h("div", { className: "dt-pick-pathrow" },
              editing
                ? h("input", {
                  className: "dt-pick-input", value: draft, autoFocus: true, "aria-label": "目录绝对路径",
                  placeholder: "输入绝对路径，回车跳转", onChange: function (event) { setDraft(event.target.value); }
                })
                : h("button", {
                  type: "button", className: "dt-pick-path dt-pick-pathbtn",
                  title: listing ? "点击编辑路径：" + listing.path : "点击编辑路径",
                  onClick: startEdit
                }, listing ? listing.path : "（还没有读到目录）"),
              editing ? h("button", { type: "button", className: "dt-pick-btn", onClick: submitPath }, "跳转") : null,
              editing ? h("button", { type: "button", className: "dt-pick-btn", onClick: function () { setEditing(false); setError(""); } }, "收起") : null)),
          h("div", { className: "dt-pick-body" }, body),
          h("div", { className: "dt-pick-foot" }, footActions)));
    }

    function Sidebar(props) {
      var wsSnap = useSnapshot(props.workspaces), sesSnap = useSnapshot(props.sessions);
      var goneState = React.useState({}), gone = goneState[0];
      var items = ((wsSnap && wsSnap.items) || []).filter(function (w) { return !gone[w.workspaceId]; }), paths = [], leadOf = {};
      for (var i = 0; i < items.length; i++) {
        var ownPath = pathOf(items[i]);
        if (!ownPath) continue;
        paths.push(ownPath); leadOf[ownPath] = (items[i].sessionIds || [])[0] || "";
      }
      var dirs = useTeamDirs(function (path) { return props.listDir(path, leadOf[path]); }, paths);
      var missing = useMissing(props.probeMissing, items, leadOf);
      var model = null;
      try { model = buildModel(wsSnap && Object.assign({}, wsSnap, { items: items }), sesSnap, dirs); } catch (error) { model = null; }
      var runPaths = [];
      if (model) for (var p = 0; p < model.projects.length; p++) { var projectPath = pathOf(model.projects[p].workspace); if (projectPath) runPaths.push(projectPath); }
      // team/runs 计数复用同一个探测 hook（只取 map；ready 由项目卡片忽略）。
      var runs = useTeamDirs(function (path) { return props.listRuns(path, leadOf[path]); }, runPaths).map;
      var openState = React.useState({}), open = openState[0];
      var onlyState = React.useState(false), onlyRunning = onlyState[0];
      var hintState = useHint(), hint = hintState[0], show = hintState[1];
      var now = useNow(NOW_TICK_MS);
      // 当前活动会话（宿主自己的判定：列表行上 retainedBy.mainView 的持有者，见
      // dsh-client-ui-workspace/lib/client.js:89）。读不到就是 null：只认「点会话行」那一条写入时机，
      // 不去猜 uiWorkspace 的私有字段。它一变就记一次 viewedAt —— 从原生侧栏点进来、
      // 刷新后恢复同一个会话、面板自己 openSession，都会走到这里。
      var currentId = null;
      try {
        var rows = (sesSnap && sesSnap.byId) || {};
        for (var key in rows) {
          var retained = rows[key] && rows[key].retainedBy;
          if (retained && typeof retained === "object" && (retained.mainView || 0) > 0) { currentId = String(key); break; }
        }
      } catch (error) { currentId = null; }
      var viewedRef = React.useRef(null);
      React.useEffect(function () {
        if (!currentId || viewedRef.current === currentId) return;
        viewedRef.current = currentId;
        markViewed(currentId);
      }, [currentId]);
      // 已归档/已消失的会话顺手清掉 viewedAt（只在列表真读完时做，避免加载中把记录清空）。
      var sessionKey = "";
      try { sessionKey = sesSnap && sesSnap.phase === "ready" && Array.isArray(sesSnap.ids) && sesSnap.ids.length ? sesSnap.ids.join("\n") : ""; } catch (error) { sessionKey = ""; }
      React.useEffect(function () {
        if (!sessionKey) return;
        var live = {}, ids = sessionKey.split("\n");
        for (var i = 0; i < ids.length; i++) live[ids[i]] = true;
        pruneViewed(live);
      }, [sessionKey]);
      var isOpen = function (key, fallback) { return open[key] === undefined ? fallback : open[key]; };
      var toggle = function (key, fallback) {
        openState[1](function (previous) { var next = Object.assign({}, previous), current = previous[key]; next[key] = !(current === undefined ? fallback : current); return next; });
      };
      function staleOf(workspace) { return missing[pathOf(workspace)] === true; }
      // 归档：返回 Promise<boolean>，供「重建为项目经理会话」在成功后改写提示条；旧调用点忽略返回值即可。
      function archiveSession(sessionId, successText) {
        var controller = serviceOf(props.ctx, "workspaces");
        if (!controller || typeof controller.archiveSession !== "function") { show("宿主没有提供归档接口", "bad"); return Promise.resolve(false); }
        var pending;
        try { pending = controller.archiveSession(sessionId); } catch (error) { show("归档失败：" + messageOf(error), "bad"); return Promise.resolve(false); }
        // 门面 archiveSession(sessionId, options) 成功 resolve undefined、失败 throw；兼容返回 RemoteResult 的宿主。
        return Promise.resolve(pending).then(function (result) {
          if (result && result.ok === false) throw new Error((result.error && result.error.message) || "归档失败");
          forgetViewed(sessionId);
          show(successText || "已归档。会话从列表消失，可在原生侧栏「更多 → 已归档」找回。");
          return true;
        }).then(null, function (error) { show("归档失败：" + messageOf(error), "bad"); return false; });
      }
      function removeWorkspace(workspace) {
        var controller = serviceOf(props.ctx, "workspaces");
        if (!controller || typeof controller.delete !== "function") { show("宿主没有提供移除工作区登记的接口", "bad"); return; }
        var pending; try { pending = controller.delete(workspace.workspaceId); } catch (error) { show("移除登记失败：" + messageOf(error), "bad"); return; }
        Promise.resolve(pending).then(function (result) {
          if (result && result.ok === false) throw new Error((result.error && result.error.message) || "移除登记失败");
          goneState[1](function (previous) { var next = Object.assign({}, previous); next[workspace.workspaceId] = true; return next; });
          show("已移除登记：" + (workspace.title || pathOf(workspace)) + "（磁盘目录未删除）");
        }).then(null, function (error) { show("移除登记失败：" + messageOf(error), "bad"); });
      }
      function removeButton(workspace, key) {
        return h("button", { type: "button", className: "dt-rm", key: key, title: "移除登记：只从面板和注册表移除，不删除磁盘目录", onClick: function (event) { event.stopPropagation(); removeWorkspace(workspace); }, onMouseDown: function (event) { event.stopPropagation(); event.preventDefault(); } }, "移除登记");
      }
      function openSession(sessionId) {
        try {
          // 点进去就算「看过了」：立刻写下 viewedAt，本行马上不再显示「可能卡住?」，
          // 5 分钟内没有新动静才会再提醒（不是永久静音）。
          if (props.openSession(sessionId)) { markViewed(sessionId); return true; }
          show("宿主没有提供打开会话的接口。", "bad");
        } catch (error) { show("打开会话失败：" + messageOf(error), "bad"); }
        return false;
      }
      function newSession(workspace, preset) {
        try {
          var outcome = props.startSession(workspace.workspaceId, preset);
          if (outcome && typeof outcome.then === "function") outcome.then(null, function (error) { show("新建会话失败：" + messageOf(error), "bad"); });
          else if (outcome === false) show("宿主没有提供新建会话的接口，请在原生侧栏点「新会话」。", "bad");
        } catch (error) { show("新建会话失败：" + messageOf(error), "bad"); }
      }
      // browse 目录对话框：pick = null 关闭；非 null = { listing, error }。
      var pickState = React.useState(null), pick = pickState[0], setPick = pickState[1];
      var pickResolve = React.useRef(null);
      var pickerUi = serviceOf(props.ctx, "uiWorkspace");
      function openPicker(listing, initialError) {
        return new Promise(function (resolve) { pickResolve.current = resolve; setPick({ listing: listing || null, error: initialError || "" }); });
      }
      function closePicker(path) {
        setPick(null);
        var done = pickResolve.current; pickResolve.current = null;
        if (typeof done === "function") done(path || null);
      }
      // native 后端：原来的 pickDirectory() → remote.directoryPicker.pick()。只在 browse 不可用时走。
      function pickViaNative() {
        return Promise.resolve().then(function () {
          if (pickerUi && typeof pickerUi.pickDirectory === "function") return pickerUi.pickDirectory();
          var picker = serviceOf(props.ctx, "remote.directoryPicker");
          if (picker && typeof picker.pick === "function") return Promise.resolve(picker.pick()).then(function (result) {
            if (!result || result.ok !== true) throw new Error((result && result.error && result.error.message) || "目录选择失败");
            return result.value;
          });
          throw new Error("宿主没有提供目录选择接口");
        });
      }
      // browse 后端：先读宿主主目录，确认 listDirectory 真的可用；可用就开插件自绘对话框。
      function pickViaBrowse() {
        return Promise.resolve().then(function () { return pickerUi.listDirectory(); }).then(function (listing) {
          return openPicker(listing, "");
        }, function (error) {
          if (isBrowseUnavailable(error)) return pickViaNative();
          return openPicker(null, messageOf(error));
        });
      }
      // 新建项目工作区：只换「怎么拿到 path」，后半段（create → markDeclared → 开会话）保持原样。
      function addWorkspace() {
        var controller = serviceOf(props.ctx, "workspaces");
        var picking = pickerUi && typeof pickerUi.listDirectory === "function" ? pickViaBrowse() : pickViaNative();
        return picking.then(function (pickedValue) {
          var path = pathOfPicked(pickedValue);
          if (!path) return null; // 取消：不调用 workspaces.create
          if (!controller || typeof controller.create !== "function") throw new Error("宿主没有提供新建工作区接口");
          // 门面签名是 create(request)：wire 字段就叫 "request"，只收一个具名对象。
          // 传裸字符串会被网关以 gateway/input-invalid 拒掉（实测）。
          return Promise.resolve(controller.create({ path: path })).then(function (result) {
            // 客户端控制器层失败会直接抛（WorkspaceCreateError），由 addProject 的 catch 统一提示；
            // 这里只保留 wire 层的 {ok:false} 兜底，两种宿主都判成失败。
            if (result && result.ok === false) {
              throw new Error((result.error && result.error.message) || "新建工作区失败");
            }
            // 声明成项目，立刻从「原始工作区」转到「团队项目」（localStorage，纯客户端标记）。
            // 必须用宿主返回的规范路径：workspaces.create 会对 path 做 realpath（如 /tmp/x → /private/tmp/x），
            // 用用户选的原始路径会和 buildModel 里 workspace.path 对不上，刚建的项目会掉进「原始工作区」。
            var workspace = workspaceOf(result);
            markDeclared((workspace && typeof workspace.path === "string" && workspace.path) || path);
            var workspaceId = workspace && (workspace.workspaceId || workspace.id);
            var sessions = serviceOf(props.ctx, "sessions");
            if (!workspaceId || !sessions || typeof sessions.create !== "function") return result;
            // 顺手开一个「开发团队」会话当项目经理，省掉"建完没反应"的空白期。
            return Promise.resolve(sessions.create({ workspaceId: workspaceId, agentPreset: PRESET_PM })).then(function (value) {
              var id = typeof value === "string" ? value : value && (value.sessionId || (value.value && value.value.sessionId) || value.id);
              if (id) props.openSession(id);
              return result;
            }, function (error) {
              // 工作区已经登记成功，只是项目经理会话没建成：不能静默，也不能把整次创建判成失败。
              show("项目已登记，但项目经理会话没建成：" + messageOf(error) + "。可以点项目卡片上的「＋ 新会话」重试。", "bad");
              return result;
            });
          });
        });
      }
      function addProject() { Promise.resolve().then(addWorkspace).then(null, function (error) { show("新建项目工作区失败：" + messageOf(error), "bad"); }); }
      // 「招员工」不是客户端能力：打开项目经理会话，把可直接复制的一句原话放进提示条。
      function hireHint(project) {
        var list = model.sessionsOf(project.workspace), pick = null;
        for (var i = 0; i < list.length; i++) if (presetOf(list[i]) === PRESET_PM) { pick = list[i]; break; }
        if (!pick && list.length) pick = list[0];
        if (!pick) { show("这个项目还没有会话：先点「＋ 新会话」开一个项目经理会话，再说「招一个前端，负责……」"); return; }
        if (!openSession(pick.id)) return;
        var preset = presetOf(pick);
        if (preset && preset !== PRESET_PM) show("这个会话不是项目经理预设：先点「重建为项目经理会话」，再说「招一个前端，负责……」");
        else show("跟项目经理说「招一个前端，负责……」（招人由项目经理执行，面板只负责打开会话）。");
      }
      // 跑着但 5 分钟没有任何更新 —— 可能是长任务，也可能卡在模型/工具上（权限已由会话守卫自动兜底）。
      // 计时起点 = max(updatedAt, viewedAt)：点进去看过一眼就把起点推到当时，
      // 所以提示立刻消失，再过 STUCK_MS 真的没有新动静才重新出现。
      function stuckOf(session, current) {
        var at = typeof current === "number" ? current : Date.now();
        if (!session.running) return false;
        var updated = typeof session.updatedAt === "number" && isFinite(session.updatedAt) ? session.updatedAt : 0;
        var viewed = viewedAtOf(session.id);
        var anchor = viewed > updated ? viewed : updated;
        return !!(anchor && at - anchor > STUCK_MS);
      }
      // 降级：读不到提问投影时照旧说「可能卡住?」，title 里补一句它也可能是在等回答。
      var STUCK_TIP = "可能卡住：5 分钟没有新动静；也可能是长任务。权限已自动兜底，一般是卡在模型/工具上。";
      var STUCK_TIP_FALLBACK = "可能卡住：5 分钟没有新动静；也可能是长任务（也可能是它在等你回答，面板这会儿读不到提问详情）。权限已自动兜底，一般是卡在模型/工具上。";
      // continued 的弱提示：只挂在「可能卡住?」的 title 上，不新增徽章、不改行底色。
      var CONTINUED_HINT = "（这个会话之前问过你，已超时继续，答复可选）";
      function presetBadge(session) {
        var preset = presetOf(session);
        if (preset === PRESET_PM) return h("span", { className: "dt-badge dt-badge-pm", key: "badge", title: "Agent 预设：开发团队（项目经理，带 team_* 工具）" }, "PM");
        // staff（新员工预设）与 standard（历史员工会话）都显示「员工」，标题里写明实际 id。
        if (isStaffPreset(preset)) return h("span", { className: "dt-badge dt-badge-staff", key: "badge", title: "Agent 预设：" + preset + "（员工）" }, "员工");
        return null;
      }
      // 会话行状态优先级：「等你回答（只认 open）」>「可能卡住?」> 相对时间。
      // 只有 open 的提问会让那一行说「❓ 等你回答」；continued（已超时、agent 继续跑）不算等待，
      // 也不压掉「可能卡住?」——只在确实卡住时往 title 里补一句弱提示。
      function sessionRow(session, key) {
        var title = session.displayTitle || session.id;
        var probe = pendingQuestionsOf(props.sessionsService, session);
        var pending = probe.pending, waiting = !!pending, stuck = !waiting && stuckOf(session, now);
        var waitTip = waiting ? waitTipOf(pending, session) : "";
        var stuckTip = probe.read ? STUCK_TIP : STUCK_TIP_FALLBACK;
        // continued 只在「同一行也命中可能卡住?」时补一句，不命中就什么都不加。
        var continuedHint = !waiting && stuck && probe.continued > 0;
        if (continuedHint) stuckTip += CONTINUED_HINT;
        return h("div", {
          role: "button", tabIndex: 0,
          className: "dt-row dt-row-ses" + (waiting ? " dt-row-ses-wait" : stuck ? " dt-row-ses-stuck" : ""),
          key: key,
          title: waiting ? waitTip : continuedHint ? title + CONTINUED_HINT : title,
          onClick: function () { openSession(session.id); }
        },
          h("span", { className: "dt-sdot" + (session.running ? " dt-sdot-on" : "") }),
          h("span", { className: "dt-name" }, title),
          presetBadge(session),
          waiting
            ? h("span", { key: "waiting", className: "dt-waiting", title: waitTip }, "❓ 等你回答")
            : h("span", { key: "time", className: "dt-time" + (stuck ? " dt-stuck" : ""), title: stuck ? stuckTip : "" }, stuck ? "可能卡住? " + relTime(session.updatedAt, now) : relTime(session.updatedAt, now)),
          h("button", { type: "button", className: "dt-arch", title: "归档这个会话", "aria-label": "归档这个会话",
            onMouseDown: function (event) { event.stopPropagation(); event.preventDefault(); },
            onClick: function (event) { event.stopPropagation(); event.preventDefault(); archiveSession(session.id); } }, "⌫"));
      }
      // 第一次用：三步引导。只在「没有员工也没有会话」的项目里出现，默认展开，收起状态只放内存。
      function guideBlock(project) {
        var key = "guide:" + project.workspace.workspaceId, expanded = isOpen(key, true);
        var steps = [
          "点「＋ 新会话」，对项目经理说：「招一个前端，负责……」",
          "等它建好员工工作区，会自动出现在这个项目下面",
          "在员工行点「＋」开新会话派活，回来点会话看汇报"
        ];
        var list = [];
        for (var i = 0; i < steps.length; i++) list.push(h("li", { key: i }, steps[i]));
        return h("div", { className: "dt-guide", key: "guide" },
          h("button", { type: "button", className: "dt-guide-head", title: expanded ? "收起上手引导" : "展开上手引导", "aria-label": "上手引导", "aria-expanded": expanded, onClick: function () { toggle(key, true); } },
            caret(expanded), h("span", { className: "dt-name" }, "第一次用？三步上手")),
          expanded ? h("ol", { className: "dt-guide-list", key: "list" }, list) : null);
      }
      // 非 devteam 的项目会话：明确说它没有 team_* 工具，并给一键重建。
      function presetWarning(project, session) {
        var title = session.displayTitle || session.id;
        return h("div", { className: "dt-warn", key: "preset:" + session.id },
          h("div", { className: "dt-warn-title" }, "这个会话不是项目经理预设，没有 team_* 工具"),
          h("div", { className: "dt-warn-sub", title: title }, title),
          h("button", { type: "button", className: "dt-warn-act", title: "新建一个开发团队会话并打开，再把旧会话归档", "aria-label": "重建为项目经理会话", onClick: function () { rebuildAsPm(project.workspace, session); } }, "重建为项目经理会话"));
      }
      // 优先 createSession（拿到 id 再打开，成功后才归档旧的）；宿主没有 create 时退回 startSession 尽力而为。
      function rebuildAsPm(workspace, session) {
        var created;
        try { created = props.createSession(workspace.workspaceId, PRESET_PM); }
        catch (error) { show("重建失败：" + messageOf(error), "bad"); return; }
        if (created === false || created === undefined) {
          var outcome;
          try { outcome = props.startSession(workspace.workspaceId, PRESET_PM); }
          catch (error) { show("重建失败：" + messageOf(error), "bad"); return; }
          if (outcome === false) { show("宿主没有提供新建会话的接口，无法重建。", "bad"); return; }
          Promise.resolve(outcome).then(function () {
            return archiveSession(session.id, "已新建项目经理会话，旧会话已归档。");
          }, function (error) { show("重建失败：" + messageOf(error), "bad"); });
          return;
        }
        Promise.resolve(created).then(function () {
          return archiveSession(session.id, "已新建项目经理会话，旧会话已归档。");
        }, function (error) { show("重建失败，旧会话未归档：" + messageOf(error), "bad"); });
      }
      // 计数格：running>0 → 「● 3/15」（唯一的状态点是 .dt-count-run 的 :before；
      // 运行数绿、总数灰三级色）；running===0 → 只有灰色总数。三处调用（项目经理行 / 员工行 /
      // 原始工作区行 / 项目卡片头）规则一致，计数始终按全部会话算，不受「只看运行中」过滤影响。
      function countNode(running, total, key) {
        var title = running ? running + " 个正在运行，共 " + total + " 个会话" : total + " 个会话，空闲";
        if (!running) return h("span", { className: "dt-count", key: key, title: title }, String(total));
        return h("span", { className: "dt-count dt-count-run", key: key, title: title },
          h("span", { className: "dt-count-run-n", key: "run" }, String(running)),
          h("span", { className: "dt-count-total", key: "total" }, "/" + total));
      }
      function jobRow(workspace, key, label, isLead) {
        var sessions = model.sessionsOf(workspace), running = model.runningOf(sessions), expanded = isOpen(key, !!isLead), stale = staleOf(workspace);
        var shown = onlyRunning ? sessions.filter(function (session) { return session.running; }) : sessions;
        var row = h("button", { type: "button", className: "dt-row" + (stale ? " dt-stale" : ""), title: pathOf(workspace), onClick: function () { toggle(key, !!isLead); } },
          caret(expanded), h("span", { className: "dt-ico" }, icon(isLead ? "person" : "folder", 13)),
          h("span", { className: "dt-name" }, label || workspace.title || pathOf(workspace)),
          stale ? h("span", { className: "dt-gone" }, "目录已不存在") : null,
          isLead ? h("span", { className: "dt-crown", key: "crown" }, icon("crown", 12)) : null,
          countNode(running, sessions.length, "count"));
        // 员工行 ＋：hover 出现，与 ⌫ 同一套显隐；给该员工开一个员工预设（PRESET_STAFF）会话。
        var addButton = isLead || stale ? null : h("button", { type: "button", className: "dt-pip", title: "给这个员工开一个新会话（员工预设 " + PRESET_STAFF + "）", "aria-label": "给这个员工开新会话",
          onMouseDown: function (event) { event.stopPropagation(); event.preventDefault(); },
          onClick: function (event) { event.stopPropagation(); event.preventDefault(); newSession(workspace, PRESET_STAFF); } }, "＋");
        var rows = [h("div", { className: "dt-rowwrap", key: key }, row, addButton, removeButton(workspace, key + ":rm"))];
        if (expanded) {
          if (!shown.length) rows.push(note(onlyRunning && sessions.length ? "（没有运行中的会话）" : "（还没有会话）", key + ":empty"));
          for (var i = 0; i < shown.length; i++) rows.push(sessionRow(shown[i], key + ":" + i));
        }
        return h("div", { key: key + ":wrap" }, rows);
      }
      function projectCard(project) {
        var key = "p:" + project.workspace.workspaceId, expanded = isOpen(key, true), stale = staleOf(project.workspace);
        var total = project.sessions.length, running = model.runningOf(project.sessions);
        for (var e = 0; e < project.employees.length; e++) {
          var list = model.sessionsOf(project.employees[e]);
          total += list.length; running += model.runningOf(list);
        }
        var body = [];
        if (expanded) {
          var guideNeeded = !project.employees.length && !project.sessions.length;
          if (guideNeeded) body.push(guideBlock(project));
          // 两个主操作都带文字（取代旧的纯图标 ＋ / 滑杆与「开启新分析会话」行）。
          body.push(h("div", { className: "dt-actions", key: "actions" },
            h("button", { type: "button", className: "dt-btn dt-btn-main", title: "给这个项目开一个项目经理会话（开发团队预设）", "aria-label": "新会话：项目经理", onClick: function () { newSession(project.workspace, PRESET_PM); } },
              icon("plus", 11), "新会话"),
            h("button", { type: "button", className: "dt-btn", title: "打开项目经理会话，告诉它要招谁；面板不能直接招人。可以说：招一个前端，负责……", "aria-label": "招员工：打开项目经理会话", onClick: function () { hireHint(project); } },
              icon("plus", 11), "招员工")));
          for (var i = 0; i < project.sessions.length; i++) {
            var badPreset = presetOf(project.sessions[i]);
            if (badPreset && badPreset !== PRESET_PM) body.push(presetWarning(project, project.sessions[i]));
          }
          var runsCount = runs[pathOf(project.workspace)];
          body.push(h("div", { className: "dt-row dt-row-static", key: "team", title: pathOf(project.workspace) + "/team/runs" },
            h("span", { className: "dt-ico" }, icon("users", 13)),
            h("span", { className: "dt-name" }, "团队公共聊天群"), typeof runsCount === "number" ? h("span", { className: "dt-count" }, String(runsCount)) : null));
          body.push(h("div", { className: "dt-seclabel", key: "label" },
            h("span", { className: "dt-name" }, "员工列表"),
            h("button", {
              type: "button", className: "dt-act" + (onlyRunning ? " dt-act-on" : ""),
              title: onlyRunning ? "显示全部会话" : "只看运行中的会话", "aria-label": onlyRunning ? "显示全部会话" : "只看运行中的会话", onClick: function () { onlyState[1](!onlyRunning); }
            }, icon("filter", 12))));
          body.push(jobRow(project.workspace, "lead:" + project.workspace.workspaceId, "项目经理", true));
          for (var e = 0; e < project.employees.length; e++) body.push(jobRow(project.employees[e], "emp:" + project.employees[e].workspaceId, "", false));
          if (!project.employees.length && !guideNeeded) body.push(note("还没有员工：打开项目经理会话，说「招一个前端，负责……」", "empty"));
        }
        return h("section", { className: "dt-card", key: key, "data-project": project.workspace.workspaceId },
          h("div", { className: "dt-headrow" },
            h("button", { type: "button", className: "dt-head" + (stale ? " dt-stale" : ""), title: pathOf(project.workspace), onClick: function () { toggle(key, true); } },
              caret(expanded),
              h("span", { className: "dt-avatar" }, initialOf(project.workspace.title || pathOf(project.workspace))),
              h("span", { className: "dt-name" }, project.workspace.title || pathOf(project.workspace)),
              stale ? h("span", { className: "dt-gone" }, "目录已不存在") : null),
            // 卡片头用聚合计数（PM 会话 + 各员工会话合计），与行内计数同一套渲染；
            // 旧的状态圆点已合并进这里，同一行只有一个状态点。
            countNode(running, total, "count"),
            removeButton(project.workspace, key + ":rm")),
          body);
      }
      function rawWorkspaceRow(workspace) {
        var key = "raw:" + workspace.workspaceId, sessions = model.sessionsOf(workspace);
        var expanded = isOpen(key, false), running = model.runningOf(sessions), stale = staleOf(workspace);
        var shown = onlyRunning ? sessions.filter(function (session) { return session.running; }) : sessions;
        var row = h("button", { type: "button", className: "dt-row" + (stale ? " dt-stale" : ""), title: pathOf(workspace), onClick: function () { toggle(key, false); } },
          sessions.length ? caret(expanded) : h("span", { className: "dt-caret" }),
          h("span", { className: "dt-ico" }, icon("folder", 13)), h("span", { className: "dt-name" }, workspace.title || pathOf(workspace)),
          stale ? h("span", { className: "dt-gone" }, "目录已不存在") : null,
          countNode(running, sessions.length, "count"));
        var rows = [h("div", { className: "dt-rowwrap", key: key }, row, removeButton(workspace, key + ":rm"))];
        if (expanded) {
          if (!shown.length) rows.push(note(onlyRunning && sessions.length ? "（没有运行中的会话）" : "（还没有会话）", key + ":empty"));
          for (var i = 0; i < shown.length; i++) rows.push(sessionRow(shown[i], key + ":" + i));
        }
        return h("div", { key: key + ":wrap" }, rows);
      }
      function rawSection(list) {
        var key = "raw", expanded = isOpen(key, false), rows = [];
        if (expanded) {
          for (var i = 0; i < list.length; i++) rows.push(rawWorkspaceRow(list[i]));
          if (!list.length) rows.push(note("（没有其它工作区）", "raw:empty"));
        }
        return h("section", { className: "dt-card dt-card-last", key: "raw" },
          h("button", { type: "button", className: "dt-head", onClick: function () { toggle(key, false); } },
            caret(expanded), h("span", { className: "dt-ico" }, icon("folder", 13)),
            h("span", { className: "dt-name" }, "原始工作区"),
            h("span", { className: "dt-count" }, String(list.length))),
          rows);
      }
      function renderBody() {
        if (!props.workspaces || !props.sessions) return [note("宿主没有提供 workspaces / sessions 服务，暂时无法读取项目与会话。", "no-service")];
        if (items.length === 0) {
          var loading = !wsSnap || wsSnap.phase === "pending" || wsSnap.phase === "loading" || !dirs.ready;
          return [note(loading ? "正在加载工作区…" : "还没有注册任何工作区。先点上面的「＋ 新建项目工作区」选一个文件夹；建好后跟项目经理说「招一个前端，负责……」。", "empty")];
        }
        if (!dirs.ready) return [note("正在读取各工作区的 team/ 目录…", "loading")];
        if (!model) return [note("正在整理项目结构…", "model")];
        var children = [];
        for (var p = 0; p < model.projects.length; p++) children.push(projectCard(model.projects[p]));
        if (!model.projects.length) children.push(note("还没有团队项目工作区：含 team/ 目录的工作区会出现在这里。", "no-project"));
        children.push(rawSection(model.raw));
        return children;
      }

      var scroll = [], bodyError = "";
      try { scroll = renderBody(); } catch (error) { bodyError = "团队侧栏渲染失败：" + messageOf(error); }
      // 宽度 / 收起状态必须在任何条件返回之前取（hook 顺序固定）。
      var rootRef = React.useRef(null);
      var nativeSidebar = useSidebarWidth(rootRef);
      var miniPair = React.useState(false), mini = miniPair[0], setMini = miniPair[1];
      // 原生左栏收起（rail / 窄屏 / 手动关）时整个面板不渲染：否则会盖住聊天区。
      // 收起状态由 frame 的 data-sidebar-collapsed 或量出宽度 <= 0 判定；展开后自动回来。
      if (nativeSidebar.collapsed) return null;
      if (mini) {
        // mini 胶囊保持原样，不跟原生左栏宽度。
        return h("div", { className: "dt-root dt-mini" },
          h("button", { type: "button", className: "dt-mini-toggle dt-mini-open", title: "展开团队面板", "aria-label": "展开团队面板", onClick: function () { setMini(false); } }, "▾ 展开团队"));
      }
      var flash = bodyError ? { text: bodyError, bad: true } : hint;
      // 只写 --dt-width（覆盖 CSS 的 280 默认值），top / bottom 等定位一概不动。
      return h("div", { className: "dt-root", ref: rootRef, style: { "--dt-width": nativeSidebar.width + "px" } },
        pick ? h(PickerDialog, {
          key: "picker", ui: pickerUi, initial: pick.listing, initialError: pick.error,
          onConfirm: function (path) { closePicker(path); }, onCancel: function () { closePicker(null); }
        }) : null,
        flash ? h("div", { className: "dt-flash" + (flash.bad ? " dt-flash-bad" : ""), role: flash.bad ? "alert" : "status", title: "点击关闭", onClick: function () { show(""); } }, flash.text) : null,
        h("div", { className: "dt-top" },
          h("button", { type: "button", className: "dt-mini-toggle", title: "收起面板，露出原生列表（归档/删除在那里）", "aria-label": "收起团队面板", onClick: function () { setMini(true); } }, "收起面板 ▴"),
          h("button", { type: "button", className: "dt-add", title: "选择目录并注册成工作区", "aria-label": "新建项目工作区", onClick: addProject },
            icon("plus", 13), "新建项目工作区")),
        h("div", { className: "dt-scroll" }, scroll));
    }

    function probeOf(ctx) {
      function scan(result) {
        if (!result || result.ok !== true || !result.value) return null;
        var entries = result.value.entries || [];
        for (var i = 0; i < entries.length; i++) if (entries[i] && entries[i].name === "team") return true;
        return false;
      }
      function viaDirs(path) {
        var dirs = serviceOf(ctx, "remote.directoryPicker");
        if (!dirs || typeof dirs.list !== "function") return Promise.resolve(null);
        try { return Promise.resolve(dirs.list(path)).then(scan, function () { return null; }); } catch (error) { return Promise.resolve(null); }
      }
      // 先走会话作用域的 workspaceFiles（"." = 工作区根）：macOS 本地只挂 native picker 时
      // directoryPicker.list 会以 directory-picker/unavailable 拒绝，这条路仍可用。
      return function (path, sessionId) {
        var files = serviceOf(ctx, "remote.workspaceFiles");
        if (!files || typeof files.list !== "function" || !sessionId) return viaDirs(path);
        try { return Promise.resolve(files.list(sessionId, ".")).then(scan, function () { return viaDirs(path); }); } catch (error) { return viaDirs(path); }
      };
    }
    function runCountOf(ctx) {
      return function (path, sessionId) {
        var files = serviceOf(ctx, "remote.workspaceFiles");
        if (!files || typeof files.list !== "function" || !sessionId) return Promise.resolve(null);
        try {
          return Promise.resolve(files.list(sessionId, "team/runs")).then(function (result) {
            if (!result || result.ok !== true || !result.value) return null;
            var entries = result.value.entries || [], count = 0;
            for (var i = 0; i < entries.length; i++) if (entries[i] && entries[i].type === "file") count++;
            return count;
          }, function () { return null; });
        } catch (error) { return Promise.resolve(null); }
      };
    }
    // 存在性探测：list 明确报 workspace-file/not-found 才算不存在；其它错误=未知，绝不猜。
    function missingOf(ctx) {
      return function (sessionId) {
        var files = serviceOf(ctx, "remote.workspaceFiles");
        if (!files || typeof files.list !== "function" || !sessionId) return Promise.resolve(null);
        try {
          return Promise.resolve(files.list(sessionId, ".")).then(function (result) {
            if (result && result.ok === true) return false;
            return result && result.error && result.error.code === "workspace-file/not-found" ? true : null;
          }, function () { return null; });
        } catch (error) { return Promise.resolve(null); }
      };
    }

    var inject = ["slots", "sessions", "workspaces", "uiWorkspace"];
    function apply(ctx) {
      injectCss();
      var listDir = probeOf(ctx), listRuns = runCountOf(ctx), probeMissing = missingOf(ctx);
      var props = function () {
        var workspaces = serviceOf(ctx, "workspaces"), sessions = serviceOf(ctx, "sessions");
        return {
          ctx: ctx,
          workspaces: workspaces ? workspaces.list : null,
          sessions: sessions ? sessions.list : null,
          // 会话服务本体（不是 list）：只给「这个会话有没有在等你回答」读一次投影快照用。
          sessionsService: sessions || null,
          listDir: listDir,
          listRuns: listRuns,
          probeMissing: probeMissing,
          openSession: function (sessionId) {
            var ui = serviceOf(ctx, "uiWorkspace");
            if (!ui || typeof ui.openSession !== "function") return false;
            ui.openSession(sessionId);
            return true;
          },
          // 新建会话：优先 uiWorkspace.startSession(workspaceId, {agentPreset})（本机宿主签名在
          // dsh-client-ui-workspace/lib/client.js:1499，options 一路传到 openWorkspace）；
          // 宿主抛错 / 明确返回 false / Promise 拒绝，或旧宿主只声明一个参数时，回退
          // sessions.create({workspaceId, agentPreset}) → openSession，保证预设不丢。
          startSession: function (workspaceId, preset) {
            var self = this;
            var ui = serviceOf(ctx, "uiWorkspace");
            var sessions = serviceOf(ctx, "sessions");
            var canCreate = !!(sessions && typeof sessions.create === "function");
            var options = preset ? { agentPreset: preset } : undefined;
            // 只声明一个参数的老宿主会把第二参静默丢掉：有 sessions.create 时直接走它兜住预设。
            var host = ui && typeof ui.startSession === "function" && !(preset && canCreate && ui.startSession.length === 1) ? ui : null;
            if (host) {
              var outcome;
              try { outcome = host.startSession(workspaceId, options); }
              catch (error) {
                if (canCreate) return self.createSession(workspaceId, preset);
                throw error;
              }
              // 本机宿主是「即发即忘」：成功也返回 undefined，内部失败只 console.warn + notify。
              // 所以 undefined 不能当失败（否则一次点击建出两个会话）；只有明确 false / reject 才回退。
              if (outcome && typeof outcome.then === "function") {
                return Promise.resolve(outcome).then(function (value) {
                  return value === false && canCreate ? self.createSession(workspaceId, preset) : value;
                }, function (error) {
                  return canCreate ? self.createSession(workspaceId, preset) : Promise.reject(error);
                });
              }
              if (outcome === false) return canCreate ? self.createSession(workspaceId, preset) : false;
              return true;
            }
            var created = self.createSession(workspaceId, preset);
            if (created !== false) return created;
            if (ui && typeof ui.openWorkspace === "function") return Promise.resolve(ui.openWorkspace(workspaceId));
            return false;
          },
          // 直接走会话服务建会话：拿到 id 再打开；宿主没有 create 时返回 false。
          createSession: function (workspaceId, preset) {
            var self = this;
            var sessions = serviceOf(ctx, "sessions");
            if (!sessions || typeof sessions.create !== "function") return false;
            return Promise.resolve(sessions.create(preset ? { workspaceId: workspaceId, agentPreset: preset } : { workspaceId: workspaceId })).then(function (value) {
              var id = typeof value === "string" ? value
                : value && (value.sessionId || (value.value && value.value.sessionId) || value.id);
              if (!id) throw new Error("宿主没有返回新的会话 id");
              if (self && typeof self.openSession === "function") self.openSession(id);
              return id;
            });
          }
        };
      };
      // 覆盖层默认关闭。
      // 原因：它盖住的是原生工作区列表，而「插件」「自动化任务」「更多」、会话的归档/删除、
      // 工作区右键菜单、拖拽排序、搜索全都在那一块里 —— 盖住 = 这些功能全没了。
      // 想重开就把 SIDEBAR_OVERLAY 改成 true；真要长期用，得改成完整接管单槽
      // （sidebar.workspaces 是 single 槽），并把那些原生操作一并实现。
      var SIDEBAR_OVERLAY = true;
      if (SIDEBAR_OVERLAY) {
        ctx.slots.inject("shell.overlay", function () {
          return ctx.slots.register({ name: "shell.overlay", id: "dsh-yaoking-company-office", order: 100 }, function () { return h(Sidebar, props()); });
        });
      }
    }

    exports.name = "dsh-yaoking-company-office-client";
    exports.inject = inject;
    exports.apply = apply;
    return module.exports;
  }
});
