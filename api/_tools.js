/* LeonIA · herramientas deterministas.
   El modelo propone llamadas; este archivo valida y ejecuta. Todo precio, total,
   ahorro, horario y pedido se calcula acá a partir de js/data.js y catalog(). */
"use strict";
const crypto = require("crypto");
const B = require("../js/data.js");
const { COACH_SCHEMAS, COACH_TOOLS, GOALS } = require("./_coach");

const MAX_LINES = 30, MAX_QTY = 50;
const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9.\s]/g, " ").replace(/\s+/g, " ").trim();
const words = (s) => norm(s).split(" ").filter(Boolean);
const money = B.money;
const round2 = (n) => Math.round(n * 100) / 100;

/* ---------- reloj (inyectable para tests) ---------- */
function lpClock(now) {
  const d = now instanceof Date ? now : new Date(now || Date.now());
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: B.config.timezone, hour: "2-digit", minute: "2-digit", weekday: "long", hour12: false }).formatToParts(d);
  const get = (t) => (parts.find((p) => p.type === t) || {}).value;
  const h = +get("hour") % 24, m = +get("minute");
  return { date: B.localDate(d), mins: h * 60 + m, hhmm: String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"), weekday: get("weekday") };
}
const toMin = (t) => { const [h, m] = String(t).split(":").map(Number); return h * 60 + m; };
function branchStatus(b, now) {
  if (!b.open) return { status: "sin_horario_publicado", texto: "Horario no publicado: consultar por WhatsApp" };
  const n = lpClock(now).mins, o = toMin(b.open), c = toMin(b.close);
  if (n >= o && n < c) return c - n <= 45 ? { status: "cierra_pronto", texto: "Cierra pronto (" + b.close + ")" } : { status: "abierto", texto: "Abierto hasta " + b.close };
  return n < o ? { status: "cerrado", texto: "Abre hoy a las " + b.open, abre: b.open } : { status: "cerrado", texto: "Cerrado, abre mañana a las " + b.open, abre: b.open };
}
function openAt(b, hhmm) { if (!b.open) return null; const t = toMin(hhmm); return t >= toMin(b.open) && t < toMin(b.close); }

/* ---------- búsqueda ---------- */
// Sinónimos (español, inglés, jerga) → palabras del catálogo. Frases de dos palabras primero.
const PHRASES = [
  [["sin", "sabor"], { flavor: "sin" }],
  [["con", "sabor"], { flavor: "con" }],
  [["pre", "entreno"], { add: ["preentrenos"] }],
  [["ganador", "de", "masa"], { add: ["ganadores"] }],
  [["para", "mujeres"], { add: ["ellas"] }],
  [["para", "ellas"], { add: ["ellas"] }],
  [["un", "kilo"], { add: ["1", "kg"] }],
  [["blue", "razz"], { add: ["blue", "razz"] }],
];
const SYN = {
  creatina: ["creatine"], creatinas: ["creatine"], creatine: ["creatine"], crea: ["creatine"],
  proteina: ["proteinas"], proteinas: ["proteinas"], protein: ["proteinas"], prote: ["proteinas"], whey: ["whey"], suero: ["whey"],
  aislada: ["iso"], isolate: ["iso"], isolada: ["iso"], iso: ["iso"],
  preentreno: ["preentrenos"], preentrenos: ["preentrenos"], preworkout: ["preentrenos"], pre: ["preentrenos"], energia: ["preentrenos"],
  glutamina: ["glutamine"], recuperacion: ["recuperacion"],
  ganador: ["ganadores"], gainer: ["ganadores"], masa: ["ganadores"], volumen: ["ganadores"],
  mujer: ["ellas"], mujeres: ["ellas"], chicas: ["ellas"], ladies: ["ellas"],
  limon: ["lemon"], lima: ["lime"], manzana: ["apple"], horchata: ["horchata"],
  dp: ["dragon"], dragon: ["dragon"], prosupps: ["prosupps"], ps: ["prosupps"],
  kilo: ["1", "kg"], kg: ["kg"], gramos: ["g"], servicios: ["servicios"], servings: ["servicios"], porciones: ["servicios"], caps: ["capsulas"], capsulas: ["capsulas"],
  chica: ["30"], chiquita: ["30"], pequena: ["30"], mediana: ["60"], grande: ["200"],
  aminoacido: ["aminoacidos"], aminoacidos: ["aminoacidos"], aminos: ["aminoacidos"], bcaa: ["bcaa"], eaa: ["eaa"], citrulina: ["citrulina"], beta: ["beta"], alanina: ["alanina"],
  hidratacion: ["hidratacion"], electrolitos: ["hidratacion"], ioniq: ["ioniq"],
  quemador: ["quemadores"], quemadores: ["quemadores"], quemagrasa: ["quemadores"], definicion: ["quemadores"], carnitina: ["carnitina"], diuretico: ["dry"], cla: ["cla"],
  salud: ["salud"], vitaminas: ["multi"], multivitaminico: ["multi"], omega: ["omega"], articulaciones: ["joints"], higado: ["liver"], probioticos: ["probioticos"], verdes: ["greens"],
  accesorio: ["accesorios"], accesorios: ["accesorios"], shaker: ["shaker"], gorra: ["gorra"], gorro: ["gorro"], chulo: ["chulo"], mochila: ["mochila"], vaso: ["tumbler"], termo: ["tumbler"],
  nuevo: ["nuevo"], nuevos: ["nuevo"], lanzamiento: ["nuevo"], derek: ["derek"], lunsford: ["lunsford"], venom: ["venom"], mangonada: ["mangonada"], cappuccino: ["cappuccino"],
};
const STOP = new Set(["de", "la", "el", "los", "las", "un", "una", "unos", "y", "con", "para", "quiero", "me", "das", "dame", "tienen", "hay", "algo", "que", "por", "favor", "porfa", "mi", "una", "del", "en", "o", "a", "tambien"]);

