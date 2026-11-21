"use strict";
process.env.NODE_ENV = "test";
const test = require("node:test");
const assert = require("node:assert/strict");
const { runTool, createSession, openaiTools, B } = require("../api/_tools");
const { _internals } = require("../api/leonia");

const NOW = new Date("2026-11-21T19:00:00Z");
const AFTER = new Date("2026-12-05T19:00:00Z");
const S = (state, now) => createSession(state || {}, now || NOW);
const call = (ctx, n, a) => runTool(ctx, n, a || {});

test("las herramientas de coach están registradas para el modelo", () => {
  const names = openaiTools().map((t) => t.function.name);
  for (const n of ["coach_plan", "supplement_guide", "protein_calc", "get_services"]) assert.ok(names.includes(n), n);
});

test("coach_plan: rutina según días, proteína por peso y perfil guardado", () => {
  const ctx = S();
  const r = call(ctx, "coach_plan", { goal: "musculo", days_per_week: 4, weight_kg: 75, level: "intermedio" });
  assert.equal(r.rutina.length, 4);
  assert.equal(r.nutricion.proteina.gramos_por_dia, "120–165 g");
  assert.deepEqual(ctx.state.profile, { goal: "musculo", days: 4, level: "intermedio", weight_kg: 75 });
  // el perfil sobrevive el ida y vuelta por el navegador
  assert.deepEqual(S(JSON.parse(JSON.stringify(ctx.state))).state.profile, ctx.state.profile);
  for (const d of [2, 3, 5, 6]) assert.equal(call(S(), "coach_plan", { goal: "fuerza", days_per_week: d }).rutina.length, d);
});

test("coach_plan: el stack usa precios reales y respeta el presupuesto", () => {
  const cat = B.catalog(NOW);
  const r = call(S(), "coach_plan", { goal: "musculo" });
  for (const it of r.stack_sugerido.items) assert.equal(it.precio, cat[it.id].price);
  const tight = call(S(), "coach_plan", { goal: "musculo", budget_bs: 900 }).stack_sugerido;
  assert.ok(tight.total_compra <= 900);
  // con Bs 900 entran los dos esenciales (creatina + proteína), con presentaciones más económicas
  assert.ok(tight.items.some((i) => cat[i.id].cat === "creatinas"));
  assert.ok(tight.items.some((i) => cat[i.id].cat === "proteinas"));
  assert.ok(!tight.items.some((i) => /^Opcional/.test(i.por_que)));
  assert.equal(call(S(), "coach_plan", { goal: "musculo", budget_bs: 100 }).stack_sugerido.items.length, 0);
});

test("coach_plan: después de la campaña cotiza el precio regular", () => {
  const r = call(S({}, AFTER), "coach_plan", { goal: "fuerza" });
  const c = r.stack_sugerido.items.find((i) => i.id === "dp-creatine-200");
  assert.equal(c.precio, 800);
});

test("coach_plan: objetivo en lenguaje natural o desconocido", () => {
  assert.match(call(S(), "coach_plan", { goal: "bajar la panza" }).objetivo, /grasa/);
  assert.ok(call(S(), "coach_plan", { goal: "astronauta" }).error);
  const { goalKey } = require("../api/_coach");
  assert.equal(goalKey("quiero bajar la panza"), "definicion");
  assert.equal(goalKey("me cuesta engordar"), "subir_peso");
  assert.equal(goalKey("empiezo el gym"), "principiante");
});

test("supplement_guide: creatina sin carga obligatoria, pre-entreno con advertencias", () => {
  const c = call(S(), "supplement_guide", { topic: "¿cómo tomo la creatina?" });
  assert.equal(c.tema, "creatina");
  assert.ok(c.como_usar.some((l) => /5 g/.test(l)));
  assert.ok(c.productos.length >= 5);
  const v = call(S(), "supplement_guide", { item: "dp-venom-inferno" });
  assert.equal(v.tema, "preentreno");
  assert.match(v.precauciones, /menores de 18/);
  assert.match(call(S(), "supplement_guide", { topic: "glutamina" }).que_esperar, /limitada/);
});

test("protein_calc y get_services", () => {
  const p = call(S(), "protein_calc", { weight_kg: 80, goal: "definicion" });
  assert.equal(p.proteina_dia, "144–192 g");
  assert.match(call(S(), "protein_calc", { weight_kg: 5 }).error, /peso/);
  const s = call(S(), "get_services", {});
  assert.ok(s.servicios.some((x) => /nacional/i.test(x.nombre)));
  assert.match(s.sucursales, /Cochabamba \(2 sucursales\)/);
});

test("Nemotron: los bloques <think> nunca llegan al cliente", () => {
  let out = "";
  const w = _internals.thinkFilter((t) => { out += t; });
  ["Hola <thi", "nk>razono</th", "ink> mundo"].forEach(w);
  assert.equal(out, "Hola  mundo");
});
