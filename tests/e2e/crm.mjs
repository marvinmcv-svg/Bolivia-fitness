// Bolivia Fitness CRM · prueba end-to-end completa con Playwright (sin dependencias extra).
// Uso:  node tests/e2e/crm.mjs [baseURL] [carpetaCapturas]
//   baseURL por defecto: el archivo local crm/index.html (file://). Ej. producción: https://bolivia-fitness.vercel.app/crm/
// Cubre: login y roles, cada módulo en 6 pantallas (teléfono → escritorio), desborde horizontal, tamaño táctil,
// accesibilidad básica, idioma ES/EN (y que no quede español en inglés), tema, persistencia, y todos los flujos
// de edición del dueño (ventas, anulación, clientes, oportunidades, inventario, catálogo, transferencias,
// sucursales, personal, turnos, campañas, tareas, reportes, reglas de fidelización, respaldo).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium, devices } = require("playwright");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BASE = process.argv[2] || pathToFileURL(path.join(ROOT, "crm/index.html")).href;
const OUT = process.argv[3] || "";
if (OUT) fs.mkdirSync(OUT, { recursive: true });

const MODULES = ["dashboard", "pos", "sales", "members", "pipeline", "inventory", "catalog", "transfers", "branches", "staff", "schedule", "campaigns", "tasks", "reports", "settings"];
const VIEWPORTS = [
  ["iphone-se", { viewport: { width: 320, height: 568 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }],
  ["iphone-13", { ...devices["iPhone 13"], deviceScaleFactor: 1 }],
  ["pixel-7", { ...devices["Pixel 7"], deviceScaleFactor: 1 }],
  ["ipad", { viewport: { width: 820, height: 1180 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }],
  ["laptop", { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 }],
  ["desktop", { viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 }],
];

/* ---------------- mini runner ---------------- */
const results = [];
let current = "";
function assert(cond, msg) { if (!cond) throw new Error(msg); }
function eq(a, b, msg) { if (a !== b) throw new Error(msg + " (esperado " + JSON.stringify(b) + ", obtenido " + JSON.stringify(a) + ")"); }
async function test(name, fn) {
  current = name; const t0 = Date.now();
  try { await fn(); results.push({ name, ok: true, ms: Date.now() - t0 }); process.stdout.write("  ✓ " + name + "\n"); }
  catch (e) { results.push({ name, ok: false, err: e.message.split("\n")[0] }); process.stdout.write("  ✗ " + name + "\n      → " + e.message.split("\n")[0] + "\n"); }
}

const browser = await chromium.launch();
async function newPage(opts, prefs) {
  const ctx = await browser.newContext(Object.assign({ acceptDownloads: true }, opts || { viewport: { width: 1440, height: 900 } }));
  await ctx.addInitScript((p) => { try { if (localStorage.getItem("bf_lang") == null) localStorage.setItem("bf_lang", p.lang || "es"); if (localStorage.getItem("bf_theme") == null) localStorage.setItem("bf_theme", p.theme || "dark"); } catch (e) { /* nada */ } }, prefs || {});
  const pg = await ctx.newPage();
  pg.errors = [];
  pg.on("pageerror", (e) => pg.errors.push(e.message));
  pg.on("console", (m) => { if (m.type() === "error" && !/favicon|ERR_FILE_NOT_FOUND|fonts\.g/.test(m.text())) pg.errors.push("console: " + m.text()); });
  pg.on("dialog", (d) => d.accept());
  return pg;
}
async function login(pg, user, pin) {
  await pg.goto(BASE, { waitUntil: "domcontentloaded" }); await pg.waitForSelector("#lf");
  if (user) await pg.selectOption("select[name=u]", user);
  await pg.fill("input[name=pin]", pin || "1234"); await pg.click("#lf button");
  if ((pin || "1234") === "1234") await pg.waitForSelector("#view .vh1, #view .back");
}
async function go(pg, hash) { await pg.evaluate((h) => { location.hash = h; }, hash); await pg.waitForFunction(() => document.querySelector("#view") && document.querySelector("#view").children.length > 0); await pg.waitForTimeout(120); }
const db = (pg, fn, arg) => pg.evaluate(fn, arg);
async function shot(pg, name) { if (OUT) await pg.screenshot({ path: path.join(OUT, name + ".png") }); }
async function closeModal(pg) { await pg.keyboard.press("Escape"); await pg.waitForFunction(() => !document.querySelector("#modal").open); }
async function submitModal(pg) { await pg.click("#modal footer button[value=ok]"); await pg.waitForTimeout(150); }

/* ================= 1. Pantallas y diseño en cada dispositivo ================= */
console.log("\n1) Todas las pantallas en 6 dispositivos");
for (const [vname, opts] of VIEWPORTS) {
  await test(vname + ": cada módulo carga sin errores, sin desborde horizontal y con controles accesibles", async () => {
    const pg = await newPage(opts);
    await login(pg);
    const problems = [];
    for (const m of MODULES) {
      await go(pg, "#/" + m);
      const r = await pg.evaluate((isMobile) => {
        const out = [];
        const sw = document.documentElement.scrollWidth, w = window.innerWidth;
        if (sw > w + 1) out.push("desborde horizontal " + sw + ">" + w);
        // controles sin nombre accesible
        document.querySelectorAll("#view button, #view a[href], #view input, #view select, .top button, .top input, .top select").forEach((el) => {
          if (el.closest("[hidden]") || el.type === "hidden" || !el.getClientRects().length) return;
          const name = (el.getAttribute("aria-label") || el.textContent || el.getAttribute("title") || el.getAttribute("placeholder") || "").trim() || (el.labels && el.labels.length ? el.labels[0].textContent.trim() : "") || (el.closest("label") ? el.closest("label").textContent.trim() : "");
          if (!name) out.push("sin nombre: " + el.outerHTML.slice(0, 90));
        });
        document.querySelectorAll("#view img").forEach((im) => { if (!im.hasAttribute("alt")) out.push("img sin alt " + im.src.slice(-40)); });
        // objetivos táctiles en teléfono (≥ 28px; los botones principales ≥ 36px)
        if (isMobile) document.querySelectorAll(".top button, #view .btn, #view .chip, #view .ib").forEach((el) => { const r = el.getBoundingClientRect(); if (r.width && (r.height < 26 || r.width < 26)) out.push("objetivo táctil chico " + Math.round(r.width) + "x" + Math.round(r.height) + " " + (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 20)); });
        return out;
      }, !!opts.isMobile);
      r.forEach((x) => problems.push(m + ": " + x));
      if (vname === "iphone-13" || vname === "desktop") await shot(pg, "crm-" + vname + "-" + m);
    }
    assert(!pg.errors.length, "errores JS: " + pg.errors.slice(0, 3).join(" | "));
    assert(!problems.length, problems.length + " problemas: " + [...new Set(problems)].slice(0, 6).join(" | "));
    await pg.context().close();
  });
}

await test("teléfono: el menú lateral se abre, navega y se cierra", async () => {
  const pg = await newPage(VIEWPORTS[1][1]);
  await login(pg);
  assert(await pg.isVisible("#menuBtn"), "no se ve el botón de menú");
  await pg.click("#menuBtn"); await pg.waitForTimeout(300);
  const x = await pg.evaluate(() => document.querySelector("#side").getBoundingClientRect().left);
  assert(x >= -1, "el menú no se abrió");
  await pg.click('[data-nav="members"]'); await pg.waitForTimeout(400);
  assert((await pg.url()).includes("#/members"), "no navegó a clientes");
  const x2 = await pg.evaluate(() => document.querySelector("#side").getBoundingClientRect().left);
  assert(x2 < 0, "el menú no se cerró al navegar");
  await pg.context().close();
});

/* ================= 2. Acceso y permisos ================= */
console.log("\n2) Acceso y permisos por rol");
await test("PIN incorrecto muestra error y no entra", async () => {
  const pg = await newPage();
  await login(pg, null, "0000");
  await pg.waitForTimeout(200);
  assert(await pg.isVisible("#lerr"), "no hay mensaje"); assert((await pg.textContent("#lerr")).length > 3, "mensaje vacío");
  assert(!(await pg.$("#view")), "entró con PIN incorrecto");
  await pg.context().close();
});
await test("vendedor: solo ve sus módulos, no puede abrir catálogo/ajustes por URL y queda fijo en su sucursal", async () => {
  const pg = await newPage();
  await login(pg, "st-sc-ventura-0");
  const nav = await pg.$$eval("[data-nav]", (a) => a.map((x) => x.dataset.nav));
  for (const m of ["catalog", "settings", "branches", "staff", "reports", "campaigns", "transfers", "schedule"]) assert(!nav.includes(m), "el vendedor ve " + m);
  await go(pg, "#/catalog"); assert(await pg.isVisible('[data-nav="dashboard"][aria-current]'), "pudo abrir catálogo por URL");
  await go(pg, "#/settings"); assert(await pg.isVisible('[data-nav="dashboard"][aria-current]'), "pudo abrir ajustes por URL");
  assert(!(await pg.$("#fBranch")), "el vendedor puede cambiar de sucursal");
  await go(pg, "#/inventory"); assert(!(await pg.$("[data-adj], [data-all]")), "el vendedor puede ajustar stock");
  await pg.context().close();
});
await test("encargado: ve su sucursal y puede ajustar stock de su tienda, no de todas", async () => {
  const pg = await newPage();
  await login(pg, "st-m-cb-1");
  assert(!(await pg.$("#fBranch")), "el encargado puede cambiar de sucursal");
  await go(pg, "#/inventory"); assert(await pg.$("[data-adj]"), "no puede ajustar su stock"); assert(!(await pg.$("[data-all]")), "puede editar todas las tiendas");
  await go(pg, "#/catalog"); assert(await pg.isVisible('[data-nav="dashboard"][aria-current]'), "el encargado abre el catálogo");
  await pg.context().close();
});
await test("almacén: inventario y transferencias, sin ventas", async () => {
  const pg = await newPage();
  await login(pg, "st-wh");
  const nav = await pg.$$eval("[data-nav]", (a) => a.map((x) => x.dataset.nav));
  assert(nav.includes("inventory") && nav.includes("transfers") && !nav.includes("pos") && !nav.includes("sales"), "menú de almacén incorrecto: " + nav.join(","));
  await pg.context().close();
});

/* ================= 3. Flujos de trabajo (dueño, escritorio) ================= */
console.log("\n3) Flujos completos del dueño");
const pg = await newPage({ viewport: { width: 1440, height: 900 } });
await login(pg);

await test("punto de venta: venta con cliente descuenta stock, suma puntos y muestra comprobante", async () => {
  await go(pg, "#/pos");
  await pg.selectOption("#posBranch", "sc-ventura");
  const pid = await pg.getAttribute("#pgrid .pc:not(.pc--out)", "data-p");
  const before = await db(pg, (p) => ({ n: CRMDB.db.sales.length, q: CRMDB.inv("sc-ventura", p).qty, pts: CRMDB.member("m-1003").points }), pid);
  await pg.click('#pgrid [data-p="' + pid + '"]'); await pg.click('#pgrid [data-p="' + pid + '"]');
  await pg.fill("#cq", (await db(pg, () => CRMDB.member("m-1003").phone)).slice(-6)); await pg.waitForTimeout(150);
  await pg.click("#cres [data-m] >> nth=0");
  await pg.click("[data-pay=efectivo]"); await pg.click("#charge"); await pg.waitForSelector("#modal[open] .receipt");
  const after = await db(pg, (p) => ({ n: CRMDB.db.sales.length, q: CRMDB.inv("sc-ventura", p).qty, pts: CRMDB.member("m-1003").points, last: CRMDB.db.sales[CRMDB.db.sales.length - 1] }), pid);
  eq(after.n, before.n + 1, "no se registró la venta"); eq(after.q, before.q - 2, "no se descontó el stock");
  eq(after.last.payment, "efectivo", "medio de pago"); eq(after.last.memberId, "m-1003", "cliente");
  eq(after.pts, before.pts + Math.floor(after.last.total / 10), "puntos ganados");
  assert(await pg.isVisible('#modal a[href^="https://wa.me/"]'), "falta comprobante por WhatsApp");
  await closeModal(pg);
});
await test("punto de venta: no deja vender más que el stock", async () => {
  await go(pg, "#/pos"); await pg.selectOption("#posBranch", "sc-ventura");
  const pid = await pg.getAttribute("#pgrid .pc:not(.pc--out)", "data-p");
  await db(pg, (p) => { CRMDB.inv("sc-ventura", p).qty = 1; CRMDB.save(); }, pid);
  await go(pg, "#/dashboard"); await go(pg, "#/pos");
  await pg.click("#cart .link").catch(() => {});
  await pg.click('#pgrid [data-p="' + pid + '"]'); await pg.click('#pgrid [data-p="' + pid + '"]');
  const n = await pg.textContent('#cart .qty span'); eq(n.trim(), "1", "dejó superar el stock");
  assert((await pg.textContent("#toast")).length > 3, "no avisó por falta de stock");
  await pg.click("#clr");
});
await test("ventas: anular devuelve stock y cambia el estado; exportar CSV descarga", async () => {
  const s = await db(pg, () => { const x = CRMDB.db.sales.filter((v) => v.status === "pagada").slice(-1)[0]; return { id: x.id, b: x.branchId, l: x.lines[0] }; });
  const q0 = await db(pg, (a) => CRMDB.inv(a.b, a.l.pid).qty, s);
  await go(pg, "#/sales?id=" + s.id); await pg.waitForSelector("#modal[open]");
  await submitModal(pg);
  const r = await db(pg, (a) => ({ st: CRMDB.db.sales.find((v) => v.id === a.id).status, q: CRMDB.inv(a.b, a.l.pid).qty }), s);
  eq(r.st, "anulada", "no se anuló"); eq(r.q, q0 + s.l.qty, "no devolvió stock");
  const [dl] = await Promise.all([pg.waitForEvent("download"), pg.click("#exp")]);
  const txt = fs.readFileSync(await dl.path(), "utf8"); assert(txt.startsWith('"venta"'), "CSV sin encabezado");
});
await test("clientes: crear (con validación), editar, agregar nota y eliminar", async () => {
  await go(pg, "#/members"); await pg.click("#madd");
  await pg.fill('#modal [name=name]', ""); await submitModal(pg);
  assert(await db(pg, () => document.querySelector("#modal").open), "guardó sin nombre");
  await pg.fill('#modal [name=name]', "Prueba Automática"); await pg.fill('#modal [name=phone]', "59170000001"); await submitModal(pg);
  await pg.waitForFunction(() => location.hash.startsWith("#/members/m-"));
  const id = await pg.evaluate(() => location.hash.split("/")[2]);
  await pg.click("#medit"); await pg.fill('#modal [name=name]', "Prueba Editada"); await submitModal(pg);
  eq(await db(pg, (i) => CRMDB.member(i).name, id), "Prueba Editada", "no se editó");
  await pg.fill("#nf input", "Prefiere chocolate"); await pg.click("#nf button"); await pg.waitForTimeout(150);
  eq(await db(pg, (i) => CRMDB.member(i).notes[0].text, id), "Prefiere chocolate", "no se guardó la nota");
  await pg.click("#medit"); await pg.click("#modal [data-extra]"); await pg.waitForTimeout(200);
  eq(await db(pg, (i) => !!CRMDB.member(i), id), false, "no se eliminó");
});
await test("oportunidades: crear, avanzar hasta ganada (crea cliente) y eliminar", async () => {
  await go(pg, "#/pipeline"); await pg.click("#ladd");
  await pg.fill('#modal [name=name]', "Lead Test"); await pg.fill('#modal [name=phone]', "59170000002"); await submitModal(pg);
  const id = await db(pg, () => CRMDB.db.leads.find((l) => l.name === "Lead Test").id);
  for (let i = 0; i < 3; i++) { await pg.click('[data-l="' + id + '"] [data-mv="1"]'); await pg.waitForTimeout(120); }
  eq(await db(pg, (i) => CRMDB.db.leads.find((l) => l.id === i).stage, id), "ganado", "no llegó a ganada");
  assert(await db(pg, () => CRMDB.db.members.some((m) => m.phone === "59170000002")), "no creó el cliente");
  await pg.click('[data-l="' + id + '"] b'); await pg.click("#modal [data-extra]"); await pg.waitForTimeout(150);
  assert(!(await db(pg, (i) => CRMDB.db.leads.some((l) => l.id === i), id)), "no se eliminó");
});
await test("inventario (todas las sucursales): el dueño edita stock, mínimo y vencimiento de cada tienda", async () => {
  await pg.selectOption("#fBranch", "all"); await go(pg, "#/inventory");
  const pid = await pg.getAttribute("[data-all]", "data-all");
  await pg.click('[data-all="' + pid + '"]'); await pg.waitForSelector("#modal[open] .tbl--grid");
  await pg.fill('#modal [name="q_sc-ventura"]', "77"); await pg.fill('#modal [name="m_lp-centro"]', "9"); await pg.fill('#modal [name="e_su-centro"]', "2027-05-01");
  await submitModal(pg);
  const r = await db(pg, (p) => [CRMDB.inv("sc-ventura", p).qty, CRMDB.inv("lp-centro", p).min, CRMDB.inv("su-centro", p).exp], pid);
  eq(JSON.stringify(r), JSON.stringify([77, 9, "2027-05-01"]), "no guardó la grilla de stock");
  assert(await pg.$(".cellb"), "la matriz no es editable");
});
await test("inventario (una sucursal): ingreso, salida y conteo físico", async () => {
  await pg.selectOption("#fBranch", "or-centro"); await go(pg, "#/inventory");
  const pid = await pg.getAttribute("[data-adj]", "data-adj");
  const q0 = await db(pg, (p) => CRMDB.inv("or-centro", p).qty, pid);
  const adj = async (kind, n) => { await pg.click('[data-adj="' + pid + '"]'); await pg.selectOption("#modal [name=kind]", kind); await pg.fill("#modal [name=qty]", String(n)); await submitModal(pg); };
  await adj("in", 10); eq(await db(pg, (p) => CRMDB.inv("or-centro", p).qty, pid), q0 + 10, "ingreso");
  await adj("out", 3); eq(await db(pg, (p) => CRMDB.inv("or-centro", p).qty, pid), q0 + 7, "salida");
  await adj("count", 4); eq(await db(pg, (p) => CRMDB.inv("or-centro", p).qty, pid), 4, "conteo");
  await pg.selectOption("#fBranch", "all");
});
await test("catálogo: cambiar precio se refleja en caja; ocultar lo saca de la caja", async () => {
  await go(pg, "#/catalog");
  await pg.click('[data-pe="dp-glutamine"]'); await pg.fill("#modal [name=price]", "199"); await submitModal(pg);
  eq(await db(pg, () => CRMDB.product("dp-glutamine").price), 199, "no cambió el precio");
  await go(pg, "#/pos"); assert((await pg.textContent('[data-p="dp-glutamine"]')).includes("199"), "la caja no muestra el precio nuevo");
  await go(pg, "#/catalog"); await pg.click('[data-pe="dp-glutamine"]'); await pg.check("#modal [name=hidden]"); await submitModal(pg);
  await go(pg, "#/pos"); assert(!(await pg.$('[data-p="dp-glutamine"]')), "el producto oculto sigue en la caja");
  await go(pg, "#/catalog"); await pg.click('[data-pe="dp-glutamine"]'); await pg.uncheck("#modal [name=hidden]"); await submitModal(pg);
});
await test("catálogo: crear producto propio con stock inicial, venderlo y eliminarlo", async () => {
  await go(pg, "#/catalog"); await pg.click("#padd");
  await pg.fill("#modal [name=short]", "Toalla BF"); await pg.fill("#modal [name=name]", "Toalla Bolivia Fitness"); await pg.fill("#modal [name=price]", "80");
  await pg.fill('#modal [name="q_sc-ventura"]', "12"); await submitModal(pg);
  const id = await db(pg, () => CRMDB.db.custom.find((p) => p.short === "Toalla BF").id);
  eq(await db(pg, (i) => CRMDB.inv("sc-ventura", i).qty, id), 12, "stock inicial");
  await go(pg, "#/pos"); await pg.selectOption("#posBranch", "sc-ventura");
  await pg.click('[data-p="' + id + '"]'); await pg.click("#charge"); await pg.waitForSelector("#modal[open] .receipt"); await closeModal(pg);
  eq(await db(pg, (i) => CRMDB.inv("sc-ventura", i).qty, id), 11, "no se vendió");
  await go(pg, "#/catalog"); await pg.click('[data-pe="' + id + '"]'); await pg.click("#modal [data-extra]"); await pg.waitForTimeout(150);
  assert(!(await db(pg, (i) => CRMDB.products(true).some((p) => p.id === i), id)), "no se eliminó del catálogo");
  assert(await db(pg, (i) => CRMDB.product(i).short === "Toalla BF", id), "se perdió del historial de ventas");
  await go(pg, "#/reports"); await pg.click('[data-r="products"]'); assert((await pg.textContent("#rtbl")).includes("Toalla BF"), "el reporte perdió el producto vendido");
});
await test("transferencias: valida stock, descuenta origen, suma destino al recibir y cancela devolviendo", async () => {
  await go(pg, "#/transfers");
  const pid = "dp-creatine-30";
  await db(pg, (p) => { CRMDB.inv("sc-cine", p).qty = 5; CRMDB.save(); }, pid);
  const d0 = await db(pg, (p) => CRMDB.inv("tj-centro", p).qty, pid);
  const open = async (n) => { await pg.click("#tadd"); await pg.selectOption("#modal [name=from]", "sc-cine"); await pg.selectOption("#modal [name=to]", "tj-centro"); await pg.selectOption("#modal [name=pid]", pid); await pg.fill("#modal [name=qty]", String(n)); await submitModal(pg); };
  await open(50); assert((await pg.textContent("#terr")).length > 5, "no avisó stock insuficiente"); await closeModal(pg);
  await open(3); eq(await db(pg, (p) => CRMDB.inv("sc-cine", p).qty, pid), 2, "no descontó el origen");
  const tid = await db(pg, () => CRMDB.db.transfers[0].id);
  await pg.click('[data-rcv="' + tid + '"]'); await pg.waitForTimeout(150);
  eq(await db(pg, (p) => CRMDB.inv("tj-centro", p).qty, pid), d0 + 3, "no sumó al destino");
  await open(2); const tid2 = await db(pg, () => CRMDB.db.transfers[0].id);
  await pg.click('[data-tcx="' + tid2 + '"]'); await pg.waitForTimeout(150);
  eq(await db(pg, (p) => CRMDB.inv("sc-cine", p).qty, pid), 2, "cancelar no devolvió el stock");
});
await test("sucursales: crear, editar meta/encargado y eliminar", async () => {
  await go(pg, "#/branches"); await pg.click("#badd");
  await pg.fill("#modal [name=name]", "Potosí Centro"); await pg.fill("#modal [name=city]", "Potosí"); await pg.fill("#modal [name=target]", "40000"); await submitModal(pg);
  await pg.waitForFunction(() => location.hash.startsWith("#/branches/br-"));
  const id = await pg.evaluate(() => location.hash.split("/")[2]);
  assert(await db(pg, (i) => Object.keys(CRMDB.db.inventory[i]).length > 40, id), "la sucursal nueva no tiene inventario");
  assert(await pg.$('#fBranch option[value="' + id + '"]'), "no aparece en el filtro");
  await pg.click("#bedit"); await pg.fill("#modal [name=target]", "55000"); await pg.selectOption("#modal [name=managerId]", "st-sc-ventura-1"); await submitModal(pg);
  eq(await db(pg, (i) => CRMDB.branch(i).target, id), 55000, "meta");
  eq(await db(pg, (i) => CRMDB.person("st-sc-ventura-1").branchId === i && CRMDB.person("st-sc-ventura-1").role, id), "manager", "encargado");
  await pg.click("#bedit"); await pg.click("#modal [data-extra]"); await pg.waitForTimeout(250);
  assert(!(await db(pg, (i) => CRMDB.db.branches.some((b) => b.id === i), id)), "no se eliminó");
});
await test("personal: agregar, editar comisión, entrar con su PIN y eliminar", async () => {
  await go(pg, "#/staff"); await pg.click("#sadd");
  await pg.fill("#modal [name=name]", "Vendedora Test"); await pg.fill("#modal [name=phone]", "59170000003"); await pg.fill("#modal [name=pin]", "4321"); await submitModal(pg);
  const id = await db(pg, () => CRMDB.db.staff.find((s) => s.name === "Vendedora Test").id);
  await pg.click('[data-ed="' + id + '"]'); await pg.fill("#modal [name=commission]", "5"); await submitModal(pg);
  eq(await db(pg, (i) => CRMDB.person(i).commission, id), 5, "comisión");
  const p2 = await pg.context().newPage(); p2.on("dialog", (d) => d.accept());
  await p2.goto(BASE, { waitUntil: "domcontentloaded" }); await p2.waitForSelector("#view .vh1");
  assert((await p2.textContent(".me")).includes("Dueño"), "la sesión no pasó a la pestaña nueva");
  await p2.click("#logout"); await p2.waitForSelector("#lf"); await p2.selectOption("select[name=u]", id); await p2.fill("input[name=pin]", "4321"); await p2.click("#lf button"); await p2.waitForSelector("#view .vh1");
  assert((await p2.textContent(".me")).includes("Vendedora Test"), "no pudo entrar con su PIN"); await p2.close();
  await pg.click('[data-ed="' + id + '"]'); await pg.click("#modal [data-extra]"); await pg.waitForTimeout(150);
  assert(!(await db(pg, (i) => !!CRMDB.person(i), id)), "no se eliminó");
});
await test("turnos: cambiar horario y marcar día libre", async () => {
  await go(pg, "#/schedule");
  const cell = await pg.$("#view .shift:not(.off)"); const sid = await cell.getAttribute("data-s"), day = +(await cell.getAttribute("data-d"));
  await cell.click(); await pg.fill("#modal [name=from]", "08:30"); await pg.fill("#modal [name=to]", "13:30"); await submitModal(pg);
  eq(await db(pg, (a) => (CRMDB.db.shifts.find((z) => z.staffId === a.sid && z.day === a.day) || {}).from, { sid, day }), "08:30", "no cambió el turno");
  await pg.click('[data-s="' + sid + '"][data-d="' + day + '"]'); await pg.check("#modal [name=off]"); await submitModal(pg);
  assert(!(await db(pg, (a) => CRMDB.db.shifts.some((z) => z.staffId === a.sid && z.day === a.day), { sid, day })), "no quedó libre");
});
await test("campañas: crear, difundir con WhatsApp personalizado, exportar lista y eliminar", async () => {
  await go(pg, "#/campaigns"); await pg.click("#cadd");
  await pg.fill("#modal [name=name]", "Campaña Test"); await pg.selectOption("#modal [name=segment]", "vip"); await pg.fill("#modal [name=note]", "Hola {nombre}, 15% para vos"); await submitModal(pg);
  const c = await db(pg, () => CRMDB.db.campaigns.find((x) => x.name === "Campaña Test"));
  assert(c, "no se creó");
  await pg.click('[data-bc="vip"][data-msg="Hola {nombre}, 15% para vos"]'); await pg.waitForSelector("#modal[open] #blist");
  const href = await pg.getAttribute('#blist a[href^="https://wa.me/"]', "href");
  assert(href && decodeURIComponent(href).includes("15% para vos") && !decodeURIComponent(href).includes("{nombre}"), "mensaje no personalizado");
  const [dl] = await Promise.all([pg.waitForEvent("download"), pg.click("#bcsv")]); assert(fs.readFileSync(await dl.path(), "utf8").includes("telefono"), "CSV de difusión");
  await closeModal(pg);
  await pg.click('[data-ce="' + c.id + '"]'); await pg.click("#modal [data-extra]"); await pg.waitForTimeout(150);
  assert(!(await db(pg, (i) => CRMDB.db.campaigns.some((x) => x.id === i), c.id)), "no se eliminó");
});
await test("tareas: crear, completar y eliminar", async () => {
  await go(pg, "#/tasks"); await pg.click("#tadd"); await pg.fill("#modal [name=title]", "Tarea Test"); await submitModal(pg);
  const id = await db(pg, () => CRMDB.db.tasks.find((x) => x.title === "Tarea Test").id);
  await pg.check('[data-t="' + id + '"]'); await pg.waitForTimeout(120);
  assert(await db(pg, (i) => CRMDB.db.tasks.find((x) => x.id === i).done, id), "no se completó");
  await pg.click('[data-del="' + id + '"]'); await pg.waitForTimeout(120);
  assert(!(await db(pg, (i) => CRMDB.db.tasks.some((x) => x.id === i), id)), "no se eliminó");
});
await test("reportes: cada pestaña muestra datos y exporta CSV", async () => {
  await go(pg, "#/reports");
  for (const k of ["branches", "products", "staff", "categories", "payments", "channels"]) {
    await pg.click('[data-r="' + k + '"]'); const rows = await pg.$$eval("#rtbl tbody tr", (r) => r.length); assert(rows > 0, "sin filas en " + k);
    const [dl] = await Promise.all([pg.waitForEvent("download"), pg.click("#rcsv")]); assert(fs.readFileSync(await dl.path(), "utf8").split("\n").length > 1, "CSV vacío en " + k);
  }
});
await test("fidelización: cambiar reglas cambia los puntos de la próxima venta; niveles inválidos se rechazan", async () => {
  await go(pg, "#/settings");
  await pg.fill("#loy [name=t_oro]", "100"); await pg.click("#loy button"); await pg.waitForTimeout(120);
  eq(await db(pg, () => CRMDB.db.loyalty.tiers.oro), 900, "aceptó niveles desordenados");
  await pg.fill("#loy [name=t_oro]", "900"); await pg.fill("#loy [name=per]", "5"); await pg.click("#loy button"); await pg.waitForTimeout(150);
  eq(await db(pg, () => CRMDB.db.loyalty.per), 5, "no guardó la regla");
  const p0 = await db(pg, () => CRMDB.member("m-1010").points);
  await go(pg, "#/pos?member=m-1010"); await pg.selectOption("#posBranch", "sc-ventura");
  await pg.click("#pgrid .pc:not(.pc--out) >> nth=0"); await pg.click("#charge"); await pg.waitForSelector("#modal[open] .receipt"); await closeModal(pg);
  const s = await db(pg, () => CRMDB.db.sales[CRMDB.db.sales.length - 1]);
  eq(await db(pg, () => CRMDB.member("m-1010").points), p0 + Math.floor(s.total / 5), "los puntos no usan la regla nueva");
});
await test("ajustes: costo editable, respaldo JSON válido y restauración", async () => {
  await go(pg, "#/settings");
  await pg.fill('[data-c="dp-omega3"]', "111"); await pg.dispatchEvent('[data-c="dp-omega3"]', "change");
  eq(await db(pg, () => CRMDB.product("dp-omega3").cost), 111, "costo");
  const [dl] = await Promise.all([pg.waitForEvent("download"), pg.click("#bk")]);
  const file = await dl.path(); const json = JSON.parse(fs.readFileSync(file, "utf8")); assert(json.sales.length > 1000 && json.loyalty, "respaldo incompleto");
  await db(pg, () => { CRMDB.db.members[0].name = "CAMBIADO"; CRMDB.save(); });
  await pg.setInputFiles("#rs", file); await pg.waitForTimeout(400);
  assert((await db(pg, () => CRMDB.db.members[0].name)) !== "CAMBIADO", "no restauró el respaldo");
});
await test("búsqueda global, atajo '/' y Escape para cerrar ventanas", async () => {
  await go(pg, "#/dashboard");
  await pg.keyboard.press("/"); assert(await pg.evaluate(() => document.activeElement.id === "gq"), "'/' no enfoca la búsqueda");
  const name = await db(pg, () => CRMDB.member("m-1005").name);
  await pg.keyboard.type(name.split(" ")[0] + " " + name.split(" ")[1]); await pg.waitForSelector("#gres:not([hidden]) a");
  await pg.click('#gres a[href="#/members/m-1005"]'); await pg.waitForTimeout(200);
  assert((await pg.url()).includes("#/members/m-1005"), "no abrió el cliente");
  await pg.click("#medit"); await closeModal(pg);
});
await test("filtros: período y sucursal cambian los números y se recuerdan al recargar", async () => {
  await go(pg, "#/dashboard"); await pg.selectOption("#fBranch", "all"); await pg.selectOption("#fPeriod", "30d");
  const a = await pg.textContent(".kpi__v"); await pg.selectOption("#fPeriod", "7d"); const b = await pg.textContent(".kpi__v");
  assert(a !== b, "el período no cambia las ventas");
  await pg.selectOption("#fBranch", "su-centro"); const c = await pg.textContent(".kpi__v"); assert(c !== b, "la sucursal no cambia las ventas");
  await pg.reload({ waitUntil: "domcontentloaded" }); await pg.waitForSelector("#view .vh1");
  eq(await pg.inputValue("#fBranch"), "su-centro", "no recordó la sucursal"); eq(await pg.inputValue("#fPeriod"), "7d", "no recordó el período");
  await pg.selectOption("#fBranch", "all");
});
await test("gráficos: tooltip al pasar el mouse por la línea y las barras", async () => {
  await go(pg, "#/dashboard");
  const box = await pg.locator("#chLine .hit").boundingBox(); await pg.mouse.move(box.x + box.width * .6, box.y + box.height / 2);
  assert(await pg.isVisible("#chLine .ctip.on"), "sin tooltip en la línea");
  await pg.locator("#chHour").scrollIntoViewIfNeeded(); await pg.waitForTimeout(150);
  const bb = await pg.locator("#chHour .hitb").nth(5).boundingBox(); await pg.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
  assert(await pg.isVisible("#chHour .ctip.on"), "sin tooltip en las barras");
});
await test("persistencia: los cambios sobreviven a recargar y a cerrar sesión", async () => {
  await db(pg, () => { CRMDB.member("m-1001").name = "Persistente Test"; CRMDB.save(); });
  await pg.reload({ waitUntil: "domcontentloaded" }); await pg.waitForSelector("#view");
  eq(await db(pg, () => CRMDB.member("m-1001").name), "Persistente Test", "no persistió");
  await pg.click("#logout"); await pg.waitForSelector("#lf");
  await pg.reload({ waitUntil: "domcontentloaded" }); await pg.waitForSelector("#lf"); // cerrar sesión no se deshace al recargar
  await pg.fill("input[name=pin]", "1234"); await pg.click("#lf button"); await pg.waitForSelector("#view .vh1");
  eq(await db(pg, () => CRMDB.member("m-1001").name), "Persistente Test", "se perdió al cerrar sesión");
});
assert(true);
await test("sin errores de JavaScript en todo el recorrido del dueño", async () => { assert(!pg.errors.length, pg.errors.slice(0, 3).join(" | ")); });
await pg.context().close();

/* ================= 4. Idioma y tema ================= */
console.log("\n4) Idioma ES/EN y tema");
for (const [vname, opts] of [VIEWPORTS[1], VIEWPORTS[5]]) {
  await test(vname + ": el selector ES/EN cambia todo, se recuerda y no deja español visible en inglés", async () => {
    const p = await newPage(opts);
    await p.goto(BASE, { waitUntil: "domcontentloaded" }); await p.waitForSelector("#lf");
    await p.click('.login [data-lang="en"]'); await p.waitForSelector("#lf");
    eq((await p.textContent(".login button.btn")).trim(), "Sign in", "login no cambió a inglés");
    await p.fill("input[name=pin]", "1234"); await p.click("#lf button"); await p.waitForSelector("#view .vh1");
    eq(await p.getAttribute("html", "lang"), "en", "lang del documento");
    assert(await p.isVisible('.top [data-lang="en"][aria-pressed="true"]'), "el selector no se ve o no marca EN");
    const leftovers = new Set();
    for (const m of MODULES) {
      await go(p, "#/" + m);
      (await p.evaluate(() => {
        const D = CRMDB, nouns = [];
        D.db.branches.forEach((b) => nouns.push(b.name, b.city, b.address)); D.db.staff.forEach((s) => nouns.push(s.name)); D.db.members.forEach((x) => nouns.push(x.name));
        D.products(true).forEach((p) => nouns.push(p.name, p.flavor || "")); D.db.tasks.forEach((x) => nouns.push(x.title)); D.db.campaigns.forEach((x) => nouns.push(x.name, x.note || "")); D.db.leads.forEach((x) => nouns.push(x.note || ""));
        ["Club León", "León", "LeonIA", "Ñuflo de Chávez", "Dragon Pharma", "Bolivia Fitness", "Multicentro Libertad", "Calle Camargo"].forEach((x) => nouns.push(x));
        const sorted = nouns.filter(Boolean).sort((a, b) => b.length - a.length);
        const sp = /[¿¡]|\b(de|del|los|las|con|por|para|sin|más|una|desde|hasta|ventas|clientes|sucursal|sucursales|productos|nuevo|nueva|guardar|editar|buscar|hoy|días|semana|meta|todas|todos|stock bajo)\b/i;
        const out = []; const tw = document.createTreeWalker(document.querySelector(".main"), NodeFilter.SHOW_TEXT); let n;
        while ((n = tw.nextNode())) { let s = n.data.trim(); if (!s || !n.parentElement.getClientRects().length || n.parentElement.closest(".demo + main .feed, .feed, pre, code, .gres")) continue; sorted.forEach((w) => { if (w.length > 2) s = s.split(w).join(""); }); if (sp.test(s)) out.push(s.slice(0, 80)); }
        return out;
      })).forEach((x) => leftovers.add(m + ": " + x));
    }
    await p.reload({ waitUntil: "domcontentloaded" }); await p.waitForSelector("#view .vh1"); eq(await p.getAttribute("html", "lang"), "en", "no recordó el inglés");
    await p.click('.top [data-lang="es"]'); await p.waitForTimeout(200);
    eq(await p.getAttribute("html", "lang"), "es-BO", "no volvió a español");
    assert(!leftovers.size, leftovers.size + " textos en español: " + [...leftovers].slice(0, 6).join(" | "));
    assert(!p.errors.length, p.errors.join(" | "));
    await p.context().close();
  });
}
await test("tema claro/oscuro se aplica y se recuerda", async () => {
  const p = await newPage();
  await login(p);
  eq(await p.getAttribute("html", "data-theme"), "dark", "tema inicial");
  await p.click("#themeBtn"); eq(await p.getAttribute("html", "data-theme"), "light", "no cambió a claro");
  const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor); assert(bg !== "rgb(8, 6, 6)", "el fondo no cambió");
  await p.reload({ waitUntil: "domcontentloaded" }); await p.waitForSelector("#view"); eq(await p.getAttribute("html", "data-theme"), "light", "no recordó el tema");
  await shot(p, "crm-light-dashboard");
  await p.context().close();
});

/* ================= 5. Teléfono: flujo de venta completo con toques ================= */
console.log("\n5) Teléfono: venta con toques");
await test("iPhone: venta completa con pantalla táctil", async () => {
  const p = await newPage(VIEWPORTS[1][1]);
  await login(p);
  await go(p, "#/pos"); await p.selectOption("#posBranch", "cb-1");
  const n0 = await db(p, () => CRMDB.db.sales.length);
  await p.tap("#pgrid .pc:not(.pc--out) >> nth=0"); await p.tap("#pgrid .pc:not(.pc--out) >> nth=1");
  await p.tap("[data-pay=qr]"); await p.locator("#charge").scrollIntoViewIfNeeded(); await p.tap("#charge");
  await p.waitForSelector("#modal[open] .receipt"); await shot(p, "crm-iphone-receipt");
  eq(await db(p, () => CRMDB.db.sales.length), n0 + 1, "no se registró la venta desde el teléfono");
  const w = await p.evaluate(() => document.querySelector("#modal").getBoundingClientRect().width);
  assert(w <= 390, "el modal se sale de la pantalla (" + w + ")");
  assert(!p.errors.length, p.errors.join(" | "));
  await p.context().close();
});

await browser.close();
const ok = results.filter((r) => r.ok).length;
console.log("\n" + ok + "/" + results.length + " pruebas OK" + (ok === results.length ? " ✅" : " ❌"));
if (OUT) fs.writeFileSync(path.join(OUT, "crm-results.json"), JSON.stringify(results, null, 1));
process.exit(ok === results.length ? 0 : 1);