function catalogIndex(now) {
  const cat = B.catalog(now), catNames = Object.fromEntries(B.categories.map((c) => [c.id, c.name]));
  return Object.values(cat).map((p) => ({ p, words: new Set(words([p.name, p.short, p.brand, p.size, p.flavor, p.cat, catNames[p.cat], p.cat === "proteinas" ? "whey protein" : ""].join(" "))) }));
}
function parseQuery(q) {
  const ws = words(q); const terms = []; const filt = { flavor: null, exclude: [] };
  for (let i = 0; i < ws.length; i++) {
    // "sin X" descarta X
    if (ws[i] === "sin" && ws[i + 1] && ws[i + 1] !== "sabor") { const x = ws[i + 1]; (SYN[x] || [x]).forEach((t) => filt.exclude.push(t)); i++; continue; }
    const ph = PHRASES.find(([seq]) => seq.every((w, k) => ws[i + k] === w));
    if (ph) { const [seq, act] = ph; if (act.flavor) filt.flavor = act.flavor; if (act.add) terms.push(...act.add); i += seq.length - 1; continue; }
    const w = ws[i]; if (STOP.has(w)) continue;
    // número + unidad pegada: "300g", "1200g", "1kg"
    const mu = w.match(/^(\d+)(g|kg|gr)$/); if (mu) { terms.push(mu[1]); continue; }
    if (SYN[w]) terms.push(...SYN[w]); else terms.push(w);
  }
  return { terms: [...new Set(terms)], filt };
}
// coincidencia por palabra completa (prefijo); números deben ser exactos
function wordHit(term, set) { if (/^\d+(\.\d+)?$/.test(term)) return set.has(term); for (const w of set) if (w.startsWith(term) && (term.length >= 3 || w === term)) return true; return false; }
const KIND_RANK = { creatinas: 0, proteinas: 0, preentrenos: 0, recuperacion: 1, ellas: 1, ganadores: 1 };
function search(query, now) {
  const { terms, filt } = parseQuery(query);
  let rows = catalogIndex(now);
  if (filt.flavor === "sin") rows = rows.filter((r) => /^sin sabor$/i.test(r.p.flavor || ""));
  if (filt.flavor === "con") rows = rows.filter((r) => r.p.flavor && !/^sin sabor$/i.test(r.p.flavor));
  if (filt.exclude.length) rows = rows.filter((r) => !filt.exclude.some((t) => wordHit(t, r.words)));
  if (!terms.length) return (filt.flavor || filt.exclude.length) ? rows.map((r) => ({ p: r.p, score: 1 })) : [];
  const scored = rows.map((r) => ({ p: r.p, score: terms.filter((t) => wordHit(t, r.words)).length })).filter((r) => r.score > 0);
  const max = Math.max(0, ...scored.map((s) => s.score));
  return scored.filter((s) => s.score === max).sort((a, b) => (KIND_RANK[a.p.cat] - KIND_RANK[b.p.cat]) || (b.p.star - a.p.star) || a.p.price - b.p.price)
    .map((s) => Object.assign(s, { exact: s.score === terms.length }));
}
const brief = (p) => ({ id: p.id, nombre: p.short, marca: p.brand, tamano: p.size, sabor: p.flavor, precio: p.price, antes: p.before, ahorro: p.save || 0, por_servicio: p.perServing });

/* ---------- resolver un ítem del carrito ---------- */
function sizeMatch(p, size) { if (!size) return true; const s = norm(size); const nums = s.match(/\d+/g) || []; const pw = new Set(words(p.size)); if (/kilo|kg/.test(s) && !nums.length) return pw.has("kg"); return nums.every((n) => pw.has(n)); }
function resolveItem(item, size, now) {
  const cat = B.catalog(now);
  let txt = String(item || "").trim();
  if (cat[txt]) {
    const p = cat[txt];
    if (!size || sizeMatch(p, size)) return { ok: p };
    const sib = Object.values(cat).find((x) => x.line === p.line && sizeMatch(x, size));
    if (sib) return { ok: sib };
    return { error: p.short + " no viene en " + size + ".", opciones: Object.values(cat).filter((x) => x.line === p.line).map(brief) };
  }
  const res = search(txt + (size ? " " + size : ""), now);
  if (!res.length) return { error: "No encontré '" + txt + "' en el catálogo." };
  if (res.length === 1) return { ok: res[0].p };
  return { ambiguous: true, opciones: res.slice(0, 6).map((r) => brief(r.p)) };
}

