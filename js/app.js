/* Bolivia Fitness · app (sin build). Todo el contenido viene de js/data.js */
(function () {
  "use strict";
  const B = window.BFIT;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = B.money;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let CAT = B.catalog();
  const P = (id) => CAT[id];
  const catName = (id) => (B.categories.find((c) => c.id === id) || {}).name || "";
  const store = {
    get(k, d, s) { try { const v = (s ? sessionStorage : localStorage).getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, JSON.stringify(v)); } catch (e) { /* modo privado */ } },
  };
  const ICON = {
    truck: '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M3 9h18v15H3zM21 14h6l5 5v5h-11z"/><circle cx="9" cy="26" r="2.6"/><circle cx="26" cy="26" r="2.6"/></svg>',
    gift: '<svg viewBox="0 0 36 36" aria-hidden="true"><rect x="5" y="13" width="26" height="7" rx="1.5"/><path d="M7 20v11h22V20M18 13v18M18 13c-2-5-9-6-9-2 0 2 4 2 9 2zM18 13c2-5 9-6 9-2 0 2-4 2-9 2z"/></svg>',
    shield: '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M18 4l12 4v9c0 8-5.5 13-12 15-6.5-2-12-7-12-15V8z"/><path d="M12.5 18l4 4 7-8"/></svg>',
    store: '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M5 14l2.5-8h21L31 14M5 14v17h26V14M5 14h26M14 31v-8h8v8"/></svg>',
    chat: '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M6 30l2-6a12 12 0 1 1 4.5 4.3z"/><path d="M13 14c.5 3.8 4 7.5 7.8 8l1.5-1.8 2.7 1.2c-.3 1.8-1.8 3-3.6 2.8-5.4-.6-9.1-4.3-9.7-9.7-.2-1.8 1-3.3 2.8-3.6l1.2 2.7z" fill="currentColor" stroke="none"/></svg>',
    spark: '<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M18 4l3 9 9 3-9 3-3 9-3-9-9-3 9-3z"/><path d="M28 25l1 3 3 1-3 1-1 3-1-3-3-1 3-1z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
  };

  /* ---------------- hora local de la tienda ---------------- */
  function nowLP() {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: B.config.timezone, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    const h = +parts.find((p) => p.type === "hour").value % 24, m = +parts.find((p) => p.type === "minute").value;
    return { mins: h * 60 + m, label: String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") };
  }
  const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  function branchStatus(b) {
    if (!b.open) return { k: "unknown", label: "Horario: consultá por WhatsApp" };
    const n = nowLP().mins, o = toMin(b.open), c = toMin(b.close);
    if (n >= o && n < c) return c - n <= 45 ? { k: "soon", label: "Cierra pronto · " + b.close } : { k: "open", label: "Abierto hasta las " + b.close };
    if (n < o) return { k: "closed", label: "Cerrado · abre hoy a las " + b.open };
    return { k: "closed", label: "Cerrado · abre mañana a las " + b.open };
  }

  /* ---------------- toast ---------------- */
  let toastT;
  function toast(html) { const t = $("#toast"); t.innerHTML = html; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2400); }

  /* ---------------- bolsa ---------------- */
  let cart = store.get("bf_cart", {});
  for (const id of Object.keys(cart)) if (!P(id)) delete cart[id];
  let gift = store.get("bf_gift", "");
  const cartLines = () => Object.keys(cart).filter((id) => P(id) && cart[id] > 0).map((id) => ({ id, qty: cart[id] }));
  const cartCount = () => cartLines().reduce((a, l) => a + l.qty, 0);
  const cartTotal = () => cartLines().reduce((a, l) => a + P(l.id).price * l.qty, 0);
  function setCart(next, opts) {
    cart = {};
    for (const [id, q] of Object.entries(next || {})) if (P(id) && q > 0) cart[id] = Math.min(50, Math.round(q));
    store.set("bf_cart", cart);
    renderCart(); renderShopQty(); renderFunnel(true); updateMbar();
    if (opts && opts.bump) { const c = $("[data-cart-count]"); c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); }
  }
  function addToCart(id, qty) {
    const p = P(id); if (!p) return;
    const n = Object.assign({}, cart); n[id] = (n[id] || 0) + (qty || 1);
    setCart(n, { bump: true });
    toast("Agregado a tu bolsa: <b>" + esc(p.short) + "</b> · " + money(p.price));
  }
  function changeQty(id, d) { const n = Object.assign({}, cart); n[id] = (n[id] || 0) + d; if (n[id] <= 0) delete n[id]; setCart(n); }
  const qtyHTML = (p, q) => '<div class="qty" aria-label="Cantidad de ' + esc(p.short) + '"><button type="button" data-q="' + p.id + '" data-d="-1" aria-label="Quitar uno">−</button><span>' + q + '</span><button type="button" data-q="' + p.id + '" data-d="1" aria-label="Agregar uno">+</button></div>';
  function renderCart() {
    const lines = cartLines(), count = cartCount();
    $$("[data-cart-count]").forEach((el) => { el.textContent = count; el.hidden = !count; });
    const body = $("#cartBody"), foot = $("#cartFoot");
    if (!lines.length) { body.innerHTML = '<div class="cart-empty"><p>Tu bolsa está vacía.</p><a class="btn" href="#tienda" data-close-cart>Seguir comprando</a></div>'; foot.innerHTML = ""; return; }
    body.innerHTML = lines.map((l) => { const p = P(l.id); return '<div class="line"><img src="' + esc(p.img) + '" width="64" height="64" alt=""><div><b>' + esc(p.short) + "</b><small>" + esc(p.size) + " · " + money(p.price) + "</small></div>" + qtyHTML(p, l.qty) + "</div>"; }).join("") +
      (B.campaignActive() ? '<p class="giftline">🎁 ' + esc(B.campaign.gift) + (gift ? ". Elegiste: <b>" + esc(gift) + "</b>" : ". Elegilo en la tienda o al finalizar.") + "</p>" : "");
    foot.innerHTML = '<div class="tot"><span>Total</span><b>' + money(cartTotal()) + '</b></div><a class="btn btn--lg btn--block" href="#pedido" data-goto-funnel>Finalizar pedido</a>';
  }
  document.addEventListener("click", (e) => {
    const q = e.target.closest("[data-q]"); if (q) { changeQty(q.dataset.q, +q.dataset.d); return; }
    const a = e.target.closest("[data-add]"); if (a) { e.preventDefault(); addToCart(a.dataset.add, 1); return; }
    const v = e.target.closest("[data-view]"); if (v) { e.preventDefault(); openQV(v.dataset.view); return; }
    const c = e.target.closest("[data-cat-link]"); if (c) { e.preventDefault(); closeNav(); pickCat(c.dataset.catLink); $("#tienda").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); return; }
    if (e.target.closest("[data-open-cart]")) { e.preventDefault(); openCart(); return; }
    if (e.target.closest("[data-close-cart]")) closeCart();
    if (e.target.closest("[data-goto-funnel]")) { closeCart(); closeQV(); goFunnel(2); }
    if (e.target.closest("[data-close-qv]")) closeQV();
  });
  let lastFocus = null;
  function openCart() { lastFocus = document.activeElement; $("#cart").hidden = false; renderCart(); updateMbar(); setTimeout(() => $("#cart .xbtn").focus(), 30); }
  function closeCart() { if ($("#cart").hidden) return; $("#cart").hidden = true; updateMbar(); if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeCart(); closeQV(); if (!$("#chat").hidden) closeChat(); closeNav(); } });

  /* ---------------- navegación + cinta ---------------- */
  function buildNav() {
    const L = [["#tienda", "Tienda"], ["cat:creatinas", "Creatinas"], ["cat:proteinas", "Proteínas"], ["cat:preentrenos", "Pre-entrenos"]]
      .concat(B.campaignActive() ? [["#blackfriday", "Black Friday"]] : []).concat([["#sucursales", "Sucursales"], ["#pedido", "Pedido"]]);
    const a = (h, t) => h.startsWith("cat:") ? '<a href="#tienda" data-cat-link="' + h.slice(4) + '">' + t + "</a>" : '<a href="' + h + '">' + t + "</a>";
    $("#navLinks").innerHTML = L.map(([h, t]) => "<li>" + a(h, t) + "</li>").join("") + '<li><a href="#" class="ai" data-open-chat>LeonIA</a></li>';
    $("#navpanelLinks").innerHTML = L.map(([h, t]) => a(h, t)).join("") + '<a href="#" class="ai" data-open-chat>LeonIA</a>';
    $("#ribbon").innerHTML = B.campaignActive()
      ? "<b>Black Friday:</b> hasta " + B.campaign.upTo + "% OFF y 1 accesorio gratis por cualquier compra, hasta el 30 de noviembre. <a href=\"#blackfriday\">Ver ofertas ›</a>"
      : "<b>Envíos gratis</b> a domicilio y envíos a toda Bolivia. <a href=\"#tienda\">Comprar ›</a>";
  }
  const burger = $("#burger");
  function closeNav() { if ($("#navpanel").hidden) return; $("#navpanel").hidden = true; burger.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; }
  burger.addEventListener("click", () => { const open = $("#navpanel").hidden; $("#navpanel").hidden = !open; burger.setAttribute("aria-expanded", String(open)); document.body.style.overflow = open ? "hidden" : ""; });
  $("#navpanel").addEventListener("click", (e) => { if (e.target.closest("a")) closeNav(); });
  $("#navSearch").addEventListener("click", () => { $("#tienda").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); setTimeout(() => $("#shopSearch").focus({ preventScroll: true }), reduced ? 0 : 500); });

  /* ---------------- tira de categorías ---------------- */
  const CAT_IMG = { creatinas: "dp-creatine-200", proteinas: "dp-whey-phorm", preentrenos: "dp-venom-inferno", recuperacion: "dp-glutamine", ellas: "dp-fema-trope", ganadores: "ps-incredibulk" };
  function buildCatnav() {
    const used = B.categories.filter((c) => Object.values(CAT).some((p) => p.cat === c.id));
    $("#catnav").innerHTML = used.map((c) => '<button class="catnav__item" data-cat-link="' + c.id + '"><img src="' + esc(P(CAT_IMG[c.id]).img) + '" width="108" height="78" alt=""><span>' + esc(c.name) + "</span></button>").join("") +
      (B.campaignActive() ? '<a class="catnav__item" href="#blackfriday"><img src="assets/img/bf-40off.webp" width="108" height="78" alt=""><span>Black Friday</span></a><a class="catnav__item" href="#giftcard"><img src="assets/img/bf-accesorios.webp" width="108" height="78" alt=""><span>Accesorios de regalo</span></a>' : "") +
      '<a class="catnav__item" href="#sucursales"><img src="assets/img/expocruz-dia3.webp" width="108" height="78" alt=""><span>Sucursales</span></a>';
  }

  /* ---------------- estantes ---------------- */
  const priceLine = (p) => (p.before ? money(p.price) + " · antes " + money(p.before) : "Desde " + money(p.price));
  function tile(o) {
    const media = o.video
      ? '<video muted playsinline loop preload="none" poster="' + o.video + '.webp" data-autoplay><source src="' + o.video + '.mp4" type="video/mp4"></video>'
      : '<img src="' + esc(o.img) + '" width="800" height="800" alt="' + esc(o.alt || "") + '" loading="lazy">';
    const attrs = o.view ? 'type="button" data-view="' + o.view + '"' : o.href ? 'href="' + esc(o.href) + '"' + (/^https/.test(o.href) ? ' target="_blank" rel="noopener"' : "") : "";
    const tag = o.view ? "button" : "a";
    return "<" + tag + ' class="tile ' + (o.cls || "") + '" ' + attrs + '><div class="tile__txt"><p class="eyebrow">' + esc(o.eyebrow) + "</p><h3>" + esc(o.title) + "</h3><p>" + esc(o.text) + "</p>" + (o.small ? "<small>" + esc(o.small) + "</small>" : "") + '</div><div class="tile__media' + (o.fade ? " tile__media--fade" : "") + '">' + media + "</div></" + tag + ">";
  }
  function buildLatest() {
    const bf = B.campaignActive(), whey = P("dp-whey-phorm"), cre = P("dp-creatine-200"), ven = P("dp-venom-inferno"), lem = P("dp-creatine-lemon");
    const T = [];
    if (bf) T.push({ cls: "tile--dark", eyebrow: "Black Friday", title: "Hasta " + B.campaign.upTo + "% OFF.", text: "En todos nuestros productos americanos.", small: "Del 16 al 30 de noviembre · + 1 accesorio gratis", video: "assets/video/bf-launch", href: "#blackfriday" });
    T.push({ cls: "tile--red", eyebrow: bf ? "Precio Black Friday" : "Proteína", title: "Whey Phorm", text: "25 g de proteína por servicio. Sabor Horchata.", small: priceLine(whey), img: "assets/hero/slide-whey.webp", view: whey.id, fade: true, alt: "Whey Phorm Horchata" });
    T.push({ eyebrow: "La creatina que te dura meses", title: "Creatina DP 200 servicios.", text: "100% micronizada, 5 g por servicio.", small: priceLine(cre) + " · " + money(cre.perServing) + " por servicio", img: "assets/hero/slide-creatina.webp", view: cre.id, alt: "Creatina Dragon Pharma 200 servicios" });
    T.push({ cls: "tile--dark", eyebrow: "Pre-entreno", title: "Venom Inferno.", text: "El pre-entreno de Dragon Pharma al precio más bajo del año.", small: priceLine(ven), video: "assets/video/venom-299", view: ven.id });
    T.push({ cls: "tile--red", eyebrow: lem.off ? "Ahorrá " + money(lem.save) : "Creatina con sabor", title: "Creatina Lemon Lime.", text: "Creatina con sabor, 45 servicios.", small: priceLine(lem), img: "assets/img/bf-lemon.webp", view: lem.id, fade: true, alt: "Creatina Dragon Pharma Lemon Lime" });
    T.push({ cls: "tile--dark", eyebrow: "Nuevo", title: "Nuevos sabores Dragon Pharma.", text: "En colaboración con Derek Lunsford. Ya en todas las sucursales.", small: "Consultá sabores y precios", video: "assets/video/dp-sabores", href: "https://www.instagram.com/p/Dfskk-1Pv62/" });
    $("#latestRail").innerHTML = T.map(tile).join("");
  }
  function buildBF() {
    if (!B.campaignActive()) return;
    $("#blackfriday").hidden = false;
    const list = Object.values(CAT).filter((p) => p.before).sort((a, b) => b.off - a.off);
    $("#bfRail").innerHTML = list.map((p) => productCard(p, true)).join("");
    const end = new Date(B.campaign.to + "T23:59:59-04:00").getTime();
    const tick = () => {
      let s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60); s -= m * 60;
      $("#countdown").innerHTML = '<span class="cd cd--lbl">Termina en</span>' + [[d, "días"], [h, "h"], [m, "min"], [s, "seg"]].map(([n, l]) => '<div class="cd"><b>' + String(n).padStart(2, "0") + "</b><span>" + l + "</span></div>").join("");
    };
    tick(); setInterval(tick, 1000);
  }
  function buildDiff() {
    const D = [
      [ICON.truck, "c-green", "<span class=\"c-green\">Envío gratis</span> a domicilio y envíos a todo el país.", "#pedido"],
      B.campaignActive() ? [ICON.gift, "c-red", "Llevate <span class=\"c-red\">1 accesorio gratis</span> por cualquier compra.", "#giftcard"] : null,
      [ICON.shield, "c-blue", "<span class=\"c-blue\">100% originales</span>, con registro SENASAG y sello de autenticidad.", "#historia"],
      [ICON.store, "c-ink", "Retirá en tu sucursal, en <span class=\"c-orange\">7 ciudades</span> de Bolivia.", "#sucursales"],
      [ICON.chat, "c-green", "Pedí por <span class=\"c-green\">WhatsApp</span>: armamos el mensaje por vos.", "#pedido"],
      [ICON.spark, "c-purple", "Elegí con <span class=\"c-purple\">LeonIA</span>, tu asistente de compras.", "chat"],
    ].filter(Boolean);
    $("#diffRail").innerHTML = D.map(([ic, c, t, h]) => (h === "chat" ? '<button type="button" class="mini" data-open-chat>' : '<a class="mini" href="' + h + '">') + ic.replace("<svg", '<svg class="' + c + '"') + "<p>" + t + "</p>" + (h === "chat" ? "</button>" : "</a>")).join("");
  }
  function buildHelp() {
    const H = [
      ['type="button" data-open-chat', "Asistente de compras", "Elegí con LeonIA.", "Contale tu objetivo y te arma el pedido, por texto o por voz.", "assets/video/pov-leo.webp"],
      ['href="' + B.waLink(B.config.callCenter, "¡Hola Bolivia Fitness! 🦁 Quiero hacer una consulta.") + '" target="_blank" rel="noopener"', "WhatsApp 756 66702", "Hablá con una persona.", "Stock, envíos y dudas sobre tus suplementos.", "assets/video/venom-delivery.webp"],
      ['href="#sucursales"', "Sucursales", "Vení a la tienda.", "Siete ciudades. Retirá tu pedido o mirá todo el stock.", "assets/img/expocruz-dia3.webp"],
    ];
    $("#helpRail").innerHTML = H.map(([attr, e, t, x, img]) => (attr.startsWith("type") ? "<button " + attr + ' class="mini help">' : "<a " + attr + ' class="mini help">') + '<div class="tile__txt"><p class="eyebrow">' + e + "</p><h3>" + t + "</h3><p>" + x + '</p></div><img src="' + img + '" width="540" height="960" alt="" loading="lazy">' + (attr.startsWith("type") ? "</button>" : "</a>")).join("");
  }
  function railButtons() {
    $$("[data-rail]").forEach((btn) => {
      const rail = document.getElementById(btn.dataset.rail); if (!rail) return;
      btn.addEventListener("click", () => rail.scrollBy({ left: +btn.dataset.dir * rail.clientWidth * .75, behavior: reduced ? "auto" : "smooth" }));
      const upd = () => { const prev = +btn.dataset.dir < 0; btn.disabled = prev ? rail.scrollLeft < 8 : rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8; };
      rail.addEventListener("scroll", upd, { passive: true }); addEventListener("resize", upd); setTimeout(upd, 300);
    });
  }

  /* ---------------- tienda ---------------- */
  const shop = { cat: "all", brands: new Set(), q: "", sort: "feat" };
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const SYN = { protein: "proteina", proteina: "whey", pre: "preentreno", "pre-entreno": "preentreno", gainer: "ganador", masa: "ganador", mujer: "ellas", glutamina: "glutamine", creatina: "creatine", sabor: "lemon blue razz", chica: "30", grande: "200" };
  function matches(p, q) {
    if (!q) return true;
    const hay = norm([p.name, p.short, p.brand, p.size, p.flavor, p.desc, p.cat, catName(p.cat)].join(" ")).replace(/-/g, "");
    return norm(q).split(/\s+/).filter(Boolean).every((w) => { w = w.replace(/-/g, ""); return hay.includes(w) || (SYN[w] && SYN[w].split(" ").some((s) => hay.includes(s))); });
  }
  function pickCat(id) { shop.cat = id; $$("#catTabs .tab").forEach((x) => x.setAttribute("aria-selected", String(x.dataset.cat === id))); renderShop(); }
  function buildShop() {
    const all = Object.values(CAT);
    $("#catTabs").innerHTML = '<button class="tab" role="tab" aria-selected="true" data-cat="all">Todos<small>' + all.length + "</small></button>" +
      B.categories.map((c) => { const n = all.filter((p) => p.cat === c.id).length; return n ? '<button class="tab" role="tab" aria-selected="false" data-cat="' + c.id + '">' + esc(c.name) + "<small>" + n + "</small></button>" : ""; }).join("");
    $("#brandChips").innerHTML = Object.values(B.brands).map((b) => '<button class="chip" aria-pressed="false" data-brand="' + esc(b.name) + '">' + esc(b.name) + "</button>").join("");
    $("#catTabs").addEventListener("click", (e) => { const t = e.target.closest("[data-cat]"); if (t) pickCat(t.dataset.cat); });
    $("#brandChips").addEventListener("click", (e) => { const c = e.target.closest("[data-brand]"); if (!c) return; const b = c.dataset.brand; shop.brands.has(b) ? shop.brands.delete(b) : shop.brands.add(b); c.setAttribute("aria-pressed", String(shop.brands.has(b))); renderShop(); });
    $("#shopSearch").addEventListener("input", (e) => { shop.q = e.target.value; renderShop(); });
    $("#shopSort").addEventListener("change", (e) => { shop.sort = e.target.value; renderShop(); });
    renderShop(); buildGift();
  }
  function cardFoot(p) { const q = cart[p.id] || 0; return q ? qtyHTML(p, q) : '<button class="btn" data-add="' + p.id + '" aria-label="Agregar ' + esc(p.short) + ' a la bolsa">Agregar</button>'; }
  function productCard(p, inRail) {
    const tag = p.off ? '<span class="new">Ahorrá ' + money(p.save) + " · -" + p.off + "%</span>" : p.star ? '<span class="new">Destacado</span>' : "";
    return '<article class="pcard"' + (inRail ? ' style="flex:none;width:280px;scroll-snap-align:start"' : "") + '><p class="pcard__tag">' + tag + '</p><h3 class="pcard__name"><button data-view="' + p.id + '">' + esc(p.short) + "</button></h3>" +
      '<button class="pcard__img" data-view="' + p.id + '" aria-label="Ver ' + esc(p.short) + '"><img src="' + esc(p.img) + '" width="720" height="720" alt="' + esc(p.short + " " + p.size) + '" loading="lazy"></button>' +
      '<p class="pcard__meta">' + esc(p.brand) + " · " + esc(p.size) + (p.flavor && p.flavor !== "Sin sabor" ? " · " + esc(p.flavor) : "") + "</p>" +
      '<div class="pcard__foot"><div class="pp"><span class="pp__now"><b>' + money(p.price) + "</b></span>" + (p.before ? '<span class="pp__was">Antes <s>' + money(p.before) + "</s></span>" : "") + (p.perServing ? '<span class="pp__per">' + money(p.perServing) + " por servicio</span>" : "") + "</div>" +
      '<div data-foot="' + p.id + '">' + cardFoot(p) + "</div></div></article>";
  }
  function renderShop() {
    const list = Object.values(CAT).filter((p) => (shop.cat === "all" || p.cat === shop.cat) && (!shop.brands.size || shop.brands.has(p.brand)) && matches(p, shop.q));
    const order = B.products.map((p) => p.id);
    const sorters = { feat: (a, b) => (b.star - a.star) || order.indexOf(a.id) - order.indexOf(b.id), price: (a, b) => a.price - b.price, save: (a, b) => b.save - a.save || b.off - a.off, serv: (a, b) => (a.perServing || 1e9) - (b.perServing || 1e9) };
    list.sort(sorters[shop.sort]);
    $("#shopCatName").textContent = (shop.cat === "all" ? "Todos los productos" : catName(shop.cat)) + ".";
    $("#shopCount").textContent = list.length + (list.length === 1 ? " producto" : " productos");
    $("#pgrid").innerHTML = list.length ? list.map((p) => productCard(p)).join("")
      : '<div class="empty"><p>No encontramos “' + esc(shop.q) + '”. Probá con otra palabra o preguntale a LeonIA.</p><button class="btn" data-open-chat>Preguntar a LeonIA</button></div>';
  }
  function renderShopQty() { $$("[data-foot]").forEach((el) => { el.innerHTML = cardFoot(P(el.dataset.foot)); }); if (!$("#qv").hidden) renderQVBuy(); }
  function buildGift() {
    if (!B.campaignActive()) { $("#giftcard").hidden = true; return; }
    const c = B.campaign;
    $("#giftcard").innerHTML = '<img src="' + c.img + '" width="900" height="1125" alt="Accesorios de regalo: shakers, mochila y gorras" loading="lazy"><div><p class="eyebrow">Black Friday</p><h3>Elegí tu accesorio de regalo.</h3><p>' + esc(c.gift) + '. Lo anotamos en tu pedido y la tienda te confirma disponibilidad.</p><div class="opts-tiles">' +
      c.gifts.map((g) => '<button class="otile" aria-pressed="' + (g === gift) + '" data-gift="' + esc(g) + '">' + esc(g) + "</button>").join("") + "</div></div>";
    $("#giftcard").addEventListener("click", (e) => { const g = e.target.closest("[data-gift]"); if (!g) return; gift = g.dataset.gift === gift ? "" : g.dataset.gift; store.set("bf_gift", gift); $$("#giftcard .otile").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.gift === gift))); renderCart(); renderFunnel(true); toast(gift ? "Regalo elegido: <b>" + esc(gift) + "</b>" : "Regalo sin elegir"); });
  }

  /* ---------------- comprar (página de compra en modal) ---------------- */
  let qvId = null;
  function openQV(id) {
    const p = P(id); if (!p) return; if ($("#qv").hidden) lastFocus = document.activeElement; qvId = id;
    const sib = Object.values(CAT).filter((x) => x.line === p.line || (x.cat === "creatinas" && p.cat === "creatinas" && x.brand === p.brand));
    $("#qvPanel").innerHTML = '<button class="xbtn qv__x" data-close-qv aria-label="Cerrar">✕</button>' +
      '<div class="qv__left"><img src="' + esc(p.img) + '" width="720" height="720" alt="' + esc(p.short) + '">' +
      '<div class="trust"><div>' + ICON.truck + "Envío gratis a domicilio</div><div>" + ICON.shield + "Original con registro SENASAG</div><div>" + (B.campaignActive() ? ICON.gift + "1 accesorio de regalo" : ICON.store + "Retiro en sucursal") + "</div></div></div>" +
      '<div class="qv__body">' + (p.off ? '<span class="new">Precio Black Friday · ahorrás ' + money(p.save) + "</span>" : "") + '<h3 id="qvTtl">Comprá ' + esc(p.name) + '</h3><p class="qv__desc">' + esc(p.desc) + "</p>" +
      '<p class="qv__price" style="margin:0">' + money(p.price) + (p.before ? "<s>" + money(p.before) + "</s>" : "") + (p.perServing ? ' <span class="muted" style="font-size:14px">· ' + money(p.perServing) + " por servicio</span>" : "") + "</p>" +
      (sib.length > 1 ? '<p class="qv__lbl">Presentación. <span class="muted">¿Cuál es la ideal para vos?</span></p><div class="opts-tiles">' + sib.map((s) => '<button class="otile" aria-pressed="' + (s.id === p.id) + '" data-view="' + s.id + '">' + esc(s.size) + "<small>" + esc(s.flavor || "") + " · " + money(s.price) + "</small></button>").join("") + "</div>" : "") +
      '<dl class="qv__facts"><div><dt>Marca</dt><dd>' + esc(p.brand) + "</dd></div><div><dt>Tamaño</dt><dd>" + esc(p.size) + "</dd></div><div><dt>Sabor</dt><dd>" + esc(p.flavor || "—") + "</dd></div><div><dt>Categoría</dt><dd>" + esc(catName(p.cat)) + "</dd></div></dl>" +
      '<div class="qv__buy" id="qvBuy"></div>' +
      '<p class="qv__note">Sin información de alérgenos publicada: consultá en sucursal. Si tenés alguna condición médica, consultá con un profesional antes de usar suplementos. <a class="link" href="' + esc(p.src) + '" target="_blank" rel="noopener">Ver publicación ↗</a></p></div>';
    $("#qv").hidden = false; renderQVBuy(); setTimeout(() => $("#qv .qv__x").focus(), 30);
  }
  function renderQVBuy() {
    const p = P(qvId); if (!p) return; const q = cart[p.id] || 0;
    $("#qvBuy").innerHTML = '<div class="qv__buyrow"><div><b>' + money(p.price) + '</b><div class="muted" style="font-size:12px">' + (B.campaignActive() ? "+ 1 accesorio gratis por tu compra" : "Envío gratis a domicilio") + "</div></div>" +
      (q ? qtyHTML(p, q) : '<button class="btn btn--lg" data-add="' + p.id + '">Agregar a la bolsa</button>') + "</div>" + (q ? '<a class="btn btn--lg btn--block" href="#pedido" data-goto-funnel>Revisar bolsa y finalizar</a>' : "");
  }
  function closeQV() { if ($("#qv").hidden) return; $("#qv").hidden = true; qvId = null; if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); }

  /* ---------------- reels ---------------- */
  function buildReels() {
    $("#reelRail").innerHTML = B.reels.map((r) => '<a class="reel" href="' + esc(r.url) + '" target="_blank" rel="noopener"><video muted playsinline loop preload="none" poster="' + esc(r.src) + '.webp" data-autoplay><source src="' + esc(r.src) + '.mp4" type="video/mp4"></video><span>' + esc(r.caption) + "</span></a>").join("");
  }
  function autoplayVideos() {
    if (reduced || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((ens) => ens.forEach((en) => { const v = en.target; if (en.isIntersecting) v.play().catch(() => {}); else v.pause(); }), { threshold: .35 });
    $$("video[data-autoplay]").forEach((v) => io.observe(v));
  }

  /* ---------------- checkout ---------------- */
  const F = Object.assign({ step: 1, mode: "", branch: "", name: "", address: "", reference: "", when: "asap", time: "", note: "", topic: "", question: "" }, store.get("bf_funnel", {}, true));
  const STEPS = ["Entrega", "Tu bolsa", "Tus datos", "Enviar"];
  function goFunnel(step) { F.step = step; renderFunnel(); $("#pedido").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); }
  function fmsg(t) { $("#fmsg").textContent = t || ""; }
  function funnelOrder() { return { lines: cartLines(), mode: F.mode || "delivery", branch: F.branch, address: F.address, reference: F.reference, when: F.when === "later" && F.time ? F.time : "asap", name: F.name, gift, note: F.note, topic: F.topic, question: F.question }; }
  function renderFunnel(previewOnly) {
    store.set("bf_funnel", F, true);
    const o = funnelOrder();
    $("#waPreview").textContent = (o.mode === "question" || o.lines.length) ? B.orderMessage(o) : "¡Hola Bolivia Fitness! 🦁 Quiero hacer un pedido…\n\n(Agregá productos para ver tu mensaje)";
    if (previewOnly && !(F.step === 2 && F.mode !== "question")) return;
    $("#steps").innerHTML = STEPS.map((s, i) => '<li class="' + (i + 1 === F.step ? "on" : i + 1 < F.step ? "done" : "") + '">' + s + "</li>").join("");
    const f = $("#fform");
    const nav = (back, next, lbl) => '<div class="fnav">' + (back ? '<button type="button" class="btn btn--gray" data-fstep="' + back + '">Atrás</button>' : "<span></span>") + (next ? '<button type="button" class="btn btn--lg" data-fstep="' + next + '">' + (lbl || "Continuar") + "</button>" : "") + "</div>";
    if (F.step === 1) {
      const O = [["delivery", "Envío a domicilio", "Gratis, en tu ciudad"], ["pickup", "Retiro en tienda", "En tu sucursal"], ["national", "Envío a otra ciudad", "A cualquier lugar de Bolivia"], ["question", "Tengo una consulta", "Productos, stock, uso"]];
      f.innerHTML = "<h3>¿Cómo querés recibir tu pedido?</h3><div class=\"opts-tiles\">" + O.map(([v, t, s]) => '<button type="button" class="otile" aria-pressed="' + (F.mode === v) + '" data-mode="' + v + '">' + t + "<small>" + s + "</small></button>").join("") + "</div>" + nav(0, 2);
    } else if (F.step === 2) {
      if (F.mode === "question") {
        f.innerHTML = '<h3>Tu consulta</h3><div class="field"><label for="f-topic">Tema</label><select id="f-topic" data-f="topic"><option value="">Elegí un tema</option>' + ["un producto", "stock", "precios y promos", "envíos", "otra cosa"].map((t) => "<option" + (F.topic === t ? " selected" : "") + ">" + t + "</option>").join("") + '</select></div><div class="field"><label for="f-q">Pregunta</label><textarea id="f-q" data-f="question">' + esc(F.question) + '</textarea></div><button type="button" class="btn btn--ghost" data-open-chat>Preguntar a LeonIA</button>' + nav(1, 3);
      } else {
        const lines = cartLines();
        f.innerHTML = "<h3>Revisá tu bolsa.</h3>" + (lines.length ? '<div class="bag">' + lines.map((l) => { const p = P(l.id); return '<div class="bag__row"><img src="' + esc(p.img) + '" width="72" height="72" alt=""><div><b>' + esc(p.short) + "</b><small>" + esc(p.size) + " · " + money(p.price) + "</small></div>" + qtyHTML(p, l.qty) + "</div>"; }).join("") + '<div class="bag__tot"><span>Total</span><span>' + money(cartTotal()) + "</span></div></div>" : '<p class="muted">Tu bolsa está vacía. Agregá productos acá abajo:</p>') +
          '<div class="picker" aria-label="Agregar productos">' + Object.values(CAT).map((p) => '<button type="button" data-add="' + p.id + '"><img src="' + esc(p.img) + '" width="40" height="40" alt=""><span>' + esc(p.short) + "<br><b>" + money(p.price) + "</b></span></button>").join("") + "</div>" +
          (B.campaignActive() ? '<div class="field"><label for="f-gift">Accesorio de regalo</label><select id="f-gift" data-gift-sel><option value="">El que esté disponible</option>' + B.campaign.gifts.map((g) => "<option" + (g === gift ? " selected" : "") + ">" + esc(g) + "</option>").join("") + "</select></div>" : "") + nav(1, 3);
      }
    } else if (F.step === 3) {
      const st = (b) => { const s = branchStatus(b); return s.k === "unknown" ? "" : " · " + (s.k === "closed" ? "Cerrado" : "Abierto"); };
      f.innerHTML = '<h3>Tus datos.</h3><div class="field"><label for="f-name">Nombre</label><input id="f-name" data-f="name" autocomplete="name" value="' + esc(F.name) + '"></div>' +
        '<div class="field"><label for="f-branch">' + (F.mode === "national" ? "Ciudad de destino" : "Ciudad / sucursal") + '</label><select id="f-branch" data-f="branch"><option value="">Elegí</option>' + B.branches.map((b) => '<option value="' + b.id + '"' + (F.branch === b.id ? " selected" : "") + ">" + esc(b.name) + st(b) + "</option>").join("") + '<option value="cc"' + (F.branch === "cc" ? " selected" : "") + ">Otra ciudad · WhatsApp nacional</option></select></div>" +
        (F.mode === "delivery" || F.mode === "national" ? '<div class="row2"><div class="field"><label for="f-addr">Dirección</label><input id="f-addr" data-f="address" autocomplete="street-address" value="' + esc(F.address) + '"></div><div class="field"><label for="f-ref">Referencia</label><input id="f-ref" data-f="reference" value="' + esc(F.reference) + '"></div></div>' : "") +
        (F.mode !== "question" ? '<div class="field"><label>¿Cuándo?</label><div class="opts-tiles"><button type="button" class="otile" aria-pressed="' + (F.when !== "later") + '" data-when="asap">Lo antes posible</button><button type="button" class="otile" aria-pressed="' + (F.when === "later") + '" data-when="later">Programar hora</button></div>' + (F.when === "later" ? '<input type="time" data-f="time" value="' + esc(F.time) + '" aria-label="Hora" style="margin-top:10px;max-width:180px">' : "") + "</div>" : "") +
        '<div class="field"><label for="f-note">Nota (opcional)</label><textarea id="f-note" data-f="note">' + esc(F.note) + "</textarea></div>" + nav(2, 4, "Revisar pedido");
    } else {
      const o = funnelOrder(), b = B.branchById(F.branch);
      f.innerHTML = "<h3>Revisá y enviá.</h3><p class=\"muted\">Tu mensaje va a <b style=\"color:var(--ink)\">" + (b ? "Bolivia Fitness " + esc(b.name) : "Bolivia Fitness (WhatsApp nacional)") + "</b>. Ahí te confirman stock, forma de pago y envío.</p>" +
        (o.mode !== "question" ? '<div class="bag__tot"><span>Total</span><span>' + money(cartTotal()) + "</span></div>" : "") +
        '<a class="btn btn--wa btn--lg btn--block" id="sendWa" target="_blank" rel="noopener" href="#" style="margin-top:14px">Enviar por WhatsApp</a>' + nav(3, 0);
      $("#sendWa").href = B.waLink(b ? b.whatsapp : B.config.callCenter, B.orderMessage(o));
    }
  }
  function validStep(n) {
    if (n === 2 && !F.mode) { fmsg("Elegí cómo querés recibir tu pedido."); return false; }
    if (n === 3 && F.mode !== "question" && !cartLines().length) { fmsg("Agregá al menos un producto."); return false; }
    if (n === 3 && F.mode === "question" && !F.question.trim()) { fmsg("Escribí tu pregunta."); return false; }
    if (n === 4) {
      if (!F.name.trim()) { fmsg("Contanos tu nombre."); return false; }
      if (!F.branch) { fmsg("Elegí tu ciudad o sucursal."); return false; }
      if ((F.mode === "delivery" || F.mode === "national") && !F.address.trim()) { fmsg("Necesitamos tu dirección para el envío."); return false; }
    }
    fmsg(""); return true;
  }
  $("#fform").addEventListener("click", (e) => {
    const m = e.target.closest("[data-mode]"); if (m) { F.mode = m.dataset.mode; renderFunnel(); return; }
    const s = e.target.closest("[data-fstep]"); if (s) { const n = +s.dataset.fstep; if (n < F.step || validStep(n)) { F.step = n; renderFunnel(); } return; }
    const w = e.target.closest("[data-when]"); if (w) { F.when = w.dataset.when; renderFunnel(); return; }
    if (e.target.id === "sendWa") { saveHistory(funnelOrder()); fmsg("¡Listo! Se abrió WhatsApp con tu pedido. 🦁"); }
  });
  $("#fform").addEventListener("input", (e) => { const k = e.target.dataset.f; if (k) { F[k] = e.target.value; renderFunnel(true); } if (e.target.matches("[data-gift-sel]")) { gift = e.target.value; store.set("bf_gift", gift); renderFunnel(true); } });
  function saveHistory(o) {
    if (!o.lines || !o.lines.length) return;
    const h = store.get("leonia_orders", []), cartObj = {}; o.lines.forEach((l) => (cartObj[l.id] = l.qty));
    h.unshift({ id: "WEB-" + Date.now().toString(36).toUpperCase().slice(-5), at: new Date().toISOString(), branch: o.branch, service: o.mode, cart: cartObj });
    store.set("leonia_orders", h.slice(0, 3));
  }

  /* ---------------- sucursales ---------------- */
  function buildBranches() {
    const known = B.branches.filter((b) => b.open), open = known.filter((b) => ["open", "soon"].includes(branchStatus(b).k)).length;
    $("#brNow").innerHTML = '<span class="dot ' + (open ? "dot--live" : "") + '"></span>Son las ' + nowLP().label + " en Bolivia · " + open + " de " + known.length + " sucursales con horario publicado están abiertas.";
    $("#bgrid").innerHTML = B.branches.map((b) => {
      const st = branchStatus(b);
      const maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Bolivia Fitness " + (b.address ? b.address + " " : "") + b.city + " Bolivia");
      return '<article class="bcard"><h3>Bolivia Fitness ' + esc(b.name) + '</h3><span class="bcard__st st-' + st.k + '">' + esc(st.label) + "</span>" +
        (b.note ? "<p>" + esc(b.note) + "</p>" : "") + (b.open ? "<p>Todos los días · " + b.open + "–" + b.close + "</p>" : "") + (b.address ? "<p>" + esc(b.address) + "</p>" : "") +
        '<div class="bcard__links"><a class="link" href="' + maps + '" target="_blank" rel="noopener">Cómo llegar ↗</a><a class="link" href="' + B.waLink(b.whatsapp, "¡Hola Bolivia Fitness " + b.name + "! 🦁") + '" target="_blank" rel="noopener">WhatsApp ›</a></div></article>';
    }).join("");
  }

  /* ---------------- footer + feed ---------------- */
  function buildFooter() {
    const G = [
      ["Comprar", B.categories.filter((c) => Object.values(CAT).some((p) => p.cat === c.id)).map((c) => [c.name, "#tienda", c.id])],
      ["Promos", (B.campaignActive() ? [["Black Friday", "#blackfriday"], ["Accesorio de regalo", "#giftcard"]] : []).concat([["Lo último", "#top"]])],
      ["Pedidos", [["Finalizar pedido", "#pedido"], ["Mi bolsa", "#", "cart"], ["Hablar con LeonIA", "#", "chat"], ["WhatsApp 756 66702", B.waLink(B.config.callCenter, "¡Hola Bolivia Fitness! 🦁")]]],
      ["Sucursales", B.branches.map((b) => [b.name + (b.open ? " · " + b.open + "–" + b.close : ""), "#sucursales"])],
      ["Bolivia Fitness", [["Representantes oficiales", "#historia"], ["Comunidad", "#reels"], ["Instagram", B.config.instagram], ["Facebook", B.config.facebook], ["TikTok", B.config.tiktok]]],
    ];
    const desk = matchMedia("(min-width: 834px)").matches;
    $("#ftrGroups").innerHTML = G.map(([t, items]) => "<details" + (desk ? " open" : "") + "><summary><h3>" + esc(t) + "</h3></summary><ul>" + items.map(([l, h, x]) => '<li><a href="' + esc(h) + '"' + (/^https/.test(h) ? ' target="_blank" rel="noopener"' : "") + (x === "cart" ? " data-open-cart" : x === "chat" ? " data-open-chat" : x ? ' data-cat-link="' + x + '"' : "") + ">" + esc(l) + "</a></li>").join("") + "</ul></details>").join("");
    $("#ftrNote").textContent = (B.campaignActive() ? "Precios Black Friday válidos del 16 al 30 de noviembre de 2026 a nivel nacional, según las publicaciones de @boliviafitness. " : "") + "Stock, forma de pago y envío se confirman por WhatsApp. Fotos y videos: @boliviafitness.";
    $("#ftrLegal").textContent = "© " + new Date().getFullYear() + " Bolivia Fitness. Representantes oficiales de Dragon Pharma y ProSupps.";
  }
  function buildFeed() { $("#feedgrid").innerHTML = B.feed.map((f) => '<a href="' + esc(f.url) + '" target="_blank" rel="noopener"><img src="' + esc(f.img) + '" width="600" height="600" alt="' + esc(f.alt) + '" loading="lazy"></a>').join(""); }

  /* ---------------- barra móvil ---------------- */
  const vis = { top: true, funnel: false, footer: false };
  function updateMbar() {
    const n = cartCount(), mc = $("#mbarCart");
    mc.hidden = !n; mc.textContent = n ? "Bolsa · " + n + " · " + money(cartTotal()) : "";
    const chatOpen = !$("#chat").hidden, cartOpen = !$("#cart").hidden;
    $("#mbar").classList.toggle("hide", vis.top || vis.funnel || vis.footer || chatOpen || cartOpen);
    $("#chatfab").classList.toggle("hide", vis.footer || chatOpen);
  }
  function watchSections() {
    const map = new Map([[$("#top"), "top"], [$("#pedido"), "funnel"], [$("#footer"), "footer"]]);
    const io = new IntersectionObserver((ens) => { ens.forEach((en) => (vis[map.get(en.target)] = en.isIntersecting)); updateMbar(); }, { threshold: .05 });
    map.forEach((_, el) => io.observe(el));
  }

  /* ================== LeonIA (asistente) ================== */
  const chat = $("#chat"), log = $("#chatLog");
  let LS = store.get("leonia_state", null, true) || { cart: {}, order: {}, stage: "browsing", history: [] };
  let LOG = store.get("leonia_log", [], true);
  let busy = false;
  const ENDPOINT = "/api/leonia";
  function mdSafe(t) {
    const h = esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    let out = "", inList = false;
    for (const ln of h.split(/\n/)) {
      const m = ln.match(/^\s*[-•]\s+(.*)/);
      if (m) { if (!inList) { out += "<ul>"; inList = true; } out += "<li>" + m[1] + "</li>"; continue; }
      if (inList) { out += "</ul>"; inList = false; }
      if (ln.trim()) out += "<p>" + ln + "</p>";
    }
    return out + (inList ? "</ul>" : "");
  }
  function addMsg(role, text) { const d = document.createElement("div"); d.className = "msg msg--" + (role === "user" ? "me" : "bot"); d.innerHTML = role === "user" ? esc(text) : mdSafe(text); log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  const safeWa = (u) => typeof u === "string" && u.startsWith("https://wa.me/");
  function cartCardHTML(c) {
    const ids = Object.keys(c || {}).filter((id) => P(id));
    if (!ids.length) return '<h4>Tu bolsa</h4><p style="margin:0">Vacía</p>';
    let t = 0; const li = ids.map((id) => { const s = P(id).price * c[id]; t += s; return "<li><span>" + c[id] + "× " + esc(P(id).short) + "</span><span>" + money(s) + "</span></li>"; }).join("");
    return "<h4>Tu bolsa</h4><ul>" + li + '</ul><div class="ctot"><span>Total</span><span>' + money(t) + '</span></div><button class="btn btn--gray" data-open-cart>Ver bolsa</button>';
  }
  function addCard(cls, html) { const d = document.createElement("div"); d.className = "ccard " + cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function chips(opts) { $("#chatChips").innerHTML = (opts || []).slice(0, 4).map((o) => '<button type="button">' + esc(o) + "</button>").join(""); }
  function starterChips() {
    const o = ["¿Qué promos hay hoy?", "Quiero una creatina", "¿Qué sucursales están abiertas?", "Necesito proteína"];
    if (store.get("leonia_orders", []).length) o.unshift("🦁 Lo de siempre");
    chips(o);
  }
  $("#chatChips").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) send(b.textContent); });
  log.addEventListener("click", (e) => { const b = e.target.closest(".qchips button"); if (b) send(b.textContent); const loc = e.target.closest("[data-share-loc]"); if (loc) shareLocation(loc); });
  function restoreLog() {
    log.innerHTML = "";
    if (!LOG.length) addMsg("bot", "¡Hola! Soy **LeonIA** 🦁, tu asistente de compras de Bolivia Fitness. ¿Qué estás buscando hoy?");
    LOG.forEach((m) => addMsg(m.role, m.content));
    starterChips();
  }
  function openChat() { lastFocus = document.activeElement; chat.hidden = false; document.body.classList.add("chat-open"); if (!log.children.length) restoreLog(); updateMbar(); setTimeout(() => $("#chatInput").focus(), 50); if (voice.ok) $("#voicebar").hidden = false; }
  function closeChat() { chat.hidden = true; document.body.classList.remove("chat-open"); stopVoice(); updateMbar(); if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); }
  document.addEventListener("click", (e) => { if (e.target.closest("[data-open-chat]")) { e.preventDefault(); closeNav(); closeQV(); openChat(); } });
  $("#chatClose").addEventListener("click", closeChat);
  $("#chatForm").addEventListener("submit", (e) => { e.preventDefault(); voice.lastWasVoice = false; const v = $("#chatInput").value.trim(); if (v) send(v); });

  function friendlyError(kind) {
    const txt = { setup: "Estoy terminando de prepararme 🛠️ Muy pronto voy a poder ayudarte a comprar.", rate: "Muchas preguntas seguidas 😅 Esperá un minuto y seguimos.", net: "Se cortó la conexión. Probá de nuevo en un ratito." }[kind] || "Algo falló de mi lado.";
    const d = addMsg("bot", txt + "\nMientras tanto podés ver la tienda o pedir directo por WhatsApp.");
    d.insertAdjacentHTML("beforeend", '<div class="qchips" style="margin-top:8px"><a class="btn" href="#tienda">Ver tienda</a> <a class="btn btn--wa" href="#pedido">Pedir por WhatsApp</a></div>');
  }

  async function send(text, opts) {
    if (busy || !text) return;
    stopSpeaking();
    busy = true; $("#chatInput").value = ""; chips([]);
    addMsg("user", text); LOG.push({ role: "user", content: text });
    const typing = addMsg("bot", ""); typing.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
    setVoiceState("thinking");
    LS.cart = Object.assign({}, cart); LS.myOrders = store.get("leonia_orders", []);
    let botText = "", bubble = typing, cartCard = null;
    try {
      const res = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: LOG.slice(-16), state: LS, channel: (opts && opts.voice) ? "voice" : "text" }) });
      if (!res.ok || !res.body) {
        typing.remove(); LOG.pop();
        friendlyError([503, 404, 501, 405].includes(res.status) ? "setup" : res.status === 429 ? "rate" : "other");
        busy = false; setVoiceState("idle"); starterChips(); persist(); return;
      }
      const rd = res.body.getReader(), dec = new TextDecoder(); let buf = "";
      for (;;) {
        const { value, done } = await rd.read(); if (done) break;
        buf += dec.decode(value, { stream: true });
        let i; while ((i = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (!line) continue;
          let ev; try { ev = JSON.parse(line); } catch (e) { continue; }
          if (ev.type === "text") { botText += ev.text; if (!bubble.isConnected) bubble = addMsg("bot", ""); bubble.innerHTML = mdSafe(botText); log.scrollTop = log.scrollHeight; }
          else if (ev.type === "cart") { setCart(ev.cart, { bump: true }); if (cartCard) cartCard.innerHTML = cartCardHTML(ev.cart); else { if (!botText) typing.remove(); cartCard = addCard("", cartCardHTML(ev.cart)); bubble = addMsg("bot", ""); bubble.remove(); } }
          else if (ev.type === "options") chips(ev.options);
          else if (ev.type === "readback") { const s = ev.summary || {}; addCard("ccard--receipt", "<h4>Revisá tu pedido</h4><ul>" + (s.lines || []).map((l) => "<li><span>" + l.qty + "× " + esc(l.name) + "</span><span>" + money(l.subtotal) + "</span></li>").join("") + '</ul><div class="ctot"><span>Total</span><span>' + money(s.total || 0) + '</span></div><p style="margin:8px 0 0;color:var(--muted)">' + esc([s.service, s.branch, s.address, s.when, s.name, s.gift ? "🎁 " + s.gift : ""].filter(Boolean).join(" · ")) + '</p><div class="qchips" style="margin-top:10px"><button>Sí, confirmar</button><button>Cambiar algo</button></div>'); }
          else if (ev.type === "location") addCard("", '<button class="btn" data-share-loc>📍 Compartir mi ubicación</button>');
          else if (ev.type === "order" && safeWa(ev.url)) { addCard("ccard--order", "<b>Pedido " + esc(ev.id) + " listo · " + money(ev.total) + '</b><a class="btn btn--wa btn--block" target="_blank" rel="noopener" href="' + esc(ev.url) + '">Enviar pedido por WhatsApp a ' + esc(ev.branch || "Bolivia Fitness") + "</a>"); if (ev.entry) saveOrderEntry(ev.entry); }
          else if (ev.type === "handoff" && safeWa(ev.url)) addCard("", '<a class="btn btn--wa" target="_blank" rel="noopener" href="' + esc(ev.url) + '">Hablar con una persona' + (ev.to ? " · " + esc(ev.to) : "") + "</a>");
          else if (ev.type === "state") LS = ev.state || LS;
          else if (ev.type === "error" && !botText) { typing.remove(); LOG.pop(); friendlyError(ev.kind === "not_configured" ? "setup" : ev.kind === "rate_limited" ? "rate" : "other"); }
        }
      }
      if (typing.isConnected && !typing.textContent.trim()) typing.remove();
      if (botText.trim()) { LOG.push({ role: "assistant", content: botText.trim() }); speak(botText); } else setVoiceState("idle");
    } catch (err) {
      if (typing.isConnected) typing.remove();
      if (!botText) { LOG.pop(); friendlyError("net"); } setVoiceState("idle");
    }
    LOG = LOG.slice(-20); persist(); busy = false;
    if (!$("#chatChips").children.length && LS.stage !== "awaiting_confirmation") starterChips();
  }
  function persist() { store.set("leonia_state", LS, true); store.set("leonia_log", LOG, true); }
  function saveOrderEntry(entry) { if (!entry || !entry.cart) return; const h = store.get("leonia_orders", []).filter((x) => x.id !== entry.id); h.unshift(entry); store.set("leonia_orders", h.slice(0, 3)); }
  function shareLocation(btn) {
    if (!navigator.geolocation) { addMsg("bot", "Tu navegador no permite compartir ubicación. Escribime tu dirección y una referencia 🙏"); return; }
    btn.disabled = true; btn.textContent = "Buscando tu ubicación…";
    navigator.geolocation.getCurrentPosition((pos) => {
      LS.order = Object.assign({}, LS.order, { location: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
      persist(); btn.textContent = "📍 Ubicación lista"; send("📍 Ubicación compartida");
    }, () => { btn.disabled = false; btn.textContent = "📍 Compartir mi ubicación"; addMsg("bot", "No pude obtener tu ubicación. Escribime tu dirección y una referencia, porfa."); }, { enableHighAccuracy: true, timeout: 12000 });
  }

  /* ---------- voz (Web Speech API) ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const voice = { ok: !!SR, rec: null, listening: false, speaking: false, wake: null, voiceObj: null, lastWasVoice: false };
  function setVoiceState(s) {
    const mic = $("#micBtn"); mic.classList.remove("listening", "thinking", "speaking"); if (s !== "idle") mic.classList.add(s);
    $("#voicebar").classList.toggle("live", s !== "idle");
    $("#voiceStatus").textContent = { idle: "Tocá el micrófono y hablá", listening: "Escuchando…", thinking: "Pensando…", speaking: "Hablando… tocá para interrumpir" }[s];
  }
  function pickVoice() { const vs = speechSynthesis.getVoices(); voice.voiceObj = vs.find((v) => /es-BO/i.test(v.lang)) || vs.find((v) => /es-(419|US|MX|AR)/i.test(v.lang)) || vs.find((v) => /^es/i.test(v.lang)) || null; }
  function speechText(t) {
    return t.replace(/\*\*/g, "").replace(/https?:\/\/\S+/g, "").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "")
      .replace(/Bs\.?\s?(\d[\d.,]*)/g, "$1 bolivianos").replace(/^\s*[-•]\s*/gm, "").replace(/\s+/g, " ").trim();
  }
  function speak(t) {
    if (!voice.lastWasVoice || !("speechSynthesis" in window)) { setVoiceState("idle"); return; }
    const u = new SpeechSynthesisUtterance(speechText(t)); u.lang = "es-BO"; if (voice.voiceObj) u.voice = voice.voiceObj; u.rate = 1.04;
    u.onend = () => { voice.speaking = false; setVoiceState("idle"); if ($("#handsfree").checked && !chat.hidden) listen(); };
    voice.speaking = true; setVoiceState("speaking"); speechSynthesis.speak(u);
  }
  function stopSpeaking() { if ("speechSynthesis" in window && speechSynthesis.speaking) speechSynthesis.cancel(); voice.speaking = false; }
  async function wakeLock(on) { try { if (on && "wakeLock" in navigator && !voice.wake) voice.wake = await navigator.wakeLock.request("screen"); if (!on && voice.wake) { await voice.wake.release(); voice.wake = null; } } catch (e) { /* no soportado */ } }
  function listen() {
    if (!voice.ok || busy) return;
    stopSpeaking();
    const r = new SR(); voice.rec = r; r.lang = "es-BO"; r.interimResults = true; r.maxAlternatives = 1;
    let final = "";
    r.onresult = (e) => { let interim = ""; for (let i = e.resultIndex; i < e.results.length; i++) { const tr = e.results[i][0].transcript; if (e.results[i].isFinal) final += tr; else interim += tr; } $("#chatInput").value = (final + interim).trim(); };
    r.onerror = (e) => { voice.listening = false; setVoiceState("idle"); if (e.error === "not-allowed" || e.error === "service-not-allowed") addMsg("bot", "No tengo permiso para usar el micrófono. Podés escribirme igual 🙂"); };
    r.onend = () => { voice.listening = false; if (final.trim()) { voice.lastWasVoice = true; send(final.trim(), { voice: true }); } else setVoiceState("idle"); };
    voice.listening = true; setVoiceState("listening"); wakeLock(true);
    try { r.start(); } catch (e) { voice.listening = false; setVoiceState("idle"); }
  }
  function stopVoice() { stopSpeaking(); if (voice.rec && voice.listening) voice.rec.abort(); voice.listening = false; setVoiceState("idle"); wakeLock(false); }
  if (voice.ok) {
    $("#micBtn").hidden = false;
    if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
    $("#micBtn").addEventListener("click", () => { if (voice.speaking) { stopSpeaking(); setVoiceState("idle"); listen(); return; } if (voice.listening) { voice.rec.stop(); return; } listen(); });
  }

  /* ---------------- init ---------------- */
  buildNav(); buildCatnav(); buildLatest(); buildBF(); buildDiff(); buildShop(); buildHelp(); buildReels();
  renderFunnel(); buildBranches(); buildFooter(); buildFeed(); renderCart(); railButtons(); autoplayVideos(); watchSections(); updateMbar();
  setInterval(() => { CAT = B.catalog(); buildBranches(); }, 60000);
  if (location.hash === "#leonia") openChat();
})();
