/* Inicio: categorías, Black Friday, la diferencia (bento 3D), destacados, stacks, comunidad */
(function () {
  "use strict";
  const X = window.BFX, B = X.B, $ = X.$, esc = X.esc, money = X.money, P = X.P;
  const CAT = X.cat();

  // Categorías
  const IMG = { creatinas: "dp-creatine-200", proteinas: "dp-whey-phorm", preentrenos: "dp-venom-inferno", recuperacion: "dp-glutamine", ellas: "dp-fema-trope", ganadores: "ps-incredibulk" };
  $("#cats").innerHTML = B.categories.filter((c) => Object.values(CAT).some((p) => p.cat === c.id)).map((c) => {
    const n = Object.values(CAT).filter((p) => p.cat === c.id).length, from = Math.min(...Object.values(CAT).filter((p) => p.cat === c.id).map((p) => p.price));
    return '<a class="cat" href="' + X.url.shop("cat=" + c.id) + '"><img src="' + esc(P(IMG[c.id]).img) + '" width="720" height="720" alt="" loading="lazy"><span><span>' + esc(c.name) + "<small>" + n + (n === 1 ? " producto" : " productos") + " · desde " + money(from) + '</small></span><span class="arrow">→</span></span></a>';
  }).join("");

  // Black Friday
  if (B.campaignActive()) {
    $("#blackfriday").hidden = false;
    $("#bfRail").innerHTML = Object.values(CAT).filter((p) => p.before).sort((a, b) => b.off - a.off).map(X.productCard).join("");
    X.countdown($("#countdown"));
  }

  // La diferencia (bento 3D)
  const I = X.ICON, bf = B.campaignActive();
  const cards = [
    ["a", "nosotros.html", "", '<div class="feat__big">100<b>%</b></div><h3>Originales, siempre.</h3><p>Representantes oficiales de Dragon Pharma y ProSupps, con registro SENASAG y sello de autenticidad.</p><img class="feat__img" src="' + P("dp-whey-phorm").img + '" width="720" height="720" alt="" loading="lazy">'],
    ["b", "pedido.html", I.truck, "<h3>Envío gratis a domicilio.</h3><p>Y envíos a nivel nacional, a cualquier ciudad de Bolivia.</p>"],
    ["c", bf ? "ofertas.html" : "tienda.html", I.gift, bf ? '<h3>1 accesorio gratis.</h3><p>Shaker, mochila o gorra por cualquier compra.</p><img class="feat__img" src="assets/img/bf-accesorios.webp" width="900" height="1125" alt="" loading="lazy">' : "<h3>Promos todo el año.</h3><p>Seguí la tienda para no perderte ninguna.</p>"],
    ["d", "sucursales.html", I.store, "<h3>7 ciudades.</h3><p>Retirá en tu sucursal o mirá todo el stock en persona.</p>"],
    ["e", "pedido.html", I.chat, "<h3>Pedido en minutos.</h3><p>Armamos tu mensaje de WhatsApp con todo el detalle.</p>"],
    ["f", "#", I.spark, "<h3>Elegí con LeonIA.</h3><p>Tu asistente de compras, por texto o por voz.</p>"],
  ];
  $("#bento").innerHTML = cards.map(([k, h, ic, html]) => '<a class="feat feat--' + k + '" data-tilt href="' + h + '"' + (k === "f" ? " data-open-chat" : "") + ">" + (ic ? '<span class="feat__ic">' + ic + "</span>" : "") + html + "</a>").join("");
  X.tilt($("#bento"));

  // Destacados: estrellas + mayores descuentos
  const top = Object.values(CAT).sort((a, b) => (b.star - a.star) || (b.off - a.off)).slice(0, 8);
  $("#topGrid").innerHTML = top.map(X.productCard).join("");

  // Stacks (precio = suma exacta de los productos, sin descuentos inventados)
  const STACKS = [
    ["Fuerza", "Para entrenar pesado todos los días.", ["dp-creatine-200", "dp-venom-inferno"]],
    ["Volumen", "Proteína, creatina y recuperación.", ["dp-whey-phorm", "dp-creatine-60", "dp-glutamine"]],
    ["Para ellas", "La línea Hardcore Ladies, con proteína aislada y creatina con sabor.", ["dp-fema-trope", "dp-iso-phorm", "dp-creatine-lemon"]],
  ];
  $("#stacks").innerHTML = STACKS.map(([t, d, ids], i) => {
    const ps = ids.map(P), tot = ps.reduce((a, p) => a + p.price, 0), save = ps.reduce((a, p) => a + (p.save || 0), 0);
    return '<article class="stack reveal"><div class="stack__imgs">' + ps.map((p) => '<img src="' + esc(p.img) + '" width="92" height="92" alt="" loading="lazy">').join("") + "</div><h3>" + esc(t) + '</h3><p class="muted" style="margin:0">' + esc(d) + "</p><ul>" + ps.map((p) => '<li><a href="' + X.url.product(p.id) + '" style="text-decoration:none">' + esc(p.short) + "</a><span>" + money(p.price) + "</span></li>").join("") + "</ul>" +
      '<div class="stack__tot"><div><b>' + money(tot) + "</b>" + (save ? '<div class="stack__note gold">Ahorrás ' + money(save) + " vs. precio antes</div>" : "") + '</div><button class="btn" data-stack="' + i + '">Agregar todo</button></div><p class="stack__note">Precio = suma de los productos.' + (bf ? " Incluye 1 accesorio gratis por compra." : "") + "</p></article>";
  }).join("");
  $("#stacks").addEventListener("click", (e) => {
    const b = e.target.closest("[data-stack]"); if (!b) return;
    STACKS[+b.dataset.stack][2].forEach((id) => X.cart.add(id, 1, true));
    X.toast("Stack <b>" + esc(STACKS[+b.dataset.stack][0]) + "</b> agregado a tu bolsa"); X.openCart();
  });

  // Comunidad (solo 5 reels; el resto vive en Nosotros)
  $("#reelRail").innerHTML = B.reels.slice(0, 5).map((r) => '<a class="reel" href="' + esc(r.url) + '" target="_blank" rel="noopener"><video muted playsinline loop preload="none" poster="' + esc(r.src) + '.webp" data-autoplay><source src="' + esc(r.src) + '.mp4" type="video/mp4"></video><span>' + esc(r.caption) + "</span></a>").join("");

  X.hideMbarWhileVisible($("#hero"), "hero");
  X.railButtons(); X.autoplay(); X.reveal();
})();