/* ---------- estado ---------- */
const BLANK_ORDER = { service: null, branch: null, address: null, reference: null, location: null, when: null, payment: null, name: null, notes: null, gift: null };
function sanitizeState(raw, now) {
  const cat = B.catalog(now), s = raw && typeof raw === "object" ? raw : {};
  const cleanCart = (c) => { const out = {}; let n = 0; for (const [id, q] of Object.entries(c && typeof c === "object" ? c : {})) { if (!cat[id] || n >= MAX_LINES) continue; const v = Math.round(Number(q)); if (v >= 1) { out[id] = Math.min(MAX_QTY, v); n++; } } return out; };
  const o = Object.assign({}, BLANK_ORDER), ro = s.order && typeof s.order === "object" ? s.order : {};
  const str = (v, n) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n || 160) : null);
  if (["delivery", "pickup", "national"].includes(ro.service)) o.service = ro.service;
  if (ro.branch === "cc" || B.branchById(ro.branch)) o.branch = ro.branch;
  o.address = str(ro.address); o.reference = str(ro.reference); o.name = str(ro.name, 60); o.notes = str(ro.notes, 200); o.payment = str(ro.payment, 60);
  if (typeof ro.when === "string" && (ro.when === "asap" || /^([01]\d|2[0-3]):[0-5]\d$/.test(ro.when))) o.when = ro.when;
  if (B.campaign && B.campaign.gifts.includes(ro.gift)) o.gift = ro.gift;
  if (ro.location && isFinite(+ro.location.lat) && isFinite(+ro.location.lng) && Math.abs(+ro.location.lat) <= 90 && Math.abs(+ro.location.lng) <= 180) o.location = { lat: +ro.location.lat, lng: +ro.location.lng };
  const hist = Array.isArray(s.myOrders) ? s.myOrders : Array.isArray(s.history) ? s.history : [];
  const history = hist.slice(0, 3).map((h) => ({ id: str(h && h.id, 20) || "—", at: str(h && h.at, 40), branch: (h && (B.branchById(h.branch) || h.branch === "cc")) ? h.branch : null, service: ["delivery", "pickup", "national"].includes(h && h.service) ? h.service : null, cart: cleanCart(h && h.cart) })).filter((h) => Object.keys(h.cart).length);
  return {
    cart: cleanCart(s.cart), prevCart: s.prevCart ? cleanCart(s.prevCart) : null, order: o,
    stage: ["browsing", "awaiting_confirmation", "placed"].includes(s.stage) ? s.stage : "browsing",
    token: typeof s.token === "string" && /^[a-f0-9]{16}$/.test(s.token) ? s.token : null,
    placed: s.placed && typeof s.placed === "object" && typeof s.placed.id === "string" ? { id: s.placed.id.slice(0, 12), token: String(s.placed.token || "").slice(0, 16), branch: s.placed.branch || null, total: +s.placed.total || 0, url: typeof s.placed.url === "string" && s.placed.url.startsWith("https://wa.me/") ? s.placed.url : null, at: s.placed.at || null } : null,
    upsold: !!s.upsold, newsShown: !!s.newsShown, history, profile: cleanProfile(s.profile),
  };
}

function cleanProfile(p) {
  if (!p || typeof p !== "object") return null;
  const out = { goal: GOALS[p.goal] ? p.goal : null, days: Number.isInteger(p.days) && p.days >= 2 && p.days <= 6 ? p.days : null,
    level: ["principiante", "intermedio", "avanzado"].includes(p.level) ? p.level : null, weight_kg: +p.weight_kg > 30 && +p.weight_kg < 250 ? Math.round(+p.weight_kg) : null };
  return Object.values(out).some((v) => v != null) ? out : null;
}

/* ---------- sesión ---------- */
function createSession(rawState, now) {
  const state = sanitizeState(rawState, now);
  const events = [];
  const ctx = { state, events, now: now || new Date(), emit: (e) => events.push(e), cartChanged: false, ctx: null };
  ctx.cat = () => B.catalog(ctx.now);
  return ctx;
}
function cartSummary(ctx) {
  const cat = ctx.cat(); let total = 0;
  const lines = Object.entries(ctx.state.cart).map(([id, qty]) => { const p = cat[id]; const sub = p.price * qty; total += sub; return { id, nombre: p.short, tamano: p.size, cantidad: qty, precio: p.price, subtotal: sub }; });
  return { lineas: lines, total, total_texto: money(total), regalo: B.campaignActive(ctx.now) && lines.length ? B.campaign.gift : null };
}
function setCart(ctx, next) {
  ctx.state.prevCart = Object.assign({}, ctx.state.cart);
  ctx.state.cart = next;
  if (ctx.state.stage === "awaiting_confirmation") { ctx.state.stage = "browsing"; ctx.state.token = null; }
  if (ctx.state.stage === "placed") ctx.state.stage = "browsing";
  ctx.emit({ type: "cart", cart: Object.assign({}, next) });
}
function tokenFor(state) {
  const o = state.order;
  const body = JSON.stringify({ c: Object.keys(state.cart).sort().map((k) => [k, state.cart[k]]), o: [o.service, o.branch, o.address, o.reference, o.when, o.name, o.gift, o.payment, o.notes, o.location && [o.location.lat, o.location.lng]] });
  return crypto.createHash("sha256").update(body).digest("hex").slice(0, 16);
}
const orderIdFor = (token) => "BF-" + parseInt(token.slice(0, 10), 16).toString(36).toUpperCase().padStart(5, "0").slice(-5);

