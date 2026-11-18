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
    var ICONS = {
      chevron: ["M9 5l6 7-6 7"], plus: ["M12 5v14", "M5 12h14"], filter: ["M4 6h16", "M7 12h10", "M10 18h4"], sliders: ["M4 7h9", "M17 7h3", "M4 17h4", "M12 17h8", "M15 4.5v5", "M9 14.5v5"],
      folder: ["M4 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"], person: ["M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7", "M5 20c0-3.2 3.1-5.5 7-5.5s7 2.3 7 5.5"],
      chat: ["M4 6.5h16v9H9l-5 3.5v-3.5H4z"], users: ["M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6", "M3 20c0-3 2.7-5 6-5s6 2 6 5", "M16 6.6a2.4 2.4 0 0 1 0 4.8", "M17.6 15.4c2 .6 3.4 2.2 3.4 4.6"], crown: ["M4 18h16", "M4 6l4 4 4-6 4 6 4-4v12H4z"]
    };
    var CSS = [
      ".dt-root{position:fixed;left:0;top:var(--dt-top,204px);bottom:var(--dt-bottom,64px);width:var(--dt-width,280px);z-index:30;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden;background:var(--dsw-specific-sidebar-fill,var(--dsw-alias-bg-base));border-right:1px solid var(--dsw-alias-border-l3);color:var(--dsw-alias-label-primary);font-size:12.5px;line-height:18px}.dt-root,.dt-root *{box-sizing:border-box}.dt-top{flex:none;padding:10px 10px 4px}.dt-add{width:100%;height:30px;padding:0;border:0;border-radius:8px;background:var(--dsw-alias-button-info-fill,var(--dsw-alias-brand-primary));color:var(--dsw-alias-label-primary-foreground,#fff);font:inherit;font-size:12.5px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:5px;cursor:pointer}.dt-add:hover{background:var(--dsw-alias-button-info-hover,var(--dsw-alias-button-primary-hover))}.dt-add:focus-visible,.dt-head:focus-visible,.dt-row:focus-visible,.dt-act:focus-visible,.dt-rm:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,var(--dsw-alias-brand-primary));outline-offset:-2px}.dt-scroll{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:6px 8px 10px}.dt-card{margin:0 0 6px;padding-bottom:6p",
      "x;border-bottom:1px solid var(--dsw-alias-border-l1)}.dt-card-last{margin-bottom:0;padding-bottom:0;border-bottom:0}.dt-headrow{display:flex;align-items:center;gap:1px;min-height:30px;padding-right:2px;border-radius:7px}.dt-headrow:hover,.dt-head:hover{background:var(--dsw-alias-interactive-bg-hover)}.dt-head{flex:1;min-width:0;display:flex;align-items:center;gap:6px;height:30px;padding:0 2px 0 4px;border:0;border-radius:7px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}.dt-head .dt-name{font-size:13px;font-weight:600}.dt-caret{flex:none;display:inline-flex;align-items:center;justify-content:center;width:12px;height:12px;color:var(--dsw-alias-label-tertiary);transition:transform .16s var(--ds-ease-in-out,ease)}.dt-caret-on{transform:rotate(90deg)}.dt-avatar{flex:none;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-button-info-fill,var(--dsw-alias-brand-primary));color:var(--dsw-alias-label-primary-foreground,#fff);font-size:9px;font-weight:700;line-height:16px;text-align:center;text-transform:uppercase}.dt-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dt-status{flex:none;width:6px;height:6px;border-radius:50%;margin:0 3px 0 1px;box-s",
      "hadow:inset 0 0 0 1px var(--dsw-alias-label-tertiary)}.dt-status-on{background:var(--dsw-alias-state-success-primary);box-shadow:none}.dt-act{flex:none;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;opacity:.7}.dt-act:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);opacity:1}.dt-act-on{color:var(--dsw-alias-button-info-fill,var(--dsw-alias-brand-primary));opacity:1}.dt-row{display:flex;align-items:center;gap:6px;width:100%;min-height:28px;padding:0 6px 0 20px;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;font-size:12.5px;line-height:18px;text-align:left;cursor:pointer}.dt-row:hover{background:var(--dsw-alias-interactive-bg-hover)}.dt-row-static{cursor:default}.dt-row-static:hover{background:transparent}.dt-row-ses{min-height:26px;padding-left:34px;font-size:12px;color:var(--dsw-alias-label-secondary)}.dt-ico{flex:none;display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;color:var(--dsw-alias-label-secondary)}.dt-bubble{color:var(--dsw-alias-button-info-fill,var(--dsw-ali",
      "as-brand-primary))}.dt-pill{flex:none;height:15px;padding:0 4px;border-radius:4px;font-size:10px;font-weight:500;line-height:15px;color:var(--dsw-alias-button-info-fill,var(--dsw-alias-brand-primary));background:var(--dsw-alias-interactive-bg-hover-accent);background:color-mix(in srgb,var(--dsw-alias-button-info-fill,#4176e6) 14%,transparent)}.dt-count{flex:none;min-width:12px;text-align:right;font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}.dt-count-run{display:inline-flex;align-items:center;justify-content:flex-end;gap:4px;color:var(--dsw-alias-state-success-primary)}.dt-count-run:before{content:'';width:5px;height:5px;border-radius:50%;background:currentColor}.dt-crown{flex:none;display:inline-flex;color:var(--dsw-alias-state-warn-primary)}.dt-sdot{flex:none;width:5px;height:5px;border-radius:50%;box-shadow:inset 0 0 0 1px var(--dsw-alias-label-tertiary)}.dt-sdot-on{background:var(--dsw-alias-state-success-primary);box-shadow:none}.dt-time{flex:none;font-size:11px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}.dt-seclabel{display:flex;align-items:center;gap:4px;height:24px;margin-top:2px;padding:0 2px 0 20px;color:var(--dsw-alias-label-tert",
      "iary);font-size:11px;letter-spacing:.03em}.dt-note{margin:4px 2px;padding:2px 6px 2px 20px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:17px}.dt-mini{bottom:auto;height:auto;left:8px;right:auto;width:126px;padding:4px;border:1px solid color-mix(in srgb,var(--dsw-alias-button-info-fill) 50%,transparent);border-radius:8px;background:var(--dsw-specific-sidebar-fill,var(--dsw-alias-bg-base))}.dt-mini-btn{height:26px;font-size:12px}.dt-mini-toggle{margin:0;width:100%;height:26px;display:flex;align-items:center;justify-content:center;gap:6px;line-height:1;border:1px solid color-mix(in srgb,var(--dsw-alias-button-info-fill) 50%,transparent);border-radius:9px;background:color-mix(in srgb,var(--dsw-alias-button-info-fill) 16%,transparent);color:var(--dsw-alias-button-info-fill);font:inherit;font-size:13px;font-weight:700;letter-spacing:.02em;cursor:pointer}.dt-mini-toggle:hover{background:color-mix(in srgb,var(--dsw-alias-button-info-fill) 28%,transparent)}.dt-mini-toggle:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.dt-stuck{color:var(--dsw-alias-state-warn-primary);font-weight:600}.dt-arch{flex:none;margin-left:2px;width:18px;height:18px;padding:0;border:0;display:inline-flex;align-items:center;justify-content:center;border-radius:4px;background:transparent;opacity:0;pointer-events:none;font:inherit;font-size:11px;color:var(--dsw-alias-label-tertiary);cursor:pointer}.dt-row-ses:hover .dt-arch,.dt-arch:focus-visible{opacity:.8;pointer-events:auto}.dt-arch:hover{background:var(--dsw-alias-state-error-primary);color:#fff;opacity:1}.dt-rowwrap{position:relative;display:flex;align-items:center;gap:2px}.dt-rowwrap>.dt-row{flex:1;min-width:0}.dt-rm{flex:none;hei",
      "ght:20px;padding:0 4px;border:0;border-radius:5px;background:transparent;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:10px;line-height:20px;white-space:nowrap;cursor:pointer;opacity:0;pointer-events:none}.dt-headrow:hover .dt-rm,.dt-rowwrap:hover .dt-rm,.dt-rm:focus-visible{opacity:1;pointer-events:auto}.dt-rm:hover{background:var(--dsw-alias-state-error-primary);color:#fff;opacity:1}.dt-stale{opacity:.55;filter:grayscale(1)}.dt-gone{flex:none;font-size:10px;color:var(--dsw-alias-state-warn-primary);white-space:nowrap}.dt-flash{flex:none;margin:8px 10px 0;padding:6px 8px;border:1px solid var(--dsw-alias-border-l3);border-radius:7px;background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 14%,var(--dsw-specific-sidebar-fill,#fff));color:var(--dsw-alias-label-primary);font-size:11.5px;line-height:16px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.16);word-break:break-word}.dt-flash-bad{border-color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 16%,var(--dsw-specific-sidebar-fill,#fff));color:var(--dsw-alias-state-error-primary)}.dt-err{margin:6px 2px;padding:2px 6px;color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:17px}"
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
    function relTime(ms) {
      if (typeof ms !== "number" || !isFinite(ms) || ms <= 0) return "";
      var diff = Date.now() - ms, minutes = Math.floor(diff / 6e4), hours = Math.floor(minutes / 60);
      if (diff < 6e4) return "刚刚";
      if (minutes < 60) return minutes + "分钟";
      return hours < 24 ? hours + "小时" : Math.floor(hours / 24) + "天";
    }
    function serviceOf(ctx, name) { try { return ctx.get(name) || null; } catch (error) { return null; } }
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
        set(value ? { text: value, bad: bad === true } : null);
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
    // 分组规则沿用旧面板（不改判定）：team/ 存在 = 项目；项目路径之下的工作区 = 员工；
    // 其余 = 原始工作区；项目自身工作区的会话 = 项目经理。
    function buildModel(wsSnap, sesSnap, dirs) {
      var items = (wsSnap && wsSnap.items) || [], byId = (sesSnap && sesSnap.byId) || {}, archived = {};
      var archivedIds = (wsSnap && wsSnap.archivedSessionIds) || [];
      for (var a = 0; a < archivedIds.length; a++) archived[archivedIds[a]] = true;
      function sessionsOf(workspace) {
        var out = [], ids = (workspace && workspace.sessionIds) || [];
        for (var i = 0; i < ids.length; i++) { var summary = byId[ids[i]]; if (summary && !summary.blank && !archived[ids[i]]) out.push(summary); }
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
      var isOpen = function (key, fallback) { return open[key] === undefined ? fallback : open[key]; };
      var toggle = function (key, fallback) {
        openState[1](function (previous) { var next = Object.assign({}, previous), current = previous[key]; next[key] = !(current === undefined ? fallback : current); return next; });
      };
      function staleOf(workspace) { return missing[pathOf(workspace)] === true; }
      function archiveSession(sessionId) {
        var controller = serviceOf(props.ctx, "workspaces");
        if (!controller || typeof controller.archiveSession !== "function") { show("宿主没有提供归档接口", "bad"); return; }
        var pending;
        try { pending = controller.archiveSession(sessionId); } catch (error) { show("归档失败：" + messageOf(error), "bad"); return; }
        // 门面 archiveSession(sessionId, options) 成功 resolve undefined、失败 throw；兼容返回 RemoteResult 的宿主。
        Promise.resolve(pending).then(function (result) {
          if (result && result.ok === false) throw new Error((result.error && result.error.message) || "归档失败");
          show("已归档。会话从列表消失，可在原生侧栏「更多 → 已归档」找回。");
        }).then(null, function (error) { show("归档失败：" + messageOf(error), "bad"); });
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
        try { if (props.openSession(sessionId)) return true; show("宿主没有提供打开会话的接口。", "bad"); } catch (error) { show("打开会话失败：" + messageOf(error), "bad"); }
        return false;
      }
      function newSession(workspace, preset) {
        try {
          var outcome = props.startSession(workspace.workspaceId, preset);
          if (outcome && typeof outcome.then === "function") outcome.then(null, function (error) { show("新建会话失败：" + messageOf(error), "bad"); });
          else if (outcome === false) show("宿主没有提供新建会话的接口，请在原生侧栏点「新会话」。", "bad");
        } catch (error) { show("新建会话失败：" + messageOf(error), "bad"); }
      }
      function addProject() { Promise.resolve().then(function () { return props.addWorkspace(); }).then(null, function (error) { show("新建项目工作区失败：" + messageOf(error), "bad"); }); }
      // 跑着但 5 分钟没有任何更新 —— 最可能卡在人工审批（员工写工作区外文件会弹审批，没人点就永远停在这）。
      function stuckOf(session) {
        return !!(session.running && session.updatedAt && Date.now() - session.updatedAt > 5 * 60 * 1000);
      }
      function sessionRow(session, key) {
        var title = session.displayTitle || session.id;
        return h("div", { role: "button", tabIndex: 0, className: "dt-row dt-row-ses", key: key, title: title, onClick: function () { openSession(session.id); } },
          h("span", { className: "dt-sdot" + (session.running ? " dt-sdot-on" : "") }),
          h("span", { className: "dt-name" }, title),
          h("span", { className: "dt-time" + (stuckOf(session) ? " dt-stuck" : ""), title: stuckOf(session) ? "已经跑了很久没动静，可能卡在人工审批——点进去看，或给它换成完全权限" : "" }, session.running && stuckOf(session) ? "卡住? " + relTime(session.updatedAt) : relTime(session.updatedAt)),
          h("button", { type: "button", className: "dt-arch", title: "归档这个会话", "aria-label": "归档这个会话",
            onMouseDown: function (event) { event.stopPropagation(); event.preventDefault(); },
            onClick: function (event) { event.stopPropagation(); event.preventDefault(); archiveSession(session.id); } }, "⌫"));
      }
      function jobRow(workspace, key, label, isLead) {
        var sessions = model.sessionsOf(workspace), running = model.runningOf(sessions), expanded = isOpen(key, !!isLead), stale = staleOf(workspace);
        var shown = onlyRunning ? sessions.filter(function (session) { return session.running; }) : sessions;
        var row = h("button", { type: "button", className: "dt-row" + (stale ? " dt-stale" : ""), title: pathOf(workspace), onClick: function () { toggle(key, !!isLead); } },
          caret(expanded), h("span", { className: "dt-ico" }, icon(isLead ? "person" : "folder", 13)),
          h("span", { className: "dt-name" }, label || workspace.title || pathOf(workspace)),
          stale ? h("span", { className: "dt-gone" }, "目录已不存在") : null,
          isLead ? h("span", { className: "dt-crown", key: "crown" }, icon("crown", 12)) : null,
          h("span", { className: "dt-count" + (running ? " dt-count-run" : ""), key: "count", title: sessions.length + " 个会话" + (running ? "，" + running + " 个在跑" : "") }, String(sessions.length)));
        var rows = [h("div", { className: "dt-rowwrap", key: key }, row, removeButton(workspace, key + ":rm"))];
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
          body.push(h("button", { type: "button", className: "dt-row", key: "new", onClick: function () { newSession(project.workspace, "devteam"); } },
            h("span", { className: "dt-ico dt-bubble" }, icon("chat", 13)),
            h("span", { className: "dt-name" }, "开启新分析会话"), h("span", { className: "dt-pill" }, "New")));
          var runsCount = runs[pathOf(project.workspace)];
          body.push(h("div", { className: "dt-row dt-row-static", key: "team", title: pathOf(project.workspace) + "/team/runs" },
            h("span", { className: "dt-ico" }, icon("users", 13)),
            h("span", { className: "dt-name" }, "团队公共聊天群"), typeof runsCount === "number" ? h("span", { className: "dt-count" }, String(runsCount)) : null));
          body.push(h("div", { className: "dt-seclabel", key: "label" },
            h("span", { className: "dt-name" }, "员工列表"),
            h("button", {
              type: "button", className: "dt-act" + (onlyRunning ? " dt-act-on" : ""),
              title: onlyRunning ? "显示全部会话" : "只看运行中的会话", onClick: function () { onlyState[1](!onlyRunning); }
            }, icon("filter", 12))));
          body.push(jobRow(project.workspace, "lead:" + project.workspace.workspaceId, "项目经理", true));
          for (var e = 0; e < project.employees.length; e++) body.push(jobRow(project.employees[e], "emp:" + project.employees[e].workspaceId, "", false));
          if (!project.employees.length) body.push(note("这个项目下还没有员工工作区。", "empty"));
        }
        return h("section", { className: "dt-card", key: key, "data-project": project.workspace.workspaceId },
          h("div", { className: "dt-headrow" },
            h("button", { type: "button", className: "dt-head" + (stale ? " dt-stale" : ""), title: pathOf(project.workspace), onClick: function () { toggle(key, true); } },
              caret(expanded),
              h("span", { className: "dt-avatar" }, initialOf(project.workspace.title || pathOf(project.workspace))),
              h("span", { className: "dt-name" }, project.workspace.title || pathOf(project.workspace)),
              stale ? h("span", { className: "dt-gone" }, "目录已不存在") : null),
            h("span", { className: "dt-status" + (running ? " dt-status-on" : ""), title: running ? running + " / " + total + " 个会话在运行" : total + " 个会话，空闲" }),
            h("button", { type: "button", className: "dt-act", title: "新建分析会话", onClick: function () { newSession(project.workspace, "devteam"); } }, icon("plus", 12)),
            h("button", {
              type: "button", className: "dt-act", title: "招人：到项目经理会话里说一句",
              onClick: function () {
                var list = model.sessionsOf(project.workspace);
                if (list && list.length) { if (openSession(list[0].id)) show("在项目经理会话里说：招一个前端，负责……（招人由项目经理执行）"); }
                else show("先在项目里开一个会话当项目经理，再说「招一个前端」。");
              }
            }, icon("sliders", 12)),
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
          h("span", { className: "dt-count" + (running ? " dt-count-run" : "") }, String(sessions.length)));
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
          return [note(loading ? "正在加载工作区…" : "还没有注册任何工作区。", "empty")];
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
      var miniPair = React.useState(false), mini = miniPair[0], setMini = miniPair[1];
      if (mini) {
        return h("div", { className: "dt-root dt-mini" },
          h("button", { type: "button", className: "dt-mini-toggle dt-mini-open", title: "展开团队面板", onClick: function () { setMini(false); } }, "▾ 展开团队"));
      }
      var flash = bodyError ? { text: bodyError, bad: true } : hint;
      return h("div", { className: "dt-root" },
        flash ? h("div", { className: "dt-flash" + (flash.bad ? " dt-flash-bad" : ""), role: flash.bad ? "alert" : "status", title: "点击关闭", onClick: function () { show(""); } }, flash.text) : null,
        h("div", { className: "dt-top" },
          h("button", { type: "button", className: "dt-mini-toggle", title: "收起面板，露出原生列表（归档/删除在那里）", onClick: function () { setMini(true); } }, "收起面板 ▴"),
          h("button", { type: "button", className: "dt-add", title: "选择目录并注册成工作区", onClick: addProject },
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
          listDir: listDir,
          listRuns: listRuns,
          probeMissing: probeMissing,
          openSession: function (sessionId) {
            var ui = serviceOf(ctx, "uiWorkspace");
            if (!ui || typeof ui.openSession !== "function") return false;
            ui.openSession(sessionId);
            return true;
          },
          // 新建会话：uiWorkspace.startSession → sessions.create({workspaceId}) → openWorkspace。
          // uiWorkspace 上没有 startSession（宿主只暴露 openSession/pickDirectory），
          // 所以真正能建会话的是会话服务自己的 create()。
          startSession: function (workspaceId, preset) {
            var self = this;
            var ui = serviceOf(ctx, "uiWorkspace");
            if (ui && typeof ui.startSession === "function") { ui.startSession(workspaceId); return true; }
            var sessions = serviceOf(ctx, "sessions");
            if (sessions && typeof sessions.create === "function") {
              return Promise.resolve(sessions.create(preset ? { workspaceId: workspaceId, agentPreset: preset } : { workspaceId: workspaceId })).then(function (value) {
                var id = typeof value === "string" ? value
                  : value && (value.sessionId || (value.value && value.value.sessionId) || value.id);
                if (!id) throw new Error("宿主没有返回新的会话 id");
                if (self && typeof self.openSession === "function") self.openSession(id);
                return id;
              });
            }
            if (ui && typeof ui.openWorkspace === "function") return Promise.resolve(ui.openWorkspace(workspaceId));
            return false;
          },
          // 原生「＋ 添加工作区」：pickDirectory（native picker）→ workspaces.create({path})。
          addWorkspace: function () {
            var self = this;
            var ui = serviceOf(ctx, "uiWorkspace"), picker = serviceOf(ctx, "remote.directoryPicker");
            var controller = serviceOf(ctx, "workspaces");
            var picked = Promise.resolve().then(function () {
              if (ui && typeof ui.pickDirectory === "function") return ui.pickDirectory();
              if (picker && typeof picker.pick === "function") return Promise.resolve(picker.pick()).then(function (result) {
                if (!result || result.ok !== true) throw new Error((result && result.error && result.error.message) || "目录选择失败");
                return result.value;
              });
              throw new Error("宿主没有提供目录选择接口");
            });
            return picked.then(function (pickedValue) {
              // pickDirectory() 返回 result.value；不同版本可能直接给字符串，也可能给带 path 的对象。
              var path = typeof pickedValue === "string" ? pickedValue
                : pickedValue && (pickedValue.path || (pickedValue.value && pickedValue.value.path));
              if (!path) throw new Error("目录选择没有返回路径");
              if (!controller || typeof controller.create !== "function") throw new Error("宿主没有提供新建工作区接口");
              // 门面签名是 create(request)：wire 字段就叫 "request"，只收一个具名对象。
              // 传裸字符串会被网关以 gateway/input-invalid 拒掉（实测）。
              return Promise.resolve(controller.create({ path: path })).then(function (result) {
                if (result && result.ok === false) {
                  throw new Error((result.error && result.error.message) || "新建工作区失败");
                }
                // 声明成项目，立刻从「原始工作区」转到「团队项目」（localStorage，纯客户端标记）。
                markDeclared(path);
                var created = result && result.value && result.value.workspace;
                var workspaceId = created && (created.id || created.workspaceId);
                var sessions = serviceOf(ctx, "sessions");
                if (!workspaceId || !sessions || typeof sessions.create !== "function") return result;
                // 顺手开一个「开发团队」会话当项目经理，省掉"建完没反应"的空白期。
                return Promise.resolve(sessions.create({ workspaceId: workspaceId, agentPreset: "devteam" })).then(function (value) {
                  var id = typeof value === "string" ? value : value && (value.sessionId || (value.value && value.value.sessionId) || value.id);
                  if (id && self && typeof self.openSession === "function") self.openSession(id);
                  return result;
                }, function () { return result; });
              });
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
