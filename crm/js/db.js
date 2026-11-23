/* Bolivia Fitness CRM · capa de datos.
   Guarda todo en localStorage (clave bfcrm_v2). Catálogo, precios y sucursales salen de ../js/data.js
   (window.BFIT), así el CRM y la tienda online nunca se contradicen.
   Los datos iniciales son de DEMOSTRACIÓN: personas, ventas y stock ficticios, generados con una
   semilla fija para que el demo sea igual en todos los navegadores. */
(function () {
  "use strict";
  const B = window.BFIT;
  const KEY = "bfcrm_v2";
  const DAY = 86400000;

  /* ---------- utilidades ---------- */
  function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const iso = (d) => new Date(d).toISOString();
  const dayKey = (d) => B.localDate(new Date(d));
  const uid = (p) => p + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const round = (n) => Math.round(n * 100) / 100;

  /* ---------- sucursales (tiendas físicas reales de la marca) ---------- */
  const BRANCHES = [
    { id: "sc-ventura", name: "Ventura Mall", city: "Santa Cruz", address: "Ventura Mall, planta baja", open: "11:00", close: "22:00", weight: 1.35, target: 120000 },
    { id: "sc-nuflo", name: "Ñuflo de Chávez", city: "Santa Cruz", address: "Calle Ñuflo de Chávez #424", open: "11:00", close: "22:00", weight: 1.1, target: 95000 },
    { id: "sc-cine", name: "Cine Center", city: "Santa Cruz", address: "Cine Center, planta baja", open: "11:00", close: "22:00", weight: 1.15, target: 100000 },
    { id: "sc-fidalga", name: "Shopping Fidalga", city: "Santa Cruz", address: "Shopping Fidalga, piso 2", open: "11:00", close: "22:00", weight: 0.95, target: 85000 },
    { id: "lp-centro", name: "La Paz", city: "La Paz", address: "", open: "", close: "", weight: 1.0, target: 90000 },
    { id: "ea-centro", name: "El Alto", city: "El Alto", address: "", open: "", close: "", weight: 0.6, target: 50000 },
    { id: "cb-1", name: "Cochabamba 1", city: "Cochabamba", address: "", open: "", close: "", weight: 0.85, target: 75000 },
    { id: "cb-2", name: "Cochabamba 2", city: "Cochabamba", address: "", open: "", close: "", weight: 0.65, target: 55000 },
    { id: "su-centro", name: "Sucre", city: "Sucre", address: "Calle Camargo #526 (Multicentro Libertad)", open: "10:00", close: "22:00", weight: 0.6, target: 50000 },
    { id: "or-centro", name: "Oruro", city: "Oruro", address: "", open: "", close: "", weight: 0.45, target: 38000 },
    { id: "tj-centro", name: "Tarija", city: "Tarija", address: "", open: "", close: "", weight: 0.5, target: 42000 },
  ];

  const FIRST = ["Andrés", "Camila", "Diego", "Valeria", "Luis", "Daniela", "Jorge", "Mariana", "Carlos", "Gabriela", "José", "Fernanda", "Miguel", "Paola", "Rodrigo", "Natalia", "Sergio", "Lucía", "Fabián", "Andrea", "Marcelo", "Sofía", "Iván", "Carla", "Mauricio", "Verónica", "Gonzalo", "Alejandra", "Ricardo", "Daniel", "Patricia", "Javier", "Ximena", "Óscar", "Karen", "Pablo", "Mónica", "Hugo", "Claudia", "Renato", "Brenda", "Cristian", "Wendy", "Edwin", "Rocío", "Franz", "Liliana", "Alvaro", "Melissa", "Rubén"];
  const LAST = ["Rojas", "Vargas", "Gutiérrez", "Mamani", "Quispe", "Flores", "Justiniano", "Suárez", "Pérez", "Rodríguez", "Fernández", "López", "Choque", "Áñez", "Paz", "Montaño", "Salvatierra", "Céspedes", "Torrico", "Arce", "Zambrana", "Cuéllar", "Aguilera", "Ribera", "Herrera", "Molina", "Peña", "Soliz", "Villarroel", "Antelo", "Claros", "Medina"];
  const GOALS = ["masa", "definicion", "fuerza", "salud", "rendimiento", "inicio"];
  const SOURCES = ["whatsapp", "leonia", "instagram", "tienda", "web", "tiktok"];
  const PAYMENTS = ["qr", "efectivo", "tarjeta", "transferencia"];
  const CHANNELS = ["tienda", "tienda", "tienda", "tienda", "whatsapp", "web", "leonia"];
  const ROLES = ["owner", "admin", "manager", "seller", "coach", "warehouse"];

  /* ---------- semilla de demostración ---------- */
  function seed(now) {
    const r = rng(20261122), pick = (a) => a[Math.floor(r() * a.length)], int = (a, b) => a + Math.floor(r() * (b - a + 1));
    const products = B.products.map((p) => p.id);
    const name = () => pick(FIRST) + " " + pick(LAST);
    const phone = () => "5917" + int(0, 9) + String(int(1000000, 9999999));
    const today0 = new Date(dayKey(now) + "T00:00:00-04:00").getTime();

    // personal
    const staff = [
      { id: "st-owner", name: "Dueño (demo)", role: "owner", branchId: null, phone: phone(), email: "dueno@demo.bf", hired: "2022-03-01", commission: 0, active: true, pin: "1234" },
      { id: "st-admin", name: "Administración (demo)", role: "admin", branchId: null, phone: phone(), email: "admin@demo.bf", hired: "2023-01-10", commission: 0, active: true, pin: "1234" },
    ];
    BRANCHES.forEach((b, i) => {
      staff.push({ id: "st-m-" + b.id, name: name(), role: "manager", branchId: b.id, phone: phone(), email: "", hired: "202" + int(3, 5) + "-0" + int(1, 9) + "-1" + int(0, 9), commission: 2, active: true, pin: "1234" });
      const n = b.weight > 1 ? 3 : 2;
      for (let k = 0; k < n; k++) staff.push({ id: "st-" + b.id + "-" + k, name: name(), role: k === 2 ? "coach" : "seller", branchId: b.id, phone: phone(), email: "", hired: "202" + int(4, 6) + "-" + String(int(1, 12)).padStart(2, "0") + "-0" + int(1, 9), commission: 3, active: true, pin: "1234" });
    });
    staff.push({ id: "st-wh", name: name(), role: "warehouse", branchId: "sc-ventura", phone: phone(), email: "", hired: "2024-06-01", commission: 0, active: true, pin: "1234" });
    BRANCHES.forEach((b) => { b.managerId = "st-m-" + b.id; });

    // clientes (miembros del club)
    const members = [];
    for (let i = 0; i < 1400; i++) {
      const b = pick(BRANCHES.flatMap((x) => Array(Math.ceil(x.weight * 4)).fill(x)));
      const joined = today0 - int(5, 700) * DAY;
      members.push({ id: "m-" + (1000 + i), name: name(), phone: phone(), email: "", city: b.city, branchId: b.id, birthday: "19" + int(75, 99) + "-" + String(int(1, 12)).padStart(2, "0") + "-" + String(int(1, 28)).padStart(2, "0"),
        joined: iso(joined), act: Math.pow(r(), 3), goal: pick(GOALS), source: pick(SOURCES), tags: r() < .12 ? ["atleta"] : r() < .1 ? ["gimnasio aliado"] : [], notes: [], points: 0, waOptIn: r() < .85 });
    }

    // inventario por sucursal
    const inventory = {};
    BRANCHES.forEach((b) => { inventory[b.id] = {}; products.forEach((pid) => {
      const cat = B.products.find((p) => p.id === pid).cat, big = ["creatinas", "proteinas", "preentrenos"].includes(cat);
      const min = big ? Math.round(6 * b.weight) + 2 : Math.round(3 * b.weight) + 1;
      const qty = r() < .07 ? int(0, Math.max(0, min - 1)) : int(min, min * 4);
      const exp = cat === "accesorios" ? null : dayKey(today0 + int(20, 640) * DAY);
      inventory[b.id][pid] = { qty, min, exp };
    }); });

    // ventas de los últimos 120 días
    const sales = [];
    const popularity = Object.fromEntries(B.products.map((p) => [p.id, (p.star ? 3 : 1) * (["creatinas", "proteinas", "preentrenos"].includes(p.cat) ? 2.2 : 1) * (p.cat === "accesorios" ? .5 : 1)]));
    const bag = products.flatMap((pid) => Array(Math.round(popularity[pid] * 3)).fill(pid));
    // clientes por sucursal, ponderados por actividad (pocos muy frecuentes, muchos ocasionales)
    const pool = {}; BRANCHES.forEach((b) => { pool[b.id] = members.filter((m) => m.branchId === b.id).flatMap((m) => Array(1 + Math.round(m.act * 12)).fill(m)); });
    const sellers = (bid) => staff.filter((s) => s.branchId === bid && ["seller", "manager", "coach"].includes(s.role));
    let n = 0;
    for (let d = 119; d >= 0; d--) {
      const day0 = today0 - d * DAY, date = new Date(day0 + 12 * 3600000), dow = date.getUTCDay();
      const bf = B.campaignActive(date), growth = 1 + (119 - d) / 119 * .25;
      BRANCHES.forEach((b) => {
        let count = Math.round((3 + r() * 4) * b.weight * growth * (dow === 6 || dow === 0 ? 1.35 : 1) * (bf ? 1.9 : 1));
        if (d === 0) count = Math.round(count * Math.min(1, (Date.now() - day0) / (15 * 3600000)));
        for (let k = 0; k < count; k++) {
          const lines = [], nl = r() < .62 ? 1 : r() < .75 ? 2 : 3, used = new Set();
          for (let j = 0; j < nl; j++) { const pid = pick(bag); if (used.has(pid)) continue; used.add(pid); lines.push({ pid, qty: r() < .88 ? 1 : 2, price: B.priceOf(B.products.find((p) => p.id === pid), date) }); }
          const sub = lines.reduce((a, l) => a + l.qty * l.price, 0);
          const member = r() < .5 ? (r() < .9 && pool[b.id].length ? pick(pool[b.id]) : pick(members)) : null;
          let ts = day0 + (10.5 + r() * 11) * 3600000 + 4 * 3600000;
          if (ts > now.getTime() - 60000) ts = day0 + r() * Math.max(1, now.getTime() - 60000 - day0);
          if (member && ts < Date.parse(member.joined)) continue;
          const s = sellers(b.id);
          sales.push({ id: "V-" + String(100000 + n++), date: iso(ts), branchId: b.id, staffId: pick(s).id, memberId: member ? member.id : null, channel: pick(CHANNELS), payment: pick(PAYMENTS), lines, discount: 0, total: sub, gift: bf && r() < .7 ? pick(B.campaign.gifts) : "", status: "pagada" });
          if (member) member.points += Math.floor(sub / 10);
        }
      });
    }

    // oportunidades (pipeline)
    const STAGES = ["nuevo", "contactado", "cotizado", "ganado", "perdido"];
    const leads = [];
    for (let i = 0; i < 46; i++) {
      const b = pick(BRANCHES), st = STAGES[Math.min(4, Math.floor(r() * 5.4))], pid = pick(bag);
      leads.push({ id: "L-" + (500 + i), name: name(), phone: phone(), source: pick(SOURCES), interest: pid, value: B.products.find((p) => p.id === pid).price * int(1, 3), stage: st, branchId: b.id, ownerId: pick(sellers(b.id)).id, created: iso(today0 - int(0, 30) * DAY), next: dayKey(today0 + int(-2, 6) * DAY), note: "" });
    }

    // tareas
    const TT = ["Llamar a cliente por reposición de proteína", "Contar stock de creatinas", "Enviar promo Black Friday por WhatsApp", "Revisar vencimientos del mes", "Armar vitrina de lanzamientos Derek Lunsford", "Capacitar al equipo en Venom Inferno", "Confirmar transferencia de stock", "Seguimiento a gimnasio aliado"];
    const tasks = [];
    for (let i = 0; i < 18; i++) { const b = pick(BRANCHES); tasks.push({ id: "T-" + (300 + i), title: pick(TT), due: dayKey(today0 + int(-3, 7) * DAY), branchId: b.id, staffId: pick(sellers(b.id)).id, done: r() < .3, priority: pick(["alta", "media", "baja"]) }); }

    // campañas
    const campaigns = [
      { id: "C-1", name: "Black Friday 2026", type: "descuento", from: B.campaign.from, to: B.campaign.to, value: B.campaign.upTo, code: "", segment: "todos", channel: "whatsapp", note: "Hasta 40% OFF + 1 accesorio gratis", status: "activa" },
      { id: "C-2", name: "Club León: doble puntos en creatinas", type: "puntos", from: dayKey(today0 + 9 * DAY), to: dayKey(today0 + 23 * DAY), value: 2, code: "", segment: "vip", channel: "whatsapp", note: "", status: "programada" },
      { id: "C-3", name: "Reactivación clientes inactivos", type: "cupon", from: dayKey(today0 - 40 * DAY), to: dayKey(today0 - 20 * DAY), value: 10, code: "VOLVE10", segment: "riesgo", channel: "whatsapp", note: "10% en tu próxima compra", status: "finalizada" },
    ];

    // turnos semanales
    const shifts = [];
    staff.filter((s) => s.branchId).forEach((s, i) => { for (let d = 0; d < 7; d++) { if ((d + i) % 7 === 6) continue; const b = BRANCHES.find((x) => x.id === s.branchId); const open = b.open || "10:00", close = b.close || "21:00"; shifts.push({ staffId: s.id, day: d, from: (i + d) % 2 ? open : "15:00", to: (i + d) % 2 ? "16:00" : close }); } });

    const transfers = [
      { id: "TR-1", date: iso(today0 - 2 * DAY), from: "sc-ventura", to: "su-centro", lines: [{ pid: "dp-creatine-200", qty: 6 }, { pid: "dp-venom-inferno", qty: 4 }], status: "en camino", by: "st-wh" },
      { id: "TR-2", date: iso(today0 - 6 * DAY), from: "sc-cine", to: "tj-centro", lines: [{ pid: "dp-whey-phorm-cappuccino", qty: 3 }], status: "recibida", by: "st-wh" },
    ];

    members.forEach((m) => delete m.act);
    return { v: 1, seededAt: iso(now), branches: BRANCHES.map((b) => Object.assign({}, b)), staff, members, inventory, sales, leads, tasks, campaigns, shifts, transfers, cost: {}, prod: {}, custom: [], loyalty: { per: 10, redeem: 10, maxPct: 20, tiers: { plata: 300, oro: 900, leon: 2000 } }, log: [{ at: iso(now), who: "sistema", what: "Datos de demostración generados" }] };
  }

  /* ---------- almacenamiento ---------- */
  let DB = null;
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) { DB = migrate(JSON.parse(raw)); return DB; } } catch (e) { /* datos dañados → nueva semilla */ }
    DB = seed(new Date()); save(); return DB;
  }
  function migrate(d) {
    d.cost = d.cost || {}; d.prod = d.prod || {}; d.custom = d.custom || [];
    d.loyalty = d.loyalty || { per: 10, redeem: 10, maxPct: 20, tiers: { plata: 300, oro: 900, leon: 2000 } };
    return d;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { console.warn("No se pudo guardar", e); } }
  function reset() { DB = seed(new Date()); save(); }
  function log(who, what) { DB.log.unshift({ at: iso(Date.now()), who, what }); DB.log = DB.log.slice(0, 300); }

  /* ---------- catálogo ---------- */
  const base = (id) => B.products.find((x) => x.id === id) || DB.custom.find((x) => x.id === id) || null;
  const product = (id) => {
    const p = base(id) || { id, short: String(id), name: String(id), cat: "accesorios", brand: "bf", size: "", price: 0, img: "assets/img/logo.png", deleted: true };
    const o = DB.prod[id] || {}, custom = !B.products.includes(p);
    const price = o.price != null ? o.price : custom ? p.price : B.priceOf(p);
    return Object.assign({}, p, o, { price, custom, hidden: !!(o.hidden || p.hidden), brandName: (B.brands[p.brand] || { name: p.brandName || "Bolivia Fitness" }).name,
      cost: DB.cost[id] != null ? DB.cost[id] : Math.round((p.before || price) * .58) });
  };
  // all=true incluye productos ocultos (para el catálogo del dueño)
  const products = (all) => B.products.map((p) => p.id).concat(DB.custom.map((p) => p.id)).map(product).filter((p) => !p.deleted && (all || !p.hidden));
  function editProduct(id, patch, who) {
    const p = base(id); if (!p) return;
    if (!B.products.includes(p)) Object.assign(p, patch);
    else DB.prod[id] = Object.assign({}, DB.prod[id], patch);
    log(who, "Producto editado: " + (patch.short || product(id).short)); save();
  }
  function addProduct(p, who) {
    const id = "cx-" + Date.now().toString(36);
    DB.custom.push(Object.assign({ id, line: id, brand: "bf", img: "assets/img/logo.png", servings: null, flavor: null, before: null, desc: "" }, p, { id }));
    DB.branches.forEach((b) => { DB.inventory[b.id][id] = { qty: 0, min: 2, exp: null }; });
    log(who, "Producto nuevo: " + p.short); save(); return id;
  }
  function deleteProduct(id, who) {
    const c = DB.custom.find((x) => x.id === id); if (!c) return false;
    // con ventas: se archiva para no romper el historial; sin ventas: se borra
    if (DB.sales.some((s) => s.lines.some((l) => l.pid === id))) c.deleted = true;
    else DB.custom = DB.custom.filter((x) => x.id !== id);
    DB.branches.forEach((b) => delete DB.inventory[b.id][id]);
    log(who, "Producto eliminado " + id); save(); return true;
  }
  function addBranch(b, who) {
    const id = "br-" + Date.now().toString(36);
    DB.branches.push(Object.assign({ id, weight: 1, target: 50000, open: "", close: "", address: "" }, b, { id }));
    DB.inventory[id] = {}; products(true).forEach((p) => { DB.inventory[id][p.id] = { qty: 0, min: 2, exp: null }; });
    log(who, "Sucursal nueva: " + b.name); save(); return id;
  }
  function removeBranch(id, who) {
    const b = branch(id); if (!b || DB.branches.length < 2) return false;
    DB.branches = DB.branches.filter((x) => x.id !== id); delete DB.inventory[id];
    DB.staff.forEach((s) => { if (s.branchId === id) { s.branchId = null; s.active = false; } });
    DB.members.forEach((m) => { if (m.branchId === id) m.branchId = DB.branches[0].id; });
    DB.removedBranches = (DB.removedBranches || []).concat([{ id, name: b.name, city: b.city }]);
    log(who, "Sucursal eliminada: " + b.name); save(); return true;
  }
  const branch = (id) => DB.branches.find((b) => b.id === id) || (DB.removedBranches || []).find((b) => b.id === id) || null;
  const person = (id) => DB.staff.find((s) => s.id === id) || null;
  const member = (id) => DB.members.find((m) => m.id === id) || null;

  /* ---------- consultas ---------- */
  function inRange(s, f) { if (f.branch && f.branch !== "all" && s.branchId !== f.branch) return false; const t = Date.parse(s.date); return t >= f.from && t < f.to && s.status !== "anulada"; }
  function range(period, now) {
    const t0 = new Date(dayKey(now || Date.now()) + "T00:00:00-04:00").getTime(), end = t0 + DAY;
    const days = { "today": 1, "7d": 7, "30d": 30, "90d": 90 }[period] || 30;
    return { from: end - days * DAY, to: end, days };
  }
  const salesIn = (f) => DB.sales.filter((s) => inRange(s, f));
  const sum = (a, fn) => a.reduce((x, y) => x + fn(y), 0);
  function kpis(f) {
    const cur = salesIn(f), len = f.to - f.from, prev = salesIn({ branch: f.branch, from: f.from - len, to: f.from });
    const rev = sum(cur, (s) => s.total), prevRev = sum(prev, (s) => s.total);
    const units = sum(cur, (s) => sum(s.lines, (l) => l.qty));
    const costs = sum(cur, (s) => sum(s.lines, (l) => l.qty * product(l.pid).cost));
    const buyers = new Set(cur.filter((s) => s.memberId).map((s) => s.memberId));
    const newM = DB.members.filter((m) => { const t = Date.parse(m.joined); return t >= f.from && t < f.to && (!f.branch || f.branch === "all" || m.branchId === f.branch); }).length;
    return { rev, prevRev, delta: prevRev ? (rev - prevRev) / prevRev : 0, orders: cur.length, prevOrders: prev.length, avg: cur.length ? rev / cur.length : 0, units, margin: rev ? (rev - costs) / rev : 0, buyers: buyers.size, newMembers: newM, memberShare: cur.length ? cur.filter((s) => s.memberId).length / cur.length : 0 };
  }
  function series(f) {
    const out = [], map = {};
    for (let t = f.from; t < f.to; t += DAY) { const k = dayKey(t + 12 * 3600000); map[k] = { day: k, rev: 0, orders: 0 }; out.push(map[k]); }
    salesIn(f).forEach((s) => { const k = dayKey(s.date); if (map[k]) { map[k].rev += s.total; map[k].orders++; } });
    return out;
  }
  function groupBy(f, keyFn) {
    const m = {};
    salesIn(f).forEach((s) => s.lines.forEach((l) => { const k = keyFn(l, s); if (k == null) return; m[k] = m[k] || { key: k, rev: 0, units: 0 }; m[k].rev += l.qty * l.price; m[k].units += l.qty; }));
    return Object.values(m).sort((a, b) => b.rev - a.rev);
  }
  const byProduct = (f) => groupBy(f, (l) => l.pid);
  const byCategory = (f) => groupBy(f, (l) => (product(l.pid) || {}).cat);
  const byBranch = (f) => groupBy(Object.assign({}, f, { branch: "all" }), (l, s) => s.branchId);
  const byStaff = (f) => groupBy(f, (l, s) => s.staffId);
  function byPayment(f) { const m = {}; salesIn(f).forEach((s) => { m[s.payment] = (m[s.payment] || 0) + s.total; }); return Object.entries(m).map(([key, rev]) => ({ key, rev })).sort((a, b) => b.rev - a.rev); }
  function byChannel(f) { const m = {}; salesIn(f).forEach((s) => { m[s.channel] = (m[s.channel] || 0) + s.total; }); return Object.entries(m).map(([key, rev]) => ({ key, rev })).sort((a, b) => b.rev - a.rev); }
  function byHour(f) { const h = Array.from({ length: 24 }, (_, i) => ({ key: i, rev: 0, orders: 0 })); salesIn(f).forEach((s) => { const hr = +new Intl.DateTimeFormat("en-GB", { timeZone: B.config.timezone, hour: "2-digit", hour12: false }).format(new Date(s.date)) % 24; h[hr].rev += s.total; h[hr].orders++; }); return h; }

  /* ---------- clientes ---------- */
  const tiers = () => [{ id: "bronce", min: 0 }].concat(["plata", "oro", "leon"].map((id) => ({ id, min: DB.loyalty.tiers[id] })));
  const tier = (pts) => tiers().slice().reverse().find((t) => pts >= t.min).id;
  function salesByMember() { const m = {}; DB.sales.forEach((x) => { if (x.memberId && x.status !== "anulada") (m[x.memberId] = m[x.memberId] || []).push(x); }); return m; }
  function memberStats(id, idx) {
    const s = ((idx ? idx[id] : DB.sales.filter((x) => x.memberId === id && x.status !== "anulada")) || []).slice().sort((a, b) => b.date.localeCompare(a.date));
    const ltv = sum(s, (x) => x.total), last = s[0] ? Date.parse(s[0].date) : null;
    const daysSince = last ? Math.floor((Date.now() - last) / DAY) : null;
    let seg = "nuevo";
    if (s.length >= 6 || ltv >= 4000) seg = "vip"; else if (s.length >= 2) seg = "frecuente";
    if (daysSince != null && daysSince > 60) seg = "riesgo";
    if (!s.length) seg = Date.now() - Date.parse(DB.members.find((m) => m.id === id).joined) < 30 * DAY ? "nuevo" : "inactivo";
    // reposición: creatina/proteína dura ~1 servicio por día
    let refill = null;
    const last1 = s.find((x) => x.lines.some((l) => { const p = B.products.find((q) => q.id === l.pid); return p && p.servings && ["creatinas", "proteinas"].includes(p.cat); }));
    if (last1) { const l = last1.lines.find((q) => { const p = B.products.find((z) => z.id === q.pid); return p && p.servings; }); const p = B.products.find((z) => z.id === l.pid); refill = { pid: p.id, due: dayKey(Date.parse(last1.date) + p.servings * l.qty * DAY) }; }
    return { sales: s, orders: s.length, ltv, last, daysSince, seg, refill, avg: s.length ? ltv / s.length : 0 };
  }

  /* ---------- escritura ---------- */
  function addSale(sale, who) {
    const s = Object.assign({ id: "V-" + String(100000 + DB.sales.length), date: iso(Date.now()), status: "pagada", discount: 0, gift: "" }, sale);
    s.total = round(Math.max(0, sum(s.lines, (l) => l.qty * l.price) - (s.discount || 0)));
    DB.sales.push(s);
    s.lines.forEach((l) => { const inv = (DB.inventory[s.branchId] || {})[l.pid]; if (inv) inv.qty = Math.max(0, inv.qty - l.qty); });
    if (s.memberId) { const m = member(s.memberId); if (m) m.points = Math.max(0, m.points + Math.floor(s.total / DB.loyalty.per) - (s.pointsUsed || 0)); }
    log(who, "Venta " + s.id + " · Bs " + s.total + " · " + branch(s.branchId).name); save(); return s;
  }
  function voidSale(id, who) {
    const s = DB.sales.find((x) => x.id === id); if (!s || s.status === "anulada") return;
    s.status = "anulada";
    s.lines.forEach((l) => { const inv = (DB.inventory[s.branchId] || {})[l.pid]; if (inv) inv.qty += l.qty; });
    if (s.memberId) { const m = member(s.memberId); if (m) m.points = Math.max(0, m.points - Math.floor(s.total / DB.loyalty.per) + (s.pointsUsed || 0)); }
    log(who, "Venta anulada " + id); save();
  }
  function upsert(coll, obj, prefix, who) {
    const list = DB[coll]; let o = list.find((x) => x.id === obj.id);
    if (o) Object.assign(o, obj); else { o = Object.assign({ id: uid(prefix) }, obj); list.unshift(o); }
    log(who, (coll === "members" ? "Cliente " : coll === "staff" ? "Personal " : coll === "leads" ? "Oportunidad " : coll === "tasks" ? "Tarea " : coll === "campaigns" ? "Campaña " : "") + (o.name || o.title || o.id) + " guardado");
    save(); return o;
  }
  function remove(coll, id, who) { DB[coll] = DB[coll].filter((x) => x.id !== id); log(who, "Eliminado " + id); save(); }
  function inv(bid, pid) { DB.inventory[bid] = DB.inventory[bid] || {}; return DB.inventory[bid][pid] || (DB.inventory[bid][pid] = { qty: 0, min: 2, exp: null }); }
  function cancelTransfer(id, who) { const tr = DB.transfers.find((x) => x.id === id); if (!tr || tr.status !== "en camino") return; tr.status = "cancelada"; tr.lines.forEach((l) => { inv(tr.from, l.pid).qty += l.qty; }); log(who, "Transferencia cancelada " + id); save(); }
  function adjustStock(bid, pid, delta, reason, who) { const r = inv(bid, pid); r.qty = Math.max(0, r.qty + delta); log(who, "Ajuste de stock " + pid + " (" + (delta > 0 ? "+" : "") + delta + ") en " + branch(bid).name + (reason ? " · " + reason : "")); save(); }
  function setStock(bid, pid, patch, who) { Object.assign(inv(bid, pid), patch); log(who, "Stock editado " + pid + " en " + branch(bid).name); save(); }
  function transfer(t, who) {
    const tr = Object.assign({ id: "TR-" + (DB.transfers.length + 1), date: iso(Date.now()), status: "en camino", by: who }, t);
    tr.lines.forEach((l) => { const r = inv(tr.from, l.pid); r.qty = Math.max(0, r.qty - l.qty); });
    DB.transfers.unshift(tr); log(who, "Transferencia " + tr.id + ": " + branch(tr.from).name + " → " + branch(tr.to).name); save(); return tr;
  }
  function receive(id, who) { const tr = DB.transfers.find((x) => x.id === id); if (!tr || tr.status === "recibida") return; tr.status = "recibida"; tr.lines.forEach((l) => { inv(tr.to, l.pid).qty += l.qty; }); log(who, "Transferencia recibida " + id); save(); }

  function exportJSON() { return JSON.stringify(DB, null, 1); }
  function importJSON(txt) { const d = JSON.parse(txt); if (!d || !d.sales || !d.members || !d.inventory) throw new Error("bad"); DB = d; save(); }
  function toCSV(rows) { if (!rows.length) return ""; const cols = Object.keys(rows[0]); const q = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"'; return [cols.map(q).join(",")].concat(rows.map((r) => cols.map((c) => q(r[c])).join(","))).join("\n"); }

  window.CRMDB = { load, save, reset, get db() { return DB; }, product, products, branch, person, member, range, salesIn, kpis, series, byProduct, byCategory, byBranch, byStaff, byPayment, byChannel, byHour,
    get TIERS() { return tiers(); }, inv, cancelTransfer, editProduct, addProduct, deleteProduct, addBranch, removeBranch,
    tier, memberStats, salesByMember, addSale, voidSale, upsert, remove, adjustStock, setStock, transfer, receive, exportJSON, importJSON, toCSV, dayKey, DAY, ROLES, PAYMENTS, SOURCES, GOALS, log };
})();