/* ---------- herramientas ---------- */
const T = {};

T.search_menu = (ctx, { query }) => {
  const res = search(query || "", ctx.now);
  if (!res.length) { log({ evt: "leonia_miss", text: String(query || "").slice(0, 120), reason: "busqueda_vacia" }); return { resultados: [], nota: "Sin resultados. Ofrecé las categorías: " + B.categories.map((c) => c.name).join(", ") }; }
  return { resultados: res.slice(0, 8).map((r) => Object.assign(brief(r.p), { categoria: r.p.cat })) };
};

T.get_item_details = (ctx, { item }) => {
  const r = resolveItem(item, null, ctx.now);
  if (!r.ok) return r;
  const p = r.ok, cat = ctx.cat();
  return Object.assign(brief(p), {
    descripcion: p.desc, categoria: B.categories.find((c) => c.id === p.cat).name,
    otras_presentaciones: Object.values(cat).filter((x) => x.line === p.line && x.id !== p.id).map(brief),
    promo: B.campaignActive(ctx.now) && p.before ? "Precio Black Friday hasta el " + B.campaign.to + " (antes " + money(p.before) + "). " + B.campaign.gift + "." : null,
    alergenos: "No tenemos información de alérgenos publicada: consultá en la sucursal antes de comprar.",
    salud: "Para cómo tomarlo usá supplement_guide. Ante embarazo, medicación o condiciones de salud, consultá con un profesional.",
    fuente: p.src,
  });
};

T.get_whats_new = (ctx) => {
  ctx.state.newsShown = true;
  const cat = ctx.cat();
  return {
    campana: B.campaignActive(ctx.now) ? { nombre: B.campaign.name, hasta: B.campaign.to, descuento_hasta: B.campaign.upTo + "%", regalo: B.campaign.gift, accesorios: B.campaign.gifts } : null,
    novedad: "Nuevos sabores Dragon Pharma en colaboración con Derek Lunsford, disponibles en todas las sucursales (precios no publicados).",
    destacados: Object.values(cat).filter((p) => p.star).map(brief),
  };
};

T.get_branches = (ctx, { name } = {}) => {
  const clk = lpClock(ctx.now);
  let list = B.branches;
  if (name) { const n = norm(name); list = list.filter((b) => norm(b.name).includes(n) || n.includes(norm(b.city))); if (!list.length) return { error: "No tenemos sucursal publicada en '" + name + "'. Hacemos envíos a nivel nacional.", ciudades: B.branches.map((b) => b.name) }; }
  return {
    hora_local: clk.hhmm,
    sucursales: list.map((b) => Object.assign({ id: b.id, nombre: b.name, nota: b.note || null, horario: b.open ? b.open + "–" + b.close + " todos los días" : null, direccion: b.address || null, whatsapp: b.whatsapp }, branchStatus(b, ctx.now))),
    envios: B.delivery,
  };
};

function sizeUpgrades(ctx) {
  const cat = ctx.cat(), out = [];
  for (const [id, qty] of Object.entries(ctx.state.cart)) {
    const p = cat[id]; if (!p.perServing) continue;
    const bigger = Object.values(cat).filter((x) => x.line === p.line && x.servings > p.servings * qty && x.perServing < p.perServing).sort((a, b) => a.price - b.price)[0];
    if (!bigger) continue;
    const next = Object.assign({}, ctx.state.cart); delete next[id]; next[bigger.id] = (next[bigger.id] || 0) + 1;
    const totalNow = cartSummary(ctx).total;
    const totalIf = Object.entries(next).reduce((a, [k, q]) => a + cat[k].price * q, 0);
    out.push({ tipo: "mejor_tamano", cambiar: id, por: bigger.id, de: p.short, a: bigger.short, por_servicio_actual: p.perServing, por_servicio_nuevo: bigger.perServing,
      servicios_actuales: p.servings * qty, servicios_nuevos: bigger.servings, diferencia: totalIf - totalNow, total_si_acepta: totalIf,
      texto: "Por " + money(totalIf - totalNow) + " más llevás " + bigger.short + ": " + money(bigger.perServing) + " por servicio en vez de " + money(p.perServing) + ". Total del carrito si acepta: " + money(totalIf) + "." });
  }
  return out;
}

T.get_deals = (ctx) => {
  const cat = ctx.cat(), active = B.campaignActive(ctx.now);
  const hints = [];
  const cs = cartSummary(ctx);
  if (cs.lineas.length) {
    const ahorro = Object.entries(ctx.state.cart).reduce((a, [id, q]) => a + (cat[id].save || 0) * q, 0);
    if (active && ahorro) hints.push({ tipo: "ahorro_carrito", ahorro, texto: "Con precios Black Friday tu carrito ahorra " + money(ahorro) + "." });
    if (active) hints.push({ tipo: "regalo", texto: B.campaign.gift + " (" + B.campaign.gifts.join(", ") + ")." });
    hints.push(...sizeUpgrades(ctx));
  }
  const top = Object.values(cat).filter((p) => p.before).sort((a, b) => b.off - a.off).slice(0, 5).map(brief);
  return {
    campana: active ? { nombre: B.campaign.name, desde: B.campaign.from, hasta: B.campaign.to, descuento_hasta: B.campaign.upTo + "%", regalo: B.campaign.gift } : null,
    mayores_descuentos: top,
    mejor_precio_por_servicio: Object.values(cat).filter((p) => p.perServing && p.cat === "creatinas").sort((a, b) => a.perServing - b.perServing).slice(0, 3).map(brief),
    pistas_carrito: hints, total_carrito: cs.total,
    regla: "Citá total_si_acepta tal cual. No sumes precios vos.",
  };
};

