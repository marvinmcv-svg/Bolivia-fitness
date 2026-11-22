/* Bolivia Fitness CRM · aplicación (router por hash, vistas, permisos por rol). */
(function () {
  "use strict";
  const D = window.CRMDB, C = window.CRMCHART, B = window.BFIT, T = window.CRMI18N;
  const t = T.t;
  D.load();
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const loc = () => (T.lang() === "en" ? "en-US" : "es-BO");
  const money = (n) => "Bs " + Number(n || 0).toLocaleString("es-BO", { maximumFractionDigits: 0 });
  const money2 = (n) => "Bs " + Number(n || 0).toLocaleString("es-BO", { maximumFractionDigits: 2 });
  const num = (n) => Number(n || 0).toLocaleString("es-BO");
  const pct = (n) => (n * 100).toFixed(1).replace(".", T.lang() === "en" ? "." : ",") + "%";
  const fdate = (d, o) => new Intl.DateTimeFormat(loc(), Object.assign({ timeZone: B.config.timezone, day: "numeric", month: "short" }, o || {})).format(new Date(d));
  const fdt = (d) => fdate(d, { hour: "2-digit", minute: "2-digit" });
  const short = (k) => fdate(k + "T12:00:00-04:00");
  const today = () => D.dayKey(Date.now());
  const wa = (phone, text) => "https://wa.me/" + String(phone).replace(/\D/g, "") + (text ? "?text=" + encodeURIComponent(text) : "");
  const P = (id) => D.product(id), BR = (id) => D.branch(id), ST = (id) => D.person(id), M = (id) => D.member(id);
  const pname = (id) => { const p = P(id); return p ? p.short : id; };
  const catName = (id) => t((B.categories.find((c) => c.id === id) || {}).name || id);

  /* ---------- sesión y permisos ---------- */
  const PERMS = {
    owner: ["dashboard", "pos", "sales", "members", "pipeline", "inventory", "transfers", "branches", "staff", "schedule", "campaigns", "tasks", "reports", "settings"],
    admin: ["dashboard", "pos", "sales", "members", "pipeline", "inventory", "transfers", "branches", "staff", "schedule", "campaigns", "tasks", "reports", "settings"],
    manager: ["dashboard", "pos", "sales", "members", "pipeline", "inventory", "transfers", "branches", "staff", "schedule", "campaigns", "tasks", "reports"],
    seller: ["dashboard", "pos", "sales", "members", "pipeline", "inventory", "tasks"],
    coach: ["dashboard", "pos", "sales", "members", "pipeline", "tasks"],
    warehouse: ["dashboard", "inventory", "transfers", "tasks"],
  };
  let ME = null;
  try { ME = ST(sessionStorage.getItem("bfcrm_user")); } catch (e) { /* sin sesión */ }
  const can = (mod) => ME && PERMS[ME.role].includes(mod);
  const global = () => ["owner", "admin"].includes(ME.role) || ME.role === "warehouse";
  const who = () => (ME ? ME.name : "—");

  const S = { branch: "all", period: "30d" };
  try { Object.assign(S, JSON.parse(sessionStorage.getItem("bfcrm_filters") || "{}")); } catch (e) { /* nada */ }
  const saveS = () => { try { sessionStorage.setItem("bfcrm_filters", JSON.stringify(S)); } catch (e) { /* nada */ } };
  const curBranch = () => (ME && !global() ? ME.branchId : S.branch);
  const filt = () => Object.assign({ branch: curBranch() }, D.range(S.period));

  /* ---------- íconos ---------- */
  const ic = (d) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + "</svg>";
  const I = {
    dashboard: ic('<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>'),
    pos: ic('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M7 20h10M12 16v4M7 9h4"/>'),
    sales: ic('<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>'),
    members: ic('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.5c2.4.2 4 1.8 4.5 4.5"/>'),
    pipeline: ic('<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/>'),
    inventory: ic('<path d="M3 8l9-5 9 5-9 5z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>'),
    transfers: ic('<path d="M4 8h13l-3-3M20 16H7l3 3"/>'),
    branches: ic('<path d="M4 10l1.5-6h13L20 10M4 10v10h16V10M4 10h16M10 20v-5h4v5"/>'),
    staff: ic('<circle cx="12" cy="7" r="3.5"/><path d="M5 21c.6-4 3.4-6.5 7-6.5s6.4 2.5 7 6.5"/>'),
    schedule: ic('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    campaigns: ic('<path d="M3 11v2a1 1 0 0 0 1 1h3l6 4V6L7 10H4a1 1 0 0 0-1 1zM17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12"/>'),
    tasks: ic('<path d="M9 6h11M9 12h11M9 18h11"/><path d="M3.5 6l1.5 1.5L7.5 5M3.5 12l1.5 1.5 2.5-2.5M3.5 18l1.5 1.5 2.5-2.5"/>'),
    reports: ic('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 17v-3M13 17v-5M16 17v-2"/>'),
    settings: ic('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'),
    search: ic('<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>'),
    sun: ic('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'),
    moon: ic('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
    menu: ic('<path d="M4 7h16M4 12h16M4 17h16"/>'),
    plus: ic('<path d="M12 5v14M5 12h14"/>'), wa: ic('<path d="M5 19l1.2-3.6A7.5 7.5 0 1 1 9 18.6z"/>'), out: ic('<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>'),
    alert: ic('<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>'), check: ic('<path d="M5 12.5l4.5 4.5L19 7"/>'), x: ic('<path d="M6 6l12 12M18 6L6 18"/>'),
    dl: ic('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  };
  const NAV = [["dashboard", "Panel"], ["pos", "Punto de venta"], ["sales", "Ventas"], ["members", "Clientes"], ["pipeline", "Oportunidades"], ["inventory", "Inventario"], ["transfers", "Transferencias"], ["branches", "Sucursales"], ["staff", "Personal"], ["schedule", "Turnos"], ["campaigns", "Campañas"], ["tasks", "Tareas"], ["reports", "Reportes"], ["settings", "Ajustes"]];
  const ROLE = { owner: "Dueño", admin: "Administración", manager: "Encargado de sucursal", seller: "Vendedor", coach: "Coach", warehouse: "Almacén" };
  const SEG = { vip: "VIP", frecuente: "Frecuente", nuevo: "Nuevo", riesgo: "En riesgo", inactivo: "Sin compras" };
  const TIER = { bronce: "Bronce", plata: "Plata", oro: "Oro", leon: "León" };
  const PAY = { qr: "QR", efectivo: "Efectivo", tarjeta: "Tarjeta", transferencia: "Transferencia" };
  const CH = { tienda: "Tienda", whatsapp: "WhatsApp", web: "Web", leonia: "LeonIA" };
  const SRC = { whatsapp: "WhatsApp", leonia: "LeonIA", instagram: "Instagram", tienda: "Tienda", web: "Web", tiktok: "TikTok" };
  const GOAL = { masa: "Ganar masa", definicion: "Definición", fuerza: "Fuerza", salud: "Salud", rendimiento: "Rendimiento", inicio: "Recién empieza" };
  const STAGE = { nuevo: "Nuevo", contactado: "Contactado", cotizado: "Cotizado", ganado: "Ganado", perdido: "Perdido" };
  const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  /* ---------- piezas de UI ---------- */
  const opt = (v, l, sel) => '<option value="' + esc(v) + '"' + (String(v) === String(sel) ? " selected" : "") + ">" + esc(l) + "</option>";
  const branchOpts = (sel, withAll) => (withAll ? opt("all", t("Todas las sucursales"), sel) : "") + D.db.branches.map((b) => opt(b.id, b.city === b.name ? b.name : b.city + " · " + b.name, sel)).join("");
  const bname = (id) => { const b = BR(id); return b ? (b.city === b.name ? b.name : b.city + " · " + b.name) : "—"; };
  const badge = (txt, k) => '<span class="badge badge--' + (k || "n") + '">' + esc(txt) + "</span>";
  const segBadge = (s) => badge(t(SEG[s]), { vip: "gold", frecuente: "ok", nuevo: "info", riesgo: "warn", inactivo: "n" }[s]);
  const tierBadge = (tr) => '<span class="tier tier--' + tr + '">' + esc(t(TIER[tr])) + "</span>";
  const delta = (d) => (d === 0 || !isFinite(d) ? "" : '<span class="delta ' + (d > 0 ? "up" : "down") + '">' + (d > 0 ? "▲ " : "▼ ") + pct(Math.abs(d)) + "</span>");
  const empty = (msg) => '<div class="empty">' + esc(msg) + "</div>";
  const card = (title, body, extra) => '<section class="card"><header class="card__h"><h2>' + esc(title) + "</h2>" + (extra || "") + "</header>" + body + "</section>";
  const initials = (n) => String(n).split(/\s+/).filter((w) => /^\p{L}/u.test(w)).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const avatar = (n) => '<span class="av" aria-hidden="true">' + esc(initials(n)) + "</span>";
  function download(name, text, type) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: type || "text/csv;charset=utf-8" })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  let toastT;
  function toast(msg) { const el = $("#toast"); el.textContent = msg; el.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("on"), 2600); }

  /* modal genérico: devuelve el form; onSave(FormData) → false para mantener abierto */
  function modal(title, body, onSave, o) {
    o = o || {};
    const dlg = $("#modal");
    dlg.innerHTML = '<form method="dialog" class="mdl' + (o.wide ? " mdl--wide" : "") + '"><header><h2>' + esc(title) + '</h2><button type="button" class="ib" data-close aria-label="' + esc(t("Cerrar")) + '">' + I.x + "</button></header><div class=\"mdl__b\">" + body + "</div>" +
      (onSave ? '<footer><button type="button" class="btn btn--ghost" data-close>' + esc(t("Cancelar")) + '</button><button class="btn" value="ok">' + esc(o.ok || t("Guardar")) + "</button></footer>" : "") + "</form>";
    const form = dlg.querySelector("form");
    dlg.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => dlg.close()));
    form.addEventListener("submit", (e) => { if (!onSave) return; e.preventDefault(); const r = onSave(new FormData(form), form); if (r !== false) { dlg.close(); } });
    dlg.showModal(); if (o.onOpen) o.onOpen(form);
    const f = form.querySelector("input:not([type=hidden]), select, textarea"); if (f && !o.noFocus) f.focus();
    return form;
  }
  const field = (lbl, html, cls) => '<label class="fld' + (cls ? " " + cls : "") + '"><span>' + esc(lbl) + "</span>" + html + "</label>";
  const inp = (name, val, o) => '<input name="' + name + '" value="' + esc(val == null ? "" : val) + '"' + (o || "") + ">";

  /* ---------- layout ---------- */
  function shell() {
    document.body.innerHTML =
      '<a class="skip" href="#view">' + esc(t("Saltar al contenido")) + "</a>" +
      '<aside class="side" id="side"><a class="brand" href="#/dashboard"><img src="../assets/img/logo.png" width="34" height="34" alt=""><span>Bolivia <b>Fitness</b><small>CRM</small></span></a><nav aria-label="CRM">' +
      NAV.filter(([k]) => can(k)).map(([k, l]) => '<a href="#/' + k + '" data-nav="' + k + '">' + I[k] + "<span>" + esc(t(l)) + "</span></a>").join("") +
      '</nav><div class="side__foot"><a href="../index.html" target="_blank" rel="noopener">' + esc(t("Ver tienda online")) + ' ↗</a></div></aside><div class="scrim" id="scrim"></div>' +
      '<div class="main"><header class="top"><button class="ib top__menu" id="menuBtn" aria-label="' + esc(t("Menú")) + '">' + I.menu + "</button>" +
      '<label class="gsearch">' + I.search + '<span class="vh">' + esc(t("Buscar")) + '</span><input id="gq" type="search" placeholder="' + esc(t("Buscar clientes, productos, ventas…")) + '" autocomplete="off"><div class="gres" id="gres" hidden></div></label>' +
      '<div class="top__f">' + (global() ? '<label><span class="vh">' + esc(t("Sucursal")) + '</span><select id="fBranch" class="sel">' + branchOpts(S.branch, true) + "</select></label>" : '<span class="pill">' + esc(bname(ME.branchId)) + "</span>") +
      '<label><span class="vh">' + esc(t("Período")) + '</span><select id="fPeriod" class="sel">' + [["today", "Hoy"], ["7d", "7 días"], ["30d", "30 días"], ["90d", "90 días"]].map(([v, l]) => opt(v, t(l), S.period)).join("") + "</select></label></div>" +
      '<div class="top__r"><button class="ib" id="themeBtn" aria-label="' + esc(t("Cambiar tema")) + '">' + I.sun + I.moon + '</button><button class="ib langb" id="langBtn" aria-label="' + esc(T.lang() === "en" ? "Cambiar a español" : "Switch to English") + '">' + (T.lang() === "en" ? "ES" : "EN") + "</button>" +
      '<div class="me">' + avatar(ME.name) + "<div><b>" + esc(ME.name) + "</b><small>" + esc(t(ROLE[ME.role])) + '</small></div><button class="ib" id="logout" aria-label="' + esc(t("Cerrar sesión")) + '">' + I.out + "</button></div></div></header>" +
      '<div class="demo">' + esc(t("Modo demostración: los clientes, ventas y stock son ficticios y se guardan solo en este navegador.")) + ' <a href="#/settings">' + esc(t("Más info")) + "</a></div>" +
      '<main id="view" tabindex="-1"></main></div><dialog id="modal"></dialog><div class="toast" id="toast" role="status" aria-live="polite"></div>';
    $("#menuBtn").addEventListener("click", () => document.body.classList.toggle("nav-open"));
    $("#scrim").addEventListener("click", () => document.body.classList.remove("nav-open"));
    if ($("#fBranch")) $("#fBranch").addEventListener("change", (e) => { S.branch = e.target.value; saveS(); route(); });
    $("#fPeriod").addEventListener("change", (e) => { S.period = e.target.value; saveS(); route(); });
    $("#themeBtn").addEventListener("click", () => { const n = document.documentElement.dataset.theme === "light" ? "dark" : "light"; document.documentElement.dataset.theme = n; try { localStorage.setItem("bf_theme", n); } catch (e) { /* nada */ } route(); });
    $("#langBtn").addEventListener("click", () => { T.set(T.lang() === "en" ? "es" : "en"); shell(); route(); });
    $("#logout").addEventListener("click", () => { try { sessionStorage.removeItem("bfcrm_user"); } catch (e) { /* nada */ } ME = null; login(); });
    // búsqueda global
    const gq = $("#gq"), gres = $("#gres");
    gq.addEventListener("input", () => {
      const q = norm(gq.value); if (q.length < 2) { gres.hidden = true; return; }
      const ms = D.db.members.filter((m) => norm(m.name + " " + m.phone).includes(q)).slice(0, 6);
      const ps = D.products().filter((p) => norm(p.short + " " + p.name + " " + p.brandName).includes(q)).slice(0, 5);
      const ss = D.db.sales.filter((s) => s.id.toLowerCase().includes(q)).slice(-4);
      gres.innerHTML = (ms.length ? "<h3>" + esc(t("Clientes")) + "</h3>" + ms.map((m) => '<a href="#/members/' + m.id + '">' + avatar(m.name) + esc(m.name) + "<small>" + esc(m.phone) + "</small></a>").join("") : "") +
        (ps.length ? "<h3>" + esc(t("Productos")) + "</h3>" + ps.map((p) => '<a href="#/inventory?q=' + encodeURIComponent(p.short) + '"><img src="../' + esc(p.img) + '" width="28" height="28" alt="">' + esc(p.short) + "<small>" + money(p.price) + "</small></a>").join("") : "") +
        (ss.length ? "<h3>" + esc(t("Ventas")) + "</h3>" + ss.map((s) => '<a href="#/sales?id=' + s.id + '">' + esc(s.id) + "<small>" + money(s.total) + "</small></a>").join("") : "") || '<p class="muted" style="padding:10px">' + esc(t("Sin resultados")) + "</p>";
      gres.hidden = false;
    });
    gq.addEventListener("blur", () => setTimeout(() => (gres.hidden = true), 200));
    gres.addEventListener("click", () => { gq.value = ""; gres.hidden = true; });
  }
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  /* ---------- login ---------- */
  function login() {
    document.body.className = "is-login";
    const groups = [["owner", "admin"], ["manager"], ["seller", "coach"], ["warehouse"]];
    document.body.innerHTML = '<main class="login"><div class="login__card"><img src="../assets/img/logo.png" width="64" height="64" alt=""><h1>Bolivia <b>Fitness</b> CRM</h1><p class="muted">' + esc(t("Elegí tu usuario e ingresá tu PIN.")) + "</p>" +
      '<form id="lf"><label class="fld"><span>' + esc(t("Usuario")) + '</span><select name="u" class="sel">' + groups.map((g) => '<optgroup label="' + esc(g.map((r) => t(ROLE[r])).join(" / ")) + '">' + D.db.staff.filter((s) => s.active && g.includes(s.role)).map((s) => opt(s.id, s.name + (s.branchId ? " · " + bname(s.branchId) : ""), "st-owner")).join("") + "</optgroup>").join("") + "</select></label>" +
      '<label class="fld"><span>PIN</span><input name="pin" type="password" inputmode="numeric" maxlength="6" autocomplete="off" required></label><p class="err" id="lerr" aria-live="polite"></p><button class="btn btn--block">' + esc(t("Entrar")) + "</button></form>" +
      '<p class="hint">' + esc(t("Demo: el PIN de todos los usuarios es 1234. Cada rol ve solo lo que le corresponde.")) + "</p>" +
      '<div class="login__tg"><button class="ib" id="langL">' + (T.lang() === "en" ? "ES" : "EN") + "</button></div></div></main>";
    $("#langL").addEventListener("click", () => { T.set(T.lang() === "en" ? "es" : "en"); login(); });
    $("#lf").addEventListener("submit", (e) => {
      e.preventDefault(); const f = new FormData(e.target), u = ST(f.get("u"));
      if (!u || f.get("pin") !== u.pin) { $("#lerr").textContent = t("PIN incorrecto."); return; }
      ME = u; try { sessionStorage.setItem("bfcrm_user", u.id); } catch (er) { /* nada */ }
      D.log(u.name, "Inició sesión"); D.save(); document.body.className = ""; shell(); location.hash = "#/dashboard"; route();
    });
  }

  /* ---------- router ---------- */
  const VIEWS = {};
  function route() {
    if (!ME) return login();
    const h = location.hash.replace(/^#\/?/, "") || "dashboard";
    const [path, qs] = h.split("?"), [mod, id] = path.split("/");
    const q = new URLSearchParams(qs || "");
    const m = VIEWS[mod] && can(mod) ? mod : "dashboard";
    $$("[data-nav]").forEach((a) => a.toggleAttribute("aria-current", a.dataset.nav === m));
    document.body.classList.remove("nav-open");
    const v = $("#view");
    v.innerHTML = ""; VIEWS[m](v, id, q);
    document.title = t((NAV.find((n) => n[0] === m) || ["", "Panel"])[1]) + " · Bolivia Fitness CRM";
    window.scrollTo(0, 0);
  }
  const head = (title, sub, actions) => '<div class="vh1"><div><h1>' + esc(title) + "</h1>" + (sub ? '<p class="muted">' + sub + "</p>" : "") + '</div><div class="acts">' + (actions || "") + "</div></div>";
  const periodLbl = () => ({ today: t("Hoy"), "7d": t("Últimos 7 días"), "30d": t("Últimos 30 días"), "90d": t("Últimos 90 días") })[S.period];
  const scope = () => (curBranch() === "all" ? t("Todas las sucursales") : bname(curBranch()));

  /* ================= PANEL ================= */
  VIEWS.dashboard = function (v) {
    const f = filt(), k = D.kpis(f), ser = D.series(f);
    const spk = ser.map((d) => d.rev);
    const inv = invRows(curBranch());
    const low = inv.filter((r) => r.st !== "ok").length, exp = inv.filter((r) => r.days != null && r.days <= 60).length;
    const tasksDue = D.db.tasks.filter((x) => !x.done && x.due <= today() && (curBranch() === "all" || x.branchId === curBranch())).length;
    const leadsDue = D.db.leads.filter((l) => !["ganado", "perdido"].includes(l.stage) && l.next <= today() && (curBranch() === "all" || l.branchId === curBranch())).length;
    const idx = D.salesByMember();
    const refills = D.db.members.filter((m) => curBranch() === "all" || m.branchId === curBranch()).map((m) => ({ m, s: D.memberStats(m.id, idx) })).filter((x) => x.s.refill && x.s.refill.due >= today() && x.s.refill.due <= D.dayKey(Date.now() + 7 * D.DAY)).sort((a, b) => a.s.refill.due.localeCompare(b.s.refill.due));
    const tile = (lbl, val, sub, extra) => '<div class="kpi"><span class="kpi__l">' + esc(lbl) + '</span><b class="kpi__v">' + val + '</b><span class="kpi__s">' + (sub || "") + "</span>" + (extra || "") + "</div>";
    v.innerHTML = head(t("Hola") + ", " + esc(ME.name.split(" ")[0]), esc(scope()) + " · " + esc(periodLbl()), can("pos") ? '<a class="btn" href="#/pos">' + I.plus + esc(t("Nueva venta")) + "</a>" : "") +
      '<div class="kpis">' +
      tile(t("Ventas"), money(k.rev), delta(k.delta) + " " + esc(t("vs. período anterior")), C.spark(spk)) +
      tile(t("Tickets"), num(k.orders), esc(t("Ticket promedio")) + " " + money(k.avg)) +
      tile(t("Margen bruto (estimado)"), pct(k.margin), esc(t("Unidades vendidas")) + " " + num(k.units)) +
      tile(t("Clientes del club"), num(k.buyers), pct(k.memberShare) + " " + esc(t("de los tickets")) + " · +" + num(k.newMembers) + " " + esc(t("nuevos"))) +
      "</div>" +
      '<div class="grid g-2-1">' + card(t("Ventas por día"), '<div class="chart" id="chLine"></div>', '<span class="muted">' + esc(periodLbl()) + "</span>") +
      card(t("Alertas"), '<ul class="alerts">' +
        alert(low, t("productos con stock bajo o agotado"), "#/inventory?f=low", "warn") + alert(exp, t("productos vencen en 60 días o menos"), "#/inventory?f=exp", "warn") +
        alert(tasksDue, t("tareas vencidas o para hoy"), "#/tasks", "info") + alert(leadsDue, t("oportunidades para contactar hoy"), "#/pipeline", "info") +
        alert(refills.length, t("clientes por reponer su suplemento esta semana"), "#/campaigns?seg=reposicion", "ok") + "</ul>") + "</div>" +
      '<div class="grid g-3">' +
      (curBranch() === "all" ? card(t("Ranking de sucursales"), C.hbars(D.byBranch(f).map((r) => ({ label: bname(r.key), v: r.rev, href: "#/branches/" + r.key })), { fmt: money })) : card(t("Vendedores"), C.hbars(D.byStaff(f).slice(0, 8).map((r) => ({ label: (ST(r.key) || {}).name || r.key, v: r.rev, href: "#/staff/" + r.key })), { fmt: money }))) +
      card(t("Productos más vendidos"), C.hbars(D.byProduct(f).slice(0, 8).map((r) => ({ label: pname(r.key), sub: num(r.units) + " u.", v: r.rev })), { fmt: money })) +
      card(t("Ventas por categoría"), C.hbars(D.byCategory(f).map((r) => ({ label: catName(r.key), v: r.rev })), { fmt: money })) + "</div>" +
      '<div class="grid g-3">' + card(t("Ventas por hora"), '<div class="chart" id="chHour"></div>') +
      card(t("Medios de pago"), C.hbars(D.byPayment(f).map((r) => ({ label: t(PAY[r.key]), v: r.rev })), { fmt: money })) +
      card(t("Canales"), C.hbars(D.byChannel(f).map((r) => ({ label: t(CH[r.key]), v: r.rev })), { fmt: money })) + "</div>" +
      '<div class="grid g-2">' + card(t("Reposición próxima"), refills.length ? '<ul class="list">' + refills.slice(0, 6).map((x) => '<li>' + avatar(x.m.name) + '<div><a href="#/members/' + x.m.id + '">' + esc(x.m.name) + "</a><small>" + esc(pname(x.s.refill.pid)) + " · " + esc(t("se termina el")) + " " + esc(short(x.s.refill.due)) + '</small></div><a class="btn btn--sm btn--wa" target="_blank" rel="noopener" href="' + esc(wa(x.m.phone, t("¡Hola") + " " + x.m.name.split(" ")[0] + "! 🦁 " + t("Tu") + " " + pname(x.s.refill.pid) + " " + t("está por terminarse. ¿Te reservamos uno?"))) + '">WhatsApp</a></li>').join("") + "</ul>" : empty(t("Nadie por reponer esta semana.")), '<a class="more" href="#/campaigns?seg=reposicion">' + esc(t("Ver todos")) + "</a>") +
      card(t("Actividad reciente"), '<ul class="feed">' + D.db.log.slice(0, 8).map((l) => "<li><b>" + esc(l.who) + "</b> " + esc(l.what) + "<small>" + esc(fdt(l.at)) + "</small></li>").join("") + "</ul>") + "</div>";
    C.line($("#chLine"), ser.map((d) => ({ x: short(d.day), v: d.rev, sub: num(d.orders) + " " + t("tickets") })), { id: "dash", fmt: money, fmtAxis: (n) => (n >= 1000 ? Math.round(n / 1000) + "k" : Math.round(n)), label: t("Ventas por día"), xName: t("Día") });
    C.bars($("#chHour"), D.byHour(f).slice(9, 23).map((h) => ({ x: h.key + "h", v: h.rev, tip: h.key + ":00 · " + num(h.orders) + " " + t("tickets") })), { fmt: money, fmtAxis: (n) => (n >= 1000 ? Math.round(n / 1000) + "k" : Math.round(n)), label: t("Ventas por hora"), xName: t("Hora") });
  };
  const alert = (n, txt, href, k) => '<li class="al al--' + (n ? k : "none") + '"><a href="' + href + '"><b>' + num(n) + "</b><span>" + esc(txt) + "</span></a></li>";

  /* ================= PUNTO DE VENTA ================= */
  let CART = { lines: {}, member: null, discount: 0, payment: "qr", channel: "tienda", gift: "", usePoints: false };
  VIEWS.pos = function (v, id, q) {
    if (q.get("member")) CART.member = q.get("member");
    let bid = curBranch() === "all" ? (CART.branch || D.db.branches[0].id) : curBranch();
    CART.branch = bid;
    let qtext = "", qcat = "all";
    v.innerHTML = head(t("Punto de venta"), esc(t("Registrá ventas de mostrador, WhatsApp o web.")), global() ? '<label class="inl">' + esc(t("Sucursal")) + ' <select class="sel" id="posBranch">' + branchOpts(bid) + "</select></label>" : "") +
      '<div class="pos"><section class="card pos__cat"><div class="pos__tools"><label class="gsearch gsearch--in">' + I.search + '<input id="pq" type="search" placeholder="' + esc(t("Buscar producto…")) + '" autocomplete="off"></label></div><div class="chips" id="pcats"></div><div class="pgrid" id="pgrid"></div></section>' +
      '<section class="card pos__cart" id="cart"></section></div>';
    const cats = [["all", t("Todo")]].concat(B.categories.map((c) => [c.id, t(c.name)]));
    $("#pcats").innerHTML = cats.map(([k, l]) => '<button class="chip" data-c="' + k + '" aria-pressed="' + (k === qcat) + '">' + esc(l) + "</button>").join("");
    function grid() {
      const inv = D.db.inventory[bid];
      const list = D.products().filter((p) => (qcat === "all" || p.cat === qcat) && (!qtext || norm(p.short + " " + p.name + " " + p.brandName + " " + (p.flavor || "")).includes(norm(qtext))));
      $("#pgrid").innerHTML = list.map((p) => { const s = inv[p.id].qty; return '<button class="pc' + (s ? "" : " pc--out") + '" data-p="' + p.id + '"' + (s ? "" : " disabled") + '><img src="../' + esc(p.img) + '" width="96" height="96" alt="" loading="lazy"><span class="pc__n">' + esc(p.short) + '</span><span class="pc__m"><b>' + money(p.price) + "</b><small>" + (s ? num(s) + " " + t("en stock") : t("Agotado")) + "</small></span></button>"; }).join("") || empty(t("Sin productos."));
    }
    function cart() {
      const lines = Object.entries(CART.lines).filter(([, n]) => n > 0);
      const sub = lines.reduce((a, [pid, n]) => a + P(pid).price * n, 0);
      const m = CART.member ? M(CART.member) : null;
      const maxPts = m ? Math.min(m.points, Math.floor(sub * .2) * 10) : 0;
      const ptsDisc = CART.usePoints && m ? Math.floor(maxPts / 10) : 0;
      const total = Math.max(0, sub - (+CART.discount || 0) - ptsDisc);
      $("#cart").innerHTML = '<header class="card__h"><h2>' + esc(t("Venta actual")) + "</h2>" + (lines.length ? '<button class="link" id="clr">' + esc(t("Vaciar")) + "</button>" : "") + "</header>" +
        '<div class="cust">' + (m ? avatar(m.name) + '<div><b>' + esc(m.name) + "</b><small>" + tierBadge(D.tier(m.points)) + " " + num(m.points) + " " + esc(t("puntos")) + '</small></div><button class="ib" id="unm" aria-label="' + esc(t("Quitar cliente")) + '">' + I.x + "</button>" :
          '<label class="gsearch gsearch--in">' + I.search + '<input id="cq" placeholder="' + esc(t("Cliente: nombre o teléfono")) + '" autocomplete="off"></label><button class="btn btn--sm btn--ghost" id="newm">' + I.plus + esc(t("Nuevo")) + '</button><div class="gres" id="cres" hidden></div>') + "</div>" +
        (lines.length ? '<ul class="cl">' + lines.map(([pid, n]) => { const p = P(pid); return '<li><img src="../' + esc(p.img) + '" width="40" height="40" alt=""><div><b>' + esc(p.short) + "</b><small>" + money(p.price) + '</small></div><div class="qty"><button data-q="' + pid + '" data-d="-1" aria-label="−">−</button><span>' + n + '</span><button data-q="' + pid + '" data-d="1" aria-label="+">+</button></div><b>' + money(p.price * n) + "</b></li>"; }).join("") + "</ul>" : empty(t("Tocá un producto para agregarlo."))) +
        '<div class="pay"><div class="row2">' + field(t("Descuento (Bs)"), '<input id="disc" type="number" min="0" step="1" value="' + esc(CART.discount || "") + '">') + field(t("Canal"), '<select id="chan" class="sel">' + Object.keys(CH).map((k) => opt(k, t(CH[k]), CART.channel)).join("") + "</select>") + "</div>" +
        (B.campaignActive() ? field(t("Regalo Black Friday"), '<select id="gift" class="sel">' + opt("", t("Sin regalo"), CART.gift) + B.campaign.gifts.map((g) => opt(g, g, CART.gift)).join("") + "</select>") : "") +
        (m && maxPts >= 10 ? '<label class="chk"><input type="checkbox" id="usepts"' + (CART.usePoints ? " checked" : "") + "> " + esc(t("Canjear")) + " " + num(Math.floor(maxPts / 10) * 10) + " " + esc(t("puntos")) + " (−" + money(Math.floor(maxPts / 10)) + ")</label>" : "") +
        '<div class="seg" role="group" aria-label="' + esc(t("Medio de pago")) + '">' + Object.keys(PAY).map((k) => '<button type="button" data-pay="' + k + '" aria-pressed="' + (CART.payment === k) + '">' + esc(t(PAY[k])) + "</button>").join("") + "</div>" +
        '<dl class="tot"><dt>' + esc(t("Subtotal")) + "</dt><dd>" + money2(sub) + "</dd>" + (+CART.discount || ptsDisc ? "<dt>" + esc(t("Descuentos")) + "</dt><dd>−" + money2((+CART.discount || 0) + ptsDisc) + "</dd>" : "") + '<dt class="big">' + esc(t("Total")) + '</dt><dd class="big">' + money2(total) + "</dd>" + (m ? "<dt>" + esc(t("Puntos a ganar")) + "</dt><dd>+" + num(Math.floor(total / 10)) + "</dd>" : "") + "</dl>" +
        '<button class="btn btn--block btn--lg" id="charge"' + (lines.length ? "" : " disabled") + ">" + esc(t("Cobrar")) + " " + money2(total) + "</button></div>";
      bindCart(sub, ptsDisc, total);
    }
    function bindCart(sub, ptsDisc, total) {
      const c = $("#cart");
      c.onclick = (e) => {
        const q = e.target.closest("[data-q]"); if (q) { const pid = q.dataset.q; CART.lines[pid] = Math.max(0, (CART.lines[pid] || 0) + +q.dataset.d); if (CART.lines[pid] > D.db.inventory[bid][pid].qty) { CART.lines[pid] = D.db.inventory[bid][pid].qty; toast(t("No hay más stock en esta sucursal.")); } cart(); return; }
        const p = e.target.closest("[data-pay]"); if (p) { CART.payment = p.dataset.pay; cart(); return; }
        if (e.target.closest("#clr")) { CART = { lines: {}, member: null, discount: 0, payment: "qr", channel: "tienda", gift: "", usePoints: false, branch: bid }; cart(); return; }
        if (e.target.closest("#unm")) { CART.member = null; CART.usePoints = false; cart(); return; }
        if (e.target.closest("#newm")) { memberForm(null, (m) => { CART.member = m.id; cart(); }); return; }
        const pick = e.target.closest("[data-m]"); if (pick) { CART.member = pick.dataset.m; cart(); return; }
        if (e.target.closest("#charge")) charge(total, ptsDisc);
      };
      const d = $("#disc"); if (d) d.onchange = () => { CART.discount = Math.max(0, Math.min(sub, +d.value || 0)); cart(); };
      $("#chan").onchange = (e) => { CART.channel = e.target.value; };
      if ($("#gift")) $("#gift").onchange = (e) => { CART.gift = e.target.value; };
      if ($("#usepts")) $("#usepts").onchange = (e) => { CART.usePoints = e.target.checked; cart(); };
      const cq = $("#cq");
      if (cq) cq.oninput = () => { const s = norm(cq.value), r = $("#cres"); if (s.length < 2) { r.hidden = true; return; } const ms = D.db.members.filter((m) => norm(m.name + " " + m.phone).includes(s)).slice(0, 6); r.innerHTML = ms.map((m) => '<button type="button" data-m="' + m.id + '">' + avatar(m.name) + esc(m.name) + "<small>" + esc(m.phone) + "</small></button>").join("") || '<p class="muted" style="padding:10px">' + esc(t("Sin resultados")) + "</p>"; r.hidden = false; };
    }
    function charge(total, ptsDisc) {
      const lines = Object.entries(CART.lines).filter(([, n]) => n > 0).map(([pid, qty]) => ({ pid, qty, price: P(pid).price }));
      const s = D.addSale({ branchId: bid, staffId: ME.id, memberId: CART.member, channel: CART.channel, payment: CART.payment, lines, discount: (+CART.discount || 0) + ptsDisc, gift: CART.gift, pointsUsed: ptsDisc * 10 }, who());
      const m = s.memberId ? M(s.memberId) : null;
      const receipt = "Bolivia Fitness · " + bname(bid) + "\n" + s.id + " · " + fdt(s.date) + "\n" + lines.map((l) => l.qty + "× " + pname(l.pid) + " — " + money2(l.qty * l.price)).join("\n") + (s.discount ? "\n" + t("Descuento") + ": −" + money2(s.discount) : "") + "\nTotal: " + money2(s.total) + (s.gift ? "\n🎁 " + s.gift : "") + (m ? "\n" + t("Puntos") + ": " + num(m.points) + " (" + t(TIER[D.tier(m.points)]) + ")" : "") + "\n¡" + t("Gracias por tu compra") + "! 🦁";
      modal(t("Venta registrada"), '<div class="receipt"><pre>' + esc(receipt) + "</pre></div>" + (m ? '<a class="btn btn--wa btn--block" target="_blank" rel="noopener" href="' + esc(wa(m.phone, receipt)) + '">' + esc(t("Enviar comprobante por WhatsApp")) + "</a>" : "") + '<button type="button" class="btn btn--ghost btn--block" data-close style="margin-top:10px">' + esc(t("Nueva venta")) + "</button>", null);
      CART = { lines: {}, member: null, discount: 0, payment: CART.payment, channel: "tienda", gift: "", usePoints: false, branch: bid };
      grid(); cart();
    }
    $("#pgrid").addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (!b) return; const pid = b.dataset.p, have = D.db.inventory[bid][pid].qty; if ((CART.lines[pid] || 0) >= have) { toast(t("No hay más stock en esta sucursal.")); return; } CART.lines[pid] = (CART.lines[pid] || 0) + 1; cart(); });
    $("#pcats").addEventListener("click", (e) => { const b = e.target.closest("[data-c]"); if (!b) return; qcat = b.dataset.c; $$("#pcats .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); grid(); });
    $("#pq").addEventListener("input", (e) => { qtext = e.target.value; grid(); });
    if ($("#posBranch")) $("#posBranch").addEventListener("change", (e) => { bid = e.target.value; CART.branch = bid; CART.lines = {}; grid(); cart(); });
    grid(); cart();
  };

  /* ================= VENTAS ================= */
  VIEWS.sales = function (v, id, q) {
    const f = filt();
    let list = D.salesIn(Object.assign({}, f, { to: f.to })).concat(D.db.sales.filter((s) => s.status === "anulada" && Date.parse(s.date) >= f.from && (curBranch() === "all" || s.branchId === curBranch())));
    list.sort((a, b) => b.date.localeCompare(a.date));
    let fq = q.get("id") || "", fp = "all", fc = "all", page = 0;
    v.innerHTML = head(t("Ventas"), esc(scope()) + " · " + esc(periodLbl()), '<button class="btn btn--ghost" id="exp">' + I.dl + esc(t("Exportar CSV")) + "</button>" + (can("pos") ? '<a class="btn" href="#/pos">' + I.plus + esc(t("Nueva venta")) + "</a>" : "")) +
      '<div class="card"><div class="tools"><label class="gsearch gsearch--in">' + I.search + '<input id="sq" type="search" value="' + esc(fq) + '" placeholder="' + esc(t("N° de venta o cliente…")) + '"></label><select class="sel" id="sp">' + opt("all", t("Todos los pagos")) + Object.keys(PAY).map((k) => opt(k, t(PAY[k]))).join("") + '</select><select class="sel" id="sc">' + opt("all", t("Todos los canales")) + Object.keys(CH).map((k) => opt(k, t(CH[k]))).join("") + '</select><span class="muted" id="scount"></span></div><div class="tbl-w"><table class="tbl"><thead><tr><th>' + [t("Venta"), t("Fecha"), t("Sucursal"), t("Cliente"), t("Vendedor"), t("Pago"), t("Canal"), t("Total")].map(esc).join("</th><th>") + '</th></tr></thead><tbody id="sb"></tbody></table></div><div class="pager" id="pg"></div></div>';
    const rows = () => list.filter((s) => (fp === "all" || s.payment === fp) && (fc === "all" || s.channel === fc) && (!fq || norm(s.id + " " + (s.memberId ? M(s.memberId).name : "")).includes(norm(fq))));
    function render() {
      const r = rows(), per = 50, pages = Math.max(1, Math.ceil(r.length / per)); page = Math.min(page, pages - 1);
      $("#scount").textContent = num(r.length) + " " + t("ventas") + " · " + money(r.filter((s) => s.status !== "anulada").reduce((a, s) => a + s.total, 0));
      $("#sb").innerHTML = r.slice(page * per, page * per + per).map((s) => '<tr data-s="' + s.id + '" class="' + (s.status === "anulada" ? "void" : "") + '" tabindex="0"><td><b>' + esc(s.id) + "</b>" + (s.status === "anulada" ? " " + badge(t("Anulada"), "bad") : "") + "</td><td>" + esc(fdt(s.date)) + "</td><td>" + esc(bname(s.branchId)) + "</td><td>" + (s.memberId ? '<a href="#/members/' + s.memberId + '">' + esc(M(s.memberId).name) + "</a>" : '<span class="muted">' + esc(t("Ocasional")) + "</span>") + "</td><td>" + esc((ST(s.staffId) || {}).name || "—") + "</td><td>" + esc(t(PAY[s.payment])) + "</td><td>" + esc(t(CH[s.channel])) + '</td><td class="num"><b>' + money2(s.total) + "</b></td></tr>").join("") || '<tr><td colspan="8">' + empty(t("Sin ventas con esos filtros.")) + "</td></tr>";
      $("#pg").innerHTML = pages > 1 ? '<button class="btn btn--sm btn--ghost" data-pg="-1"' + (page ? "" : " disabled") + ">←</button><span>" + (page + 1) + " / " + pages + '</span><button class="btn btn--sm btn--ghost" data-pg="1"' + (page < pages - 1 ? "" : " disabled") + ">→</button>" : "";
    }
    $("#sq").oninput = (e) => { fq = e.target.value; page = 0; render(); };
    $("#sp").onchange = (e) => { fp = e.target.value; page = 0; render(); };
    $("#sc").onchange = (e) => { fc = e.target.value; page = 0; render(); };
    $("#pg").onclick = (e) => { const b = e.target.closest("[data-pg]"); if (b) { page += +b.dataset.pg; render(); } };
    $("#sb").addEventListener("click", (e) => { if (e.target.closest("a")) return; const tr = e.target.closest("[data-s]"); if (tr) saleDetail(tr.dataset.s, render); });
    $("#sb").addEventListener("keydown", (e) => { if (e.key === "Enter") { const tr = e.target.closest("[data-s]"); if (tr) saleDetail(tr.dataset.s, render); } });
    $("#exp").onclick = () => download("ventas-" + today() + ".csv", D.toCSV(rows().map((s) => ({ venta: s.id, fecha: s.date, sucursal: bname(s.branchId), cliente: s.memberId ? M(s.memberId).name : "", vendedor: (ST(s.staffId) || {}).name || "", pago: s.payment, canal: s.channel, productos: s.lines.map((l) => l.qty + "x " + pname(l.pid)).join(" | "), descuento: s.discount, total: s.total, estado: s.status }))));
    render();
    if (q.get("id")) { const s = D.db.sales.find((x) => x.id === q.get("id")); if (s) saleDetail(s.id, render); }
  };
  function saleDetail(id, after) {
    const s = D.db.sales.find((x) => x.id === id); if (!s) return;
    const canVoid = ["owner", "admin", "manager"].includes(ME.role) && s.status !== "anulada";
    modal(t("Venta") + " " + s.id, '<dl class="kv"><dt>' + esc(t("Fecha")) + "</dt><dd>" + esc(fdt(s.date)) + "</dd><dt>" + esc(t("Sucursal")) + "</dt><dd>" + esc(bname(s.branchId)) + "</dd><dt>" + esc(t("Vendedor")) + "</dt><dd>" + esc((ST(s.staffId) || {}).name || "—") + "</dd><dt>" + esc(t("Cliente")) + "</dt><dd>" + (s.memberId ? esc(M(s.memberId).name) : esc(t("Ocasional"))) + "</dd><dt>" + esc(t("Pago")) + "</dt><dd>" + esc(t(PAY[s.payment])) + " · " + esc(t(CH[s.channel])) + "</dd>" + (s.gift ? "<dt>🎁</dt><dd>" + esc(s.gift) + "</dd>" : "") + "</dl>" +
      '<ul class="cl">' + s.lines.map((l) => '<li><img src="../' + esc(P(l.pid).img) + '" width="40" height="40" alt=""><div><b>' + esc(pname(l.pid)) + "</b><small>" + l.qty + " × " + money2(l.price) + "</small></div><span></span><b>" + money2(l.qty * l.price) + "</b></li>").join("") + "</ul>" +
      '<dl class="tot">' + (s.discount ? "<dt>" + esc(t("Descuentos")) + "</dt><dd>−" + money2(s.discount) + "</dd>" : "") + '<dt class="big">Total</dt><dd class="big">' + money2(s.total) + "</dd></dl>" +
      (s.status === "anulada" ? '<p class="err">' + esc(t("Venta anulada: el stock y los puntos se devolvieron.")) + "</p>" : ""), canVoid ? () => { if (!confirm(t("¿Anular esta venta? Se devuelve el stock y se descuentan los puntos."))) return false; D.voidSale(s.id, who()); toast(t("Venta anulada")); after && after(); } : null, { ok: t("Anular venta") });
  }

  /* ================= CLIENTES ================= */
  VIEWS.members = function (v, id, q) {
    if (id) return memberPage(v, id);
    const idx = D.salesByMember();
    const all = D.db.members.filter((m) => curBranch() === "all" || m.branchId === curBranch()).map((m) => Object.assign({ m }, D.memberStats(m.id, idx), { tier: D.tier(m.points) }));
    let fseg = q.get("seg") || "all", ftier = "all", fq = "", sort = "ltv", page = 0;
    const segs = ["all", "vip", "frecuente", "nuevo", "riesgo", "inactivo"];
    v.innerHTML = head(t("Clientes"), num(all.length) + " " + esc(t("en el club")) + " · " + esc(scope()), '<button class="btn btn--ghost" id="mexp">' + I.dl + esc(t("Exportar CSV")) + '</button><button class="btn" id="madd">' + I.plus + esc(t("Nuevo cliente")) + "</button>") +
      '<div class="kpis kpis--sm">' + ["vip", "frecuente", "nuevo", "riesgo"].map((s) => '<button class="kpi kpi--btn" data-seg="' + s + '"><span class="kpi__l">' + segBadge(s) + '</span><b class="kpi__v">' + num(all.filter((x) => x.seg === s).length) + '</b><span class="kpi__s">' + esc(t({ vip: "6+ compras o Bs 4.000+", frecuente: "2 a 5 compras", nuevo: "Primer mes o 1 compra", riesgo: "Sin comprar hace 60+ días" }[s])) + "</span></button>").join("") + "</div>" +
      '<div class="card"><div class="tools"><label class="gsearch gsearch--in">' + I.search + '<input id="mq" type="search" placeholder="' + esc(t("Nombre o teléfono…")) + '"></label><div class="chips" id="msegs">' + segs.map((s) => '<button class="chip" data-s="' + s + '" aria-pressed="' + (s === fseg) + '">' + esc(s === "all" ? t("Todos") : t(SEG[s])) + "</button>").join("") + '</div><select class="sel" id="mtier">' + opt("all", t("Todos los niveles")) + D.TIERS.map((x) => opt(x.id, t(TIER[x.id]))).join("") + '</select><select class="sel" id="msort">' + [["ltv", "Mayor gasto"], ["recent", "Compra más reciente"], ["orders", "Más compras"], ["points", "Más puntos"], ["name", "Nombre"]].map(([k, l]) => opt(k, t(l), sort)).join("") + "</select></div>" +
      '<div class="tbl-w"><table class="tbl"><thead><tr><th>' + [t("Cliente"), t("Nivel"), t("Segmento"), t("Compras"), t("Gasto total"), t("Última compra"), t("Sucursal"), ""].map(esc).join("</th><th>") + '</th></tr></thead><tbody id="mb"></tbody></table></div><div class="pager" id="mpg"></div></div>';
    const rows = () => all.filter((x) => (fseg === "all" || x.seg === fseg) && (ftier === "all" || x.tier === ftier) && (!fq || norm(x.m.name + " " + x.m.phone).includes(norm(fq)))).sort({ ltv: (a, b) => b.ltv - a.ltv, recent: (a, b) => (b.last || 0) - (a.last || 0), orders: (a, b) => b.orders - a.orders, points: (a, b) => b.m.points - a.m.points, name: (a, b) => a.m.name.localeCompare(b.m.name) }[sort]);
    function render() {
      const r = rows(), per = 40, pages = Math.max(1, Math.ceil(r.length / per)); page = Math.min(page, pages - 1);
      $("#mb").innerHTML = r.slice(page * per, page * per + per).map((x) => '<tr><td><a class="who" href="#/members/' + x.m.id + '">' + avatar(x.m.name) + "<span><b>" + esc(x.m.name) + "</b><small>" + esc(x.m.phone) + "</small></span></a></td><td>" + tierBadge(x.tier) + "<small class=\"muted\"> " + num(x.m.points) + " pts</small></td><td>" + segBadge(x.seg) + '</td><td class="num">' + num(x.orders) + '</td><td class="num"><b>' + money(x.ltv) + "</b></td><td>" + (x.last ? esc(fdate(x.last)) + ' <small class="muted">(' + x.daysSince + "d)</small>" : "—") + "</td><td>" + esc(bname(x.m.branchId)) + '</td><td><a class="ib ib--wa" target="_blank" rel="noopener" href="' + esc(wa(x.m.phone)) + '" aria-label="WhatsApp ' + esc(x.m.name) + '">' + I.wa + "</a></td></tr>").join("") || '<tr><td colspan="8">' + empty(t("Sin clientes con esos filtros.")) + "</td></tr>";
      $("#mpg").innerHTML = pages > 1 ? '<button class="btn btn--sm btn--ghost" data-pg="-1"' + (page ? "" : " disabled") + ">←</button><span>" + (page + 1) + " / " + pages + " · " + num(r.length) + '</span><button class="btn btn--sm btn--ghost" data-pg="1"' + (page < pages - 1 ? "" : " disabled") + ">→</button>" : "";
    }
    $("#mq").oninput = (e) => { fq = e.target.value; page = 0; render(); };
    $("#msegs").onclick = (e) => { const b = e.target.closest("[data-s]"); if (!b) return; fseg = b.dataset.s; $$("#msegs .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); page = 0; render(); };
    $$("[data-seg]").forEach((b) => b.onclick = () => { fseg = b.dataset.seg; $$("#msegs .chip").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.s === fseg))); page = 0; render(); });
    $("#mtier").onchange = (e) => { ftier = e.target.value; page = 0; render(); };
    $("#msort").onchange = (e) => { sort = e.target.value; render(); };
    $("#mpg").onclick = (e) => { const b = e.target.closest("[data-pg]"); if (b) { page += +b.dataset.pg; render(); } };
    $("#madd").onclick = () => memberForm(null, (m) => (location.hash = "#/members/" + m.id));
    $("#mexp").onclick = () => download("clientes-" + today() + ".csv", D.toCSV(rows().map((x) => ({ id: x.m.id, nombre: x.m.name, telefono: x.m.phone, email: x.m.email, ciudad: x.m.city, sucursal: bname(x.m.branchId), nivel: x.tier, puntos: x.m.points, segmento: x.seg, compras: x.orders, gasto_total: x.ltv, ultima_compra: x.last ? new Date(x.last).toISOString() : "", objetivo: x.m.goal, whatsapp_ok: x.m.waOptIn ? "si" : "no" }))));
    render();
  };
  function memberForm(m, done) {
    const e = m || { name: "", phone: "591", email: "", branchId: curBranch() === "all" ? D.db.branches[0].id : curBranch(), birthday: "", goal: "inicio", source: "tienda", tags: [], waOptIn: true };
    modal(m ? t("Editar cliente") : t("Nuevo cliente"),
      '<div class="row2">' + field(t("Nombre completo"), inp("name", e.name, " required")) + field(t("WhatsApp"), inp("phone", e.phone, ' required inputmode="tel" pattern="[0-9+ ]{8,16}"')) + "</div>" +
      '<div class="row2">' + field(t("Email"), inp("email", e.email, ' type="email"')) + field(t("Cumpleaños"), inp("birthday", e.birthday, ' type="date"')) + "</div>" +
      '<div class="row2">' + field(t("Sucursal"), '<select name="branchId" class="sel">' + branchOpts(e.branchId) + "</select>") + field(t("Objetivo"), '<select name="goal" class="sel">' + Object.keys(GOAL).map((k) => opt(k, t(GOAL[k]), e.goal)).join("") + "</select>") + "</div>" +
      '<div class="row2">' + field(t("¿Cómo nos conoció?"), '<select name="source" class="sel">' + Object.keys(SRC).map((k) => opt(k, SRC[k], e.source)).join("") + "</select>") + field(t("Etiquetas (separadas por coma)"), inp("tags", (e.tags || []).join(", "))) + "</div>" +
      '<label class="chk"><input type="checkbox" name="waOptIn"' + (e.waOptIn ? " checked" : "") + "> " + esc(t("Acepta recibir promociones por WhatsApp")) + "</label>",
      (fd) => {
        const b = BR(fd.get("branchId"));
        const o = D.upsert("members", Object.assign(m ? { id: m.id } : { joined: new Date().toISOString(), points: 0, notes: [] }, { name: fd.get("name").trim(), phone: fd.get("phone").replace(/[^\d]/g, ""), email: fd.get("email").trim(), birthday: fd.get("birthday"), branchId: b.id, city: b.city, goal: fd.get("goal"), source: fd.get("source"), tags: fd.get("tags").split(",").map((s) => s.trim()).filter(Boolean), waOptIn: !!fd.get("waOptIn") }), "m", who());
        toast(t("Cliente guardado")); done && done(o);
      });
  }
  function memberPage(v, id) {
    const m = M(id); if (!m) { v.innerHTML = empty(t("Cliente no encontrado.")); return; }
    const s = D.memberStats(id), tr = D.tier(m.points), next = D.TIERS.find((x) => x.min > m.points);
    const fav = {}; s.sales.forEach((x) => x.lines.forEach((l) => { fav[l.pid] = (fav[l.pid] || 0) + l.qty; }));
    const favs = Object.entries(fav).sort((a, b) => b[1] - a[1]).slice(0, 5);
    v.innerHTML = '<a class="back" href="#/members">← ' + esc(t("Clientes")) + "</a>" +
      '<div class="prof card"><div class="prof__id">' + avatar(m.name) + "<div><h1>" + esc(m.name) + "</h1><p>" + tierBadge(tr) + " " + segBadge(s.seg) + (m.tags || []).map((x) => " " + badge(x)).join("") + '</p><p class="muted">' + esc(m.phone) + (m.email ? " · " + esc(m.email) : "") + " · " + esc(bname(m.branchId)) + " · " + esc(t("Cliente desde")) + " " + esc(fdate(m.joined, { year: "numeric" })) + "</p></div></div>" +
      '<div class="acts"><a class="btn btn--wa" target="_blank" rel="noopener" href="' + esc(wa(m.phone, t("¡Hola") + " " + m.name.split(" ")[0] + "! 🦁 ")) + '">' + I.wa + "WhatsApp</a>" + (can("pos") ? '<a class="btn" href="#/pos?member=' + m.id + '">' + I.plus + esc(t("Nueva venta")) + "</a>" : "") + '<button class="btn btn--ghost" id="medit">' + esc(t("Editar")) + "</button></div></div>" +
      '<div class="kpis">' +
      '<div class="kpi"><span class="kpi__l">' + esc(t("Gasto total")) + '</span><b class="kpi__v">' + money(s.ltv) + '</b><span class="kpi__s">' + num(s.orders) + " " + esc(t("compras")) + " · " + esc(t("Ticket promedio")) + " " + money(s.avg) + "</span></div>" +
      '<div class="kpi"><span class="kpi__l">' + esc(t("Puntos Club León")) + '</span><b class="kpi__v">' + num(m.points) + '</b><span class="kpi__s">' + (next ? esc(t("Faltan")) + " " + num(next.min - m.points) + " " + esc(t("para")) + " " + esc(t(TIER[next.id])) : esc(t("Nivel máximo"))) + "</span>" + (next ? '<div class="prog"><i style="width:' + Math.min(100, m.points / next.min * 100).toFixed(0) + '%"></i></div>' : "") + "</div>" +
      '<div class="kpi"><span class="kpi__l">' + esc(t("Última compra")) + '</span><b class="kpi__v">' + (s.last ? esc(fdate(s.last)) : "—") + '</b><span class="kpi__s">' + (s.daysSince != null ? (T.lang() === "en" ? s.daysSince + " days ago" : "hace " + s.daysSince + " días") : esc(t("Todavía no compró"))) + "</span></div>" +
      '<div class="kpi"><span class="kpi__l">' + esc(t("Reposición estimada")) + '</span><b class="kpi__v">' + (s.refill ? esc(short(s.refill.due)) : "—") + '</b><span class="kpi__s">' + (s.refill ? esc(pname(s.refill.pid)) + " · " + esc(t("1 servicio por día")) : esc(t("Sin creatina ni proteína aún"))) + "</span></div></div>" +
      '<div class="grid g-2-1">' + card(t("Historial de compras"), s.sales.length ? '<div class="tbl-w"><table class="tbl"><thead><tr><th>' + [t("Venta"), t("Fecha"), t("Sucursal"), t("Productos"), t("Total")].map(esc).join("</th><th>") + "</th></tr></thead><tbody>" + s.sales.slice(0, 30).map((x) => '<tr><td><a href="#/sales?id=' + x.id + '">' + esc(x.id) + "</a></td><td>" + esc(fdt(x.date)) + "</td><td>" + esc(bname(x.branchId)) + "</td><td>" + esc(x.lines.map((l) => l.qty + "× " + pname(l.pid)).join(", ")) + '</td><td class="num"><b>' + money2(x.total) + "</b></td></tr>").join("") + "</tbody></table></div>" : empty(t("Sin compras todavía."))) +
      '<div class="stack">' + card(t("Perfil"), '<dl class="kv"><dt>' + esc(t("Objetivo")) + "</dt><dd>" + esc(t(GOAL[m.goal] || m.goal)) + "</dd><dt>" + esc(t("Cumpleaños")) + "</dt><dd>" + (m.birthday ? esc(fdate(m.birthday + "T12:00:00-04:00", { year: undefined })) : "—") + "</dd><dt>" + esc(t("Origen")) + "</dt><dd>" + esc(SRC[m.source] || m.source) + "</dd><dt>WhatsApp</dt><dd>" + esc(m.waOptIn ? t("Acepta promos") : t("No enviar promos")) + "</dd></dl>") +
      card(t("Favoritos"), favs.length ? C.hbars(favs.map(([pid, n]) => ({ label: pname(pid), v: n })), { fmt: (n) => n + " u." }) : empty("—")) +
      card(t("Notas"), '<form id="nf" class="nf"><input name="n" placeholder="' + esc(t("Agregar nota (ej.: prefiere sabor chocolate)")) + '" required><button class="btn btn--sm">' + esc(t("Agregar")) + '</button></form><ul class="feed">' + (m.notes || []).map((n) => "<li>" + esc(n.text) + "<small>" + esc(n.by) + " · " + esc(fdt(n.at)) + "</small></li>").join("") + "</ul>") + "</div></div>";
    $("#medit").onclick = () => memberForm(m, () => route());
    $("#nf").onsubmit = (e) => { e.preventDefault(); const txt = new FormData(e.target).get("n").trim(); if (!txt) return; m.notes = [{ text: txt, by: who(), at: new Date().toISOString() }].concat(m.notes || []); D.log(who(), "Nota en " + m.name); D.save(); route(); };
  }

  /* ================= OPORTUNIDADES ================= */
  VIEWS.pipeline = function (v) {
    const stages = ["nuevo", "contactado", "cotizado", "ganado", "perdido"];
    const list = D.db.leads.filter((l) => curBranch() === "all" || l.branchId === curBranch());
    const open = list.filter((l) => !["ganado", "perdido"].includes(l.stage));
    const won = list.filter((l) => l.stage === "ganado").length, lost = list.filter((l) => l.stage === "perdido").length;
    v.innerHTML = head(t("Oportunidades"), esc(t("Consultas de WhatsApp, LeonIA, redes y tienda hasta que se convierten en venta.")), '<button class="btn" id="ladd">' + I.plus + esc(t("Nueva oportunidad")) + "</button>") +
      '<div class="kpis kpis--sm"><div class="kpi"><span class="kpi__l">' + esc(t("Abiertas")) + '</span><b class="kpi__v">' + num(open.length) + '</b><span class="kpi__s">' + money(open.reduce((a, l) => a + l.value, 0)) + " " + esc(t("en juego")) + '</span></div><div class="kpi"><span class="kpi__l">' + esc(t("Tasa de cierre")) + '</span><b class="kpi__v">' + (won + lost ? pct(won / (won + lost)) : "—") + '</b><span class="kpi__s">' + num(won) + " " + esc(t("ganadas")) + " · " + num(lost) + " " + esc(t("perdidas")) + '</span></div><div class="kpi"><span class="kpi__l">' + esc(t("Para hoy")) + '</span><b class="kpi__v">' + num(open.filter((l) => l.next <= today()).length) + '</b><span class="kpi__s">' + esc(t("seguimientos vencidos o de hoy")) + "</span></div></div>" +
      '<div class="kanban">' + stages.map((st) => { const items = list.filter((l) => l.stage === st); return '<section class="col" data-stage="' + st + '"><header><h2>' + esc(t(STAGE[st])) + "</h2><span>" + num(items.length) + " · " + money(items.reduce((a, l) => a + l.value, 0)) + '</span></header><div class="col__b">' + items.sort((a, b) => a.next.localeCompare(b.next)).map((l) => '<article class="lead" draggable="true" data-l="' + l.id + '" tabindex="0"><b>' + esc(l.name) + "</b><span>" + esc(pname(l.interest)) + "</span><small>" + badge(SRC[l.source] || l.source) + " " + money(l.value) + "</small>" + (["ganado", "perdido"].includes(st) ? "" : '<small class="' + (l.next < today() ? "late" : l.next === today() ? "due" : "") + '">' + esc(t("Seguimiento")) + ": " + esc(short(l.next)) + "</small>") + '<div class="lead__a"><button class="ib ib--sm" data-mv="-1" aria-label="' + esc(t("Etapa anterior")) + '">‹</button><a class="ib ib--sm ib--wa" target="_blank" rel="noopener" href="' + esc(wa(l.phone, t("¡Hola") + " " + l.name.split(" ")[0] + "! 🦁 ")) + '" aria-label="WhatsApp">' + I.wa + '</a><button class="ib ib--sm" data-mv="1" aria-label="' + esc(t("Etapa siguiente")) + '">›</button></div></article>').join("") + "</div></section>"; }).join("") + "</div>";
    const move = (lid, st) => { const l = D.db.leads.find((x) => x.id === lid); if (!l || l.stage === st) return; l.stage = st; D.log(who(), "Oportunidad " + l.name + " → " + st);
      if (st === "ganado" && !D.db.members.some((m) => m.phone === l.phone)) { const b = BR(l.branchId); D.upsert("members", { name: l.name, phone: l.phone, email: "", city: b.city, branchId: b.id, birthday: "", joined: new Date().toISOString(), goal: "inicio", source: l.source, tags: [], notes: [], points: 0, waOptIn: true }, "m", who()); toast(t("¡Ganada! Se creó el cliente en el club.")); }
      D.save(); route(); };
    v.querySelector(".kanban").addEventListener("click", (e) => {
      const mv = e.target.closest("[data-mv]"); if (mv) { const l = D.db.leads.find((x) => x.id === mv.closest("[data-l]").dataset.l); const i = Math.max(0, Math.min(4, stages.indexOf(l.stage) + +mv.dataset.mv)); move(l.id, stages[i]); return; }
      if (e.target.closest("a")) return;
      const c = e.target.closest("[data-l]"); if (c) leadForm(D.db.leads.find((x) => x.id === c.dataset.l));
    });
    $$(".lead").forEach((el) => el.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", el.dataset.l)));
    $$(".col").forEach((col) => { col.addEventListener("dragover", (e) => { e.preventDefault(); col.classList.add("over"); }); col.addEventListener("dragleave", () => col.classList.remove("over")); col.addEventListener("drop", (e) => { e.preventDefault(); move(e.dataTransfer.getData("text/plain"), col.dataset.stage); }); });
    $("#ladd").onclick = () => leadForm(null);
  };
  function leadForm(l) {
    const e = l || { name: "", phone: "591", source: "whatsapp", interest: "dp-creatine-200", value: P("dp-creatine-200").price, stage: "nuevo", branchId: curBranch() === "all" ? D.db.branches[0].id : curBranch(), ownerId: ME.id, next: today(), note: "" };
    modal(l ? t("Oportunidad") : t("Nueva oportunidad"),
      '<div class="row2">' + field(t("Nombre"), inp("name", e.name, " required")) + field(t("WhatsApp"), inp("phone", e.phone, " required")) + "</div>" +
      '<div class="row2">' + field(t("Origen"), '<select name="source" class="sel">' + Object.keys(SRC).map((k) => opt(k, SRC[k], e.source)).join("") + "</select>") + field(t("Le interesa"), '<select name="interest" class="sel">' + D.products().map((p) => opt(p.id, p.short, e.interest)).join("") + "</select>") + "</div>" +
      '<div class="row2">' + field(t("Valor estimado (Bs)"), inp("value", e.value, ' type="number" min="0"')) + field(t("Etapa"), '<select name="stage" class="sel">' + Object.keys(STAGE).map((k) => opt(k, t(STAGE[k]), e.stage)).join("") + "</select>") + "</div>" +
      '<div class="row2">' + field(t("Sucursal"), '<select name="branchId" class="sel">' + branchOpts(e.branchId) + "</select>") + field(t("Próximo seguimiento"), inp("next", e.next, ' type="date"')) + "</div>" +
      field(t("Responsable"), '<select name="ownerId" class="sel">' + D.db.staff.filter((s) => s.active).map((s) => opt(s.id, s.name + " · " + t(ROLE[s.role]), e.ownerId)).join("") + "</select>") + field(t("Nota"), '<textarea name="note" rows="2">' + esc(e.note) + "</textarea>"),
      (fd) => { D.upsert("leads", Object.assign(l ? { id: l.id } : { created: new Date().toISOString() }, Object.fromEntries(["name", "phone", "source", "interest", "stage", "branchId", "next", "ownerId", "note"].map((k) => [k, fd.get(k)])), { value: +fd.get("value") || 0 }), "L", who()); toast(t("Guardado")); route(); });
  }

  /* ================= INVENTARIO ================= */
  function invRows(bid) {
    const ids = bid === "all" ? D.db.branches.map((b) => b.id) : [bid];
    return D.products().map((p) => {
      let qty = 0, min = 0, exp = null, low = 0;
      ids.forEach((b) => { const r = D.db.inventory[b][p.id]; qty += r.qty; min += r.min; if (r.qty <= r.min) low++; if (r.exp && (!exp || r.exp < exp)) exp = r.exp; });
      const days = exp ? Math.round((Date.parse(exp + "T12:00:00-04:00") - Date.now()) / D.DAY) : null;
      const st = qty === 0 ? "out" : (bid === "all" ? low > 0 : qty <= min) ? "low" : "ok";
      return { p, qty, min, exp, days, st, low, value: qty * p.cost };
    });
  }
  VIEWS.inventory = function (v, id, q) {
    const bid = curBranch(), rows = invRows(bid);
    let fq = q.get("q") || "", ff = q.get("f") || "all", fc = "all";
    const editable = bid !== "all" && ["owner", "admin", "manager", "warehouse"].includes(ME.role);
    v.innerHTML = head(t("Inventario"), esc(scope()) + (bid === "all" ? " · " + esc(t("elegí una sucursal arriba para ajustar stock")) : ""), '<button class="btn btn--ghost" id="iexp">' + I.dl + esc(t("Exportar CSV")) + "</button>" + (can("transfers") ? '<a class="btn btn--ghost" href="#/transfers">' + I.transfers + esc(t("Transferir")) + "</a>" : "")) +
      '<div class="kpis kpis--sm"><div class="kpi"><span class="kpi__l">' + esc(t("Unidades en stock")) + '</span><b class="kpi__v">' + num(rows.reduce((a, r) => a + r.qty, 0)) + '</b><span class="kpi__s">' + num(rows.length) + " " + esc(t("productos")) + '</span></div><div class="kpi"><span class="kpi__l">' + esc(t("Valor al costo (estimado)")) + '</span><b class="kpi__v">' + money(rows.reduce((a, r) => a + r.value, 0)) + '</b><span class="kpi__s">' + esc(t("Costo editable en Ajustes")) + '</span></div><button class="kpi kpi--btn" data-f="low"><span class="kpi__l">' + badge(t("Stock bajo"), "warn") + '</span><b class="kpi__v">' + num(rows.filter((r) => r.st !== "ok").length) + '</b><span class="kpi__s">' + esc(t("en o bajo el mínimo")) + '</span></button><button class="kpi kpi--btn" data-f="exp"><span class="kpi__l">' + badge(t("Por vencer"), "bad") + '</span><b class="kpi__v">' + num(rows.filter((r) => r.days != null && r.days <= 60).length) + '</b><span class="kpi__s">' + esc(t("lote más próximo ≤ 60 días")) + "</span></button></div>" +
      '<div class="card"><div class="tools"><label class="gsearch gsearch--in">' + I.search + '<input id="iq" type="search" value="' + esc(fq) + '" placeholder="' + esc(t("Buscar producto…")) + '"></label><div class="chips" id="iff">' + [["all", "Todo"], ["low", "Stock bajo"], ["exp", "Por vencer"]].map(([k, l]) => '<button class="chip" data-v="' + k + '" aria-pressed="' + (k === ff) + '">' + esc(t(l)) + "</button>").join("") + '</div><select class="sel" id="ic">' + opt("all", t("Todas las categorías")) + B.categories.map((c) => opt(c.id, t(c.name))).join("") + "</select></div>" +
      '<div class="tbl-w"><table class="tbl"><thead><tr><th>' + [t("Producto"), t("Categoría"), t("Precio"), t("Stock"), t("Mínimo"), t("Estado"), t("Vence"), ""].map(esc).join("</th><th>") + '</th></tr></thead><tbody id="ib"></tbody></table></div></div>' +
      (bid === "all" ? card(t("Stock por sucursal (productos con alerta)"), '<div class="tbl-w" id="matrix"></div>') : "");
    function render() {
      const r = rows.filter((x) => (fc === "all" || x.p.cat === fc) && (ff === "all" || (ff === "low" ? x.st !== "ok" : x.days != null && x.days <= 60)) && (!fq || norm(x.p.short + " " + x.p.name + " " + x.p.brandName).includes(norm(fq))));
      $("#ib").innerHTML = r.map((x) => '<tr><td><span class="who"><img src="../' + esc(x.p.img) + '" width="36" height="36" alt=""><span><b>' + esc(x.p.short) + "</b><small>" + esc(x.p.brandName) + " · " + esc(x.p.size) + "</small></span></span></td><td>" + esc(catName(x.p.cat)) + '</td><td class="num">' + money(x.p.price) + '</td><td class="num"><b>' + num(x.qty) + '</b></td><td class="num">' + num(x.min) + "</td><td>" + (x.st === "out" ? badge(t("Agotado"), "bad") : x.st === "low" ? badge(bid === "all" ? x.low + " " + t("suc. bajo mínimo") : t("Bajo"), "warn") : badge("OK", "ok")) + "</td><td>" + (x.exp ? '<span class="' + (x.days <= 30 ? "late" : x.days <= 60 ? "due" : "") + '">' + esc(fdate(x.exp + "T12:00:00-04:00", { year: "2-digit" })) + "</span>" : "—") + "</td><td>" + (editable ? '<button class="btn btn--sm btn--ghost" data-adj="' + x.p.id + '">' + esc(t("Ajustar")) + "</button>" : "") + "</td></tr>").join("") || '<tr><td colspan="8">' + empty(t("Nada con esos filtros.")) + "</td></tr>";
    }
    if (bid === "all") {
      const alertP = invRows("all").filter((x) => x.st !== "ok").slice(0, 14);
      $("#matrix").innerHTML = '<table class="tbl tbl--mx"><thead><tr><th>' + esc(t("Producto")) + "</th>" + D.db.branches.map((b) => '<th title="' + esc(bname(b.id)) + '">' + esc(b.name.replace("Cochabamba", "Cbba").replace("Shopping ", "")) + "</th>").join("") + "</tr></thead><tbody>" + alertP.map((x) => "<tr><td>" + esc(x.p.short) + "</td>" + D.db.branches.map((b) => { const r = D.db.inventory[b.id][x.p.id]; return '<td class="num ' + (r.qty === 0 ? "c-out" : r.qty <= r.min ? "c-low" : "") + '">' + r.qty + "</td>"; }).join("") + "</tr>").join("") + "</tbody></table>";
    }
    $("#iq").oninput = (e) => { fq = e.target.value; render(); };
    $("#iff").onclick = (e) => { const b = e.target.closest("[data-v]"); if (!b) return; ff = b.dataset.v; $$("#iff .chip").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); render(); };
    $$("[data-f]").forEach((b) => b.onclick = () => { ff = b.dataset.f; $$("#iff .chip").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.v === ff))); render(); });
    $("#ic").onchange = (e) => { fc = e.target.value; render(); };
    $("#ib").onclick = (e) => { const b = e.target.closest("[data-adj]"); if (!b) return; const pid = b.dataset.adj, r = D.db.inventory[bid][pid];
      modal(t("Ajustar stock") + " · " + pname(pid), '<p class="muted">' + esc(bname(bid)) + " · " + esc(t("Stock actual")) + ": <b>" + num(r.qty) + "</b></p>" +
        '<div class="row2">' + field(t("Movimiento"), '<select name="kind" class="sel">' + [["in", "Ingreso de mercadería"], ["out", "Salida / merma"], ["count", "Conteo físico (dejar en)"]].map(([k, l]) => opt(k, t(l))).join("") + "</select>") + field(t("Cantidad"), inp("qty", "", ' type="number" min="0" required')) + "</div>" +
        '<div class="row2">' + field(t("Stock mínimo"), inp("min", r.min, ' type="number" min="0"')) + field(t("Vencimiento del lote más próximo"), inp("exp", r.exp || "", ' type="date"')) + "</div>" + field(t("Motivo"), inp("reason", "", ' placeholder="' + esc(t("Ej.: llegó pedido de Dragon Pharma")) + '"')),
        (fd) => { const n = +fd.get("qty") || 0, k = fd.get("kind"); const d = k === "in" ? n : k === "out" ? -n : n - r.qty; if (d) D.adjustStock(bid, pid, d, fd.get("reason"), who()); D.setStock(bid, pid, { min: +fd.get("min") || 0, exp: fd.get("exp") || null }, who()); toast(t("Stock actualizado")); route(); }); };
    $("#iexp").onclick = () => download("inventario-" + today() + ".csv", D.toCSV(rows.map((x) => ({ producto: x.p.short, marca: x.p.brandName, categoria: x.p.cat, precio: x.p.price, costo: x.p.cost, stock: x.qty, minimo: x.min, vence: x.exp || "", sucursal: scope() }))));
    render();
  };

  /* ================= TRANSFERENCIAS ================= */
  VIEWS.transfers = function (v) {
    const list = D.db.transfers.filter((x) => curBranch() === "all" || x.from === curBranch() || x.to === curBranch());
    v.innerHTML = head(t("Transferencias"), esc(t("Mové stock entre sucursales y confirmá la recepción.")), '<button class="btn" id="tadd">' + I.plus + esc(t("Nueva transferencia")) + "</button>") +
      '<div class="card"><div class="tbl-w"><table class="tbl"><thead><tr><th>' + [t("N°"), t("Fecha"), t("Desde"), t("Hacia"), t("Productos"), t("Estado"), ""].map(esc).join("</th><th>") + "</th></tr></thead><tbody>" + (list.map((x) => "<tr><td><b>" + esc(x.id) + "</b></td><td>" + esc(fdt(x.date)) + "</td><td>" + esc(bname(x.from)) + "</td><td>" + esc(bname(x.to)) + "</td><td>" + esc(x.lines.map((l) => l.qty + "× " + pname(l.pid)).join(", ")) + "</td><td>" + (x.status === "recibida" ? badge(t("Recibida"), "ok") : badge(t("En camino"), "info")) + "</td><td>" + (x.status !== "recibida" && (global() || ME.branchId === x.to) ? '<button class="btn btn--sm" data-rcv="' + x.id + '">' + esc(t("Confirmar recepción")) + "</button>" : "") + "</td></tr>").join("") || '<tr><td colspan="7">' + empty(t("Sin transferencias.")) + "</td></tr>") + "</tbody></table></div></div>";
    v.onclick = (e) => { const b = e.target.closest("[data-rcv]"); if (b) { D.receive(b.dataset.rcv, who()); toast(t("Stock sumado a la sucursal de destino")); route(); } };
    $("#tadd").onclick = () => {
      const from0 = curBranch() === "all" ? D.db.branches[0].id : curBranch();
      const line = () => '<div class="row2 tl">' + field(t("Producto"), '<select name="pid" class="sel">' + D.products().map((p) => opt(p.id, p.short)).join("") + "</select>") + field(t("Cantidad"), '<input name="qty" type="number" min="1" value="1">') + "</div>";
      const f = modal(t("Nueva transferencia"), '<div class="row2">' + field(t("Desde"), '<select name="from" class="sel">' + branchOpts(from0) + "</select>") + field(t("Hacia"), '<select name="to" class="sel">' + branchOpts(D.db.branches.find((b) => b.id !== from0).id) + "</select>") + '</div><div id="tls">' + line() + '</div><button type="button" class="btn btn--sm btn--ghost" id="tl+">' + I.plus + esc(t("Otro producto")) + '</button><p class="err" id="terr"></p>',
        (fd, form) => {
          const from = fd.get("from"), to = fd.get("to"); if (from === to) { $("#terr").textContent = t("Elegí sucursales distintas."); return false; }
          const pids = fd.getAll("pid"), qs = fd.getAll("qty"), lines = [];
          pids.forEach((pid, i) => { const n = +qs[i] || 0; if (n > 0) { const ex = lines.find((l) => l.pid === pid); if (ex) ex.qty += n; else lines.push({ pid, qty: n }); } });
          const short1 = lines.find((l) => D.db.inventory[from][l.pid].qty < l.qty); if (short1) { $("#terr").textContent = t("No hay suficiente stock de") + " " + pname(short1.pid) + " (" + D.db.inventory[from][short1.pid].qty + ")."; return false; }
          if (!lines.length) return false;
          D.transfer({ from, to, lines }, who()); toast(t("Transferencia creada")); route();
        });
      $("#tl\\+", f).onclick = () => $("#tls", f).insertAdjacentHTML("beforeend", line());
    };
  };

  /* ================= SUCURSALES ================= */
  VIEWS.branches = function (v, id) {
    if (id) return branchPage(v, id);
    const month = monthRange();
    v.innerHTML = head(t("Sucursales"), num(D.db.branches.length) + " " + esc(t("tiendas en 7 ciudades")) + " · " + esc(t("meta y ventas del mes en curso"))) +
      '<div class="bcards">' + D.db.branches.filter((b) => global() || b.id === ME.branchId).map((b) => {
        const k = D.kpis(Object.assign({ branch: b.id }, month)), td = D.kpis(Object.assign({ branch: b.id }, D.range("today"))), prog = b.target ? k.rev / b.target : 0;
        const inv = invRows(b.id), low = inv.filter((r) => r.st !== "ok").length, st = openNow(b);
        return '<a class="bcard card" href="#/branches/' + b.id + '"><header><div><small>' + esc(b.city) + "</small><h2>" + esc(b.name) + "</h2></div>" + badge(t(st.l), st.k) + '</header><div class="bcard__n"><div><small>' + esc(t("Hoy")) + "</small><b>" + money(td.rev) + "</b></div><div><small>" + esc(t("Mes")) + "</small><b>" + money(k.rev) + "</b></div><div><small>" + esc(t("Tickets mes")) + "</small><b>" + num(k.orders) + '</b></div></div><div class="prog prog--lg"><i style="width:' + Math.min(100, prog * 100).toFixed(0) + '%"></i></div><p class="muted">' + pct(prog) + " " + esc(t("de la meta")) + " (" + money(b.target) + ") · " + num(D.db.staff.filter((s) => s.branchId === b.id && s.active).length) + " " + esc(t("personas")) + (low ? " · " + num(low) + " " + esc(t("alertas de stock")) : "") + "</p></a>";
      }).join("") + "</div>";
  };
  function monthRange() { const d = today(), from = new Date(d.slice(0, 8) + "01T00:00:00-04:00").getTime(); return { from, to: D.range("today").to }; }
  function openNow(b) { if (!b.open) return { l: "Horario no publicado", k: "n" }; const h = new Intl.DateTimeFormat("en-GB", { timeZone: B.config.timezone, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()); return h >= b.open && h < b.close ? { l: "Abierta", k: "ok" } : { l: "Cerrada", k: "n" }; }
  function branchPage(v, id) {
    const b = BR(id); if (!b) { v.innerHTML = empty(t("Sucursal no encontrada.")); return; }
    const f = Object.assign({}, D.range(S.period), { branch: id }), k = D.kpis(f), month = D.kpis(Object.assign({ branch: id }, monthRange()));
    const team = D.db.staff.filter((s) => s.branchId === id);
    v.innerHTML = '<a class="back" href="#/branches">← ' + esc(t("Sucursales")) + "</a>" + head(b.city + " · " + b.name, esc(b.address || t("Dirección no publicada")) + " · " + (b.open ? esc(b.open + "–" + b.close) : esc(t("Horario no publicado"))), ["owner", "admin"].includes(ME.role) ? '<button class="btn btn--ghost" id="bedit">' + esc(t("Editar")) + "</button>" : "") +
      '<div class="kpis"><div class="kpi"><span class="kpi__l">' + esc(t("Ventas")) + " · " + esc(periodLbl()) + '</span><b class="kpi__v">' + money(k.rev) + '</b><span class="kpi__s">' + delta(k.delta) + '</span></div><div class="kpi"><span class="kpi__l">' + esc(t("Meta del mes")) + '</span><b class="kpi__v">' + pct(b.target ? month.rev / b.target : 0) + '</b><span class="kpi__s">' + money(month.rev) + " / " + money(b.target) + '</span><div class="prog"><i style="width:' + Math.min(100, month.rev / (b.target || 1) * 100).toFixed(0) + '%"></i></div></div><div class="kpi"><span class="kpi__l">' + esc(t("Tickets")) + '</span><b class="kpi__v">' + num(k.orders) + '</b><span class="kpi__s">' + esc(t("Ticket promedio")) + " " + money(k.avg) + '</span></div><div class="kpi"><span class="kpi__l">' + esc(t("Margen bruto (estimado)")) + '</span><b class="kpi__v">' + pct(k.margin) + '</b><span class="kpi__s">' + num(k.units) + " " + esc(t("unidades")) + "</span></div></div>" +
      '<div class="grid g-2-1">' + card(t("Ventas por día"), '<div class="chart" id="bl"></div>') + card(t("Equipo"), '<ul class="list">' + team.map((s) => { const r = D.byStaff(f).find((x) => x.key === s.id); return '<li>' + avatar(s.name) + '<div><a href="#/staff/' + s.id + '">' + esc(s.name) + "</a><small>" + esc(t(ROLE[s.role])) + "</small></div><b>" + money(r ? r.rev : 0) + "</b></li>"; }).join("") + "</ul>") + "</div>" +
      '<div class="grid g-2">' + card(t("Productos más vendidos"), C.hbars(D.byProduct(f).slice(0, 8).map((r) => ({ label: pname(r.key), sub: num(r.units) + " u.", v: r.rev })), { fmt: money })) + card(t("Ventas por hora"), '<div class="chart" id="bh"></div>') + "</div>";
    C.line($("#bl"), D.series(f).map((d) => ({ x: short(d.day), v: d.rev, sub: num(d.orders) + " " + t("tickets") })), { id: "br", fmt: money, fmtAxis: (n) => (n >= 1000 ? Math.round(n / 1000) + "k" : Math.round(n)), label: t("Ventas por día") });
    C.bars($("#bh"), D.byHour(f).slice(9, 23).map((h) => ({ x: h.key + "h", v: h.rev })), { fmt: money, fmtAxis: (n) => (n >= 1000 ? Math.round(n / 1000) + "k" : Math.round(n)), label: t("Ventas por hora") });
    const be = $("#bedit"); if (be) be.onclick = () => modal(t("Editar sucursal"), '<div class="row2">' + field(t("Nombre"), inp("name", b.name, " required")) + field(t("Ciudad"), inp("city", b.city, " required")) + "</div>" + field(t("Dirección"), inp("address", b.address)) + '<div class="row3">' + field(t("Abre"), inp("open", b.open, ' type="time"')) + field(t("Cierra"), inp("close", b.close, ' type="time"')) + field(t("Meta mensual (Bs)"), inp("target", b.target, ' type="number" min="0"')) + "</div>",
      (fd) => { Object.assign(b, { name: fd.get("name"), city: fd.get("city"), address: fd.get("address"), open: fd.get("open"), close: fd.get("close"), target: +fd.get("target") || 0 }); D.log(who(), "Sucursal " + b.name + " editada"); D.save(); toast(t("Guardado")); route(); });
  }

  /* ================= PERSONAL ================= */
  VIEWS.staff = function (v, id) {
    if (id) return staffPage(v, id);
    const f = filt(), perf = D.byStaff(f), ords = {}; D.salesIn(f).forEach((s) => { ords[s.staffId] = (ords[s.staffId] || 0) + 1; });
    const list = D.db.staff.filter((s) => curBranch() === "all" || s.branchId === curBranch());
    const editable = ["owner", "admin"].includes(ME.role) || ME.role === "manager";
    v.innerHTML = head(t("Personal"), num(list.filter((s) => s.active).length) + " " + esc(t("personas activas")) + " · " + esc(scope()) + " · " + esc(periodLbl()), editable ? '<button class="btn" id="sadd">' + I.plus + esc(t("Agregar persona")) + "</button>" : "") +
      '<div class="card"><div class="tbl-w"><table class="tbl"><thead><tr><th>' + [t("Nombre"), t("Rol"), t("Sucursal"), t("Ventas"), t("Tickets"), t("Comisión est."), t("Estado"), ""].map(esc).join("</th><th>") + "</th></tr></thead><tbody>" +
      list.sort((a, b) => ((perf.find((x) => x.key === b.id) || {}).rev || 0) - ((perf.find((x) => x.key === a.id) || {}).rev || 0)).map((s) => { const r = perf.find((x) => x.key === s.id), rev = r ? r.rev : 0; return '<tr><td><a class="who" href="#/staff/' + s.id + '">' + avatar(s.name) + "<span><b>" + esc(s.name) + "</b><small>" + esc(s.phone) + "</small></span></a></td><td>" + esc(t(ROLE[s.role])) + "</td><td>" + esc(s.branchId ? bname(s.branchId) : t("Todas")) + '</td><td class="num"><b>' + money(rev) + '</b></td><td class="num">' + num(ords[s.id] || 0) + '</td><td class="num">' + money(rev * (s.commission || 0) / 100) + " <small class=\"muted\">(" + (s.commission || 0) + "%)</small></td><td>" + (s.active ? badge(t("Activo"), "ok") : badge(t("Inactivo"))) + "</td><td>" + (editable && !["owner"].includes(s.role) ? '<button class="btn btn--sm btn--ghost" data-ed="' + s.id + '">' + esc(t("Editar")) + "</button>" : "") + "</td></tr>"; }).join("") + "</tbody></table></div></div>";
    v.onclick = (e) => { const b = e.target.closest("[data-ed]"); if (b) staffForm(ST(b.dataset.ed)); };
    if ($("#sadd")) $("#sadd").onclick = () => staffForm(null);
  };
  function staffForm(s) {
    const e = s || { name: "", role: "seller", branchId: curBranch() === "all" ? D.db.branches[0].id : curBranch(), phone: "591", email: "", hired: today(), commission: 3, active: true, pin: "1234" };
    const roles = ME.role === "manager" ? ["seller", "coach"] : ["admin", "manager", "seller", "coach", "warehouse"];
    modal(s ? t("Editar persona") : t("Agregar persona"),
      '<div class="row2">' + field(t("Nombre completo"), inp("name", e.name, " required")) + field(t("Teléfono"), inp("phone", e.phone, " required")) + "</div>" +
      '<div class="row2">' + field(t("Rol"), '<select name="role" class="sel">' + roles.map((r) => opt(r, t(ROLE[r]), e.role)).join("") + "</select>") + field(t("Sucursal"), '<select name="branchId" class="sel">' + (ME.role === "manager" ? branchOpts(ME.branchId).split("</option>").filter((x) => x.includes('"' + ME.branchId + '"')).join("</option>") + "</option>" : opt("", t("Todas (oficina central)"), e.branchId || "") + branchOpts(e.branchId)) + "</select>") + "</div>" +
      '<div class="row3">' + field(t("Fecha de ingreso"), inp("hired", e.hired, ' type="date"')) + field(t("Comisión (%)"), inp("commission", e.commission, ' type="number" min="0" max="20" step="0.5"')) + field(t("PIN de acceso"), inp("pin", e.pin, ' inputmode="numeric" pattern="[0-9]{4,6}" required')) + "</div>" +
      field(t("Email"), inp("email", e.email, ' type="email"')) + '<label class="chk"><input type="checkbox" name="active"' + (e.active ? " checked" : "") + "> " + esc(t("Activo (puede iniciar sesión)")) + "</label>",
      (fd) => { D.upsert("staff", Object.assign(s ? { id: s.id } : {}, { name: fd.get("name"), phone: fd.get("phone"), role: fd.get("role"), branchId: fd.get("branchId") || null, hired: fd.get("hired"), commission: +fd.get("commission") || 0, pin: fd.get("pin"), email: fd.get("email"), active: !!fd.get("active") }), "st", who()); toast(t("Guardado")); route(); });
  }
  function staffPage(v, id) {
    const s = ST(id); if (!s) { v.innerHTML = empty(t("Persona no encontrada.")); return; }
    const f = Object.assign({}, D.range(S.period), { branch: "all" }), mine = D.salesIn(f).filter((x) => x.staffId === id);
    const rev = mine.reduce((a, x) => a + x.total, 0), map = {};
    D.series(f).forEach((d) => { map[d.day] = { x: short(d.day), v: 0 }; }); mine.forEach((x) => { const k = D.dayKey(x.date); if (map[k]) map[k].v += x.total; });
    const sh = D.db.shifts.filter((x) => x.staffId === id);
    v.innerHTML = '<a class="back" href="#/staff">← ' + esc(t("Personal")) + "</a>" + '<div class="prof card"><div class="prof__id">' + avatar(s.name) + "<div><h1>" + esc(s.name) + "</h1><p>" + badge(t(ROLE[s.role])) + " " + (s.active ? badge(t("Activo"), "ok") : badge(t("Inactivo"))) + '</p><p class="muted">' + esc(s.branchId ? bname(s.branchId) : t("Oficina central")) + " · " + esc(s.phone) + " · " + esc(t("Ingreso")) + " " + esc(s.hired) + '</p></div></div><div class="acts"><a class="btn btn--wa" target="_blank" rel="noopener" href="' + esc(wa(s.phone)) + '">' + I.wa + "WhatsApp</a></div></div>" +
      '<div class="kpis"><div class="kpi"><span class="kpi__l">' + esc(t("Ventas")) + " · " + esc(periodLbl()) + '</span><b class="kpi__v">' + money(rev) + '</b></div><div class="kpi"><span class="kpi__l">' + esc(t("Tickets")) + '</span><b class="kpi__v">' + num(mine.length) + '</b><span class="kpi__s">' + esc(t("Ticket promedio")) + " " + money(mine.length ? rev / mine.length : 0) + '</span></div><div class="kpi"><span class="kpi__l">' + esc(t("Comisión estimada")) + '</span><b class="kpi__v">' + money(rev * (s.commission || 0) / 100) + '</b><span class="kpi__s">' + (s.commission || 0) + "% " + esc(t("de las ventas")) + '</span></div><div class="kpi"><span class="kpi__l">' + esc(t("Clientes atendidos")) + '</span><b class="kpi__v">' + num(new Set(mine.filter((x) => x.memberId).map((x) => x.memberId)).size) + "</b></div></div>" +
      '<div class="grid g-2-1">' + card(t("Ventas por día"), '<div class="chart" id="sl"></div>') + card(t("Turnos de la semana"), '<ul class="list">' + DAYS.map((d, i) => { const x = sh.find((z) => z.day === i); return "<li><b>" + esc(t(d)) + "</b><span>" + (x ? esc(x.from + "–" + x.to) : '<span class="muted">' + esc(t("Libre")) + "</span>") + "</span></li>"; }).join("") + "</ul>") + "</div>";
    C.line($("#sl"), Object.values(map), { id: "st", fmt: money, fmtAxis: (n) => (n >= 1000 ? Math.round(n / 1000) + "k" : Math.round(n)), label: t("Ventas por día") });
  }

  /* ================= TURNOS ================= */
  VIEWS.schedule = function (v) {
    let bid = curBranch() === "all" ? D.db.branches[0].id : curBranch();
    function render() {
      const team = D.db.staff.filter((s) => s.branchId === bid && s.active);
      const editable = ["owner", "admin", "manager"].includes(ME.role);
      v.innerHTML = head(t("Turnos"), esc(t("Horario semanal del equipo. Tocá una celda para cambiarla.")), curBranch() === "all" ? '<label class="inl">' + esc(t("Sucursal")) + ' <select class="sel" id="shB">' + branchOpts(bid) + "</select></label>" : "") +
        '<div class="card"><div class="tbl-w"><table class="tbl tbl--sch"><thead><tr><th>' + esc(t("Persona")) + "</th>" + DAYS.map((d) => "<th>" + esc(t(d)) + "</th>").join("") + "</tr></thead><tbody>" +
        team.map((s) => "<tr><td><b>" + esc(s.name) + "</b><small class=\"muted\"> " + esc(t(ROLE[s.role])) + "</small></td>" + DAYS.map((d, i) => { const x = D.db.shifts.find((z) => z.staffId === s.id && z.day === i); return '<td><button class="shift' + (x ? "" : " off") + '" data-s="' + s.id + '" data-d="' + i + '"' + (editable ? "" : " disabled") + ">" + (x ? esc(x.from + "–" + x.to) : esc(t("Libre"))) + "</button></td>"; }).join("") + "</tr>").join("") + "</tbody></table></div></div>" +
        '<p class="muted">' + esc(t("Cobertura por día")) + ": " + DAYS.map((d, i) => esc(t(d)) + " " + team.filter((s) => D.db.shifts.some((z) => z.staffId === s.id && z.day === i)).length).join(" · ") + "</p>";
      if ($("#shB")) $("#shB").onchange = (e) => { bid = e.target.value; render(); };
      v.querySelector("tbody").onclick = (e) => { const b = e.target.closest(".shift"); if (!b || b.disabled) return; const sid = b.dataset.s, day = +b.dataset.d, x = D.db.shifts.find((z) => z.staffId === sid && z.day === day);
        modal(ST(sid).name + " · " + t(DAYS[day]), '<label class="chk"><input type="checkbox" name="off"' + (x ? "" : " checked") + "> " + esc(t("Día libre")) + '</label><div class="row2">' + field(t("Entrada"), inp("from", x ? x.from : "10:00", ' type="time"')) + field(t("Salida"), inp("to", x ? x.to : "18:00", ' type="time"')) + "</div>",
          (fd) => { D.db.shifts = D.db.shifts.filter((z) => !(z.staffId === sid && z.day === day)); if (!fd.get("off")) D.db.shifts.push({ staffId: sid, day, from: fd.get("from"), to: fd.get("to") }); D.log(who(), "Turno de " + ST(sid).name + " actualizado"); D.save(); render(); }); };
    }
    render();
  };

  /* ================= CAMPAÑAS ================= */
  const SEGS = { todos: "Todos los clientes", vip: "VIP", frecuente: "Frecuentes", nuevo: "Nuevos", riesgo: "En riesgo (60+ días sin comprar)", inactivo: "Sin compras", cumple: "Cumpleaños este mes", reposicion: "Reposición en los próximos 7 días" };
  function segment(seg) {
    const idx = D.salesByMember(), mon = today().slice(5, 7), lim = D.dayKey(Date.now() + 7 * D.DAY);
    return D.db.members.filter((m) => m.waOptIn && (curBranch() === "all" || m.branchId === curBranch())).map((m) => ({ m, s: D.memberStats(m.id, idx) })).filter((x) =>
      seg === "todos" ? true : seg === "cumple" ? x.m.birthday && x.m.birthday.slice(5, 7) === mon : seg === "reposicion" ? x.s.refill && x.s.refill.due >= today() && x.s.refill.due <= lim : x.s.seg === seg);
  }
  VIEWS.campaigns = function (v, id, q) {
    const list = D.db.campaigns;
    v.innerHTML = head(t("Campañas"), esc(t("Promociones, cupones y difusión por WhatsApp a segmentos del club.")), '<button class="btn" id="cadd">' + I.plus + esc(t("Nueva campaña")) + "</button>") +
      '<div class="grid g-2-1"><div class="card"><div class="tbl-w"><table class="tbl"><thead><tr><th>' + [t("Campaña"), t("Tipo"), t("Fechas"), t("Segmento"), t("Estado"), ""].map(esc).join("</th><th>") + "</th></tr></thead><tbody>" +
      list.map((c) => "<tr><td><b>" + esc(c.name) + "</b>" + (c.code ? ' <code>' + esc(c.code) + "</code>" : "") + "<small class=\"muted\" style=\"display:block\">" + esc(c.note || "") + "</small></td><td>" + esc(t({ descuento: "Descuento", cupon: "Cupón", puntos: "Puntos extra", regalo: "Regalo" }[c.type] || c.type)) + "</td><td>" + esc(short(c.from) + " – " + short(c.to)) + "</td><td>" + esc(t(SEGS[c.segment] || c.segment)) + "</td><td>" + badge(t({ activa: "Activa", programada: "Programada", finalizada: "Finalizada", borrador: "Borrador" }[status(c)]), { activa: "ok", programada: "info", finalizada: "n", borrador: "n" }[status(c)]) + '</td><td class="acts"><button class="btn btn--sm" data-bc="' + c.segment + '" data-msg="' + esc(c.note || c.name) + '">' + esc(t("Difundir")) + '</button><button class="btn btn--sm btn--ghost" data-ce="' + c.id + '">' + esc(t("Editar")) + "</button></td></tr>").join("") + "</tbody></table></div></div>" +
      card(t("Segmentos del club"), '<ul class="list">' + Object.keys(SEGS).map((k) => '<li><div><b>' + esc(t(SEGS[k])) + '</b></div><span class="num">' + num(segment(k).length) + '</span><button class="btn btn--sm btn--ghost" data-bc="' + k + '" data-msg="">' + esc(t("Difundir")) + "</button></li>").join("") + '</ul><p class="muted" style="margin:10px 0 0;font-size:12px">' + esc(t("Solo clientes que aceptaron recibir promociones por WhatsApp.")) + "</p>") + "</div>";
    v.onclick = (e) => { const b = e.target.closest("[data-bc]"); if (b) broadcast(b.dataset.bc, b.dataset.msg); const ed = e.target.closest("[data-ce]"); if (ed) campaignForm(list.find((c) => c.id === ed.dataset.ce)); };
    $("#cadd").onclick = () => campaignForm(null);
    if (q.get("seg")) broadcast(q.get("seg"), "");
  };
  const status = (c) => (c.status === "borrador" ? "borrador" : today() < c.from ? "programada" : today() > c.to ? "finalizada" : "activa");
  function campaignForm(c) {
    const e = c || { name: "", type: "descuento", from: today(), to: D.dayKey(Date.now() + 14 * D.DAY), value: 10, code: "", segment: "todos", note: "", status: "activa" };
    modal(c ? t("Editar campaña") : t("Nueva campaña"), field(t("Nombre"), inp("name", e.name, " required")) +
      '<div class="row3">' + field(t("Tipo"), '<select name="type" class="sel">' + [["descuento", "Descuento"], ["cupon", "Cupón"], ["puntos", "Puntos extra"], ["regalo", "Regalo"]].map(([k, l]) => opt(k, t(l), e.type)).join("") + "</select>") + field(t("Valor (% o ×)"), inp("value", e.value, ' type="number" min="0"')) + field(t("Código"), inp("code", e.code, ' placeholder="VERANO10"')) + "</div>" +
      '<div class="row3">' + field(t("Desde"), inp("from", e.from, ' type="date" required')) + field(t("Hasta"), inp("to", e.to, ' type="date" required')) + field(t("Segmento"), '<select name="segment" class="sel">' + Object.keys(SEGS).map((k) => opt(k, t(SEGS[k]), e.segment)).join("") + "</select>") + "</div>" +
      field(t("Mensaje para WhatsApp"), '<textarea name="note" rows="3" placeholder="' + esc(t("Ej.: Esta semana 2x1 en shakers 🦁")) + '">' + esc(e.note) + "</textarea>") + '<label class="chk"><input type="checkbox" name="draft"' + (e.status === "borrador" ? " checked" : "") + "> " + esc(t("Guardar como borrador")) + "</label>",
      (fd) => { D.upsert("campaigns", Object.assign(c ? { id: c.id } : {}, { name: fd.get("name"), type: fd.get("type"), value: +fd.get("value") || 0, code: fd.get("code").toUpperCase(), from: fd.get("from"), to: fd.get("to"), segment: fd.get("segment"), note: fd.get("note"), channel: "whatsapp", status: fd.get("draft") ? "borrador" : "activa" }), "C", who()); toast(t("Guardado")); route(); });
  }
  function broadcast(seg, msg) {
    const people = segment(seg);
    const tpl = msg || t("¡Hola {nombre}! 🦁 Tenemos novedades para vos en Bolivia Fitness.");
    const f = modal(t("Difusión") + " · " + t(SEGS[seg] || seg), '<p class="muted">' + num(people.length) + " " + esc(t("clientes con WhatsApp autorizado. WhatsApp no permite envíos masivos desde la web: tocá cada contacto para abrir el chat con el mensaje listo, o exportá la lista para WhatsApp Business.")) + "</p>" +
      field(t("Mensaje ({nombre} se reemplaza)"), '<textarea id="bmsg" rows="3">' + esc(tpl) + "</textarea>") +
      '<div class="acts" style="margin:10px 0"><button type="button" class="btn btn--sm btn--ghost" id="bcsv">' + I.dl + esc(t("Exportar lista CSV")) + '</button></div><ul class="list list--scroll" id="blist"></ul>', null, { wide: true, noFocus: true });
    const draw = () => { const m = $("#bmsg", f).value; $("#blist", f).innerHTML = people.slice(0, 300).map((x) => "<li>" + avatar(x.m.name) + "<div><b>" + esc(x.m.name) + "</b><small>" + esc(x.m.phone) + " · " + esc(bname(x.m.branchId)) + '</small></div><a class="btn btn--sm btn--wa" target="_blank" rel="noopener" href="' + esc(wa(x.m.phone, m.replace(/\{nombre\}/g, x.m.name.split(" ")[0]))) + '">' + esc(t("Abrir chat")) + "</a></li>").join("") || "<li>" + esc(t("Nadie en este segmento.")) + "</li>"; };
    $("#bmsg", f).oninput = draw; draw();
    $("#bcsv", f).onclick = () => download("difusion-" + seg + "-" + today() + ".csv", D.toCSV(people.map((x) => ({ nombre: x.m.name, telefono: x.m.phone, mensaje: $("#bmsg", f).value.replace(/\{nombre\}/g, x.m.name.split(" ")[0]) }))));
  }

  /* ================= TAREAS ================= */
  VIEWS.tasks = function (v) {
    let mine = false;
    function render() {
      const list = D.db.tasks.filter((x) => (curBranch() === "all" || x.branchId === curBranch()) && (!mine || x.staffId === ME.id));
      const grp = [["late", "Vencidas", (x) => !x.done && x.due < today()], ["today", "Hoy", (x) => !x.done && x.due === today()], ["next", "Próximas", (x) => !x.done && x.due > today()], ["done", "Hechas", (x) => x.done]];
      v.innerHTML = head(t("Tareas"), esc(scope()), '<label class="chk"><input type="checkbox" id="tm"' + (mine ? " checked" : "") + "> " + esc(t("Solo mías")) + '</label><button class="btn" id="tadd">' + I.plus + esc(t("Nueva tarea")) + "</button>") +
        '<div class="grid g-2">' + grp.map(([k, l, fn]) => { const items = list.filter(fn); return card(t(l) + " · " + items.length, items.length ? '<ul class="tasks">' + items.sort((a, b) => a.due.localeCompare(b.due)).map((x) => '<li class="' + (x.done ? "done" : "") + '"><label><input type="checkbox" data-t="' + x.id + '"' + (x.done ? " checked" : "") + "><span><b>" + esc(x.title) + "</b><small>" + esc(short(x.due)) + " · " + esc((ST(x.staffId) || {}).name || "—") + " · " + esc(bname(x.branchId)) + "</small></span></label>" + badge(t({ alta: "Alta", media: "Media", baja: "Baja" }[x.priority]), { alta: "bad", media: "warn", baja: "n" }[x.priority]) + '<button class="ib ib--sm" data-del="' + x.id + '" aria-label="' + esc(t("Eliminar")) + '">' + I.x + "</button></li>").join("") + "</ul>" : empty(t("Nada por acá."))); }).join("") + "</div>";
      $("#tm").onchange = (e) => { mine = e.target.checked; render(); };
      v.onchange = (e) => { const c = e.target.closest("[data-t]"); if (c) { const x = D.db.tasks.find((z) => z.id === c.dataset.t); x.done = c.checked; D.log(who(), (x.done ? "Completó: " : "Reabrió: ") + x.title); D.save(); render(); } };
      v.onclick = (e) => { const d = e.target.closest("[data-del]"); if (d && confirm(t("¿Eliminar esta tarea?"))) { D.remove("tasks", d.dataset.del, who()); render(); } };
      $("#tadd").onclick = () => modal(t("Nueva tarea"), field(t("Tarea"), inp("title", "", " required")) + '<div class="row3">' + field(t("Vence"), inp("due", today(), ' type="date" required')) + field(t("Prioridad"), '<select name="priority" class="sel">' + [["alta", "Alta"], ["media", "Media"], ["baja", "Baja"]].map(([k, l]) => opt(k, t(l), "media")).join("") + "</select>") + field(t("Sucursal"), '<select name="branchId" class="sel">' + branchOpts(curBranch() === "all" ? (ME.branchId || D.db.branches[0].id) : curBranch()) + "</select>") + "</div>" + field(t("Responsable"), '<select name="staffId" class="sel">' + D.db.staff.filter((s) => s.active).map((s) => opt(s.id, s.name + " · " + t(ROLE[s.role]), ME.id)).join("") + "</select>"),
        (fd) => { D.upsert("tasks", { title: fd.get("title"), due: fd.get("due"), priority: fd.get("priority"), branchId: fd.get("branchId"), staffId: fd.get("staffId"), done: false }, "T", who()); render(); });
    }
    render();
  };

  /* ================= REPORTES ================= */
  VIEWS.reports = function (v) {
    const f = filt(), k = D.kpis(f), all = Object.assign({}, f, { branch: "all" });
    const ords = (fn) => { const m = {}; D.salesIn(f).forEach((s) => { const key = fn(s); m[key] = (m[key] || 0) + 1; }); return m; };
    const bo = {}; D.salesIn(all).forEach((s) => { bo[s.branchId] = (bo[s.branchId] || 0) + 1; });
    const so = ords((s) => s.staffId);
    const tables = {
      branches: { t: "Por sucursal", cols: ["Sucursal", "Ventas", "Tickets", "Ticket prom.", "% del total"], rows: D.byBranch(f).map((r) => [bname(r.key), r.rev, bo[r.key] || 0, (r.rev / (bo[r.key] || 1)), r.rev / D.byBranch(f).reduce((a, x) => a + x.rev, 0)]) },
      products: { t: "Por producto", cols: ["Producto", "Unidades", "Ventas", "Margen est."], rows: D.byProduct(f).map((r) => { const p = P(r.key); return [p.short, r.units, r.rev, (r.rev - r.units * p.cost) / (r.rev || 1)]; }) },
      staff: { t: "Por vendedor", cols: ["Persona", "Sucursal", "Ventas", "Tickets", "Comisión est."], rows: D.byStaff(f).map((r) => { const s = ST(r.key) || {}; return [s.name || r.key, s.branchId ? bname(s.branchId) : "—", r.rev, so[r.key] || 0, r.rev * (s.commission || 0) / 100]; }) },
      categories: { t: "Por categoría", cols: ["Categoría", "Unidades", "Ventas"], rows: D.byCategory(f).map((r) => [catName(r.key), r.units, r.rev]) },
      payments: { t: "Por medio de pago", cols: ["Medio", "Ventas"], rows: D.byPayment(f).map((r) => [t(PAY[r.key]), r.rev]) },
      channels: { t: "Por canal", cols: ["Canal", "Ventas"], rows: D.byChannel(f).map((r) => [t(CH[r.key]), r.rev]) },
    };
    const fmtCell = (c, i, cols) => (typeof c === "number" ? (/%|Margen/.test(cols[i]) ? pct(c) : /Tickets|Unidades/.test(cols[i]) ? num(c) : money(c)) : esc(c));
    let cur = "branches";
    v.innerHTML = head(t("Reportes"), esc(scope()) + " · " + esc(periodLbl()) + " · " + esc(t("comparado con el período anterior")), "") +
      '<div class="kpis"><div class="kpi"><span class="kpi__l">' + esc(t("Ventas")) + '</span><b class="kpi__v">' + money(k.rev) + '</b><span class="kpi__s">' + delta(k.delta) + " " + esc(t("antes")) + " " + money(k.prevRev) + '</span></div><div class="kpi"><span class="kpi__l">' + esc(t("Tickets")) + '</span><b class="kpi__v">' + num(k.orders) + '</b><span class="kpi__s">' + delta(k.prevOrders ? (k.orders - k.prevOrders) / k.prevOrders : 0) + " " + esc(t("antes")) + " " + num(k.prevOrders) + '</span></div><div class="kpi"><span class="kpi__l">' + esc(t("Ticket promedio")) + '</span><b class="kpi__v">' + money(k.avg) + '</b></div><div class="kpi"><span class="kpi__l">' + esc(t("Margen bruto (estimado)")) + '</span><b class="kpi__v">' + pct(k.margin) + "</b></div></div>" +
      '<div class="card"><div class="tools"><div class="chips" id="rt">' + Object.entries(tables).map(([key, x]) => '<button class="chip" data-r="' + key + '" aria-pressed="' + (key === cur) + '">' + esc(t(x.t)) + "</button>").join("") + '</div><button class="btn btn--sm btn--ghost" id="rcsv">' + I.dl + esc(t("Exportar CSV")) + '</button></div><div class="tbl-w" id="rtbl"></div></div>';
    const draw = () => { const x = tables[cur]; $("#rtbl").innerHTML = '<table class="tbl"><thead><tr><th>' + x.cols.map((c) => esc(t(c))).join("</th><th>") + "</th></tr></thead><tbody>" + x.rows.map((r) => "<tr>" + r.map((c, i) => '<td class="' + (typeof c === "number" ? "num" : "") + '">' + fmtCell(c, i, x.cols) + "</td>").join("") + "</tr>").join("") + "</tbody></table>"; };
    $("#rt").onclick = (e) => { const b = e.target.closest("[data-r]"); if (!b) return; cur = b.dataset.r; $$("#rt .chip").forEach((z) => z.setAttribute("aria-pressed", String(z === b))); draw(); };
    $("#rcsv").onclick = () => { const x = tables[cur]; download("reporte-" + cur + "-" + today() + ".csv", D.toCSV(x.rows.map((r) => Object.fromEntries(x.cols.map((c, i) => [c, typeof r[i] === "number" ? Math.round(r[i] * 100) / 100 : r[i]]))))); };
    draw();
  };

  /* ================= AJUSTES ================= */
  VIEWS.settings = function (v) {
    v.innerHTML = head(t("Ajustes"), "") + '<div class="grid g-2">' +
      card(t("Datos"), '<p class="muted">' + esc(t("Esta versión es una demostración: los datos se guardan solo en este navegador (localStorage). Para usarla con todo el equipo a la vez, el siguiente paso es conectarla a una base de datos en la nube con usuarios reales.")) + '</p><div class="acts"><button class="btn btn--ghost" id="bk">' + I.dl + esc(t("Descargar respaldo (JSON)")) + '</button><label class="btn btn--ghost">' + esc(t("Restaurar respaldo")) + '<input type="file" accept="application/json" id="rs" hidden></label><button class="btn btn--danger" id="rst">' + esc(t("Regenerar datos de demostración")) + "</button></div>") +
      card(t("Club León (fidelización)"), '<ul class="list"><li><b>' + esc(t("Acumulación")) + "</b><span>" + esc(t("1 punto por cada Bs 10")) + "</span></li><li><b>" + esc(t("Canje")) + "</b><span>" + esc(t("10 puntos = Bs 1 (hasta 20% del ticket)")) + "</span></li>" + D.TIERS.map((x) => "<li>" + tierBadge(x.id) + "<span>" + esc(t("desde")) + " " + num(x.min) + " " + esc(t("puntos")) + "</span></li>").join("") + "</ul>") +
      card(t("Costos de productos (para margen)"), '<div class="tbl-w" style="max-height:420px"><table class="tbl"><thead><tr><th>' + esc(t("Producto")) + "</th><th>" + esc(t("Precio")) + "</th><th>" + esc(t("Costo")) + "</th></tr></thead><tbody>" + D.products().map((p) => "<tr><td>" + esc(p.short) + '</td><td class="num">' + money(p.price) + '</td><td><input class="cost" type="number" min="0" data-c="' + p.id + '" value="' + p.cost + '" aria-label="' + esc(t("Costo") + " " + p.short) + '"' + (["owner", "admin"].includes(ME.role) ? "" : " disabled") + "></td></tr>").join("") + '</tbody></table></div><p class="muted" style="font-size:12px">' + esc(t("Por defecto el costo se estima en 58% del precio regular.")) + "</p>") +
      card(t("Registro de actividad"), '<ul class="feed feed--scroll">' + D.db.log.slice(0, 120).map((l) => "<li><b>" + esc(l.who) + "</b> " + esc(l.what) + "<small>" + esc(fdt(l.at)) + "</small></li>").join("") + "</ul>") + "</div>";
    $("#bk").onclick = () => download("bolivia-fitness-crm-" + today() + ".json", D.exportJSON(), "application/json");
    $("#rs").onchange = (e) => { const file = e.target.files[0]; if (!file) return; file.text().then((txt) => { try { D.importJSON(txt); toast(t("Respaldo restaurado")); route(); } catch (er) { toast(t("Archivo no válido")); } }); };
    $("#rst").onclick = () => { if (confirm(t("¿Borrar todo y volver a los datos de demostración?"))) { D.reset(); toast(t("Datos regenerados")); ME = ST(ME.id) || ST("st-owner"); route(); } };
    v.addEventListener("change", (e) => { const c = e.target.closest("[data-c]"); if (c) { D.db.cost[c.dataset.c] = +c.value || 0; D.save(); toast(t("Costo guardado")); } });
  };

  /* ---------- arranque ---------- */
  window.addEventListener("hashchange", route);
  document.addEventListener("keydown", (e) => { if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName) && $("#gq")) { e.preventDefault(); $("#gq").focus(); } });
  if (ME) { shell(); route(); } else login();
})();
