// Auditoría responsive end-to-end con Playwright (sin dependencias extra: usa el Playwright instalado).
// Uso: node tests/e2e/audit.mjs [baseURL] [carpetaCapturas]
// Revisa cada página en teléfono, tablet y escritorio: desborde horizontal, objetivos táctiles chicos,
// texto demasiado chico, imágenes rotas, errores de consola, y flujos clave (menú, bolsa, LeonIA, checkout).
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium, devices } = require("playwright");

const BASE = process.argv[2] || "http://localhost:4173";
const OUT = process.argv[3] || "";
if (OUT) fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  ["home", "/index.html"],
  ["tienda", "/tienda.html"],
  ["producto", "/producto.html?id=dp-creatine-60"],
  ["ofertas", "/ofertas.html"],
  ["sucursales", "/sucursales.html"],
  ["nosotros", "/nosotros.html"],
  ["pedido", "/pedido.html"],
];
const VIEWPORTS = [
  ["iphone-se", { viewport: { width: 320, height: 568 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }],
  ["iphone-13", { ...devices["iPhone 13"], deviceScaleFactor: 1 }],
  ["pixel-7", { ...devices["Pixel 7"], deviceScaleFactor: 1 }],
  ["ipad", { viewport: { width: 820, height: 1180 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }],
  ["laptop", { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 }],
  ["desktop", { viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 }],
];

const issues = [];
const note = (vp, pg, msg) => issues.push(`[${vp}] ${pg}: ${msg}`);

async function inspect(page, vp, pg, touch) {
  return page.evaluate(({ touch }) => {
    const out = [];
    const W = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > W + 1) out.push(`desborde horizontal: scrollWidth ${document.documentElement.scrollWidth} > ${W}`);
    const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0.05; };
    const inRail = (el) => el.closest(".rail, .mfilters, .picker, .chat__chips, .countdown");
    // elementos que se salen del viewport (excluye rieles con scroll horizontal intencional)
    const wide = new Set();
    for (const el of document.querySelectorAll("main *, footer *, header *")) {
      if (!vis(el) || inRail(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > W + 2 || r.left < -2) {
        let anc = el.parentElement, clipped = false;
        while (anc && anc !== document.body) { const o = getComputedStyle(anc).overflowX; if (o === "hidden" || o === "clip" || o === "auto" || o === "scroll") { const ar = anc.getBoundingClientRect(); if (ar.right <= W + 2 && ar.left >= -2) { clipped = true; break; } } anc = anc.parentElement; }
        if (!clipped) wide.add((el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : el.tagName) + ` (${Math.round(r.left)}→${Math.round(r.right)})`);
      }
    }
    if (wide.size) out.push("se sale de pantalla: " + [...wide].slice(0, 6).join(", "));
    if (touch) {
      const small = new Set();
      for (const el of document.querySelectorAll("a, button, input, select, [role=button], summary, label.switchrow")) {
        if (!vis(el)) continue;
        if (el.closest(".ftr__bottom, p, .msg, .acc__body, .pcard__name, .combo__item")) continue; // enlaces en línea de texto
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight * 6) continue;
        if (el.matches("input[type=checkbox]") && el.closest("label")) continue;
        if (r.width < 24 || r.height < 40) small.add(`${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : ""}[${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 18)}] ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
      if (small.size) out.push(`objetivos táctiles < 40px (${small.size}): ` + [...small].slice(0, 8).join(" | "));
      const tiny = new Set();
      for (const el of document.querySelectorAll("main *, footer *")) {
        if (!vis(el) || !el.childNodes.length) continue;
        const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!hasText) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < 11) tiny.add(`${el.tagName.toLowerCase()}.${(el.className || "").toString().split(" ")[0]} ${fs}px`);
      }
      if (tiny.size) out.push("texto < 11px: " + [...tiny].slice(0, 6).join(", "));
    }
    const broken = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src")).map((i) => i.getAttribute("src"));
    if (broken.length) out.push("imágenes rotas: " + broken.slice(0, 4).join(", "));
    const inputs = [...document.querySelectorAll("input:not([type=checkbox]):not([type=radio]), select, textarea")].filter(vis).filter((i) => parseFloat(getComputedStyle(i).fontSize) < 16);
    if (touch && inputs.length) out.push(`inputs < 16px (zoom en iOS): ${inputs.map((i) => i.id || i.name || i.className).join(", ")}`);
    return out;
  }, { touch });
}

async function settle(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  // termina el loader y revela todo para medir el estado final
  await page.evaluate(() => { const l = document.getElementById("loader"); if (l) { l.classList.add("done"); document.documentElement.classList.remove("is-loading"); } document.querySelectorAll(".reveal").forEach((e) => e.classList.add("in")); document.querySelectorAll(".bento").forEach((e) => e.classList.add("in")); });
  await page.waitForTimeout(1200);
}

const browser = await chromium.launch();
for (const [vpName, ctxOpts] of VIEWPORTS) {
  const ctx = await browser.newContext({ ...ctxOpts, locale: "es-BO", reducedMotion: "reduce" });
  const touch = !!ctxOpts.hasTouch;
  for (const [pgName, path] of PAGES) {
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push(e.message));
    page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource.*(fonts|api)/.test(m.text())) errs.push(m.text()); });
    await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    await settle(page);
    for (const m of await inspect(page, vpName, pgName, touch)) note(vpName, pgName, m);
    if (errs.length) note(vpName, pgName, "errores JS: " + errs.slice(0, 3).join(" || "));
    if (OUT) await page.screenshot({ path: `${OUT}/${vpName}-${pgName}.png`, fullPage: true });
    await page.close();
  }

  // Hero: los botones de la primera diapositiva tienen que verse sin desplazar
  {
    const hp = await ctx.newPage();
    await hp.goto(BASE + "/index.html", { waitUntil: "domcontentloaded" });
    await hp.waitForFunction(() => document.querySelector(".hl--bottom.on"), null, { timeout: 10000 }).catch(() => {});
    await hp.waitForTimeout(800);
    const r = await hp.evaluate(() => { const c = document.querySelector('.hl--bottom[data-hl="0"] .ctas'); const b = c && c.getBoundingClientRect(); return b ? { top: b.top, bottom: b.bottom, h: innerHeight } : null; });
    if (!r || r.bottom > r.h || r.top < 0) note(vpName, "hero", "botones del hero fuera de pantalla " + JSON.stringify(r));
    await hp.close();
  }

  // Flujos clave
  const page = await ctx.newPage();
  page.on("pageerror", (e) => note(vpName, "flujo", "error JS: " + e.message));
  await page.goto(BASE + "/tienda.html", { waitUntil: "domcontentloaded" });
  await settle(page);
  // agregar a la bolsa desde la grilla
  try { await page.locator("#grid .add").first().click({ timeout: 4000 }); } catch (e) { note(vpName, "flujo", "no se puede tocar el botón + de la tarjeta: " + (/intercepts[^\n]*/.exec(e.message) || [""])[0]); await page.locator("#grid .add").first().click({ force: true }); }
  await page.waitForTimeout(400);
  const count = await page.locator("[data-cart-count]").first().textContent();
  if (count.trim() !== "1") note(vpName, "flujo", `agregar a la bolsa: contador = ${count}`);
  // abrir bolsa
  await page.locator("[data-open-cart]:visible").first().click();
  await page.waitForTimeout(500);
  if (!(await page.locator(".drawer__panel").isVisible())) note(vpName, "flujo", "la bolsa no abre");
  else {
    for (const m of await inspect(page, vpName, "bolsa", touch)) if (/táctiles|desborde/.test(m)) note(vpName, "bolsa", m);
    if (OUT) await page.screenshot({ path: `${OUT}/${vpName}-flow-bolsa.png` });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    if (await page.locator(".drawer__panel").isVisible()) note(vpName, "flujo", "Escape no cierra la bolsa");
  }
  // menú móvil
  if (await page.locator("#burger").isVisible()) {
    await page.locator("#burger").click();
    await page.waitForTimeout(300);
    if (!(await page.locator("#navpanel").isVisible())) note(vpName, "flujo", "el menú no abre");
    if (OUT) await page.screenshot({ path: `${OUT}/${vpName}-flow-menu.png` });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    if (await page.locator("#navpanel").isVisible()) note(vpName, "flujo", "Escape no cierra el menú");
  }
  // LeonIA
  await page.locator("[data-open-chat]:visible").first().click();
  await page.waitForTimeout(500);
  const chat = page.locator(".chat");
  if (!(await chat.isVisible())) note(vpName, "flujo", "LeonIA no abre");
  else {
    const box = await chat.boundingBox();
    const vw = page.viewportSize();
    if (box.x < 0 || box.y < 0 || box.x + box.width > vw.width + 1 || box.y + box.height > vw.height + 1) note(vpName, "flujo", `LeonIA se sale de pantalla ${JSON.stringify(box)}`);
    const inp = page.locator(".chat__form input");
    if (parseFloat(await inp.evaluate((e) => getComputedStyle(e).fontSize)) < 16 && touch) note(vpName, "flujo", "input del chat < 16px (zoom en iOS)");
    if (OUT) await page.screenshot({ path: `${OUT}/${vpName}-flow-chat.png` });
    await page.keyboard.press("Escape");
  }
  // checkout
  await page.goto(BASE + "/pedido.html", { waitUntil: "domcontentloaded" });
  await settle(page);
  for (const m of await inspect(page, vpName, "pedido-con-bolsa", touch)) note(vpName, "pedido-con-bolsa", m);
  if (OUT) await page.screenshot({ path: `${OUT}/${vpName}-flow-pedido.png`, fullPage: true });
  await page.close();
  await ctx.close();
}
await browser.close();

if (issues.length) { console.log(issues.join("\n")); console.log(`\n${issues.length} problemas`); process.exitCode = 1; }
else console.log("OK: sin problemas en " + VIEWPORTS.length * PAGES.length + " combinaciones");