T.cart_add = (ctx, { items }) => {
  if (!Array.isArray(items) || !items.length) return { error: "Falta items." };
  const next = Object.assign({}, ctx.state.cart), added = [], problems = [];
  for (const it of items.slice(0, 10)) {
    const r = resolveItem(it && it.item, it && it.size, ctx.now);
    if (!r.ok) { problems.push(Object.assign({ pedido: it && it.item }, r)); continue; }
    if (!next[r.ok.id] && Object.keys(next).length >= MAX_LINES) { problems.push({ pedido: it.item, error: "Máximo " + MAX_LINES + " productos distintos." }); continue; }
    const q = Math.max(1, Math.min(MAX_QTY, Math.round(Number(it.qty) || 1)));
    next[r.ok.id] = Math.min(MAX_QTY, (next[r.ok.id] || 0) + q);
    added.push({ id: r.ok.id, nombre: r.ok.short, tamano: r.ok.size, cantidad: q, precio: r.ok.price });
  }
  if (added.length) setCart(ctx, next);
  if (problems.some((p) => p.ambiguous)) ctx.emit({ type: "options", options: problems.find((p) => p.ambiguous).opciones.slice(0, 4).map((o) => o.nombre + " · " + o.tamano) });
  return { agregados: added, problemas: problems, carrito: cartSummary(ctx) };
};
T.cart_remove = (ctx, { item }) => {
  const r = resolveItem(item, null, ctx.now); const id = r.ok ? r.ok.id : null;
  if (!id || !ctx.state.cart[id]) { const inCart = Object.keys(ctx.state.cart).find((k) => norm(ctx.cat()[k].short).includes(norm(item))); if (!inCart) return { error: "Eso no está en el carrito.", carrito: cartSummary(ctx) }; return T.cart_remove(ctx, { item: inCart }); }
  const next = Object.assign({}, ctx.state.cart); delete next[id]; setCart(ctx, next);
  return { quitado: ctx.cat()[id].short, carrito: cartSummary(ctx) };
};
T.cart_set_qty = (ctx, { item, qty }) => {
  const r = resolveItem(item, null, ctx.now); if (!r.ok) return r;
  const q = Math.round(Number(qty)); const next = Object.assign({}, ctx.state.cart);
  if (!(q >= 1)) delete next[r.ok.id]; else next[r.ok.id] = Math.min(MAX_QTY, q);
  setCart(ctx, next); return { carrito: cartSummary(ctx) };
};
T.cart_clear = (ctx) => { setCart(ctx, {}); return { carrito: cartSummary(ctx) }; };
T.cart_view = (ctx) => cartSummary(ctx);
T.cart_undo = (ctx) => {
  if (!ctx.state.prevCart) return { error: "No hay nada para deshacer.", carrito: cartSummary(ctx) };
  const prev = ctx.state.prevCart; setCart(ctx, prev); ctx.state.prevCart = null;
  return { deshecho: true, carrito: cartSummary(ctx) };
};
T.cart_upgrade_size = (ctx, { item }) => {
  const r = resolveItem(item, null, ctx.now); if (!r.ok || !ctx.state.cart[r.ok.id]) return { error: "Ese producto no está en el carrito." };
  const up = sizeUpgrades(ctx).find((u) => u.cambiar === r.ok.id); if (!up) return { error: "No hay una presentación más conveniente para " + r.ok.short + "." };
  const next = Object.assign({}, ctx.state.cart); delete next[up.cambiar]; next[up.por] = (next[up.por] || 0) + 1; setCart(ctx, next);
  return { cambiado: up.de + " → " + up.a, carrito: cartSummary(ctx) };
};

T.suggest_upsell = (ctx) => {
  if (ctx.state.upsold) return { sugerencia: null, nota: "Ya sugeriste algo en esta conversación." };
  const cat = ctx.cat(), cats = new Set(Object.keys(ctx.state.cart).map((id) => cat[id].cat));
  if (!cats.size) return { sugerencia: null };
  ctx.state.upsold = true;
  const up = sizeUpgrades(ctx)[0];
  if (up && up.diferencia > 0 && up.por_servicio_nuevo <= up.por_servicio_actual * 0.85) return { sugerencia: up };
  const pick = (id, why) => { const p = cat[id]; const total = cartSummary(ctx).total + p.price; return { tipo: "complemento", id, nombre: p.short, precio: p.price, motivo: why, total_si_acepta: total }; };
  if (!cats.has("creatinas") && (cats.has("proteinas") || cats.has("preentrenos") || cats.has("ganadores"))) return { sugerencia: pick("dp-creatine-30", "la creatina más accesible para sumar a tu rutina") };
  if (cats.has("creatinas") && !cats.has("recuperacion")) return { sugerencia: pick("dp-glutamine", "glutamina para la recuperación") };
  return { sugerencia: null };
};

