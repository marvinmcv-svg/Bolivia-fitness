/* Ofertas: campaña vigente, todos los productos con descuento y elección del accesorio de regalo */
(function () {
  "use strict";
  const X = window.BFX, B = X.B, $ = X.$, esc = X.esc;
  const ALL = Object.values(X.cat());
  if (!B.campaignActive()) {
    $("#offEyebrow").textContent = "Promociones";
    $("#offTtl").innerHTML = "Ofertas <b>pronto</b>";
    $("#offLede").textContent = "No hay una campaña activa en este momento. Mirá la tienda completa o seguinos para enterarte de la próxima.";
    $("#grid").innerHTML = ALL.filter((p) => p.star).map(X.productCard).join("");
    $("#regalo").hidden = true; return;
  }
  X.countdown($("#countdown"));
  $("#grid").innerHTML = ALL.filter((p) => p.before).sort((a, b) => b.off - a.off).map(X.productCard).join("");
  const c = B.campaign;
  function gift() {
    const g = X.cart.getGift();
    $("#gift").innerHTML = '<div class="giftgrid"><img src="' + c.img + '" width="900" height="1125" alt="Accesorios de regalo: shakers, mochila y gorras" style="border-radius:18px" loading="lazy"><div><p class="eyebrow">De regalo</p><h2 class="h2" id="giftTtl" style="font-size:clamp(26px,3vw,36px)">Elegí tu accesorio.</h2><p class="muted">' + esc(c.gift) + '. Lo anotamos en tu pedido y la tienda te confirma disponibilidad.</p><div class="otiles" style="margin-top:14px">' +
      c.gifts.map((x) => '<button type="button" class="otile" data-gift="' + esc(x) + '" aria-pressed="' + (x === g) + '">' + esc(x) + "</button>").join("") + '</div></div></div><div class="combo__sum"><a class="btn btn--lg" href="tienda.html">Seguir comprando <span class="arrow">→</span></a><a class="btn btn--ghost btn--lg" href="pedido.html">Finalizar pedido</a></div>';
  }
  $("#gift").addEventListener("click", (e) => { const b = e.target.closest("[data-gift]"); if (!b) return; X.cart.setGift(b.dataset.gift === X.cart.getGift() ? "" : b.dataset.gift); gift(); X.toast("Regalo: <b>" + esc(X.cart.getGift() || "sin elegir") + "</b>"); });
  gift();
})();
