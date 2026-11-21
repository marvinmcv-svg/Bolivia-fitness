/* Tienda: filtros (categoría, marca, precio, ofertas), búsqueda y orden, sincronizados con la URL */
(function () {
  "use strict";
  const X = window.BFX, B = X.B, $ = X.$, $$ = X.$$, esc = X.esc;
  const ALL = Object.values(X.cat());
  const qs = new URLSearchParams(location.search);
  const st = { cat: qs.get("cat") || "all", brand: qs.get("brand") || "all", price: qs.get("precio") || "all", deals: qs.get("ofertas") === "1", q: qs.get("q") || "", sort: qs.get("orden") || "feat" };
  const PRICES = [["all", "Todos los precios"], ["0-300", "Hasta Bs 300"], ["300-600", "Bs 300 – 600"], ["600-9999", "Más de Bs 600"]];
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/-/g, "");
  const SYN = { proteina: "whey iso proteinas", protein: "whey iso proteinas", pre: "preentrenos", preentreno: "preentrenos", gainer: "ganadores", masa: "ganadores", mujer: "ellas", glutamina: "glutamine", creatina: "creatine", sabor: "lemon blue razz" };
  const hay = (p) => norm([p.name, p.short, p.brand, p.size, p.flavor, p.desc, p.cat, X.catName(p.cat)].join(" "));
  const match = (p) => !st.q || norm(st.q).split(/\s+/).filter(Boolean).every((w) => hay(p).includes(w) || (SYN[w] || "").split(" ").some((s) => s && hay(p).includes(s)));
  const inPrice = (p) => { if (st.price === "all") return true; const [a, b] = st.price.split("-").map(Number); return p.price >= a && p.price <= b; };
  const base = (skip) => ALL.filter((p) => (skip === "cat" || st.cat === "all" || p.cat === st.cat) && (skip === "brand" || st.brand === "all" || p.brand === st.brand) && (skip === "price" || inPrice(p)) && (!st.deals || p.before) && match(p));

  function filters() {
    const cats = [["all", "Todos"]].concat(B.categories.filter((c) => ALL.some((p) => p.cat === c.id)).map((c) => [c.id, c.name]));
    const btn = (k, v, t, n) => '<button type="button" data-k="' + k + '" data-v="' + esc(v) + '" aria-pressed="' + (st[k] === v) + '"><span>' + esc(t) + "</span><small>" + n + "</small></button>";
    $("#fCats").innerHTML = cats.map(([v, t]) => btn("cat", v, t, base("cat").filter((p) => v === "all" || p.cat === v).length)).join("");
    $("#fBrands").innerHTML = [["all", "Todas"]].concat(Object.values(B.brands).map((b) => [b.name, b.name])).map(([v, t]) => btn("brand", v, t, base("brand").filter((p) => v === "all" || p.brand === v).length)).join("");
    $("#fPrice").innerHTML = PRICES.map(([v, t]) => { const s = st.price; st.price = v; const n = base("price").filter(inPrice).length; st.price = s; return btn("price", v, t, n); }).join("");
    $("#mCats").innerHTML = cats.map(([v, t]) => '<button type="button" data-k="cat" data-v="' + v + '" aria-pressed="' + (st.cat === v) + '">' + esc(t) + "</button>").join("") + '<button type="button" data-deals aria-pressed="' + st.deals + '">Solo ofertas</button>';
    $("#fDeals").checked = st.deals;
  }
  function render() {
    const order = B.products.map((p) => p.id);
    const sorters = { feat: (a, b) => (b.star - a.star) || order.indexOf(a.id) - order.indexOf(b.id), price: (a, b) => a.price - b.price, "price-d": (a, b) => b.price - a.price, save: (a, b) => b.save - a.save || b.off - a.off, serv: (a, b) => (a.perServing || 1e9) - (b.perServing || 1e9) };
    const list = base().sort(sorters[st.sort] || sorters.feat);
    $("#count").textContent = list.length + (list.length === 1 ? " producto" : " productos") + (st.cat !== "all" ? " en " + X.catName(st.cat) : "");
    $("#grid").innerHTML = list.length ? list.map(X.productCard).join("") : '<div class="empty"><p>No encontramos productos con esos filtros.</p><button class="btn" type="button" id="clearF">Limpiar filtros</button> <button class="btn btn--ghost" data-open-chat>Preguntar a LeonIA</button></div>';
    filters();
    const p = new URLSearchParams();
    if (st.cat !== "all") p.set("cat", st.cat); if (st.brand !== "all") p.set("brand", st.brand); if (st.price !== "all") p.set("precio", st.price); if (st.deals) p.set("ofertas", "1"); if (st.q) p.set("q", st.q); if (st.sort !== "feat") p.set("orden", st.sort);
    history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : "") + location.hash);
    if (st.cat !== "all") document.title = X.catName(st.cat) + " · Tienda · Bolivia Fitness";
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]"); if (b) { st[b.dataset.k] = b.dataset.v; render(); return; }
    if (e.target.closest("[data-deals]")) { st.deals = !st.deals; render(); return; }
    if (e.target.id === "clearF") { Object.assign(st, { cat: "all", brand: "all", price: "all", deals: false, q: "" }); $("#q").value = ""; render(); }
  });
  $("#fDeals").addEventListener("change", (e) => { st.deals = e.target.checked; render(); });
  $("#q").value = st.q; $("#q").addEventListener("input", (e) => { st.q = e.target.value; render(); });
  $("#sort").value = st.sort; $("#sort").addEventListener("change", (e) => { st.sort = e.target.value; render(); });
  if (location.hash === "#buscar") setTimeout(() => $("#q").focus(), 50);
  render();
})();