T.get_my_orders = (ctx) => {
  const cat = ctx.cat();
  return { pedidos: ctx.state.history.map((h, i) => ({ indice: i, id: h.id, fecha: h.at, sucursal: h.branch, servicio: h.service, lineas: Object.entries(h.cart).map(([id, q]) => q + "× " + cat[id].short), total_hoy: Object.entries(h.cart).reduce((a, [id, q]) => a + cat[id].price * q, 0) })) };
};
T.reorder = (ctx, { index }) => {
  const h = ctx.state.history[Math.max(0, Math.round(Number(index) || 0))];
  if (!h) return { error: "No tengo pedidos guardados en este dispositivo." };
  setCart(ctx, Object.assign({}, h.cart));
  if (h.branch) ctx.state.order.branch = h.branch; if (h.service) ctx.state.order.service = h.service;
  return { cargado: h.id, carrito: cartSummary(ctx), servicio: h.service, sucursal: h.branch, nota: "Precios actualizados a hoy." };
};

function missingDetails(o) {
  const m = [];
  if (!o.service) m.push("service"); if (!o.branch) m.push("branch");
  if ((o.service === "delivery" || o.service === "national") && !o.address && !o.location) m.push("address");
  if (!o.when) m.push("when"); if (!o.name) m.push("name");
  return m;
}
T.set_order_details = (ctx, args = {}) => {
  const o = ctx.state.order, errs = [], clk = lpClock(ctx.now);
  if (args.service != null) { if (["delivery", "pickup", "national"].includes(args.service)) o.service = args.service; else errs.push("service debe ser delivery, pickup o national."); }
  if (args.branch != null) {
    const n = norm(args.branch);
    const b = B.branches.find((x) => x.id === args.branch || norm(x.name) === n || n.includes(norm(x.city)));
    if (b) o.branch = b.id; else if (/^cc$|otra|nacional/.test(n)) o.branch = "cc"; else errs.push("No hay sucursal en '" + args.branch + "'. Ciudades: " + B.branches.map((x) => x.name).join(", ") + ". Para otras ciudades usá branch 'cc' y service 'national'.");
  }
  if (args.when != null) {
    const w = String(args.when).trim().toLowerCase();
    if (/^(asap|ya|ahora|lo antes posible)$/.test(w)) o.when = "asap";
    else if (/^([01]?\d|2[0-3]):[0-5]\d$/.test(w)) {
      const hh = w.padStart(5, "0");
      if (toMin(hh) <= clk.mins) errs.push("Esa hora (" + hh + ") ya pasó; son las " + clk.hhmm + ".");
      else { const b = B.branchById(o.branch); if (b && o.service === "pickup" && openAt(b, hh) === false) errs.push(b.name + " atiende " + b.open + "–" + b.close + "; " + hh + " está fuera de horario."); else o.when = hh; }
    } else errs.push("when debe ser 'asap' o HH:MM.");
  }
  for (const k of ["address", "reference", "name", "notes", "payment"]) if (typeof args[k] === "string" && args[k].trim()) o[k] = args[k].trim().slice(0, k === "notes" ? 200 : 160);
  if (args.gift != null) { const g = B.campaign && B.campaign.gifts.find((x) => norm(x).includes(norm(args.gift)) || norm(args.gift).includes(norm(x))); if (g) o.gift = g; else errs.push("Accesorios disponibles: " + (B.campaign ? B.campaign.gifts.join(", ") : "ninguno")); }
  if (o.service === "pickup" && o.branch === "cc") errs.push("Para retiro elegí una sucursal concreta.");
  if (ctx.state.stage === "awaiting_confirmation") { ctx.state.stage = "browsing"; ctx.state.token = null; }
  return { pedido: Object.assign({}, o), errores: errs, falta: missingDetails(o) };
};
T.request_location = (ctx) => { ctx.emit({ type: "location" }); return { ok: true, nota: "Se mostró el botón para compartir ubicación. Esperá a que el cliente lo use." }; };

