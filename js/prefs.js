/* Bolivia Fitness · preferencias de tema e idioma.
   Va en el <head> (sin defer) para aplicar el tema y el idioma antes de pintar y evitar parpadeos.
   Por defecto: modo oscuro (el diseño original de la marca) y español. */
(function () {
  "use strict";
  var d = document.documentElement, theme = null, lang = null;
  try { theme = localStorage.getItem("bf_theme"); lang = localStorage.getItem("bf_lang"); } catch (e) { /* modo privado */ }
  d.setAttribute("data-theme", theme === "light" ? "light" : "dark");
  if (theme === "light") {
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", "#f6f2ee");
  }
  if (lang === "en") d.setAttribute("lang", "en");
})();
