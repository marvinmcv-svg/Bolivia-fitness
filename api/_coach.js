/* LeonIA Coach · conocimiento de entrenamiento, nutrición y uso de suplementos.
   Todo es determinista: el modelo pide un plan o una guía y CITA lo que devuelve esta capa.
   Fuentes de referencia (consenso general, no consejo médico):
   - Posición ISSN sobre proteína (2017): 1,4–2,0 g/kg/día para personas que entrenan; más en déficit.
   - Posición ISSN sobre creatina (2017/2021): 3–5 g/día de monohidrato; carga opcional; segura en adultos sanos.
   - Posición ISSN sobre cafeína (2021): 3–6 mg/kg, 30–60 min antes.
   - Volumen para hipertrofia: ~10–20 series efectivas por músculo y semana, cerca del fallo (1–3 repeticiones en reserva).
   Lo que la marca no publicó (por ejemplo cafeína por servicio del Venom Inferno) NO se inventa: se remite a la etiqueta. */
"use strict";
const B = require("../js/data.js");
const money = B.money;
const norm = (s) => String(s == null ? "" : s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

const SAFETY = "Guía general para adultos sanos, no reemplaza a un médico o nutricionista. Menores de 18, embarazo o lactancia, enfermedad renal, cardíaca o presión alta, o medicación: consultá a un profesional antes de usar suplementos.";

/* ---------- guías por línea de producto ---------- */
const GUIDES = {
  creatina: {
    lineas: ["dp-creatine", "dp-creatine-flavor", "ps-creatine", "ps-creatine-flavor"],
    para_que: "Es el suplemento con más evidencia para ganar fuerza, potencia y masa muscular cuando entrenás con pesas. También ayuda a recuperarte entre series.",
    como_usar: [
      "1 servicio (5 g) por día, todos los días, entrenes o no. Lo importante es la constancia, no el horario.",
      "Mezclala con agua, jugo o tu batido de proteína.",
      "No hace falta fase de carga: con 5 g/día se satura el músculo en ~3–4 semanas. Opcional: 20 g/día repartidos en 4 tomas durante 5–7 días para llegar antes.",
      "Tomá suficiente agua durante el día.",
    ],
    que_esperar: "Es normal subir 0,5–2 kg en las primeras semanas: es agua dentro del músculo, no grasa. La fuerza mejora de a poco en 3–6 semanas.",
    mitos: ["No hace falta ciclarla ni descansar.", "No es un esteroide ni una hormona.", "Sirve igual para mujeres: no 'hincha' la cara ni engorda."],
    duracion: "30 servicios ≈ 1 mes · 60 ≈ 2 meses · 200 ≈ 6–7 meses (1 servicio por día).",
    precauciones: "Si tenés enfermedad renal, consultá a tu médico.",
  },
  proteina: {
    lineas: ["dp-whey-phorm", "dp-iso-phorm"],
    para_que: "Te ayuda a llegar a tu proteína diaria, que es lo que realmente construye y conserva músculo. No es obligatoria: es comida práctica.",
    como_usar: [
      "1 servicio ≈ 25 g de proteína. Usala cuando la comida no te alcance para llegar a tu meta diaria.",
      "Momento práctico: después de entrenar o como colación. El total del día importa más que el minuto exacto.",
      "Repartí la proteína en 3–5 comidas de ~0,3–0,4 g/kg cada una.",
    ],
    whey_vs_iso: "Whey Phorm (concentrada) es la opción más rendidora por precio. Iso Phorm (aislada) tiene menos lactosa y grasa: mejor si la leche te cae pesada o estás en definición. Ninguna es apta para alergia a la proteína de leche.",
    que_esperar: "Por sí sola no te hace crecer: funciona sumada al entrenamiento y a comer suficiente.",
    precauciones: "Contiene leche. Enfermedad renal: consultá antes de subir mucho la proteína.",
  },
  preentreno: {
    lineas: ["dp-venom"],
    para_que: "Energía, foco y ganas de entrenar fuerte. Útil en días pesados o si entrenás cansado después del trabajo.",
    como_usar: [
      "Seguí la dosis de la etiqueta del Venom Inferno. La primera vez empezá con medio servicio para ver cómo lo tolerás.",
      "Tomalo 20–30 minutos antes de entrenar, con agua.",
      "No lo tomes dentro de las 6 horas antes de dormir.",
      "No lo combines con café, energizantes ni otros estimulantes el mismo día.",
    ],
    que_esperar: "Puede dar hormigueo en la piel (normal en muchos pre-entrenos) y más energía en la sesión.",
    precauciones: "Tiene estimulantes. No apto para menores de 18, embarazo o lactancia, presión alta, problemas cardíacos, ansiedad o si sos sensible a la cafeína. La cantidad de cafeína por servicio no está publicada por la tienda: leela en la etiqueta.",
  },
  glutamina: {
    lineas: ["dp-glutamine"],
    para_que: "Aminoácido que se usa sobre todo para apoyar la recuperación y la salud digestiva en épocas de mucho entrenamiento.",
    como_usar: ["1 servicio (5 g) por día, después de entrenar o antes de dormir, con agua o en tu batido."],
    que_esperar: "Siendo honestos: en personas sanas que ya comen suficiente proteína, la evidencia de que aumente la masa muscular es limitada. Si tu presupuesto es corto, priorizá creatina y proteína.",
    precauciones: "Es vegana (fermentada). Enfermedad hepática o renal: consultá antes.",
  },
  ganador: {
    lineas: ["ps-incredibulk"],
    para_que: "Para quienes comen poco o les cuesta subir de peso: suma calorías y 25 g de proteína por servicio de forma fácil.",
    como_usar: [
      "1 servicio entre comidas o después de entrenar, además de tus comidas (no en lugar de ellas).",
      "Si subís más de ~0,5 kg por semana o sentís pesadez, bajá a medio servicio.",
    ],
    que_esperar: "Si te hace pasar tus calorías de mantenimiento, vas a subir de peso; con entrenamiento, buena parte será músculo.",
    precauciones: "No es para definición. Contiene leche. Las calorías exactas por servicio están en la etiqueta.",
  },
  ellas: {
    lineas: ["dp-fema-trope"],
    para_que: "Línea Hardcore Ladies de Dragon Pharma. Según la etiqueta: apoya el crecimiento muscular magro, la recuperación, la salud celular y la absorción de nutrientes.",
    como_usar: ["Tomá las cápsulas según la etiqueta, con comida y agua."],
    que_esperar: "Es un complemento: los resultados vienen del entrenamiento, la proteína y el descanso.",
    precauciones: "Los ingredientes detallados no están publicados por la tienda: revisá la etiqueta. Embarazo, lactancia o medicación: consultá a un profesional.",
  },
};
const LINE_TO_GUIDE = {};
for (const [k, g] of Object.entries(GUIDES)) for (const l of g.lineas) LINE_TO_GUIDE[l] = k;
const TOPIC_ALIASES = {
  creatina: "creatina", creatine: "creatina", crea: "creatina",
  proteina: "proteina", whey: "proteina", iso: "proteina", aislada: "proteina", batido: "proteina",
  preentreno: "preentreno", pre: "preentreno", venom: "preentreno", cafeina: "preentreno",
  glutamina: "glutamina", glutamine: "glutamina",
  ganador: "ganador", gainer: "ganador", incredibulk: "ganador", masa: "ganador",
  fema: "ellas", "fema trope": "ellas", mujer: "ellas",
};

/* ---------- objetivos ---------- */
const GOALS = {
  musculo: {
    nombre: "Ganar músculo (hipertrofia)",
    principios: [
      "10–20 series efectivas por grupo muscular por semana, repartidas en 2 sesiones o más.",
      "Rangos de 6–15 repeticiones, terminando cada serie a 1–3 repeticiones del fallo.",
      "Sobrecarga progresiva: cada semana intentá sumar 1 repetición o un poco de peso con buena técnica.",
      "Descansá 1,5–3 min en los básicos y 1–2 min en aislamiento.",
    ],
    energia: "Leve superávit: ~200–300 kcal sobre tu mantenimiento. Meta: subir ~0,25–0,5 kg por semana.",
    proteina_gkg: [1.6, 2.2],
    stack: [["dp-creatine-60", "Base: más fuerza y más volumen de entrenamiento."], ["dp-whey-phorm", "Para llegar a tu proteína diaria."], ["dp-glutamine", "Opcional, si entrenás muy seguido."]],
  },
  fuerza: {
    nombre: "Ganar fuerza",
    principios: [
      "Priorizá básicos: sentadilla, peso muerto, press de banca, press militar y remo.",
      "Series pesadas de 3–6 repeticiones con 2–4 min de descanso, más trabajo accesorio de 8–12.",
      "Técnica primero; registrá tus pesos y subí de a poco (2,5 kg en tren superior, 5 kg en inferior).",
    ],
    energia: "Comé al menos en mantenimiento; un leve superávit ayuda a progresar más rápido.",
    proteina_gkg: [1.6, 2.0],
    stack: [["dp-creatine-200", "El suplemento con más evidencia para fuerza; te dura meses."], ["dp-venom-inferno", "Energía y foco para los días pesados."]],
  },
  definicion: {
    nombre: "Bajar grasa y marcar (definición)",
    principios: [
      "Seguí entrenando pesado con pesas para conservar el músculo; no pases a solo cardio.",
      "Sumá pasos (8.000–10.000 por día) y 2–3 sesiones de cardio moderado de 20–30 min.",
      "Bajá de forma sostenible: ~0,5–1% de tu peso por semana.",
    ],
    energia: "Déficit moderado: ~300–500 kcal bajo tu mantenimiento. Nada de dietas extremas.",
    proteina_gkg: [1.8, 2.4],
    stack: [["dp-iso-phorm", "Proteína aislada: mucha proteína con pocas calorías."], ["dp-creatine-60", "Te ayuda a conservar fuerza y músculo en déficit."], ["dp-venom-inferno", "Opcional, para la energía cuando comés menos."]],
  },
  subir_peso: {
    nombre: "Subir de peso (me cuesta engordar)",
    principios: [
      "Entrená con pesas 3–4 días con ejercicios básicos y sobrecarga progresiva.",
      "Comé 4–5 veces por día; sumá calorías líquidas si te llenás rápido.",
      "Pesate 1 vez por semana: si no subís en 2 semanas, sumá ~200 kcal por día.",
    ],
    energia: "Superávit de ~300–500 kcal. Meta: ~0,5 kg por semana.",
    proteina_gkg: [1.6, 2.0],
    stack: [["ps-incredibulk", "Calorías y 25 g de proteína fáciles de tomar."], ["dp-creatine-60", "Más fuerza y más peso de entrenamiento."]],
  },
  principiante: {
    nombre: "Empezar en el gimnasio",
    principios: [
      "Cuerpo completo 3 días por semana, en días no consecutivos.",
      "2–3 series por ejercicio de 8–12 repeticiones; aprendé la técnica con peso moderado.",
      "Las primeras semanas el progreso es rápido: subí el peso cuando completes todas las repeticiones.",
      "Dormí 7–9 horas: ahí se construye el músculo.",
    ],
    energia: "Comé en mantenimiento con buena proteína; ajustá después según tu objetivo.",
    proteina_gkg: [1.4, 1.8],
    stack: [["dp-creatine-30", "Para empezar: el suplemento más simple y comprobado."], ["dp-whey-phorm", "Solo si te cuesta llegar a la proteína con comida."]],
  },
  tonificar: {
    nombre: "Tonificar y glúteos (enfoque femenino)",
    principios: [
      "Pesas 3–4 días: hip thrust, sentadilla, peso muerto rumano, zancadas y abducciones, más tren superior.",
      "8–15 repeticiones cerca del fallo; 'tonificar' es ganar músculo y bajar un poco de grasa.",
      "No le temas a los pesos: las mujeres no se 'ponen grandes' por entrenar pesado.",
    ],
    energia: "Mantenimiento o leve déficit según cuánta grasa quieras bajar.",
    proteina_gkg: [1.6, 2.0],
    stack: [["dp-iso-phorm", "Proteína aislada, liviana y rica."], ["dp-creatine-lemon", "Creatina con sabor Lemon Lime: fácil de tomar todos los días."], ["dp-fema-trope", "Línea Hardcore Ladies de Dragon Pharma."]],
  },
  energia: {
    nombre: "Más energía y rendimiento (deportes, crossfit, fútbol)",
    principios: [
      "Combiná fuerza 2–3 días con tu deporte o tus sesiones de acondicionamiento.",
      "Recuperación: dormí bien, hidratate y comé carbohidratos alrededor de las sesiones intensas.",
    ],
    energia: "Comé en mantenimiento; no entrenes intenso en ayunas largas.",
    proteina_gkg: [1.4, 1.8],
    stack: [["dp-venom-inferno", "Energía y foco antes de entrenar."], ["dp-creatine-60", "Mejora los esfuerzos cortos e intensos y la recuperación entre ellos."], ["dp-glutamine", "Opcional, en semanas de mucho volumen."]],
  },
};
const GOAL_ALIASES = [
  [/musc|masa muscular|hipertrof|volumen|crecer|grande/, "musculo"],
  [/fuerza|strength|powerlift|pesad/, "fuerza"],
  [/defin|grasa|bajar|adelgaz|marcar|cut|perder peso|abdomen/, "definicion"],
  [/subir de peso|engordar|flaco|delgad|ganar peso|hardgainer/, "subir_peso"],
  [/empiez|empez|arranc|princip|nuevo|novat|comienz|comenz/, "principiante"],
  [/tonif|glute|gluteo|cola|piern|mujer/, "tonificar"],
  [/energ|rendim|deport|crossfit|futbol|resist|cardio|correr/, "energia"],
];
function goalKey(g) {
  const t = norm(g);
  if (GOALS[t]) return t;
  for (const [re, k] of GOAL_ALIASES) if (re.test(t)) return k;
  return null;
}

/* ---------- rutinas por días ---------- */
const DAY = {
  full_a: ["Cuerpo completo A", ["Sentadilla 3×6–10", "Press de banca 3×6–10", "Remo con barra o mancuerna 3×8–12", "Peso muerto rumano 2×8–12", "Elevaciones laterales 2×12–15", "Plancha 3×30–45 s"]],
  full_b: ["Cuerpo completo B", ["Peso muerto 3×5–8", "Press militar 3×6–10", "Jalón al pecho o dominadas 3×8–12", "Zancadas 2×10 por pierna", "Curl de bíceps 2×10–12", "Extensión de tríceps 2×10–12"]],
  full_c: ["Cuerpo completo C", ["Prensa o sentadilla goblet 3×10–12", "Press inclinado con mancuernas 3×8–12", "Remo en polea 3×10–12", "Hip thrust 3×8–12", "Face pull 2×12–15", "Abdominales 3×12–15"]],
  upper_a: ["Tren superior A (fuerza)", ["Press de banca 4×5–8", "Remo con barra 4×6–10", "Press militar 3×6–10", "Dominadas o jalón 3×8–12", "Curl + tríceps 2×10–12"]],
  lower_a: ["Tren inferior A (fuerza)", ["Sentadilla 4×5–8", "Peso muerto rumano 3×6–10", "Prensa 3×10–12", "Curl femoral 3×10–12", "Pantorrillas 3×12–15"]],
  upper_b: ["Tren superior B (volumen)", ["Press inclinado con mancuernas 3×8–12", "Remo en polea 3×10–12", "Elevaciones laterales 3×12–15", "Fondos o press cerrado 3×8–12", "Curl martillo 3×10–12"]],
  lower_b: ["Tren inferior B (volumen)", ["Peso muerto 3×4–6", "Sentadilla búlgara 3×8–10 por pierna", "Hip thrust 3×8–12", "Extensión de cuádriceps 3×12–15", "Abdominales 3×12–15"]],
  push: ["Empuje (pecho, hombros, tríceps)", ["Press de banca 4×6–10", "Press militar 3×6–10", "Press inclinado con mancuernas 3×8–12", "Elevaciones laterales 3×12–15", "Extensión de tríceps 3×10–12"]],
  pull: ["Tirón (espalda, bíceps)", ["Peso muerto o rack pull 3×5–8", "Dominadas o jalón 4×6–10", "Remo con barra 3×8–10", "Face pull 3×12–15", "Curl de bíceps 3×10–12"]],
  legs: ["Piernas y glúteos", ["Sentadilla 4×6–10", "Peso muerto rumano 3×8–10", "Prensa 3×10–12", "Curl femoral 3×10–12", "Pantorrillas 4×12–15"]],
  glute: ["Glúteos y piernas", ["Hip thrust 4×8–12", "Sentadilla 3×8–10", "Peso muerto rumano 3×8–10", "Zancadas 3×10 por pierna", "Abducción en máquina 3×15–20"]],
  cond: ["Acondicionamiento", ["Circuito 20–30 min: remo o bici, kettlebell swings, burpees, sentadillas con salto (intervalos 40 s / 20 s)"]],
};
function split(days, goal) {
  const d = Math.min(6, Math.max(2, Math.round(days || 3)));
  if (goal === "principiante") return d <= 2 ? ["full_a", "full_b"] : ["full_a", "full_b", "full_c"];
  if (goal === "tonificar") return { 2: ["full_a", "glute"], 3: ["glute", "upper_a", "full_c"], 4: ["glute", "upper_a", "lower_a", "upper_b"], 5: ["glute", "upper_a", "lower_b", "upper_b", "glute"], 6: ["glute", "push", "pull", "lower_b", "upper_b", "glute"] }[d];
  if (goal === "energia") return { 2: ["full_a", "full_b"], 3: ["full_a", "cond", "full_b"], 4: ["upper_a", "lower_a", "cond", "full_c"], 5: ["upper_a", "lower_a", "cond", "upper_b", "lower_b"], 6: ["upper_a", "lower_a", "cond", "upper_b", "lower_b", "cond"] }[d];
  return { 2: ["full_a", "full_b"], 3: ["full_a", "full_b", "full_c"], 4: ["upper_a", "lower_a", "upper_b", "lower_b"], 5: ["upper_a", "lower_a", "push", "pull", "legs"], 6: ["push", "pull", "legs", "push", "pull", "legs"] }[d];
}

/* ---------- cálculo del stack con precios reales ---------- */
function stackFor(goalK, cat, budget) {
  const items = GOALS[goalK].stack.map(([id, por_que], i) => {
    const p = cat[id];
    return p && { id, nombre: p.short, por_que, precio: p.price, precio_texto: money(p.price), antes: p.before, por_servicio: p.perServing,
      costo_mensual: p.servings ? Math.round((p.price / p.servings) * 30) : null, prioridad: i + 1 };
  }).filter(Boolean);
  if (!budget) return { items, total_compra: items.reduce((a, x) => a + x.precio, 0) };
  // presupuesto: búsqueda exhaustiva (≤3 productos × pocas opciones). Cada producto puede reemplazarse por una
  // presentación más chica de su línea o por otro más barato de su categoría, o quedar afuera.
  // Gana la combinación con más productos esenciales, después más productos, después mejor aprovechamiento.
  const asItem = (it, x) => Object.assign({}, it, { id: x.id, nombre: x.short, precio: x.price, precio_texto: money(x.price), antes: x.before, por_servicio: x.perServing, costo_mensual: x.servings ? Math.round((x.price / x.servings) * 30) : null, cambio: x.id !== it.id ? "Opción más económica para tu presupuesto" : undefined });
  const choices = items.map((it) => {
    const p = cat[it.id];
    const opts = [p].concat(Object.values(cat).filter((x) => x.id !== p.id && x.price < p.price && (x.line === p.line || x.cat === p.cat)));
    return opts.map((x) => asItem(it, x)).concat([null]);
  });
  let best = null;
  (function walk(i, picked, total) {
    if (total > budget) return;
    if (i === choices.length) {
      const ids = picked.filter(Boolean);
      if (new Set(ids.map((x) => x.id)).size !== ids.length) return;
      const ess = ids.filter((x) => !/^Opcional/.test(x.por_que)).length;
      const servings = ids.reduce((a, x) => a + ((cat[x.id] && cat[x.id].servings) || 0), 0);
      const score = [ess, ids.length, total, servings];
      const better = !best || score.some((v, k) => v !== best.score[k] && score.slice(0, k).every((w, j) => w === best.score[j]) && v > best.score[k]);
      if (better) best = { score, ids, total };
      return;
    }
    for (const c of choices[i]) walk(i + 1, picked.concat([c]), total + (c ? c.precio : 0));
  })(0, [], 0);
  const chosen = best ? best.ids : [], total = best ? best.total : 0;
  return { items: chosen, total_compra: total, presupuesto: budget, fuera_de_presupuesto: items.filter((x) => !chosen.some((c) => c.prioridad === x.prioridad)).map((x) => x.nombre) };
}

/* ---------- herramientas ---------- */
function coach_plan(ctx, args) {
  const g = goalKey(args.goal || "");
  if (!g) return { error: "Objetivo no reconocido.", objetivos: Object.entries(GOALS).map(([k, v]) => ({ id: k, nombre: v.nombre })) };
  const G = GOALS[g], cat = ctx.cat();
  const days = Math.min(6, Math.max(2, Math.round(+args.days_per_week || (g === "principiante" ? 3 : 4))));
  const kg = +args.weight_kg > 30 && +args.weight_kg < 250 ? +args.weight_kg : null;
  const level = ["principiante", "intermedio", "avanzado"].includes(args.level) ? args.level : (g === "principiante" ? "principiante" : null);
  const budget = +args.budget_bs > 0 ? Math.round(+args.budget_bs) : null;
  const keys = split(days, g);
  // guarda el perfil para personalizar el resto de la charla
  ctx.state.profile = Object.assign({}, ctx.state.profile, { goal: g, days, level, weight_kg: kg });
  const proteina = kg ? { gramos_por_dia: Math.round(kg * G.proteina_gkg[0]) + "–" + Math.round(kg * G.proteina_gkg[1]) + " g", referencia: G.proteina_gkg.join("–") + " g por kg de peso" } : { referencia: G.proteina_gkg.join("–") + " g por kg de peso por día (decime tu peso y te lo calculo)" };
  return {
    objetivo: G.nombre, dias_por_semana: days, nivel: level,
    principios: G.principios,
    rutina: keys.map((k, i) => ({ dia: i + 1, sesion: DAY[k][0], ejercicios: DAY[k][1] })),
    nutricion: {
      energia: G.energia,
      proteina,
      calorias_aprox: kg ? "Mantenimiento estimado ≈ " + Math.round(kg * 30) + "–" + Math.round(kg * 34) + " kcal/día (punto de partida; ajustá según cómo cambie tu peso en 2–3 semanas)." : null,
      basicos: ["Agua: ~35 ml por kg de peso por día, más si sudás mucho.", "Dormí 7–9 horas.", "Base de comida real: carnes, huevos, lácteos, legumbres, arroz, papa, frutas y verduras."],
    },
    stack_sugerido: Object.assign(stackFor(g, cat, budget), { aclaracion: "total_compra = lo que se paga hoy (una vez). costo_mensual = cuánto sale cada producto por mes de uso (1 servicio por día); no es un pago mensual." }),
    progresion: "Revisá cada 4 semanas: si no progresás en pesos o medidas, ajustá calorías o volumen. Cada 6–8 semanas, hacé una semana más liviana.",
    seguridad: SAFETY,
    nota_para_leonia: "Mostrá un resumen corto (días y sesiones, proteína, 2–3 productos con por qué) y ofrecé: 'Agregar el stack a la bolsa', 'Ver la rutina completa', 'Cómo tomar cada uno'. No pegues todo junto.",
  };
}

function supplement_guide(ctx, args) {
  const q = norm(args.topic || args.item || "");
  let key = null, prod = null;
  const cat = ctx.cat();
  prod = cat[args.item] || Object.values(cat).find((p) => q && (norm(p.short).includes(q) || norm(p.name).includes(q)));
  if (prod) key = LINE_TO_GUIDE[prod.line];
  if (!key) for (const [a, k] of Object.entries(TOPIC_ALIASES)) if (q.includes(a)) { key = k; break; }
  if (!key) return { error: "Sin guía para eso.", temas: Object.keys(GUIDES) };
  const G = GUIDES[key];
  return Object.assign({ tema: key }, G, {
    productos: Object.values(cat).filter((p) => G.lineas.includes(p.line)).map((p) => ({ id: p.id, nombre: p.short, tamano: p.size, precio: money(p.price), por_servicio: p.perServing ? money(p.perServing) : null })),
    seguridad: SAFETY,
  });
}

function protein_calc(ctx, args) {
  const kg = +args.weight_kg;
  if (!(kg > 30 && kg < 250)) return { error: "Necesito el peso en kg (entre 30 y 250)." };
  const g = goalKey(args.goal || "") || "musculo", r = GOALS[g].proteina_gkg;
  const lo = Math.round(kg * r[0]), hi = Math.round(kg * r[1]);
  ctx.state.profile = Object.assign({}, ctx.state.profile, { weight_kg: kg, goal: ctx.state.profile && ctx.state.profile.goal || g });
  return {
    objetivo: GOALS[g].nombre, proteina_dia: lo + "–" + hi + " g", por_comida: Math.round(kg * 0.3) + "–" + Math.round(kg * 0.4) + " g en 3–5 comidas",
    ejemplos_25g: ["1 servicio de Whey o Iso Phorm", "100 g de pechuga de pollo", "4 huevos", "120 g de atún", "250 g de yogur griego"],
    creatina: "5 g por día (1 servicio), sin importar el peso.",
    agua: "≈ " + (Math.round(kg * 0.035 * 10) / 10) + " litros por día como base.",
  };
}

function get_services(ctx) {
  return {
    quienes_somos: "Bolivia Fitness, representantes oficiales en Bolivia de Dragon Pharma y ProSupps. Productos originales con registro SENASAG y sello de autenticidad.",
    sucursales: B.branches.map((b) => b.name + (b.note ? " (" + b.note + ")" : "")).join(", "),
    servicios: [
      { nombre: "Envío gratis a domicilio", detalle: "En las ciudades con sucursal. Podés mandar tu ubicación exacta (Envío con Pin)." },
      { nombre: "Envíos a nivel nacional", detalle: "A cualquier ciudad de Bolivia, aunque no tenga sucursal." },
      { nombre: "Retiro en sucursal", detalle: "Elegís la sucursal y pasás a buscar tu pedido." },
      { nombre: "Pedido por WhatsApp", detalle: "Armás la bolsa en la web o con LeonIA y se envía el pedido completo por WhatsApp (" + B.config.callCenterLabel + "). La tienda confirma stock, pago y envío." },
      { nombre: "LeonIA Coach", detalle: "Asesoría gratis de entrenamiento, nutrición básica y uso de suplementos, por texto o por voz, las 24 horas." },
      { nombre: "Productos originales", detalle: "Registro SENASAG y sello de autenticidad en cada producto." },
    ],
    campana: B.campaignActive(ctx.now) ? B.campaign.name + ": hasta " + B.campaign.upTo + "% OFF hasta el " + B.campaign.to + ", y " + B.campaign.gift + " (" + B.campaign.gifts.join(", ") + ")." : null,
    pago: "Los medios de pago se confirman por WhatsApp con la sucursal.",
    redes: { instagram: "@boliviafitness", tiktok: "@boliviafitness", facebook: "Boliviafitnessbol" },
    eventos: "Presentes en Expocruz 2026, FEIPOBOL Potosí y auspiciadores del Bolivia Super Show 2026.",
  };
}

const str = (d) => ({ type: "string", description: d });
const S = (props, req) => ({ type: "object", properties: props, required: req || [], additionalProperties: false });
const COACH_SCHEMAS = [
  ["coach_plan", "LeonIA Coach: plan personalizado (rutina semanal por días, principios, proteína y calorías orientativas, y stack de suplementos con precios reales y costo mensual). Usalo cuando el cliente cuente su objetivo.",
    S({ goal: { type: "string", enum: Object.keys(GOALS), description: "musculo | fuerza | definicion | subir_peso | principiante | tonificar | energia" }, days_per_week: { type: "integer", minimum: 2, maximum: 6 }, level: { type: "string", enum: ["principiante", "intermedio", "avanzado"] }, weight_kg: { type: "number", description: "Peso en kg si lo dijo" }, budget_bs: { type: "number", description: "Presupuesto en Bs si lo dijo" } }, ["goal"])],
  ["supplement_guide", "Cómo usar un suplemento: para qué sirve, cómo y cuándo tomarlo, qué esperar, mitos, duración del envase y precauciones. Temas: creatina, proteina, preentreno, glutamina, ganador, ellas, o un producto.",
    S({ topic: str("Tema o nombre del producto"), item: str("id del producto (opcional)") })],
  ["protein_calc", "Calcula la proteína diaria, por comida y agua según el peso y el objetivo.", S({ weight_kg: { type: "number" }, goal: str("Objetivo (opcional)") }, ["weight_kg"])],
  ["get_services", "Servicios de la tienda: envíos, retiro, pedido por WhatsApp, coach, autenticidad, campaña, pago y redes.", S({})],
];
const COACH_TOOLS = { coach_plan, supplement_guide, protein_calc, get_services };

module.exports = { COACH_SCHEMAS, COACH_TOOLS, GOALS, GUIDES, SAFETY, goalKey };