function readback(ctx) {
  const o = ctx.state.order, cs = cartSummary(ctx), b = B.branchById(o.branch);
  const svc = { delivery: "Envío a domicilio", pickup: "Retiro en tienda", national: "Envío a otra ciudad" }[o.service];
  return { lines: cs.lineas.map((l) => ({ name: l.nombre, qty: l.cantidad, subtotal: l.subtotal })), total: cs.total, service: svc, branch: b ? b.name : "WhatsApp nacional",
    address: o.service === "pickup" ? null : [o.address, o.reference && "Ref: " + o.reference, o.location && "📍 ubicación compartida"].filter(Boolean).join(" · "), when: o.when === "asap" ? "Lo antes posible" : "A las " + o.when, name: o.name, gift: B.campaignActive(ctx.now) ? (o.gift || "accesorio disponible") : null };
}
T.prepare_order = (ctx) => {
  const o = ctx.state.order;
  if (!Object.keys(ctx.state.cart).length) return { error: "El carrito está vacío." };
  const falta = missingDetails(o); if (falta.length) return { error: "Faltan datos.", falta };
  const b = B.branchById(o.branch);
  if (b && o.service === "pickup") {
    const at = o.when === "asap" ? lpClock(ctx.now).hhmm : o.when;
    if (openAt(b, at) === false) return { error: b.name + " está cerrada a esa hora (" + b.open + "–" + b.close + "). Pedí una hora dentro del horario.", horario: b.open + "–" + b.close };
  }
  const token = tokenFor(ctx.state);
  ctx.state.token = token; ctx.state.stage = "awaiting_confirmation";
  const summary = readback(ctx);
  ctx.emit({ type: "readback", summary });
  return { resumen: summary, token, instruccion: "Mostrá el resumen y preguntá si confirma. NO digas que está confirmado. Terminá el turno." };
};
T.place_order = (ctx, { token } = {}) => {
  const st = ctx.state;
  if (st.placed && st.placed.token === token) { ctx.emit({ type: "order", id: st.placed.id, url: st.placed.url, branch: st.placed.branch, total: st.placed.total }); return { ok: true, ya_enviado: true, id: st.placed.id }; }
  if (!token || token !== st.token || tokenFor(st) !== token) return { error: "El pedido cambió o no fue confirmado. Volvé a preparar el resumen (prepare_order)." };
  const id = orderIdFor(token), b = B.branchById(st.order.branch), number = b ? b.whatsapp : B.config.callCenter;
  const cs = cartSummary(ctx);
  const text = B.orderMessage({ lines: Object.entries(st.cart).map(([k, q]) => ({ id: k, qty: q })), mode: st.order.service, branch: st.order.branch, address: st.order.address, reference: st.order.reference, when: st.order.when, name: st.order.name, gift: st.order.gift, note: st.order.notes, payment: st.order.payment, location: st.order.location, orderId: id }, ctx.now);
  const url = B.waLink(number, text);
  const entry = { id, at: new Date(ctx.now).toISOString(), branch: st.order.branch, service: st.order.service, cart: Object.assign({}, st.cart) };
  st.placed = { id, token, branch: b ? b.name : "Bolivia Fitness", total: cs.total, url, at: entry.at };
  st.stage = "placed"; st.token = null;
  st.history = [entry].concat(st.history.filter((h) => h.id !== id)).slice(0, 3);
  ctx.emit({ type: "order", id, url, branch: st.placed.branch, total: cs.total, entry });
  return { ok: true, id, total: cs.total, sucursal: st.placed.branch, instruccion: "Decile que toque el botón verde para enviar el pedido por WhatsApp. No pegues links." };
};
T.get_order_status = (ctx) => {
  const last = ctx.state.placed || (ctx.state.history[0] && { id: ctx.state.history[0].id, branch: (B.branchById(ctx.state.history[0].branch) || {}).name, at: ctx.state.history[0].at });
  if (!last) return { error: "No tengo pedidos tuyos en este dispositivo." };
  const bb = B.branches.find((x) => x.name === last.branch) || null;
  const url = B.waLink(bb ? bb.whatsapp : B.config.callCenter, "¡Hola Bolivia Fitness! 🦁 Quería saber el estado de mi pedido " + last.id + ".");
  ctx.emit({ type: "handoff", url, to: last.branch || "Bolivia Fitness" });
  return { pedido: last.id, sucursal: last.branch, enviado: last.at, nota: "No tenemos seguimiento en vivo: la tienda confirma el estado por WhatsApp (botón mostrado)." };
};
T.handoff_to_human = (ctx, { reason, summary } = {}) => {
  const b = B.branchById(ctx.state.order.branch);
  const txt = "¡Hola Bolivia Fitness! 🦁 " + (reason ? "Motivo: " + String(reason).slice(0, 120) + ". " : "") + (summary ? String(summary).slice(0, 400) : "");
  const to = b ? "Bolivia Fitness " + b.name : "Bolivia Fitness";
  ctx.emit({ type: "handoff", url: B.waLink(b ? b.whatsapp : B.config.callCenter, txt.trim()), to });
  return { ok: true, a: to, nota: "Botón de WhatsApp mostrado." };
};
T.show_options = (ctx, { options }) => { const o = (Array.isArray(options) ? options : []).map((x) => String(x).slice(0, 40)).filter(Boolean).slice(0, 4); if (o.length >= 2) ctx.emit({ type: "options", options: o }); return { ok: o.length >= 2 }; };
T.log_miss = (ctx, { text, reason }) => { log({ evt: "leonia_miss", text: String(text || "").slice(0, 200), reason: String(reason || "").slice(0, 80) }); return { ok: true }; };

function log(obj) { if (process.env.NODE_ENV !== "test") console.log(JSON.stringify(obj)); }

