/* LeonIA · frases propias, en voz de Bolivia Fitness (voseo boliviano, 🦁🔥💪).
   Rotan sin repetirse en una sesión. Nada de sarcasmo con el pedido, culpa por calorías,
   presión de venta ni urgencia falsa. */
"use strict";
const LINES = {
  greeting: [
    "¡Hola! Soy LeonIA 🦁 ¿Qué entrenás hoy y en qué te ayudo?",
    "¡Bienvenido a la manada! 🦁 ¿Creatina, proteína o pre-entreno?",
    "¡Hola, campeón! Contame tu objetivo y armamos tu pedido 💪",
  ],
  order_confirmed: [
    "¡Pedido listo! Tocá el botón verde y lo mandás por WhatsApp 🦁",
    "¡Eso es todo, crack! Solo falta enviarlo por WhatsApp 💪",
  ],
  big_order: ["¡Pedido de manada completa! 🦁 Lo dejamos impecable."],
  late_night: ["Entrenás hasta tarde, ¿eh? 🌙 Igual te dejo el pedido listo para que lo confirmen."],
  rain: ["Llueva o no, el entrenamiento no se negocia 💪"],
  voice_listening: ["Te escucho 🎙️", "Dale, decime qué necesitás"],
};
const EGGS = [
  { re: /\b(sos|eres) (un )?(robot|bot|ia|humano)\b/i, a: ["Soy una IA con corazón de león 🦁 Pero los suplementos son 100% reales. ¿Qué buscás?"] },
  { re: /\b(chiste|broma)\b/i, a: ["¿Por qué la creatina nunca discute? Porque siempre está hidratada 😂 ¿Te muestro las creatinas?"] },
  { re: /\b(favorit[oa]|recomend[aá]s?)\b.*\b(tuy[oa]|vos)\b/i, a: ["Si fuera león de gimnasio, iría por una creatina de 200 servicios: dura meses 🦁 ¿La vemos?"] },
  { re: /\b(canta|cantame)\b/i, a: ["🎶 Una serie más, una serie más… 🎶 Mejor te canto los precios Black Friday 😄"] },
  { re: /\b(estoy triste|me siento mal|desmotivad)/i, a: ["Ánimo 💛 Un paso a la vez también es avanzar. Si querés, te ayudo con lo que necesites para volver al gym."] },
];
function egg(text) { const e = EGGS.find((x) => x.re.test(text || "")); return e ? e.a[0] : null; }
module.exports = { LINES, egg };
