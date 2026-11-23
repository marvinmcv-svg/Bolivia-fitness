/* Sucursales: estado en vivo (hora de La Paz), horarios publicados, mapa y WhatsApp */
(function () {
  "use strict";
  const X = window.BFX, B = X.B, $ = X.$, esc = X.esc;
  function render() {
    const known = B.branches.filter((b) => b.open), open = known.filter((b) => ["open", "soon"].includes(X.branchStatus(b).k)).length;
    $("#brNow").innerHTML = "Son las " + X.nowLP().label + " en Bolivia · " + open + " de " + known.length + " sucursales con horario publicado están abiertas ahora.";
    $("#bgrid").innerHTML = B.branches.map((b) => {
      const st = X.branchStatus(b);
      const maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Bolivia Fitness " + (b.address ? b.address + " " : "") + b.city + " Bolivia");
      return '<article class="bcard reveal"><span class="st st-' + st.k + '">' + (st.k === "open" ? '<span class="dot dot--live"></span>' : "") + esc(st.label) + "</span><h3>Bolivia Fitness " + esc(b.name) + "</h3>" +
        (b.note ? "<p>" + esc(b.note) + "</p>" : "") + (b.open ? "<p>Todos los días · " + b.open + "–" + b.close + "</p>" : "") + (b.stores ? '<ul class="bstores">' + b.stores.map((t) => '<li><img src="' + esc(t.img) + '" width="900" height="1600" alt="Tienda Bolivia Fitness ' + esc(t.name) + '" loading="lazy"><span><b>' + esc(t.name) + "</b>" + esc(t.addr) + "</span></li>").join("") + "</ul>" : b.address ? "<p>" + esc(b.address) + "</p>" : "") +
        '<div class="bcard__links"><a class="link" href="' + maps + '" target="_blank" rel="noopener">Cómo llegar ↗</a><a class="link" href="' + B.waLink(b.whatsapp, "¡Hola Bolivia Fitness " + b.name + "! 🦁") + '" target="_blank" rel="noopener">WhatsApp →</a><a class="link" href="pedido.html">Pedir para retirar →</a></div></article>';
    }).join("");
    X.reveal();
  }
  render(); setInterval(render, 60000);
})();