/* ---------- esquemas ---------- */
const S = (props, req) => ({ type: "object", properties: props, required: req || [], additionalProperties: false });
const str = (d) => ({ type: "string", description: d });
const SCHEMAS = [
  ["search_menu", "Busca productos por nombre, marca, categoría, sabor o tamaño (acepta sinónimos: creatina, proteína, pre-entreno, sin sabor, 200 servicios, kilo…).", S({ query: str("Texto a buscar") }, ["query"])],
  ["get_item_details", "Precio, tamaño, sabor, descripción, promo y presentaciones de un producto. Incluye aviso de alérgenos.", S({ item: str("id o nombre del producto") }, ["item"])],
  ["get_whats_new", "Campaña vigente, novedades y productos destacados.", S({})],
  ["get_branches", "Sucursales: horario, abierto/cerrado ahora, dirección, WhatsApp.", S({ name: str("Ciudad (opcional)") })],
  ["get_deals", "Promos vigentes, mayores descuentos y pistas según el carrito (con total_si_acepta).", S({})],
  ["cart_add", "Agrega productos al carrito. Si es ambiguo devuelve opciones.", S({ items: { type: "array", items: S({ item: str("id o nombre"), qty: { type: "integer", minimum: 1, maximum: 50 }, size: str("Tamaño opcional: '200 servicios', '1 kg', '300 g'") }, ["item"]) } }, ["items"])],
  ["cart_remove", "Quita un producto del carrito.", S({ item: str("id o nombre") }, ["item"])],
  ["cart_set_qty", "Cambia la cantidad de un producto (0 lo quita).", S({ item: str("id o nombre"), qty: { type: "integer", minimum: 0, maximum: 50 } }, ["item", "qty"])],
  ["cart_clear", "Vacía el carrito.", S({})],
  ["cart_view", "Muestra el carrito y el total.", S({})],
  ["cart_undo", "Deshace el último cambio del carrito.", S({})],
  ["cart_upgrade_size", "Cambia un producto del carrito por la presentación más grande y conveniente de la misma línea.", S({ item: str("id o nombre en el carrito") }, ["item"])],
  ["suggest_upsell", "Una sola sugerencia por conversación (tamaño más conveniente o complemento).", S({})],
  ["get_my_orders", "Mi Pedido: últimos pedidos guardados en este dispositivo.", S({})],
  ["reorder", "Carga un pedido anterior al carrito ('lo de siempre').", S({ index: { type: "integer", minimum: 0, maximum: 2 } }, ["index"])],
  ["set_order_details", "Guarda datos del pedido y devuelve lo que falta.", S({ service: { type: "string", enum: ["delivery", "pickup", "national"] }, branch: str("id o ciudad, o 'cc' para otra ciudad"), address: str("Dirección"), reference: str("Referencia"), when: str("'asap' o HH:MM"), name: str("Nombre"), gift: str("Accesorio de regalo preferido"), payment: str("Solo si el cliente lo menciona"), notes: str("Nota") })],
  ["request_location", "Muestra el botón 'Compartir mi ubicación' (Envío con Pin).", S({})],
  ["prepare_order", "Valida el pedido completo, muestra el resumen y genera el token de confirmación.", S({})],
  ["place_order", "Envía el pedido. Solo tras un 'sí' explícito a un resumen mostrado en un turno ANTERIOR.", S({ token: str("token de prepare_order") }, ["token"])],
  ["get_order_status", "Sigue tu Pedido: último pedido y botón para consultar a la sucursal.", S({})],
  ["handoff_to_human", "Botón de WhatsApp para hablar con una persona.", S({ reason: str("Motivo"), summary: str("Resumen") }, ["reason"])],
  ["show_options", "Muestra 2–4 botones de respuesta rápida.", S({ options: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 } }, ["options"])],
  ["log_miss", "Registra algo que el cliente pidió y no existe.", S({ text: str("Pedido"), reason: str("Motivo") }, ["text"])],
];
SCHEMAS.push(...COACH_SCHEMAS);
Object.assign(T, COACH_TOOLS);
const anthropicTools = () => SCHEMAS.map(([name, description, input_schema]) => ({ name, description, input_schema, eager_input_streaming: true }));
const openaiTools = () => SCHEMAS.map(([name, description, parameters]) => ({ type: "function", function: { name, description, parameters } }));

function validateArgs(name, args) {
  const sc = SCHEMAS.find((s) => s[0] === name); if (!sc) return "Herramienta desconocida.";
  if (!args || typeof args !== "object" || Array.isArray(args)) return "Argumentos inválidos.";
  for (const r of sc[2].required) if (args[r] == null) return "Falta el campo '" + r + "'.";
  return null;
}
function runTool(ctx, name, args) {
  const err = validateArgs(name, args); if (err) return { error: err };
  try { return T[name](ctx, args || {}); } catch (e) { return { error: "Error interno de la herramienta." }; }
}

/* ---------- confirmación ---------- */
function isYes(text) {
  const t = norm(text);
  if (!t || t.length > 60) return false;
  if (/\b(no|pero|cambia|cambiar|quita|quitar|agrega|agregar|espera|mejor|aunque|sin|but|change|remove|add|wait|instead|without)\b/.test(t)) return false;
  return /^(si|sip|sii+|claro|dale|de una|confirmo|confirmar|confirmado|ok|okay|okey|listo|perfecto|bueno|mandalo|mandale|envialo|hacelo|correcto|exacto|yes|yep|yeah|sure|confirm|confirmed|send it|go ahead|va|vamos)\b/.test(t)
    || /^si,? confirmar$/.test(t);
}

module.exports = { T, runTool, SCHEMAS, anthropicTools, openaiTools, createSession, sanitizeState, cartSummary, isYes, search, lpClock, branchStatus, tokenFor, B };
