/* =========================================================
 * 资源共享平台 - 前端逻辑 (Mock 数据，无后端)
 * 页面：广场 / 我的资源 / 详情 / 排行榜 / 帮助 / 通知 / 管理后台 / 搜索
 * 功能：登录注册、上传(标签)、编辑、删除、批量操作、下载(计数)、
 *       评论评分、收藏、下载/浏览历史、举报+管理后台、
 *       修改资料(昵称/头像/密码)、分享链接、文件预览(Mock)
 * ========================================================= */

const K = {
  res:  "rsp_resources_v1",
  users:"rsp_users_v1",
  user: "rsp_current_user_v1",
  notif:"rsp_notifications_v1",
  fav:  "rsp_favorites_v1",
  hist: "rsp_history_v1",
  rep:  "rsp_reports_v1",
  prof: "rsp_profiles_v1",
  logs: "rsp_operation_logs_v1"
};
function lsGet(key, def) { try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } }
function lsSet(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

/* ---------- 用户 / 资料 ---------- */
function loadUsers() { return lsGet(K.users, []); }
function saveUsers(u) { lsSet(K.users, u); }
let currentUser = lsGet(K.user, null);
let profiles = lsGet(K.prof, {});

function getProfile(name) { return profiles[name] || {}; }
function displayNameOf(name) { return getProfile(name).displayName || name; }

/* ---------- 角色与权限（RBAC） ---------- */
const ROLES = {
  user:         { name: "普通用户",   perms: [] },
  admin:        { name: "普通管理员", perms: ["report:handle", "resource:delete_any"] },
  ops:          { name: "运维",       perms: ["log:view", "resource:delete_any"] },
  system_admin: { name: "系统管理员", perms: ["report:handle", "resource:delete_any", "user:manage", "log:view", "system:config"] }
};
const PERM_NAMES = {
  "report:handle": "处理举报", "resource:delete_any": "删除任意资源",
  "user:manage": "用户与角色管理", "log:view": "查看系统日志", "system:config": "系统配置"
};
function roleOf() { return currentUser ? (currentUser.role || "user") : null; }
function roleName() { const r = ROLES[roleOf()]; return r ? r.name : "未登录"; }
function hasPerm(p) { const r = ROLES[roleOf()]; return !!(r && r.perms.includes(p)); }
function isStaff() { return hasPerm("report:handle") || hasPerm("user:manage") || hasPerm("log:view"); }

// 内置演示账号（系统管理员 / 普通管理员 / 运维）
(function ensureStaff() {
  const users = loadUsers();
  const seeds = [
    { name: "admin",     password: "admin123", role: "system_admin", joined: "2026-01-01" },
    { name: "moderator", password: "mod123",   role: "admin",        joined: "2026-02-01" },
    { name: "ops",       password: "ops123",   role: "ops",          joined: "2026-02-01" }
  ];
  let changed = false;
  seeds.forEach(s => {
    if (!users.some(u => u.name === s.name)) { users.push({ ...s, status: 1 }); changed = true; }
  });
  if (changed) saveUsers(users);
})();

/* ---------- 数据 ---------- */
const MOCK_DATA = [
  { id: "r1", name: "2026 产品设计与交互规范", type: "文档",
    desc: "包含色彩、字体、组件库与页面模板的完整设计规范，团队统一视觉语言。\n\n适用于 Web 与移动端项目，所有组件均附带使用示例与注意事项。",
    uploader: "林晓", date: "2026-09-12", shared: true, mine: false, size: "4.2 MB", downloads: 34,
    tags: ["设计", "规范", "组件库"],
    comments: [
      { id: "c1", user: "陈宇", stars: 5, text: "非常完整，直接用在项目里了！", time: "2026-09-14 10:22:11" },
      { id: "c2", user: "苏琳", stars: 4, text: "配色部分很实用，希望补充暗色模式。", time: "2026-09-20 15:03:45" }
    ] },
  { id: "r2", name: "城市夜景航拍素材包", type: "图片",
    desc: "30 张 4K 高清城市夜景实拍，可用于海报与视频背景，免费商用。\n\n拍摄于深圳、上海、重庆三地，含 RAW 与 JPG 双格式。",
    uploader: "陈宇", date: "2026-08-30", shared: true, mine: false, size: "218 MB", downloads: 128,
    tags: ["4K", "航拍", "素材"],
    comments: [
      { id: "c3", user: "王浩", stars: 5, text: "画质惊艳，做片头刚好。", time: "2026-09-02 09:11:02" }
    ] },
  { id: "r3", name: "前端性能优化实战视频", type: "视频",
    desc: "12 节课程，从加载、渲染到缓存逐层拆解，配套示例代码。\n\n涵盖首屏优化、懒加载、代码分割与 Lighthouse 实战。",
    uploader: "Alex", date: "2026-10-01", shared: true, mine: false, size: "1.3 GB", downloads: 76,
    tags: ["前端", "性能优化", "教程"],
    comments: [
      { id: "c4", user: "赵明", stars: 5, text: "讲得比我看过的付费课还清楚。", time: "2026-10-03 20:41:30" },
      { id: "c5", user: "林晓", stars: 4, text: "第 8 节缓存策略建议多举几个例子。", time: "2026-10-05 11:07:19" }
    ] },
  { id: "r4", name: "项目周报模板（Excel）", type: "其他",
    desc: "自动汇总进度、风险与下周计划，填入数据即可生成图表。",
    uploader: "苏琳", date: "2026-09-20", shared: false, mine: false, size: "86 KB", downloads: 0,
    tags: ["模板", "效率"], comments: [] },
  { id: "r5", name: "背景纯音乐合集", type: "音频",
    desc: "20 首无版权轻音乐，适合直播、Vlog 与办公场景。\n\n包含钢琴、Lo-Fi、自然白噪音三种风格。",
    uploader: "苏琳", date: "2026-07-15", shared: true, mine: false, size: "312 MB", downloads: 92,
    tags: ["音乐", "免版权"], comments: [] },
  { id: "r6", name: "Python 爬虫源码.zip", type: "代码",
    desc: "含请求封装、反爬处理与数据落库示例，注释详尽。\n\n技术栈：requests + BeautifulSoup + SQLite。",
    uploader: "赵明", date: "2026-10-05", shared: true, mine: false, size: "12 MB", downloads: 211,
    tags: ["Python", "爬虫"],
    comments: [
      { id: "c6", user: "Alex", stars: 5, text: "反爬部分处理得很到位。", time: "2026-10-08 13:55:07" }
    ] },
  { id: "r7", name: "内部培训资料（暂存）", type: "文档",
    desc: "新人入职培训 PPT，先放在未分享区，确认后再公开。",
    uploader: "王浩", date: "2026-10-10", shared: false, mine: false, size: "9.5 MB", downloads: 0,
    tags: ["培训"], comments: [] },
  { id: "r8", name: "产品演示录屏", type: "视频",
    desc: "最新版本功能走查录屏，方便远程同事快速了解。\n\n时长 18 分钟，含字幕与章节目录。",
    uploader: "王浩", date: "2026-09-28", shared: false, mine: false, size: "640 MB", downloads: 3,
    tags: ["演示"], comments: [] }
];

function loadResources() {
  const raw = localStorage.getItem(K.res);
  if (!raw) { lsSet(K.res, MOCK_DATA); return JSON.parse(JSON.stringify(MOCK_DATA)); }
  try { return JSON.parse(raw); } catch { return JSON.parse(JSON.stringify(MOCK_DATA)); }
}
function saveResources() { lsSet(K.res, resources); }

let resources   = loadResources();
let notifications = lsGet(K.notif, []);
let favorites   = lsGet(K.fav, {});   // { user: [resourceId] }
let history     = lsGet(K.hist, {});  // { user: { downloads:[], views:[] } }
let reports     = lsGet(K.rep, []);
let opLogs      = lsGet(K.logs, []);

// 操作日志（运维可在管理后台查看）
function pushLog(action, detail) {
  opLogs.unshift({ id: genId(), user: currentUser ? currentUser.name : "anonymous",
    role: roleOf() || "-", action, detail, time: nowStr() });
  opLogs = opLogs.slice(0, 100);
  lsSet(K.logs, opLogs);
}

let activeView  = "plaza";
let plazaFilter = "all";
let mineFilter  = "all";
let rankMode    = "downloads";
let keyword     = "";
let currentDetailId = null;
let batchMode   = false;
let selectedIds = new Set();
let ratingInput = 5;
let editingId   = null;
let reportingId = null;

/* ---------- 工具 ---------- */
const MOCK_NAMES = ["林晓", "陈宇", "Alex", "苏琳", "赵明", "王浩"];

/* 头像：单一 avatar 字段（图片地址），预设头像由风格化头像服务生成 */
const AVATAR_STYLES = ["avataaars", "bottts", "lorelei", "micah", "personas", "adventurer", "notionists", "fun-emoji"];
function hashOf(s) {
  let h = 0;
  for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}
function presetAvatar(seed) {
  const st = AVATAR_STYLES[hashOf(seed) % AVATAR_STYLES.length];
  return `https://api.dicebear.com/7.x/${st}/svg?seed=${encodeURIComponent(seed)}`;
}
const AVATAR_PRESETS = AVATAR_STYLES.map(st => `https://api.dicebear.com/7.x/${st}/svg?seed=${st}`);
function avatarOf(name) { return getProfile(name).avatar || presetAvatar(name); }
function avatarHtml(name, cls = "") {
  const ini = displayNameOf(name).slice(0, 1);
  return `<img class="avatar ${cls}" src="${escapeHtml(avatarOf(name))}" alt="${escapeHtml(ini)}"
    data-initial="${escapeHtml(ini)}" data-cls="${escapeHtml(cls)}">`;
}
// 头像加载失败（如离线）时降级为首字母圆形块
document.addEventListener("error", e => {
  const t = e.target;
  if (t && t.tagName === "IMG" && t.classList.contains("avatar")) {
    const span = document.createElement("span");
    span.className = "avatar " + (t.dataset.cls || "");
    span.textContent = (t.dataset.initial || "?").slice(0, 1);
    t.replaceWith(span);
  }
}, true);
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
function toast(msg, type = "") {
  const wrap = document.getElementById("toastWrap");
  const el = document.createElement("div");
  el.className = "toast " + type;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transition = "opacity .3s";
    setTimeout(() => el.remove(), 300); }, 2200);
}
function genId() { return "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function nowStr() { return new Date().toLocaleString("zh-CN", { hour12: false }); }
function isOwner(r) { return !!(currentUser && (r.mine || r.uploader === currentUser.name)); }
function canDownload(r) { return r.shared || isOwner(r); }
function parseTags(str) {
  return [...new Set(String(str || "").split(/[,，#\s]+/).map(s => s.trim()).filter(Boolean))].slice(0, 5);
}
function matchKeyword(r) {
  if (!keyword) return true;
  const k = keyword.toLowerCase();
  const hay = (r.name + r.desc + r.uploader + (r.tags || []).join(" ")).toLowerCase();
  return hay.includes(k);
}
function ratingAvg(r) {
  const cs = (r.comments || []).filter(c => c.stars);
  if (!cs.length) return null;
  return cs.reduce((s, c) => s + c.stars, 0) / cs.length;
}
function favList() { return currentUser ? (favorites[currentUser.name] || []) : []; }
function isFav(id) { return favList().includes(id); }
function histOf() {
  if (!currentUser) return { downloads: [], views: [] };
  if (!history[currentUser.name]) history[currentUser.name] = { downloads: [], views: [] };
  return history[currentUser.name];
}
function pushHistory(kind, id) {
  if (!currentUser) return;
  const h = histOf();
  h[kind] = [{ id, time: nowStr() }].concat(h[kind].filter(x => x.id !== id)).slice(0, 30);
  lsSet(K.hist, history);
}

/* ---------- 卡片 ---------- */
function cardHtml(r) {
  const shareFlag = r.shared
    ? `<span class="share-flag on">● 已分享</span>` : `<span class="share-flag off">● 未分享</span>`;
  const mineTag = isOwner(r) ? `<span class="mine-tag">· 我的</span>` : "";
  const avg = ratingAvg(r);
  const rating = avg ? `<span class="rating-badge">⭐ ${avg.toFixed(1)}</span>` : "";
  const tags = (r.tags || []).slice(0, 3)
    .map(t => `<button class="tag-chip" type="button" data-tag="${escapeHtml(t)}">#${escapeHtml(t)}</button>`).join("");
  const favBtn = currentUser
    ? `<button class="btn btn-sm ${isFav(r.id) ? "fav-on" : ""}" data-act="fav" data-id="${r.id}">${isFav(r.id) ? "⭐ 已收藏" : "☆ 收藏"}</button>`
    : "";
  const editBtn = isOwner(r) ? `<button class="btn btn-sm" data-act="edit" data-id="${r.id}" title="编辑">✏️</button>` : "";
  const reportBtn = (!isOwner(r) && currentUser)
    ? `<button class="btn btn-sm" data-act="report" data-id="${r.id}" title="举报">⚠️</button>` : "";
  const toggleBtn = isOwner(r)
    ? `<button class="btn btn-sm" data-act="toggle" data-id="${r.id}">${r.shared ? "🙈 取消分享" : "🌍 公开分享"}</button>` : "";
  const delBtn = isOwner(r)
    ? `<button class="btn btn-sm" data-act="delete" data-id="${r.id}" style="color:var(--red)">🗑</button>` : "";
  const dlBtn = canDownload(r)
    ? `<button class="btn btn-primary btn-sm" data-act="download" data-id="${r.id}">⬇ 下载</button>`
    : `<button class="btn btn-sm" disabled style="opacity:.5;cursor:not-allowed">🔒 私有</button>`;
  const check = (batchMode && isOwner(r))
    ? `<label class="batch-check"><input type="checkbox" data-batch="${r.id}" ${selectedIds.has(r.id) ? "checked" : ""}></label>`
    : "";
  const sel = selectedIds.has(r.id) ? " selected" : "";

  return `
    <div class="card${sel}" data-open="${r.id}">
      ${check}
      <div class="card-top">
        <span class="type-badge">${escapeHtml(r.type)}</span>
        ${shareFlag}
      </div>
      <h4 class="card-title">${escapeHtml(r.name)}</h4>
      <div class="card-desc">${escapeHtml(r.desc)}</div>
      ${tags ? `<div class="card-tags">${tags}</div>` : ""}
      <div class="card-meta">
        ${avatarHtml(r.uploader)}
        <span>${escapeHtml(displayNameOf(r.uploader))}</span>${mineTag}
        <span>·</span><span>${escapeHtml(r.date)}</span>
        <span>·</span><span>${escapeHtml(r.size || "")}</span>
        <span class="dl-count">⬇ ${r.downloads || 0}</span>
        ${rating}
      </div>
      <div class="card-actions">${dlBtn}${favBtn}${toggleBtn}${editBtn}${reportBtn}${delBtn}</div>
    </div>`;
}

/* ---------- 广场 ---------- */
function renderPlaza() {
  const shared = resources.filter(r => r.shared);
  const list = shared.filter(r => (plazaFilter === "all" || r.type === plazaFilter) && matchKeyword(r));
  document.getElementById("statTotal").textContent = shared.length;
  document.getElementById("statUsers").textContent = new Set(shared.map(r => r.uploader)).size;
  document.getElementById("statDownloads").textContent = shared.reduce((s, r) => s + (r.downloads || 0), 0);
  document.getElementById("statComments").textContent = resources.reduce((s, r) => s + (r.comments || []).length, 0);

  const grid = document.getElementById("plazaGrid");
  const empty = document.getElementById("plazaEmpty");
  if (!list.length) { grid.innerHTML = ""; empty.hidden = false; return; }
  empty.hidden = true;
  grid.innerHTML = list.map(cardHtml).join("");
}

/* ---------- 我的资源 ---------- */
function renderMine() {
  const mineAll = resources.filter(r => isOwner(r));
  let list;
  if (mineFilter === "fav") {
    list = favList().map(id => resources.find(r => r.id === id)).filter(Boolean).filter(matchKeyword);
  } else {
    list = mineAll.filter(r => matchKeyword(r)).filter(r =>
      mineFilter === "all" ||
      (mineFilter === "shared" && r.shared) ||
      (mineFilter === "private" && !r.shared));
  }

  document.getElementById("statMineTotal").textContent = mineAll.length;
  document.getElementById("statMineShared").textContent = mineAll.filter(r => r.shared).length;
  document.getElementById("statMineFav").textContent = favList().length;
  document.getElementById("statMineDownloads").textContent = mineAll.reduce((s, r) => s + (r.downloads || 0), 0);

  document.getElementById("batchBtn").textContent = batchMode ? "退出批量管理" : "☑ 批量管理";
  const bar = document.getElementById("batchBar");
  bar.hidden = !(batchMode && mineFilter !== "fav");
  document.getElementById("batchCount").textContent = selectedIds.size;

  const grid = document.getElementById("mineGrid");
  const empty = document.getElementById("mineEmpty");
  if (!list.length) { grid.innerHTML = ""; empty.hidden = false; } else { empty.hidden = true; grid.innerHTML = list.map(cardHtml).join(""); }

  renderHistory();
}

function renderHistory() {
  const h = histOf();
  const row = (x) => {
    const r = resources.find(y => y.id === x.id);
    if (!r) return "";
    return `<div class="hist-item" data-open="${r.id}">
      <span class="type-badge">${escapeHtml(r.type)}</span>
      <div class="hist-main">
        <div class="hist-name">${escapeHtml(r.name)}</div>
        <div class="hist-time">${escapeHtml(x.time)}</div>
      </div>
    </div>`;
  };
  const dl = document.getElementById("dlHistory");
  const vw = document.getElementById("viewHistory");
  dl.innerHTML = h.downloads.map(row).join("");
  vw.innerHTML = h.views.map(row).join("");
  document.getElementById("dlHistoryEmpty").hidden = h.downloads.length > 0;
  document.getElementById("viewHistoryEmpty").hidden = h.views.length > 0;
}

/* ---------- 账号卡 ---------- */
function renderAccount() {
  if (!currentUser) return;
  document.getElementById("acAvatar").src = avatarOf(currentUser.name);
  document.getElementById("acName").textContent = displayNameOf(currentUser.name);
  document.getElementById("acRole").textContent = `【${roleName()}】`;
  document.getElementById("acMeta").textContent =
    `ID：${currentUser.id || currentUser.name}　·　注册时间：${currentUser.joined || "—"}　·　上传 ${resources.filter(r => isOwner(r)).length} 个资源`;
}

/* ---------- 搜索结果 ---------- */
function renderSearch() {
  const title = document.getElementById("searchTitle");
  const grid = document.getElementById("searchGrid");
  const empty = document.getElementById("searchEmpty");
  const list = resources.filter(r => (r.shared || isOwner(r)) && matchKeyword(r));
  title.textContent = keyword ? `搜索「${keyword}」的结果（${list.length} 条）` : "请输入关键词进行搜索";
  if (!list.length) { grid.innerHTML = ""; empty.hidden = false; return; }
  empty.hidden = true;
  grid.innerHTML = list.map(cardHtml).join("");
}

/* ---------- 详情 ---------- */
function openDetail(id) {
  currentDetailId = id;
  pushHistory("views", id);
  try { history.replaceState(null, "", "#/resource/" + id); } catch (e) {}
  switchView("detail");
}

function previewHtml(r) {
  if (r.type === "图片") {
    return `<img class="preview-media" src="https://picsum.photos/seed/${encodeURIComponent(r.id)}/900/460" alt="图片预览：${escapeHtml(r.name)}" onerror="this.outerHTML='<div class=\\'preview-fallback\\'>🖼️ 图片预览不可用（Mock 环境）</div>'">`;
  }
  if (r.type === "视频") {
    return `<video class="preview-media" controls src="https://www.w3schools.com/html/mov_bbb.mp4"></video>
            <div class="hint">Mock 演示视频（本地环境为空）</div>`;
  }
  if (r.type === "音频") {
    return `<audio controls style="width:100%" src="https://www.w3schools.com/html/horse.mp3"></audio>
            <div class="hint">Mock 演示音频</div>`;
  }
  const pages = 3 + (r.id.length % 4);
  return `<div class="preview-doc">
    <div class="preview-doc-head">📄 ${escapeHtml(r.name)} — 预览（第 1 页 / 共 ${pages} 页）</div>
    <div class="preview-doc-body">${escapeHtml(r.desc)}\n\n（Mock 演示：真实环境中此处渲染文件首页内容）</div>
  </div>`;
}

function renderDetail() {
  const wrap = document.getElementById("detailWrap");
  const r = resources.find(x => x.id === currentDetailId);
  if (!r) {
    wrap.innerHTML = `<div class="empty" style="margin-top:60px"><div class="empty-icon">🫥</div><p>资源不存在或已被删除</p></div>`;
    return;
  }

  const avg = ratingAvg(r);
  const shareFlag = r.shared ? `<span class="share-flag on">● 已公开分享</span>` : `<span class="share-flag off">● 未分享（仅自己可见）</span>`;
  const mineTag = isOwner(r) ? `<span class="mine-tag">我的资源</span>` : "";
  const dlBtn = canDownload(r)
    ? `<button class="btn btn-primary" data-act="download" data-id="${r.id}">⬇ 下载资源</button>`
    : `<button class="btn" disabled style="opacity:.5;cursor:not-allowed">🔒 私有资源，无法下载</button>`;
  const toggleBtn = isOwner(r) ? `<button class="btn" data-act="toggle" data-id="${r.id}">${r.shared ? "🙈 取消分享" : "🌍 公开分享"}</button>` : "";
  const editBtn = isOwner(r) ? `<button class="btn" data-act="edit" data-id="${r.id}">✏️ 编辑</button>` : "";
  const delBtn = isOwner(r) ? `<button class="btn" data-act="delete" data-id="${r.id}" style="color:var(--red)">🗑 删除</button>` : "";
  const favBtn = currentUser ? `<button class="btn ${isFav(r.id) ? "fav-on" : ""}" data-act="fav" data-id="${r.id}">${isFav(r.id) ? "⭐ 已收藏" : "☆ 收藏"}</button>` : "";
  const reportBtn = (!isOwner(r) && currentUser) ? `<button class="btn" data-act="report" data-id="${r.id}">⚠️ 举报</button>` : "";
  const copyBtn = `<button class="btn" data-act="copylink" data-id="${r.id}">🔗 复制链接</button>`;
  const tags = (r.tags || []).map(t => `<button class="tag-chip" type="button" data-tag="${escapeHtml(t)}">#${escapeHtml(t)}</button>`).join("");

  const comments = (r.comments || []).slice().reverse().map(c => `
    <div class="comment-item">
      ${avatarHtml(c.user)}
      <div class="comment-body">
        <div class="comment-head"><b>${escapeHtml(displayNameOf(c.user))}</b>
          <span class="stars">${"★".repeat(c.stars || 0)}${"☆".repeat(5 - (c.stars || 0))}</span>
          <span class="comment-time">${escapeHtml(c.time)}</span>
        </div>
        <div class="comment-text">${escapeHtml(c.text)}</div>
      </div>
    </div>`).join("");

  const related = resources
    .filter(x => x.id !== r.id && x.type === r.type && (x.shared || isOwner(x)))
    .sort((a, b) => (ratingAvg(b) || 0) - (ratingAvg(a) || 0))
    .slice(0, 4);

  wrap.innerHTML = `
    <button class="btn btn-sm detail-back" id="detailBackBtn">← 返回</button>
    <div class="detail-card">
      <div class="detail-top">
        <span class="type-badge">${escapeHtml(r.type)}</span>
        ${shareFlag}${mineTag}
      </div>
      <h2 class="detail-title">${escapeHtml(r.name)}</h2>
      <div class="detail-meta">
        ${avatarHtml(r.uploader)}
        <span><b>${escapeHtml(displayNameOf(r.uploader))}</b> 上传</span>
        <span>·</span><span>${escapeHtml(r.date)}</span>
        <span>·</span><span>大小 ${escapeHtml(r.size || "—")}</span>
        <span>·</span><span>⬇ 已被下载 ${r.downloads || 0} 次</span>
        ${avg ? `<span class="rating-badge">⭐ ${avg.toFixed(1)} · ${(r.comments || []).length} 条评价</span>` : `<span class="rating-badge dim">暂无评分</span>`}
      </div>
      ${tags ? `<div class="card-tags detail-tags">${tags}</div>` : ""}
      <div class="detail-desc">${escapeHtml(r.desc)}</div>

      <h3 class="detail-section-title">文件预览</h3>
      <div class="preview-box">${previewHtml(r)}</div>

      <div class="detail-actions">${dlBtn}${favBtn}${copyBtn}${toggleBtn}${editBtn}${reportBtn}${delBtn}</div>
    </div>

    <h3 class="detail-section-title">评论与评分（${(r.comments || []).length}）</h3>
    <div class="panel comment-panel">
      <form class="comment-form" id="commentForm">
        <div class="star-input" id="starInput">
          <span>我的评分：</span>
          ${[1,2,3,4,5].map(i => `<button type="button" class="star${i <= ratingInput ? " on" : ""}" data-star="${i}">★</button>`).join("")}
        </div>
        <div class="comment-row">
          <textarea id="commentText" rows="2" placeholder="写下你的评价…"></textarea>
          <button type="submit" class="btn btn-primary">发表评论</button>
        </div>
      </form>
      <div class="comment-list">${comments || `<div class="hint">还没有评论，来抢沙发～</div>`}</div>
    </div>

    ${related.length ? `<h3 class="detail-section-title">相关推荐（${escapeHtml(r.type)}）</h3>
      <div class="grid" style="padding:0">${related.map(cardHtml).join("")}</div>` : ""}
  `;

  const back = document.getElementById("detailBackBtn");
  if (back) back.addEventListener("click", () => switchView(lastView || "plaza"));

  const si = document.getElementById("starInput");
  if (si) si.querySelectorAll("[data-star]").forEach(b => b.addEventListener("click", () => {
    ratingInput = +b.dataset.star;
    si.querySelectorAll("[data-star]").forEach(x => x.classList.toggle("on", +x.dataset.star <= ratingInput));
  }));
  const cf = document.getElementById("commentForm");
  if (cf) cf.addEventListener("submit", e => {
    e.preventDefault();
    const text = (document.getElementById("commentText").value || "").trim();
    if (!text) { toast("请输入评论内容", "error"); return; }
    if (!currentUser) { toast("请先登录", "error"); return; }
    r.comments = r.comments || [];
    r.comments.push({ id: genId(), user: currentUser.name, stars: ratingInput, text, time: nowStr() });
    saveResources();
    renderAll();
    toast("评论已发表", "success");
  });
}

/* ---------- 排行榜 ---------- */
function renderRank() {
  const box = document.getElementById("rankList");
  const empty = document.getElementById("rankEmpty");
  const shared = resources.filter(r => r.shared);
  let rows = [];

  if (rankMode === "users") {
    const map = {};
    shared.forEach(r => {
      const u = r.uploader;
      map[u] = map[u] || { uploads: 0, downloads: 0, rating: [] };
      map[u].uploads += 1;
      map[u].downloads += (r.downloads || 0);
      const a = ratingAvg(r); if (a) map[u].rating.push(a);
    });
    rows = Object.entries(map).sort((a, b) => b[1].downloads - a[1].downloads).slice(0, 10)
      .map(([name, s], i) => `
        <div class="rank-row">
          <span class="rank-num ${topCls(i)}">${i + 1}</span>
          ${avatarHtml(name)}
          <div class="rank-main">
            <div class="rank-name">${escapeHtml(displayNameOf(name))}</div>
            <div class="rank-sub">上传 ${s.uploads} 个资源${s.rating.length ? " · ⭐ " + (s.rating.reduce((a,b)=>a+b,0)/s.rating.length).toFixed(1) : ""}</div>
          </div>
          <span class="rank-score">⬇ ${s.downloads}</span>
        </div>`);
  } else {
    const list = [...shared].sort((a, b) =>
      rankMode === "downloads" ? (b.downloads || 0) - (a.downloads || 0)
      : rankMode === "rating" ? (ratingAvg(b) || 0) - (ratingAvg(a) || 0) || (b.comments || []).length - (a.comments || []).length
      : (b.date || "").localeCompare(a.date || "")
    ).slice(0, 10);
    rows = list.map((r, i) => `
      <div class="rank-row" data-open="${r.id}">
        <span class="rank-num ${topCls(i)}">${i + 1}</span>
        <span class="type-badge">${escapeHtml(r.type)}</span>
        <div class="rank-main">
          <div class="rank-name">${escapeHtml(r.name)}</div>
          <div class="rank-sub">${escapeHtml(displayNameOf(r.uploader))} · ${escapeHtml(r.date)}</div>
        </div>
        <span class="rank-score">${rankMode === "downloads" ? "⬇ " + (r.downloads || 0)
          : rankMode === "rating" ? (ratingAvg(r) ? "⭐ " + ratingAvg(r).toFixed(1) : "暂无评分")
          : "🆕 " + escapeHtml(r.date)}</span>
      </div>`);
  }

  if (!rows.length) { box.innerHTML = ""; empty.hidden = false; return; }
  empty.hidden = true;
  box.innerHTML = rows.join("");
}
function topCls(i) { return i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : ""; }

/* ---------- 帮助中心 ---------- */
const FAQS = [
  { q: "如何上传资源？", a: "点击顶部「＋上传资源」，填写名称、类型、标签、描述并选择文件即可。上传后可在「我的资源」中查看和管理。" },
  { q: "「公开分享」和「未分享」有什么区别？", a: "公开分享的资源会出现在资源广场，所有用户都可查看和下载；未分享的资源仅自己可见。可随时用「🌍/🙈」按钮切换。" },
  { q: "标签怎么用？", a: "上传或编辑时可填标签（如 前端、4K），点击任意标签会聚合搜索包含该标签的全部资源，方便按主题浏览。" },
  { q: "可以修改已上传的资源吗？", a: "可以。在自己资源的卡片或详情页点击「✏️ 编辑」，可修改名称、类型、标签、描述和分享状态。" },
  { q: "收藏和下载记录在哪里看？", a: "收藏其他人的资源后，在「我的资源 → ⭐ 收藏」查看；「⬇ 我下载过的」「👀 我看过的」两块记录就在「我的资源」页面底部。" },
  { q: "如何举报违规资源？", a: "在他人资源的卡片或详情页点击「⚠️ 举报」，选择原因并提交。管理员登录管理后台后即可处理。" },
  { q: "排行榜的数据怎么来的？", a: "基于公开资源实时统计：下载榜按下载次数、高分榜按评论平均星级、最新榜按上传时间、活跃用户榜按用户资源被下载总量。" },
  { q: "我的数据保存在哪里？", a: "纯前端 Mock，所有数据（账号、资源、评论、收藏、举报）保存在浏览器 localStorage，不会上传到服务器；清除站点数据即可重置。" }
];
function renderFaq() {
  document.getElementById("faqList").innerHTML = FAQS.map((f, i) => `
    <div class="faq-item${i === 0 ? " open" : ""}">
      <button class="faq-q" type="button">${escapeHtml(f.q)}<span class="arrow">›</span></button>
      <div class="faq-a">${escapeHtml(f.a)}</div>
    </div>`).join("");
}

/* ---------- 通知 ---------- */
const NOTIF_ICONS = { system: "📢", download: "⬇️", share: "🌍", comment: "💬", report: "⚠️" };
function updateNotifBadge() {
  const badge = document.getElementById("notifBadge");
  if (!currentUser) { badge.hidden = true; return; }
  const unread = notifications.filter(n => n.to === currentUser.name && !n.read).length;
  badge.hidden = unread === 0;
  badge.textContent = unread > 99 ? "99+" : unread;
}
function renderNotifs() {
  const box = document.getElementById("notifList");
  const empty = document.getElementById("notifEmpty");
  updateNotifBadge();
  if (!currentUser) { box.innerHTML = ""; empty.hidden = false; return; }
  const list = notifications.filter(n => n.to === currentUser.name).sort((a, b) => b.time.localeCompare(a.time));
  if (!list.length) { box.innerHTML = ""; empty.hidden = false; return; }
  empty.hidden = true;
  box.innerHTML = list.map(n => `
    <div class="notif-item${n.read ? "" : " unread"}" data-notif="${n.id}">
      <span class="notif-icon">${NOTIF_ICONS[n.type] || "📢"}</span>
      <div class="notif-body">
        <div class="notif-text">${escapeHtml(n.text)}</div>
        <div class="notif-time">${escapeHtml(n.time)}</div>
      </div>
      ${n.read ? "" : `<span class="unread-dot"></span>`}
    </div>`).join("");
}
function pushNotif(type, text, resourceId) {
  if (!currentUser) return;
  notifications.push({ id: genId(), to: currentUser.name, type, text, resourceId, time: nowStr(), read: false });
  lsSet(K.notif, notifications);
}
function seedNotifsFor(user) {
  if (notifications.some(n => n.to === user.name)) return;
  const t = nowStr();
  notifications.push(
    { id: genId(), to: user.name, type: "system", time: t, read: false, text: `欢迎加入资源共享平台，${user.name}！点击右上角「＋上传资源」分享你的第一个资源。` },
    { id: genId(), to: user.name, type: "system", time: t, read: false, text: "小提示：只有「公开分享」的资源才会出现在资源广场，供其他用户下载。" }
  );
  lsSet(K.notif, notifications);
}
function maybeSimulateDownloadNotif() {
  if (!currentUser) return;
  const shared = resources.filter(r => isOwner(r) && r.shared);
  if (!shared.length || Math.random() > 0.5) return;
  const r = shared[Math.floor(Math.random() * shared.length)];
  const who = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
  r.downloads = (r.downloads || 0) + 1;
  saveResources();
  notifications.push({ id: genId(), to: currentUser.name, type: "download",
    text: `用户「${who}」下载了你的资源「${r.name}」`, resourceId: r.id, time: nowStr(), read: false });
  lsSet(K.notif, notifications);
}

/* ---------- 管理后台 ---------- */
function renderAdmin() {
  const nav = document.getElementById("adminNavLink");
  nav.hidden = !isStaff();
  if (!currentUser) return;
  if (!isStaff()) {
    document.getElementById("panelReports").hidden = true;
    document.getElementById("panelUsers").hidden = true;
    document.getElementById("panelLogs").hidden = true;
    document.getElementById("adminDenied").hidden = false;
    return;
  }
  document.getElementById("adminDenied").hidden = true;
  document.getElementById("panelReports").hidden = !hasPerm("report:handle");
  document.getElementById("panelUsers").hidden = !hasPerm("user:manage");
  document.getElementById("panelLogs").hidden = !hasPerm("log:view");

  renderUserPanel();
  renderLogPanel();

  const pending = reports.filter(r => r.status === "pending");
  const handled = reports.filter(r => r.status === "handled");
  document.getElementById("adUsers").textContent = loadUsers().length;
  document.getElementById("adResources").textContent = resources.length;
  document.getElementById("adReports").textContent = pending.length;
  document.getElementById("adHandled").textContent = handled.length;

  const box = document.getElementById("reportList");
  const empty = document.getElementById("reportEmpty");
  if (!pending.length) { box.innerHTML = ""; empty.hidden = false; return; }
  empty.hidden = true;
  box.innerHTML = pending.map(rp => {
    const r = resources.find(x => x.id === rp.resourceId);
    return `<div class="report-item">
      <div class="report-main">
        <div class="report-title">⚠️ ${escapeHtml(rp.resourceName || (r ? r.name : "（资源已删除）"))}</div>
        <div class="report-sub">举报人：${escapeHtml(displayNameOf(rp.from))} · 原因：${escapeHtml(rp.reason)} · ${escapeHtml(rp.time)}</div>
        ${rp.detail ? `<div class="report-detail">${escapeHtml(rp.detail)}</div>` : ""}
      </div>
      <div class="report-actions">
        ${r ? `<button class="btn btn-sm" data-act="report-open" data-id="${r.id}">查看</button>` : ""}
        <button class="btn btn-sm" data-act="report-ignore" data-report="${rp.id}">忽略</button>
        ${r ? `<button class="btn btn-sm" data-act="report-delete" data-report="${rp.id}" style="color:var(--red)">删除资源</button>` : ""}
      </div>
    </div>`;
  }).join("");
}

// 用户管理（仅系统管理员）
function renderUserPanel() {
  if (!hasPerm("user:manage")) return;
  const users = loadUsers();
  document.getElementById("userList").innerHTML = users.map(u => `
    <div class="report-item">
      ${avatarHtml(u.name)}
      <div class="report-main">
        <div class="report-title">${escapeHtml(displayNameOf(u.name))}
          <span class="role-badge role-${u.role || "user"}">${escapeHtml((ROLES[u.role || "user"] || ROLES.user).name)}</span>
          ${u.status === 0 ? `<span class="role-badge banned">已禁用</span>` : ""}
        </div>
        <div class="report-sub">登录名：${escapeHtml(u.name)} · 注册 ${escapeHtml(u.joined || "—")} · 资源 ${resources.filter(r => r.uploader === u.name).length} 个</div>
      </div>
      <div class="report-actions">
        <select class="role-select" data-user="${escapeHtml(u.name)}">
          ${Object.keys(ROLES).map(code =>
            `<option value="${code}" ${(u.role || "user") === code ? "selected" : ""}>${escapeHtml(ROLES[code].name)}</option>`).join("")}
        </select>
        <button class="btn btn-sm" data-act="toggle-user" data-user="${escapeHtml(u.name)}">${u.status === 0 ? "启用" : "禁用"}</button>
      </div>
    </div>`).join("");
}

// 运维日志（运维 + 系统管理员）
function renderLogPanel() {
  if (!hasPerm("log:view")) return;
  const box = document.getElementById("logList");
  const empty = document.getElementById("logEmpty");
  if (!opLogs.length) { box.innerHTML = ""; empty.hidden = false; return; }
  empty.hidden = true;
  box.innerHTML = opLogs.slice(0, 50).map(l => `
    <div class="log-item">
      <span class="log-time">${escapeHtml(l.time)}</span>
      <span class="log-user">${escapeHtml(displayNameOf(l.user))}</span>
      <span class="role-badge role-${escapeHtml(l.role)}">${escapeHtml((ROLES[l.role] || ROLES.user).name)}</span>
      <span class="log-action">${escapeHtml(l.action)}</span>
      <span class="log-detail">${escapeHtml(l.detail)}</span>
    </div>`).join("");
}

/* ---------- 渲染汇总 / 视图切换 ---------- */
const VIEW_IDS = ["plaza", "mine", "search", "detail", "rank", "help", "notif", "admin"];
let lastView = "plaza";
function switchView(view) {
  if (activeView !== view && activeView !== "search") lastView = activeView;
  activeView = view;
  document.querySelectorAll(".nav-link").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  VIEW_IDS.forEach(v => {
    const el = document.getElementById("view-" + v);
    if (el) el.hidden = v !== view;
  });
  if (view !== "detail" && location.hash.indexOf("#/resource/") === 0) {
    try { history.replaceState(null, "", location.pathname); } catch (e) {}
  }
  if (view === "notif") maybeSimulateDownloadNotif();
  renderAll();
}
function renderAll() {
  renderPlaza(); renderMine(); renderSearch(); renderRank();
  renderNotifs(); renderAccount(); renderAdmin();
  if (activeView === "detail") renderDetail();
}

/* ---------- 全局事件 ---------- */
document.querySelectorAll(".nav-link").forEach(btn => btn.addEventListener("click", () => {
  keyword = ""; document.getElementById("searchInput").value = "";
  switchView(btn.dataset.view);
}));
document.querySelectorAll(".footer-link").forEach(btn => btn.addEventListener("click", () => {
  keyword = ""; document.getElementById("searchInput").value = "";
  switchView(btn.dataset.goto);
}));

document.addEventListener("click", e => {
  // 批量选择框
  const chk = e.target.closest("[data-batch]");
  if (chk) {
    const id = chk.dataset.batch;
    if (chk.checked) selectedIds.add(id); else selectedIds.delete(id);
    renderMine(); return;
  }
  // 操作按钮
  const btn = e.target.closest("button[data-act]");
  if (btn) {
    const id = btn.dataset.id;
    const act = btn.dataset.act;
    if (act === "copylink") { const r = resources.find(x => x.id === id); if (r) handleCopyLink(r); return; }
    if (act === "report-open") { openDetail(id); return; }
    if (act === "report-ignore") {
      const rp = reports.find(x => x.id === btn.dataset.report);
      if (rp) { rp.status = "handled"; lsSet(K.rep, reports); renderAdmin(); toast("已忽略该举报"); }
      return;
    }
    if (act === "report-delete") {
      const rp = reports.find(x => x.id === btn.dataset.report);
      if (rp && confirm("确定删除被举报的资源吗？")) {
        resources = resources.filter(x => x.id !== rp.resourceId);
        rp.status = "handled";
        saveResources(); lsSet(K.rep, reports);
        renderAll(); toast("资源已删除", "error");
      }
      return;
    }
    if (act === "toggle-user") {
      const users = loadUsers();
      const u = users.find(x => x.name === btn.dataset.user);
      if (!u) return;
      if (u.name === currentUser.name) { toast("不能禁用自己的账号", "error"); return; }
      u.status = u.status === 0 ? 1 : 0;
      saveUsers(users);
      pushLog(u.status === 0 ? "禁用账号" : "启用账号", `账号 ${u.name}`);
      renderAdmin();
      toast(u.status === 0 ? "已禁用该账号" : "已启用该账号", "success");
      return;
    }
    const r = resources.find(x => x.id === id);
    if (!r) return;
    if (act === "download") handleDownload(r);
    else if (act === "toggle") handleToggle(r);
    else if (act === "delete") handleDelete(r);
    else if (act === "fav") handleFav(r);
    else if (act === "edit") openEdit(r);
    else if (act === "report") openReport(r);
    return;
  }
  // 标签聚合
  const tagBtn = e.target.closest("[data-tag]");
  if (tagBtn) {
    const t = tagBtn.dataset.tag;
    keyword = t;
    document.getElementById("searchInput").value = t;
    switchView("search");
    return;
  }
  // 打开详情
  const opener = e.target.closest("[data-open]");
  if (opener && !e.target.closest("button")) openDetail(opener.dataset.open);
});

/* ---------- 行为 ---------- */
function handleDownload(r) {
  r.downloads = (r.downloads || 0) + 1;
  saveResources();
  pushHistory("downloads", r.id);
  pushLog("下载资源", `「${r.name}」`);
  const content = `资源名称：${r.name}\n类型：${r.type}\n描述：${r.desc}\n上传者：${r.uploader}\n日期：${r.date}\n\n（这是前端 Mock 环境生成的模拟下载文件。）`;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = r.name + ".txt";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  renderAll();
  toast(`已开始下载「${r.name}」`, "success");
}
function handleToggle(r) {
  r.shared = !r.shared;
  saveResources();
  pushLog(r.shared ? "公开分享" : "设为私有", `「${r.name}」`);
  pushNotif("share", r.shared ? `你已将资源「${r.name}」设为公开分享。` : `你已将资源「${r.name}」设为私有。`, r.id);
  renderAll();
  toast(r.shared ? "已公开分享，广场可见" : "已设为私有，仅自己可见", r.shared ? "success" : "");
}
function handleDelete(r) {
  if (!confirm(`确定删除资源「${r.name}」吗？此操作不可恢复。`)) return;
  resources = resources.filter(x => x.id !== r.id);
  // 清理收藏 / 历史 / 选中
  Object.keys(favorites).forEach(u => { favorites[u] = favorites[u].filter(id => id !== r.id); });
  Object.keys(history).forEach(u => {
    history[u].downloads = history[u].downloads.filter(x => x.id !== r.id);
    history[u].views = history[u].views.filter(x => x.id !== r.id);
  });
  selectedIds.delete(r.id);
  lsSet(K.fav, favorites); lsSet(K.hist, history);
  saveResources();
  pushLog("删除资源", `「${r.name}」`);
  if (currentDetailId === r.id) { currentDetailId = null; switchView(lastView); }
  else renderAll();
  toast("资源已删除", "error");
}
function handleFav(r) {
  if (!currentUser) { toast("请先登录", "error"); return; }
  const list = favList().slice();
  const i = list.indexOf(r.id);
  if (i >= 0) { list.splice(i, 1); toast("已取消收藏"); } else { list.push(r.id); toast("已加入收藏", "success"); }
  favorites[currentUser.name] = list;
  lsSet(K.fav, favorites);
  renderAll();
}
function handleCopyLink(r) {
  const url = location.origin + location.pathname + "#/resource/" + r.id;
  const done = () => toast("链接已复制，粘贴即可打开该资源", "success");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(done).catch(fallback);
  } else fallback();
  function fallback() {
    const ta = document.createElement("textarea");
    ta.value = url; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { toast("复制失败，请手动复制：" + url, "error"); }
    ta.remove();
  }
}

/* ---------- 批量操作 ---------- */
document.getElementById("batchBtn").addEventListener("click", () => {
  batchMode = !batchMode;
  selectedIds.clear();
  renderMine();
});
document.getElementById("batchExit").addEventListener("click", () => { batchMode = false; selectedIds.clear(); renderMine(); });
document.getElementById("batchSelectAll").addEventListener("click", () => {
  resources.filter(r => isOwner(r)).forEach(r => selectedIds.add(r.id));
  renderMine();
});
document.getElementById("batchShare").addEventListener("click", () => batchShare(true));
document.getElementById("batchUnshare").addEventListener("click", () => batchShare(false));
function batchShare(v) {
  if (!selectedIds.size) { toast("请先选择资源", "error"); return; }
  resources.forEach(r => { if (selectedIds.has(r.id) && isOwner(r)) r.shared = v; });
  saveResources(); renderAll();
  toast(`已批量${v ? "公开" : "设为私有"} ${selectedIds.size} 个资源`, "success");
}
document.getElementById("batchDelete").addEventListener("click", () => {
  if (!selectedIds.size) { toast("请先选择资源", "error"); return; }
  if (!confirm(`确定删除选中的 ${selectedIds.size} 个资源吗？此操作不可恢复。`)) return;
  resources = resources.filter(r => !(selectedIds.has(r.id) && isOwner(r)));
  Object.keys(favorites).forEach(u => { favorites[u] = favorites[u].filter(id => !selectedIds.has(id)); });
  Object.keys(history).forEach(u => {
    history[u].downloads = history[u].downloads.filter(x => !selectedIds.has(x.id));
    history[u].views = history[u].views.filter(x => !selectedIds.has(x.id));
  });
  lsSet(K.fav, favorites); lsSet(K.hist, history);
  saveResources();
  selectedIds.clear();
  renderAll();
  toast("批量删除完成", "error");
});

/* ---------- 上传 / 编辑弹窗 ---------- */
const uploadModal = document.getElementById("uploadModal");
const uploadForm = document.getElementById("uploadForm");
const editModal = document.getElementById("editModal");
const editForm = document.getElementById("editForm");

document.getElementById("uploadBtn").addEventListener("click", () => {
  if (!currentUser) { openAuth(); toast("请先登录", "error"); return; }
  uploadModal.hidden = false;
});
document.getElementById("closeUpload").addEventListener("click", () => { uploadModal.hidden = true; uploadForm.reset(); });
document.getElementById("cancelUpload").addEventListener("click", () => { uploadModal.hidden = true; uploadForm.reset(); });
uploadModal.addEventListener("click", e => { if (e.target === uploadModal) { uploadModal.hidden = true; uploadForm.reset(); } });

uploadForm.addEventListener("submit", e => {
  e.preventDefault();
  const fd = new FormData(uploadForm);
  const name = (fd.get("name") || "").toString().trim();
  const file = fd.get("file");
  if (!name) { toast("请填写资源名称", "error"); return; }
  if (!file || !file.name) { toast("请选择要上传的文件", "error"); return; }
  const sizeStr = file.size > 0
    ? (file.size / 1024 / 1024 >= 1 ? (file.size / 1024 / 1024).toFixed(1) + " MB" : (file.size / 1024).toFixed(0) + " KB") : "—";
  resources.unshift({
    id: genId(), name, type: fd.get("type"),
    tags: parseTags(fd.get("tags")),
    desc: (fd.get("desc") || "").toString().trim() || "（暂无描述）",
    uploader: currentUser.name,
    date: new Date().toISOString().slice(0, 10),
    shared: fd.get("shared") === "on",
    mine: true, size: sizeStr, downloads: 0, comments: []
  });
  saveResources();
  pushLog("上传资源", `「${name}」`);
  uploadModal.hidden = true; uploadForm.reset();
  mineFilter = "all";
  document.querySelectorAll("#mineTabs .tab").forEach(t => t.classList.toggle("active", t.dataset.filter === "all"));
  switchView("mine");
  toast(`「${name}」上传成功`, "success");
});

function openEdit(r) {
  editingId = r.id;
  // 注意：必须用 elements 访问，form.name 会被 HTMLFormElement 自身的 name 属性遮蔽
  editForm.elements.name.value = r.name;
  editForm.elements.type.value = r.type;
  editForm.elements.tags.value = (r.tags || []).join(" ");
  editForm.elements.desc.value = r.desc || "";
  editForm.elements.shared.checked = !!r.shared;
  editModal.hidden = false;
}
document.getElementById("closeEdit").addEventListener("click", () => { editModal.hidden = true; });
document.getElementById("cancelEdit").addEventListener("click", () => { editModal.hidden = true; });
editModal.addEventListener("click", e => { if (e.target === editModal) editModal.hidden = true; });
editForm.addEventListener("submit", e => {
  e.preventDefault();
  const r = resources.find(x => x.id === editingId);
  if (!r) { editModal.hidden = true; return; }
  const name = (editForm.elements.name.value || "").trim();
  if (!name) { toast("请填写资源名称", "error"); return; }
  r.name = name;
  r.type = editForm.elements.type.value;
  r.tags = parseTags(editForm.elements.tags.value);
  r.desc = (editForm.elements.desc.value || "").trim() || "（暂无描述）";
  r.shared = editForm.elements.shared.checked;
  saveResources();
  pushLog("编辑资源", `「${r.name}」`);
  editModal.hidden = true;
  renderAll();
  toast("修改已保存", "success");
});

/* ---------- 举报弹窗 ---------- */
const reportModal = document.getElementById("reportModal");
const reportForm = document.getElementById("reportForm");
function openReport(r) {
  reportingId = r.id;
  document.getElementById("reportTarget").textContent = `被举报资源：${r.name}（上传者：${displayNameOf(r.uploader)}）`;
  reportForm.detail.value = "";
  reportModal.hidden = false;
}
document.getElementById("closeReport").addEventListener("click", () => { reportModal.hidden = true; });
document.getElementById("cancelReport").addEventListener("click", () => { reportModal.hidden = true; });
reportModal.addEventListener("click", e => { if (e.target === reportModal) reportModal.hidden = true; });
reportForm.addEventListener("submit", e => {
  e.preventDefault();
  const r = resources.find(x => x.id === reportingId);
  if (!r) { reportModal.hidden = true; return; }
  if (!currentUser) { toast("请先登录", "error"); return; }
  reports.unshift({
    id: genId(), resourceId: r.id, resourceName: r.name,
    from: currentUser.name, reason: reportForm.elements.reason.value,
    detail: (reportForm.elements.detail.value || "").trim(), time: nowStr(), status: "pending"
  });
  lsSet(K.rep, reports);
  pushLog("提交举报", `资源「${r.name}」，原因：${reportForm.elements.reason.value}`);
  reportModal.hidden = true;
  toast("举报已提交，等待管理员处理", "success");
});

/* ---------- 修改资料弹窗 ---------- */
const profileModal = document.getElementById("profileModal");
const profileForm = document.getElementById("profileForm");
let pickedAvatar = "";

document.getElementById("profileBtn").addEventListener("click", () => {
  if (!currentUser) { toast("请先登录", "error"); return; }
  const p = getProfile(currentUser.name);
  pickedAvatar = p.avatar || presetAvatar(currentUser.name);
  profileForm.elements.displayName.value = p.displayName || "";
  profileForm.elements.oldpwd.value = "";
  profileForm.elements.newpwd.value = "";
  renderAvatarPick();
  profileModal.hidden = false;
});
function renderAvatarPick() {
  document.getElementById("avatarPick").innerHTML = AVATAR_PRESETS.map(u =>
    `<button type="button" class="${u === pickedAvatar ? "on" : ""}" data-avatar="${escapeHtml(u)}">
       <img src="${escapeHtml(u)}" alt="头像">
     </button>`).join("");
}
document.getElementById("avatarPick").addEventListener("click", e => {
  const b = e.target.closest("[data-avatar]"); if (!b) return;
  pickedAvatar = b.dataset.avatar; renderAvatarPick();
});
document.getElementById("closeProfile").addEventListener("click", () => { profileModal.hidden = true; });
document.getElementById("cancelProfile").addEventListener("click", () => { profileModal.hidden = true; });
profileModal.addEventListener("click", e => { if (e.target === profileModal) profileModal.hidden = true; });
profileForm.addEventListener("submit", e => {
  e.preventDefault();
  if (!currentUser) return;
  const users = loadUsers();
  const me = users.find(u => u.name === currentUser.name);
  const oldp = (profileForm.elements.oldpwd.value || "");
  const newp = (profileForm.elements.newpwd.value || "");
  if (newp) {
    if (!me || me.password !== oldp) { toast("当前密码不正确", "error"); return; }
    if (newp.length < 4) { toast("新密码至少 4 位", "error"); return; }
    me.password = newp;
    saveUsers(users);
  }
  profiles[currentUser.name] = {
    displayName: (profileForm.elements.displayName.value || "").trim(),
    avatar: pickedAvatar
  };
  lsSet(K.prof, profiles);
  pushLog("修改资料", `${currentUser.name} 更新了个人资料`);
  profileModal.hidden = true;
  refreshAuthUI();
  renderAll();
  toast("资料已更新", "success");
});

/* ---------- 搜索 / 筛选 ---------- */
document.getElementById("plazaTabs").addEventListener("click", e => {
  const tab = e.target.closest(".tab"); if (!tab) return;
  document.querySelectorAll("#plazaTabs .tab").forEach(t => t.classList.remove("active"));
  tab.classList.add("active"); plazaFilter = tab.dataset.filter; renderPlaza();
});
document.getElementById("mineTabs").addEventListener("click", e => {
  const tab = e.target.closest(".tab"); if (!tab) return;
  document.querySelectorAll("#mineTabs .tab").forEach(t => t.classList.remove("active"));
  tab.classList.add("active"); mineFilter = tab.dataset.filter; batchMode = false; selectedIds.clear(); renderMine();
});
document.getElementById("rankTabs").addEventListener("click", e => {
  const tab = e.target.closest(".tab"); if (!tab) return;
  document.querySelectorAll("#rankTabs .tab").forEach(t => t.classList.remove("active"));
  tab.classList.add("active"); rankMode = tab.dataset.rank; renderRank();
});
document.getElementById("faqList").addEventListener("click", e => {
  const q = e.target.closest(".faq-q"); if (!q) return;
  q.parentElement.classList.toggle("open");
});
document.getElementById("searchInput").addEventListener("input", e => {
  keyword = e.target.value.trim();
  if (keyword) { if (activeView !== "search") lastView = activeView; switchView("search"); }
  else if (activeView === "search") switchView(lastView);
});
document.getElementById("backBtn").addEventListener("click", () => {
  keyword = ""; document.getElementById("searchInput").value = ""; switchView(lastView);
});
document.getElementById("clearSearchBtn").addEventListener("click", () => {
  const input = document.getElementById("searchInput");
  input.value = ""; keyword = ""; switchView(lastView); input.focus();
});
// 用户角色下拉（系统管理员）
document.getElementById("userList").addEventListener("change", e => {
  const sel = e.target.closest(".role-select"); if (!sel) return;
  const users = loadUsers();
  const u = users.find(x => x.name === sel.dataset.user);
  if (!u) return;
  if (u.name === currentUser.name) { toast("不能修改自己的角色", "error"); renderAdmin(); return; }
  u.role = sel.value;
  saveUsers(users);
  pushLog("修改角色", `将 ${u.name} 的角色改为 ${ROLES[sel.value].name}`);
  renderAdmin();
  toast("角色已更新", "success");
});

document.getElementById("notifBtn").addEventListener("click", () => switchView("notif"));
document.getElementById("readAllBtn").addEventListener("click", () => {
  notifications.filter(n => currentUser && n.to === currentUser.name).forEach(n => { n.read = true; });
  lsSet(K.notif, notifications); renderNotifs(); toast("已全部标记为已读", "success");
});
document.getElementById("notifList").addEventListener("click", e => {
  const item = e.target.closest(".notif-item"); if (!item) return;
  const n = notifications.find(x => x.id === item.dataset.notif); if (!n) return;
  n.read = true; lsSet(K.notif, notifications); renderNotifs();
  if (n.resourceId && resources.some(r => r.id === n.resourceId)) openDetail(n.resourceId);
});
document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (!uploadModal.hidden) { uploadModal.hidden = true; uploadForm.reset(); }
  else if (!editModal.hidden) editModal.hidden = true;
  else if (!reportModal.hidden) reportModal.hidden = true;
  else if (!profileModal.hidden) profileModal.hidden = true;
});

/* ---------- 登录 / 注册 ---------- */
const authModal = document.getElementById("authModal");
const authForm = document.getElementById("authForm");
const authError = document.getElementById("authError");
const authSubmit = document.getElementById("authSubmit");
let authMode = "login";

function refreshAuthUI() {
  if (currentUser) {
    authModal.hidden = true;
    document.getElementById("userArea").hidden = false;
    document.getElementById("topUserName").textContent = displayNameOf(currentUser.name);
    document.getElementById("topAvatar").src = avatarOf(currentUser.name);
  } else {
    authModal.hidden = false;
    document.getElementById("userArea").hidden = true;
  }
  renderFooter(); renderAccount(); updateNotifBadge();
  const nav = document.getElementById("adminNavLink");
  nav.hidden = !isStaff();
  nav.textContent = "🛡 " + (hasPerm("user:manage") ? "管理后台" : hasPerm("log:view") ? "运维面板" : "内容审核");
}
function openAuth() { authModal.hidden = false; }

document.querySelectorAll(".auth-tab").forEach(tab => tab.addEventListener("click", () => {
  document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
  tab.classList.add("active");
  authMode = tab.dataset.auth;
  authSubmit.textContent = authMode === "login" ? "登录" : "注册";
  authError.textContent = "";
  authForm.querySelector('input[name=password]').setAttribute("autocomplete", authMode === "login" ? "current-password" : "new-password");
}));

authForm.addEventListener("submit", e => {
  e.preventDefault();
  const fd = new FormData(authForm);
  const username = (fd.get("username") || "").toString().trim();
  const password = (fd.get("password") || "").toString();
  if (!username || !password) { authError.textContent = "用户名和密码都不能为空"; return; }
  let users = loadUsers();
  if (authMode === "register") {
    if (users.some(u => u.name === username)) { authError.textContent = "该用户名已被注册，请直接登录"; return; }
    if (username === "admin") { authError.textContent = "该用户名为系统保留，无法注册"; return; }
    const joined = new Date().toISOString().slice(0, 10);
    users.push({ name: username, password, joined, role: "user", status: 1 });
    saveUsers(users);
    currentUser = { name: username, id: "u_" + username, joined, role: "user" };
    lsSet(K.user, currentUser);
    seedNotifsFor(currentUser);
    pushLog("注册", `新用户 ${username} 注册`);
    authError.textContent = ""; refreshAuthUI(); renderAll();
    toast(`注册成功，欢迎 ${username}！`, "success");
  } else {
    const u = users.find(x => x.name === username);
    if (!u || u.password !== password) { authError.textContent = "用户名或密码错误"; return; }
    if (u.status === 0) { authError.textContent = "该账号已被禁用，请联系管理员"; return; }
    currentUser = { name: username, id: "u_" + username, joined: u.joined || "—", role: u.role || "user" };
    lsSet(K.user, currentUser);
    seedNotifsFor(currentUser);
    pushLog("登录", `用户 ${username} 登录成功（角色：${roleName()}）`);
    authError.textContent = ""; refreshAuthUI(); renderAll();
    toast(`欢迎回来，${displayNameOf(username)}！`, "success");
  }
});

/* ---------- 退出 / 底部 ---------- */
function logout() {
  pushLog("退出登录", `${currentUser ? currentUser.name : ""}`);
  currentUser = null;
  localStorage.removeItem(K.user);
  refreshAuthUI();
  switchView("plaza");
  toast("已退出登录");
}
document.getElementById("logoutBtn").addEventListener("click", logout);
document.getElementById("acLogoutBtn").addEventListener("click", logout);

function renderFooter() {
  const el = document.getElementById("footerReg");
  if (currentUser) {
    el.innerHTML = `用户名：${escapeHtml(currentUser.name)}<br>昵称：${escapeHtml(displayNameOf(currentUser.name))}<br>注册时间：${escapeHtml(currentUser.joined || "—")}`;
  } else {
    el.innerHTML = "尚未登录，注册后即可上传与分享资源";
  }
}

/* ---------- 初始化 ---------- */
refreshAuthUI();
renderFaq();
renderAdmin();
switchView("plaza");
(function restoreHash() {
  const m = location.hash.match(/^#\/resource\/(.+)$/);
  if (m) openDetail(decodeURIComponent(m[1]));
})();
