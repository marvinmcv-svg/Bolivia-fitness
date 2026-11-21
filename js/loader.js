/* Pantalla de carga del inicio (escritorio y celular).
   El anillo avanza con la carga real: documento listo, tipografías y las imágenes de la primera diapositiva.
   Dura al menos ~1,7 s en la primera visita de la sesión y ~0,6 s en las siguientes; nunca más de 6 s. */
(function () {
  "use strict";
  var loader = document.getElementById("loader");
  if (!loader) return;
  var root = document.documentElement;
  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var first = true;
  try { first = !sessionStorage.getItem("bf_seen_intro"); } catch (e) { /* modo privado */ }
  var MIN = reduced ? 250 : first ? 1700 : 600, MAX = 6000;
  var t0 = performance.now(), shown = 0, finished = false;
  var steps = { dom: 0, fonts: 0, imgs: 0 };
  var bar = document.getElementById("loaderBar"), pct = document.getElementById("loaderPct"), CIRC = 2 * Math.PI * 64;
  if (bar) { bar.style.strokeDasharray = String(CIRC); bar.style.strokeDashoffset = String(CIRC); }
  var progress = function () { return steps.dom * 0.25 + steps.fonts * 0.25 + steps.imgs * 0.5; };

  function finish() {
    if (finished) return; finished = true;
    try { sessionStorage.setItem("bf_seen_intro", "1"); } catch (e) { /* modo privado */ }
    loader.classList.add("done");
    root.classList.remove("is-loading");
    setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 1000);
  }
  function paint() {
    if (finished) return;
    var el = performance.now() - t0;
    var target = Math.min(progress(), Math.min(1, el / MIN));
    shown += (target - shown) * 0.16;
    if (target >= 1 && shown > 0.985) shown = 1;
    if (bar) bar.style.strokeDashoffset = String(CIRC * (1 - shown));
    if (pct) pct.textContent = ("00" + Math.round(shown * 100)).slice(-3) + "%";
    if (shown >= 1 || el > MAX) return finish();
    requestAnimationFrame(paint);
  }
  requestAnimationFrame(paint);
  setTimeout(finish, MAX + 400); // por si requestAnimationFrame no corre (pestaña en segundo plano)

  function onReady() {
    steps.dom = 1;
    // imágenes de la primera diapositiva (las arma home.js); si no hay, cuenta como cargado
    setTimeout(function () {
      var imgs = Array.prototype.slice.call(document.querySelectorAll("#hero .hs:first-child img"));
      if (!imgs.length) { steps.imgs = 1; return; }
      var done = 0, tick = function () { done++; steps.imgs = done / imgs.length; };
      imgs.forEach(function (im) { if (im.complete) tick(); else { im.addEventListener("load", tick, { once: true }); im.addEventListener("error", tick, { once: true }); } });
    }, 0);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onReady); else onReady();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { steps.fonts = 1; }, function () { steps.fonts = 1; });
  else steps.fonts = 1;
})();
