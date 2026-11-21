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
  const store = {
    get(k, d, s) { try { const v = (s ? sessionStorage : localStorage).getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v, s) { try { (s ? sessionStorage : localStorage).setItem(k, JSON.stringify(v)); } catch (e) { /* privado */ } },
  };

  /* ---------------- hora local de la tienda ---------------- */
  function nowLP() {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: B.config.timezone, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    const h = +parts.find((p) => p.type === "hour").value % 24, m = +parts.find((p) => p.type === "minute").value;
    return { h, m, mins: h * 60 + m, label: String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") };
  }
  const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  function branchStatus(b) {
    if (!b.open) return { k: "unknown", label: "Horario: consultá por WhatsApp", dot: "" };
    const n = nowLP().mins, o = toMin(b.open), c = toMin(b.close);
    if (n >= o && n < c) return c - n <= 45 ? { k: "soon", label: "Cierra pronto · " + b.close, dot: "dot--warn" } : { k: "open", label: "Abierto · hasta " + b.close, dot: "dot--live" };
    if (n < o) return { k: "closed", label: "Abre hoy a las " + b.open, dot: "dot--off", opens: b.open };
    return { k: "closed", label: "Cerrado · abre mañana " + b.open, dot: "dot--off", opens: b.open };
  }

  /* ---------------- toast ---------------- */
  let toastT;
  function toast(html) { const t = $("#toast"); t.innerHTML = html; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2600); }

  /* ---------------- carrito ---------------- */
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
    toast("Agregado: <b>" + esc(p.short) + "</b> · " + money(p.price));
  }
  function changeQty(id, d) { const n = Object.assign({}, cart); n[id] = (n[id] || 0) + d; if (n[id] <= 0) delete n[id]; setCart(n); }
  function renderCart() {
    const lines = cartLines(), count = cartCount();
    $$("[data-cart-count]").forEach((el) => { el.textContent = count; el.hidden = !count; });
    const body = $("#cartBody"), foot = $("#cartFoot");
    if (!lines.length) {
      body.innerHTML = '<div class="cart-empty"><p>Tu carrito está vacío.</p><a class="btn btn--red" href="#tienda" data-close-cart>Ver la tienda</a></div>';
      foot.innerHTML = ""; return;
    }
    body.innerHTML = lines.map((l) => { const p = P(l.id); return '<div class="line"><img src="' + esc(p.img) + '" width="64" height="64" alt=""><div><b>' + esc(p.short) + '</b><small>' + esc(p.size) + " · " + money(p.price) + '</small></div><div class="qty" aria-label="Cantidad"><button data-q="' + p.id + '" data-d="-1" aria-label="Quitar uno">−</button><span>' + l.qty + '</span><button data-q="' + p.id + '" data-d="1" aria-label="Agregar uno">+</button></div></div>'; }).join("") +
      (B.campaignActive() ? '<p class="giftline">🎁 ' + esc(B.campaign.gift) + (gift ? " · Elegiste: " + esc(gift) : "") + "</p>" : "");
    foot.innerHTML = '<div class="tot"><span>Total</span><b>' + money(cartTotal()) + '</b></div><a class="btn btn--red btn--lg btn--block" href="#pedido" data-goto-funnel>Continuar pedido →</a>';
  }
  document.addEventListener("click", (e) => {
    const q = e.target.closest("[data-q]"); if (q) { changeQty(q.dataset.q, +q.dataset.d); return; }
    const a = e.target.closest("[data-add]"); if (a) { e.preventDefault(); addToCart(a.dataset.add, 1); return; }
    const v = e.target.closest("[data-view]"); if (v) { e.preventDefault(); openQV(v.dataset.view); return; }
    if (e.target.closest("[data-open-cart]")) { openCart(); return; }
    if (e.target.closest("[data-close-cart]")) { closeCart(); }
    if (e.target.closest("[data-goto-funnel]")) { closeCart(); goFunnel(2); }
    if (e.target.closest("[data-close-qv]")) closeQV();
  });

  /* dialogs (carrito, quick view) con foco y Esc */
  let lastFocus = null;
  function openCart() { lastFocus = document.activeElement; $("#cart").hidden = false; renderCart(); updateMbar(); setTimeout(() => $("#cart .xbtn").focus(), 30); }
  function closeCart() { if ($("#cart").hidden) return; $("#cart").hidden = true; updateMbar(); if (lastFocus) lastFocus.focus(); }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeCart(); closeQV(); if (!$("#chat").hidden) closeChat(); closeNav(); } });

  /* ---------------- ticker ---------------- */
  function buildTicker() {
    const slice = '<svg viewBox="0 0 24 24" fill="none" stroke="#feff39" stroke-width="2" aria-hidden="true"><path d="M12 3l2.6 5.4 5.9.9-4.3 4.1 1 5.9L12 16.6l-5.2 2.7 1-5.9L3.5 9.3l5.9-.9z"/></svg>';
    const min = Math.min(...Object.values(CAT).filter((p) => p.cat === "creatinas").map((p) => p.price));
    const items = [];
    if (B.campaignActive()) items.push("<b>BLACK FRIDAY</b> hasta " + B.campaign.upTo + "% OFF · hasta el 30 de noviembre", "<b>+1 accesorio gratis</b> por cualquier compra");
    items.push("Creatinas desde <b>" + money(min) + "</b>", "<b>Envíos gratis</b> a domicilio y a toda Bolivia", "Originales con <b>registro SENASAG</b> y sello de autenticidad", "Pedí por WhatsApp <b>756 66702</b>");
    const html = items.map((t) => '<span class="ticker__item">' + slice + "<span>" + t + "</span></span>").join("");
    $("#ticker").innerHTML = html + html;
  }

  /* ---------------- header + nav ---------------- */
  const NAV = [["#ofertas", "Ofertas"], ["#tienda", "Tienda"], ["#blackfriday", "Black Friday"], ["#pedido", "Pedido"], ["#sucursales", "Sucursales"], ["#historia", "Nosotros"]];
  function buildNav() {
    const links = NAV.filter(([h]) => h !== "#blackfriday" || B.campaignActive()).map(([h, t]) => '<a href="' + h + '">' + t + "</a>").join("") + '<a href="#" class="ai" data-open-chat>LeonIA ✨</a>';
    $$("[data-pillnav]").forEach((n) => (n.innerHTML = links));
    $("#navpanelLinks").innerHTML = links;
  }
  const hdr = $("#hdr");
  function onScroll() { hdr.classList.toggle("solid", scrollY > parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tick")) + 4); updateMbar(); }
  addEventListener("scroll", onScroll, { passive: true });
  const burger = $("#burger");
  function closeNav() { if ($("#navpanel").hidden) return; $("#navpanel").hidden = true; burger.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; }
  burger.addEventListener("click", () => { const open = $("#navpanel").hidden; $("#navpanel").hidden = !open; burger.setAttribute("aria-expanded", String(open)); document.body.style.overflow = open ? "hidden" : ""; });
  $("#navpanel").addEventListener("click", (e) => { if (e.target.closest("a")) closeNav(); });

  /* ---------------- hero ---------------- */
  const SLIDES = [
    { cls: "red", id: "dp-whey-phorm", kicker: "Black Friday", t1: "Whey Phorm", t2: "Horchata", img: "assets/hero/slide-whey.webp",
      desc: (p) => "52 servicios, 25 g de proteína. <s>" + money(p.before) + "</s> + accesorio gratis", sticker: true },
    { cls: "light", id: "dp-creatine-200", kicker: "Modo Black Friday ON", t1: "Creatina DP", t2: "200 servicios", img: "assets/hero/slide-creatina.webp",
      desc: (p) => "La creatina que te dura meses. <s>" + money(p.before) + "</s> · " + money(p.perServing) + " por servicio" },
    { cls: "dark", id: "dp-venom-inferno", kicker: "Pre-entreno", t1: "Venom", t2: "Inferno", video: "assets/video/venom-299", poster: "assets/video/venom-299.webp",
      desc: (p) => "El pre-entreno de Dragon Pharma al precio más bajo del año" + (p.before ? ". <s>" + money(p.before) + "</s>" : ""), blob: "¡Probá el Venom Inferno!" },
  ];
  let cur = 0, timer = null, paused = false, heroVisible = true;
  function buildHero() {
    const stage = $("#slides");
    stage.innerHTML = SLIDES.map((s, i) => {
      const p = P(s.id);
      const media = s.video
        ? '<div class="vcard"><video muted playsinline loop preload="none" poster="' + s.poster + '"><source src="' + s.video + '.mp4" type="video/mp4"></video></div>' + (s.blob ? '<p class="blob">' + esc(s.blob) + "</p>" : "")
        : '<img class="cut" src="' + s.img + '" width="1000" height="750" alt="' + esc(p.short) + '"' + (i === 0 ? ' fetchpriority="high"' : ' loading="lazy"') + ">" +
          (s.sticker && B.campaignActive() ? '<div class="sticker" aria-hidden="true"><svg viewBox="0 0 128 128"><defs><path id="circ" d="M64 64m-50 0a50 50 0 1 1 100 0a50 50 0 1 1-100 0"/></defs><text><textPath href="#circ">HASTA ' + B.campaign.upTo + "% OFF · BLACK FRIDAY · BOLIVIA FITNESS ·</textPath></text></svg><b>-" + B.campaign.upTo + "%</b></div>" : "");
      const bg = s.cls === "dark" ? '<div class="slide__bg"><img src="' + s.poster + '" alt="" width="540" height="960" loading="lazy"></div>' : '<div class="slide__bg"></div>';
      return '<article class="slide slide--' + s.cls + (i === 0 ? " on" : "") + '" role="group" aria-roledescription="diapositiva" aria-label="' + (i + 1) + " de " + SLIDES.length + '"' + (i ? " inert" : "") + ">" + bg +
        '<div class="slide__in"><div class="slide__copy"><p class="kicker">' + esc(s.kicker) + '</p><h2 class="slide__ttl">' + esc(s.t1) + "<span>" + esc(s.t2) + "</span></h2>" +
        '<div class="price"><span class="price__cur">Bs</span><span class="price__num">' + p.price + '</span><p class="price__desc">' + s.desc(p) + "</p></div>" +
        '<div class="ctas"><button class="btn btn--mustard btn--lg" data-add="' + p.id + '">Agregar al carrito</button><button class="btn ' + (s.cls === "light" ? "btn--outline" : "btn--ghost") + ' btn--lg" data-view="' + p.id + '">Ver detalle</button></div></div>' +
        '<div class="slide__media">' + media + "</div></div></article>";
    }).join("");
    $("#dots").innerHTML = SLIDES.map((s, i) => '<button role="tab" aria-selected="' + (i === 0) + '" aria-label="' + esc(s.t1 + " " + s.t2) + '"></button>').join("");
    const month = new Intl.DateTimeFormat("es-BO", { month: "long", timeZone: B.config.timezone }).format(new Date());
    $("#terms").textContent = B.campaignActive() ? "Precios Black Friday válidos hasta el 30 de noviembre · en tiendas, delivery o WhatsApp" : "Precios de " + month + " · en tiendas o WhatsApp";
    $$("#dots button").forEach((b, i) => {
      b.addEventListener("click", () => go(i, true));
      b.addEventListener("keydown", (e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); go((cur + (e.key === "ArrowRight" ? 1 : -1) + SLIDES.length) % SLIDES.length, true); $$("#dots button")[cur].focus(); } });
    });
    const hero = $(".hero");
    hero.addEventListener("mouseenter", () => (paused = true)); hero.addEventListener("mouseleave", () => (paused = false));
    hero.addEventListener("focusin", () => (paused = true)); hero.addEventListener("focusout", () => (paused = false));
    let sx = null;
    stage.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
    stage.addEventListener("touchend", (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go((cur + (dx < 0 ? 1 : -1) + SLIDES.length) % SLIDES.length, true); sx = null; });
    new IntersectionObserver((en) => { heroVisible = en[0].isIntersecting; syncVideo(); }, { threshold: .2 }).observe(hero);
    if (!reduced) timer = setInterval(() => { if (!paused && !document.hidden && heroVisible) go((cur + 1) % SLIDES.length); }, 6500);
    applyHeroTheme();
  }
  function go(i, user) {
    const sl = $$(".slide");
    sl[cur].classList.remove("on"); sl[cur].setAttribute("inert", "");
    cur = i; sl[cur].classList.add("on"); sl[cur].removeAttribute("inert");
    $$("#dots button").forEach((b, j) => b.setAttribute("aria-selected", String(j === cur)));
    applyHeroTheme(); syncVideo();
    if (user && timer) { clearInterval(timer); timer = setInterval(() => { if (!paused && !document.hidden && heroVisible) go((cur + 1) % SLIDES.length); }, 6500); }
  }
  function applyHeroTheme() { const light = SLIDES[cur].cls === "light"; hdr.classList.toggle("on-light", light); $(".hero").classList.toggle("light-on", light); }
  function syncVideo() { $$(".slide").forEach((s, i) => { const v = $("video", s); if (!v) return; if (i === cur && heroVisible && !reduced) { v.play().catch(() => {}); } else v.pause(); }); }
  document.addEventListener("visibilitychange", syncVideo);
  if (store.get("bf_qr_off", false, true)) $("#qrcard").hidden = true;
  $("#qrClose").addEventListener("click", () => { $("#qrcard").hidden = true; store.set("bf_qr_off", true, true); });

  /* ---------------- order box ---------------- */
  function branchOptions(sel, withCC) {
    const opts = B.branches.map((b) => { const st = branchStatus(b); return '<option value="' + b.id + '">' + esc(b.name) + (b.note ? " (" + b.note + ")" : "") + (st.k === "unknown" ? "" : " · " + (st.k === "closed" ? "Cerrado" : "Abierto")) + "</option>"; }).join("");
    const v = sel.value; sel.innerHTML = (withCC ? '<option value="">Elegí tu ciudad</option>' : "") + opts; if (v) sel.value = v;
  }
  function obStatus() {
    const b = B.branchById($("#ob-branch").value), mode = $("input[name=ob-mode]:checked").value;
    const st = branchStatus(b);
    $("#obStatus").innerHTML = mode === "delivery"
      ? '<span class="dot dot--live"></span><span><b>Envío gratis</b> a domicilio · ' + esc(b.name) + "</span>"
      : '<span class="dot ' + st.dot + '"></span><span>' + esc(b.name) + " · " + esc(st.label) + "</span>";
  }
  function buildOrderbox() {
    branchOptions($("#ob-branch"));
    $("#orderbox").addEventListener("change", obStatus); obStatus();
    $("#orderbox").addEventListener("submit", (e) => {
      e.preventDefault();
      F.mode = $("input[name=ob-mode]:checked").value; F.branch = $("#ob-branch").value;
      goFunnel(2);
    });
  }

  /* ---------------- ofertas ---------------- */
  function buildOffers() {
    $("#offerRail").innerHTML = B.offers.map((o) => '<a class="ocard" href="' + esc(o.href) + '" target="_blank" rel="noopener"><img src="' + esc(o.img) + '" width="900" height="1125" alt="' + esc(o.alt) + '" loading="lazy"></a>').join("");
  }
  function railButtons() {
    $$("[data-rail]").forEach((btn) => {
      const rail = document.getElementById(btn.dataset.rail);
      btn.addEventListener("click", () => rail.scrollBy({ left: +btn.dataset.dir * rail.clientWidth * .8, behavior: reduced ? "auto" : "smooth" }));
    });
    const rail = $("#offerRail");
    const upd = () => { $(".railbtn--prev").hidden = rail.scrollLeft < 10; $(".railbtn--next").hidden = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 10; };
    rail.addEventListener("scroll", upd, { passive: true }); addEventListener("resize", upd); upd();
  }

  /* ---------------- Black Friday ---------------- */
  function buildBF() {
    if (!B.campaignActive()) return;
    $("#blackfriday").hidden = false;
    const c = B.campaign;
    const prods = Object.values(CAT).filter((p) => p.before);
    const best = prods.reduce((a, p) => (p.off > a.off ? p : a), prods[0]);
    const minCreat = Math.min(...prods.filter((p) => p.cat === "creatinas").map((p) => p.price));
    $("#bfgrid").innerHTML =
      '<article class="bfc bfc--hot"><span class="bfc__day">Hoy · Black Friday</span><h3>Hasta ' + c.upTo + '% OFF</h3><p>En todos nuestros productos americanos Dragon Pharma y ProSupps.</p><span class="bfc__big">-' + c.upTo + "%</span></article>" +
      '<article class="bfc"><span class="bfc__day">De regalo</span><h3>+1 accesorio gratis</h3><p>' + esc(c.gifts.join(", ")) + '.</p><span class="pillsave">Por cualquier compra</span></article>' +
      '<article class="bfc"><span class="bfc__day">Mayor ahorro</span><h3>' + esc(best.short) + '</h3><p>' + esc(best.size) + '</p><span class="bfc__big"><small>Bs </small>' + best.price + '</span><span class="pillsave">Ahorrás ' + money(best.save) + "</span></article>" +
      '<article class="bfc"><span class="bfc__day">Creatinas</span><h3>Todas a precio Black Friday</h3><p>Desde 30 servicios hasta el kilo, con o sin sabor.</p><span class="bfc__big"><small>desde Bs </small>' + minCreat + "</span></article>";
    const end = new Date(c.to + "T23:59:59-04:00").getTime();
    const tick = () => {
      let s = Math.max(0, Math.floor((end - Date.now()) / 1000));
      const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60); s -= m * 60;
      $("#countdown").innerHTML = '<div class="cd cd--lbl">Termina en</div>' + [[d, "días"], [h, "horas"], [m, "min"], [s, "seg"]].map(([n, l]) => '<div class="cd"><b>' + String(n).padStart(2, "0") + "</b><span>" + l + "</span></div>").join("");
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---------------- spotlight ---------------- */
  function buildSpot() {
    const p = P("dp-creatine-lemon");
    $("#estrella").innerHTML = '<div class="wrap spot__grid"><div class="spot__img reveal"><img src="assets/img/bf-lemon.webp" width="900" height="1125" alt="Creatina Dragon Pharma Lemon Lime con etiqueta de precio" loading="lazy"></div>' +
      '<div class="reveal"><p class="eyebrow">' + (p.before ? "Ahorrá " + money(p.save) + " · -" + p.off + "%" : "Creatina con sabor") + '</p><h2 class="spot__ttl" id="spotTtl">Creatina con sabor<span>Lemon Lime</span></h2>' +
      '<p class="sub" style="opacity:.85">' + esc(p.desc) + " " + esc(p.size) + ".</p>" +
      '<div class="price"><span class="price__cur">Bs</span><span class="price__num">' + p.price + '</span><p class="price__desc">' + (p.before ? "<s>" + money(p.before) + "</s> · " : "") + money(p.perServing) + ' por servicio</p></div>' +
      '<button class="btn btn--mustard btn--lg" data-add="' + p.id + '">Agregar al carrito</button></div></div>';
  }

  /* ---------------- tienda ---------------- */
  const shop = { cat: "all", brands: new Set(), q: "", sort: "feat" };
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const SYN = { protein: "proteina", proteina: "whey", pre: "preentreno", "pre-entreno": "preentreno", gainer: "ganador", masa: "ganador", mujer: "ellas", glutamina: "glutamine", creatina: "creatine", sabor: "lemon blue razz", chica: "30", grande: "200" };
  function matches(p, q) {
    if (!q) return true;
    const hay = norm([p.name, p.short, p.brand, p.size, p.flavor, p.desc, p.cat, B.categories.find((c) => c.id === p.cat).name].join(" ")).replace(/-/g, "");
    return norm(q).split(/\s+/).filter(Boolean).every((w) => { w = w.replace(/-/g, ""); return hay.includes(w) || (SYN[w] && SYN[w].split(" ").some((s) => hay.includes(s))); });
  }
  function buildShop() {
    const all = Object.values(CAT);
    $("#catTabs").innerHTML = '<button class="tab" role="tab" aria-selected="true" data-cat="all">Todo<small>' + all.length + "</small></button>" +
      B.categories.map((c) => { const n = all.filter((p) => p.cat === c.id).length; return n ? '<button class="tab" role="tab" aria-selected="false" data-cat="' + c.id + '">' + esc(c.name) + "<small>" + n + "</small></button>" : ""; }).join("");
    $("#brandChips").innerHTML = Object.values(B.brands).map((b) => '<button class="chip" aria-pressed="false" data-brand="' + esc(b.name) + '">' + esc(b.name) + "</button>").join("");
    $("#catTabs").addEventListener("click", (e) => { const t = e.target.closest("[data-cat]"); if (!t) return; shop.cat = t.dataset.cat; $$("#catTabs .tab").forEach((x) => x.setAttribute("aria-selected", String(x === t))); renderShop(); });
    $("#brandChips").addEventListener("click", (e) => { const c = e.target.closest("[data-brand]"); if (!c) return; const b = c.dataset.brand; shop.brands.has(b) ? shop.brands.delete(b) : shop.brands.add(b); c.setAttribute("aria-pressed", String(shop.brands.has(b))); renderShop(); });
    $("#shopSearch").addEventListener("input", (e) => { shop.q = e.target.value; renderShop(); });
    $("#shopSort").addEventListener("change", (e) => { shop.sort = e.target.value; renderShop(); });
    renderShop(); buildGift();
  }
  function cardFoot(p) {
    const q = cart[p.id] || 0;
    return q ? '<div class="qty" aria-label="Cantidad de ' + esc(p.short) + '"><button data-q="' + p.id + '" data-d="-1" aria-label="Quitar uno">−</button><span>' + q + '</span><button data-q="' + p.id + '" data-d="1" aria-label="Agregar uno">+</button></div>'
      : '<button class="plus" data-add="' + p.id + '" aria-label="Agregar ' + esc(p.short) + ' al carrito">+</button>';
  }
  function renderShop() {
    let list = Object.values(CAT).filter((p) => (shop.cat === "all" || p.cat === shop.cat) && (!shop.brands.size || shop.brands.has(p.brand)) && matches(p, shop.q));
    const order = B.products.map((p) => p.id);
    const sorters = { feat: (a, b) => (b.star - a.star) || order.indexOf(a.id) - order.indexOf(b.id), price: (a, b) => a.price - b.price, save: (a, b) => b.save - a.save || b.off - a.off, serv: (a, b) => (a.perServing || 1e9) - (b.perServing || 1e9) };
    list.sort(sorters[shop.sort]);
    $("#shopCount").textContent = list.length + (list.length === 1 ? " producto" : " productos");
    $("#pgrid").innerHTML = list.length ? list.map((p) =>
      '<article class="pcard" data-pid="' + p.id + '"><button class="pcard__img" data-view="' + p.id + '" aria-label="Ver ' + esc(p.short) + '"><img src="' + esc(p.img) + '" width="720" height="720" alt="' + esc(p.short + " " + p.size) + '" loading="lazy">' + (p.off ? '<span class="burst">-' + p.off + "%</span>" : "") + "</button>" +
      '<div class="pcard__body"><span class="pcard__brand">' + esc(p.brand) + (p.star ? ' · <span class="badge badge--y">Top</span>' : "") + '</span><h3 class="pcard__name"><button data-view="' + p.id + '">' + esc(p.short) + "</button></h3>" +
      '<p class="pcard__meta">' + esc(p.size) + (p.flavor ? " · " + esc(p.flavor) : "") + "</p>" +
      '<div class="pcard__foot"><div class="pp"><span class="pp__now"><small>Bs</small>' + p.price + "</span>" + (p.before ? '<span class="pp__was"><s>' + money(p.before) + "</s></span>" : "") + (p.perServing ? '<span class="pp__per">' + money(p.perServing) + " / servicio</span>" : "") + "</div>" +
      '<div data-foot="' + p.id + '">' + cardFoot(p) + "</div></div></div></article>").join("")
      : '<div class="empty"><p>No encontramos “' + esc(shop.q) + '”. Probá con otra palabra o preguntale a LeonIA.</p><button class="btn btn--red" data-open-chat>Preguntar a LeonIA</button></div>';
  }
  function renderShopQty() { $$("[data-foot]").forEach((el) => { el.innerHTML = cardFoot(P(el.dataset.foot)); }); if (!$("#qv").hidden) renderQVFoot(); }
  function buildGift() {
    if (!B.campaignActive()) { $("#giftcard").hidden = true; return; }
    const c = B.campaign;
    $("#giftcard").innerHTML = '<img src="' + c.img + '" width="900" height="1125" alt="Accesorios de regalo: shakers, mochila y gorras" loading="lazy"><div><p class="eyebrow">Black Friday</p><h3>Elegí tu accesorio de regalo</h3><p>' + esc(c.gift) + '. Lo anotamos en tu pedido y la tienda te confirma disponibilidad.</p><div class="gchips">' +
      c.gifts.map((g) => '<button class="gchip" aria-pressed="' + (g === gift) + '" data-gift="' + esc(g) + '">' + esc(g) + "</button>").join("") + "</div></div>";
    $("#giftcard").addEventListener("click", (e) => { const g = e.target.closest("[data-gift]"); if (!g) return; gift = g.dataset.gift === gift ? "" : g.dataset.gift; store.set("bf_gift", gift); $$(".gchip").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.gift === gift))); renderCart(); renderFunnel(true); toast(gift ? "Regalo elegido: <b>" + esc(gift) + "</b>" : "Regalo sin elegir"); });
  }

  /* quick view */
  let qvId = null;
  function openQV(id) {
    const p = P(id); if (!p) return; qvId = id; lastFocus = document.activeElement;
    const sib = Object.values(CAT).filter((x) => x.line === p.line || (x.cat === p.cat && x.brand === p.brand && x.cat === "creatinas"));
    $("#qvPanel").innerHTML = '<button class="xbtn qv__x" data-close-qv aria-label="Cerrar">✕</button><div class="qv__img"><img src="' + esc(p.img) + '" width="720" height="720" alt="' + esc(p.short) + '"></div>' +
      '<div class="qv__body"><span class="pcard__brand">' + esc(p.brand) + '</span><h3 id="qvTtl">' + esc(p.name) + "</h3><p style=\"margin:0\">" + esc(p.desc) + "</p>" +
      '<div class="pp"><span class="pp__now"><small>Bs</small>' + p.price + "</span>" + (p.before ? '<span class="pp__was">Antes <s>' + money(p.before) + "</s> · ahorrás " + money(p.save) + " (-" + p.off + "%)</span>" : "") + "</div>" +
      '<dl class="qv__facts"><div><dt>Tamaño</dt><dd>' + esc(p.size) + "</dd></div><div><dt>Sabor</dt><dd>" + esc(p.flavor || "—") + "</dd></div>" + (p.perServing ? "<div><dt>Por servicio</dt><dd>" + money(p.perServing) + "</dd></div>" : "") + "<div><dt>Categoría</dt><dd>" + esc(B.categories.find((c) => c.id === p.cat).name) + "</dd></div></dl>" +
      (sib.length > 1 ? '<div><p class="eyebrow" style="margin:6px 0">Otras presentaciones</p><div class="vars">' + sib.map((s) => '<button class="var" aria-pressed="' + (s.id === p.id) + '" data-view="' + s.id + '">' + esc(s.size) + "<br><b>" + money(s.price) + "</b></button>").join("") + "</div></div>" : "") +
      '<div id="qvFoot" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"></div>' +
      '<p class="qv__note">Sin información de alérgenos publicada: consultá en sucursal. Si tenés alguna condición médica, consultá con un profesional antes de usar suplementos. <a href="' + esc(p.src) + '" target="_blank" rel="noopener">Ver post ↗</a></p></div>';
    $("#qv").hidden = false; renderQVFoot(); setTimeout(() => $("#qv .qv__x").focus(), 30);
  }
  function renderQVFoot() { const p = P(qvId); if (!p) return; $("#qvFoot").innerHTML = (cart[p.id] ? cardFoot(p) + '<a class="btn btn--dark" href="#pedido" data-close-qv data-goto-funnel>Ir al pedido →</a>' : '<button class="btn btn--red btn--lg" data-add="' + p.id + '">Agregar al carrito · ' + money(p.price) + "</button>"); }
  function closeQV() { if ($("#qv").hidden) return; $("#qv").hidden = true; qvId = null; if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); }

  /* ---------------- destacados + reels ---------------- */
  function buildFeatured() {
    $("#fgrid").innerHTML = B.featured.map((f) => { const p = f.ref ? P(f.ref) : null; return '<article class="fcard reveal"><div class="fcard__media"><video muted playsinline loop preload="none" poster="' + esc(f.img) + '" data-autoplay><source src="' + esc(f.video) + '.mp4" type="video/mp4"></video><span class="badge badge--red">' + esc(f.tag) + "</span></div>" +
      '<div class="fcard__body"><h3>' + esc(f.title) + "</h3><p>" + esc(f.text) + '</p><div class="fcard__foot">' + (p ? '<span class="pp__now"><small>Bs</small>' + p.price + '</span><button class="plus" data-add="' + p.id + '" aria-label="Agregar ' + esc(p.short) + '">+</button>' : '<a class="ulink" style="color:var(--mustard)" href="' + esc(f.url) + '" target="_blank" rel="noopener">Ver en Instagram ↗</a><button class="btn btn--cream" data-open-chat>Consultar</button>') + "</div></div></article>"; }).join("");
    $("#featFine").textContent = B.campaignActive() ? "Precios Black Friday válidos del 16 al 30 de noviembre de 2026, a nivel nacional. Fotos y videos: @boliviafitness." : "Fotos y videos: @boliviafitness.";
    $("#reelRail").innerHTML = B.reels.map((r) => '<a class="reel" href="' + esc(r.url) + '" target="_blank" rel="noopener"><video muted playsinline loop preload="none" poster="' + esc(r.src) + '.webp" data-autoplay><source src="' + esc(r.src) + '.mp4" type="video/mp4"></video><span>' + esc(r.caption) + "</span></a>").join("");
    if (reduced) return;
    const io = new IntersectionObserver((ens) => ens.forEach((en) => { const v = en.target; if (en.isIntersecting) v.play().catch(() => {}); else v.pause(); }), { threshold: .35 });
    $$("video[data-autoplay]").forEach((v) => io.observe(v));
  }

  /* ---------------- checkout funnel ---------------- */
  const F = Object.assign({ step: 1, mode: "", branch: "", name: "", address: "", reference: "", when: "asap", time: "", note: "", topic: "", question: "" }, store.get("bf_funnel", {}, true));
  const STEPS = ["Entrega", "Productos", "Tus datos", "Enviar"];
  function goFunnel(step) { F.step = step; renderFunnel(); $("#pedido").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); }
  function fmsg(t) { $("#fmsg").textContent = t || ""; }
  function funnelOrder() { return { lines: cartLines(), mode: F.mode || "delivery", branch: F.branch, address: F.address, reference: F.reference, when: F.when === "later" && F.time ? F.time : "asap", name: F.name, gift, note: F.note, topic: F.topic, question: F.question }; }
  function renderFunnel(previewOnly) {
    store.set("bf_funnel", F, true);
    const o = funnelOrder();
    $("#waPreview").textContent = (o.mode === "question" || o.lines.length) ? B.orderMessage(o) : "¡Hola Bolivia Fitness! 🦁 Quiero hacer un pedido…\n\n(Agregá productos para ver tu mensaje)";
    if (previewOnly && !(F.step === 2 && F.mode !== "question")) return;
    $("#steps").innerHTML = STEPS.map((s, i) => '<li class="' + (i + 1 === F.step ? "on" : i + 1 < F.step ? "done" : "") + '">' + (i + 1) + ". " + s + "</li>").join("");
    const f = $("#fform");
    const nav = (back, next, nextLbl) => '<div class="fnav">' + (back ? '<button type="button" class="btn btn--ghost" data-fstep="' + back + '">← Atrás</button>' : "<span></span>") + (next ? '<button type="button" class="btn btn--mustard" data-fstep="' + next + '">' + (nextLbl || "Siguiente →") + "</button>" : "") + "</div>";
    if (F.step === 1) {
      const O = [["delivery", "Envío a domicilio", "Gratis, en tu ciudad"], ["pickup", "Retiro en tienda", "Pasá por tu sucursal"], ["national", "Envío a otra ciudad", "A cualquier lugar de Bolivia"], ["question", "Tengo una consulta", "Productos, stock, uso"]];
      f.innerHTML = "<h3>¿Qué necesitás?</h3><div class=\"opts\">" + O.map(([v, t, s]) => '<button type="button" class="opt" aria-pressed="' + (F.mode === v) + '" data-mode="' + v + '">' + t + "<small>" + s + "</small></button>").join("") + "</div>" + nav(0, 2);
    } else if (F.step === 2) {
      if (F.mode === "question") {
        f.innerHTML = '<h3>Tu consulta</h3><div class="field"><label for="f-topic">Tema</label><select id="f-topic" data-f="topic"><option value="">Elegí un tema</option>' + ["un producto", "stock", "precios y promos", "envíos", "otra cosa"].map((t) => "<option" + (F.topic === t ? " selected" : "") + ">" + t + "</option>").join("") + '</select></div><div class="field"><label for="f-q">Pregunta</label><textarea id="f-q" data-f="question">' + esc(F.question) + '</textarea></div><button type="button" class="btn btn--cream" data-open-chat>Preguntar a LeonIA ✨</button>' + nav(1, 3);
      } else {
        const lines = cartLines();
        f.innerHTML = "<h3>Tus productos</h3>" + (lines.length ? '<div class="mini">' + lines.map((l) => { const p = P(l.id); return '<div class="mini__row"><img src="' + esc(p.img) + '" width="48" height="48" alt=""><div><b>' + esc(p.short) + "</b>" + esc(p.size) + " · " + money(p.price) + '</div><div class="qty"><button type="button" data-q="' + p.id + '" data-d="-1" aria-label="Quitar uno">−</button><span>' + l.qty + '</span><button type="button" data-q="' + p.id + '" data-d="1" aria-label="Agregar uno">+</button></div></div>'; }).join("") + '<div class="mini__tot"><span>Total</span><span>' + money(cartTotal()) + "</span></div></div>" : '<p style="opacity:.75">Todavía no agregaste productos. Elegí acá abajo:</p>') +
          '<div class="picker" aria-label="Agregar productos">' + Object.values(CAT).map((p) => '<button type="button" data-add="' + p.id + '"><img src="' + esc(p.img) + '" width="38" height="38" alt=""><span>' + esc(p.short) + "<br>" + money(p.price) + "</span></button>").join("") + "</div>" +
          (B.campaignActive() ? '<div class="field"><label for="f-gift">Accesorio de regalo</label><select id="f-gift" data-gift-sel><option value="">El que esté disponible</option>' + B.campaign.gifts.map((g) => "<option" + (g === gift ? " selected" : "") + ">" + esc(g) + "</option>").join("") + "</select></div>" : "") + nav(1, 3);
      }
    } else if (F.step === 3) {
      const st = (b) => { const s = branchStatus(b); return s.k === "unknown" ? "" : " · " + (s.k === "closed" ? "Cerrado" : "Abierto"); };
      f.innerHTML = '<h3>Tus datos</h3><div class="field"><label for="f-name">Nombre</label><input id="f-name" data-f="name" autocomplete="name" value="' + esc(F.name) + '"></div>' +
        '<div class="field"><label for="f-branch">' + (F.mode === "national" ? "Ciudad de destino" : "Ciudad / sucursal") + '</label><select id="f-branch" data-f="branch"><option value="">Elegí</option>' + B.branches.map((b) => '<option value="' + b.id + '"' + (F.branch === b.id ? " selected" : "") + ">" + esc(b.name) + st(b) + "</option>").join("") + '<option value="cc"' + (F.branch === "cc" ? " selected" : "") + ">Otra ciudad · WhatsApp nacional</option></select></div>" +
        (F.mode === "delivery" || F.mode === "national" ? '<div class="row2"><div class="field"><label for="f-addr">Dirección</label><input id="f-addr" data-f="address" autocomplete="street-address" value="' + esc(F.address) + '"></div><div class="field"><label for="f-ref">Referencia</label><input id="f-ref" data-f="reference" value="' + esc(F.reference) + '"></div></div>' : "") +
        (F.mode !== "question" ? '<div class="field"><label>¿Cuándo?</label><div class="chips"><button type="button" class="chip" aria-pressed="' + (F.when !== "later") + '" data-when="asap">Lo antes posible</button><button type="button" class="chip" aria-pressed="' + (F.when === "later") + '" data-when="later">Programar</button>' + (F.when === "later" ? '<input type="time" data-f="time" value="' + esc(F.time) + '" aria-label="Hora" style="max-width:140px">' : "") + "</div></div>" : "") +
        '<div class="field"><label for="f-note">Nota (opcional)</label><textarea id="f-note" data-f="note">' + esc(F.note) + "</textarea></div>" + nav(2, 4, "Revisar →");
    } else {
      const o = funnelOrder(), b = B.branchById(F.branch);
      f.innerHTML = "<h3>Revisá y enviá</h3><p>Tu mensaje va a <b>" + (b ? "Bolivia Fitness " + esc(b.name) : "Bolivia Fitness (WhatsApp nacional)") + "</b>. Ahí te confirman stock, forma de pago y envío.</p>" +
        (o.mode !== "question" ? '<div class="mini__tot"><span>Total</span><span>' + money(cartTotal()) + "</span></div>" : "") +
        '<a class="btn btn--wa btn--lg btn--block" id="sendWa" target="_blank" rel="noopener" href="#">Enviar por WhatsApp</a>' + nav(3, 0);
      const num = b ? b.whatsapp : B.config.callCenter;
      $("#sendWa").href = B.waLink(num, B.orderMessage(o));
    }
  }
  function validStep(n) {
    if (n === 2 && !F.mode) { fmsg("Elegí cómo querés tu pedido."); return false; }
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
  $("#fform").addEventListener("change", (e) => { if (e.target.dataset.f === "branch") renderFunnel(true); });

  /* Mi Pedido (últimos 3 pedidos en este dispositivo) */
  function saveHistory(o) {
    if (!o.lines || !o.lines.length) return;
    const h = store.get("leonia_orders", []);
    const cartObj = {}; o.lines.forEach((l) => (cartObj[l.id] = l.qty));
    h.unshift({ id: o.orderId || "WEB-" + Date.now().toString(36).toUpperCase().slice(-5), at: new Date().toISOString(), branch: o.branch, service: o.mode, cart: cartObj });
    store.set("leonia_orders", h.slice(0, 3));
  }

  /* ---------------- sucursales ---------------- */
  function buildBranches() {
    const known = B.branches.filter((b) => b.open), open = known.filter((b) => ["open", "soon"].includes(branchStatus(b).k)).length;
    $("#brNow").innerHTML = '<span class="dot ' + (open ? "dot--live" : "") + '"></span>' + nowLP().label + " en Bolivia · <b>" + open + " de " + known.length + "</b>&nbsp;sucursales con horario publicado abiertas";
    $("#bgrid").innerHTML = B.branches.map((b) => {
      const st = branchStatus(b), cls = st.k === "open" ? "status--open" : st.k === "soon" ? "status--soon" : st.k === "closed" ? "status--closed" : "";
      const maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("Bolivia Fitness " + (b.address ? b.address + " " : "") + b.city + " Bolivia");
      return '<article class="bcard reveal in"><span class="status ' + cls + '">' + (st.dot ? '<span class="dot ' + st.dot + '"></span>' : "") + esc(st.label) + "</span><h3>" + esc(b.name) + "</h3>" +
        (b.note ? "<p><b>" + esc(b.note) + "</b></p>" : "") + (b.open ? "<p>Todos los días · " + b.open + "–" + b.close + "</p>" : "") + (b.address ? "<p>" + esc(b.address) + "</p>" : "") +
        '<div class="bcard__links"><a href="' + maps + '" target="_blank" rel="noopener">Cómo llegar ↗</a><a href="' + B.waLink(b.whatsapp, "¡Hola Bolivia Fitness " + b.name + "! 🦁") + '" target="_blank" rel="noopener">WhatsApp 756 66702</a></div></article>';
    }).join("");
    branchOptions($("#ob-branch")); obStatus();
  }

  /* ---------------- footer ---------------- */
  function buildFooter() {
    const G = [
      ["Productos", B.categories.filter((c) => Object.values(CAT).some((p) => p.cat === c.id)).map((c) => [c.name, "#tienda", c.id])],
      ["Promos", (B.campaignActive() ? [["Black Friday", "#blackfriday"], ["Accesorio de regalo", "#giftcard"]] : []).concat([["Ofertas", "#ofertas"], ["Más buscados", "#destacados"]])],
      ["Pedidos", [["Hacer mi pedido", "#pedido"], ["Mi carrito", "#", "cart"], ["Hablar con LeonIA", "#", "chat"], ["WhatsApp 756 66702", B.waLink(B.config.callCenter, "¡Hola Bolivia Fitness! 🦁")]]],
      ["Sucursales", B.branches.map((b) => [b.name + (b.open ? " · " + b.open + "–" + b.close : ""), "#sucursales"])],
      ["Bolivia Fitness", [["Nosotros", "#historia"], ["Representantes oficiales", "#oficial"], ["Instagram", B.config.instagram], ["Facebook", B.config.facebook], ["TikTok", B.config.tiktok]]],
    ];
    $("#ftrGroups").innerHTML = G.map(([t, items]) => "<details><summary>" + esc(t) + "</summary><ul>" + items.map(([l, h, x]) => '<li><a href="' + esc(h) + '"' + (/^https/.test(h) ? ' target="_blank" rel="noopener"' : "") + (x === "cart" ? " data-open-cart" : x === "chat" ? " data-open-chat" : x ? ' data-cat-link="' + x + '"' : "") + ">" + esc(l) + "</a></li>").join("") + "</ul></details>").join("");
    const ds = $$("#ftrGroups details");
    ds.forEach((d) => d.addEventListener("toggle", () => { if (d.open && matchMedia("(min-width: 861px)").matches) ds.forEach((o) => o !== d && (o.open = false)); }));
    document.addEventListener("click", (e) => { if (!e.target.closest("#ftrGroups") && matchMedia("(min-width: 861px)").matches) ds.forEach((d) => (d.open = false)); const c = e.target.closest("[data-cat-link]"); if (c) { const t = $('#catTabs [data-cat="' + c.dataset.catLink + '"]'); if (t) t.click(); } });
    $("#ftrLegal").textContent = "Santa Cruz 11:00–22:00 · Sucre 10:00–22:00 · Envíos a toda Bolivia · © " + new Date().getFullYear() + " Bolivia Fitness. Representantes oficiales de Dragon Pharma y ProSupps.";
  }

  /* ---------------- feed ---------------- */
  function buildFeed() { $("#feedgrid").innerHTML = B.feed.map((f) => '<a href="' + esc(f.url) + '" target="_blank" rel="noopener"><img src="' + esc(f.img) + '" width="600" height="600" alt="' + esc(f.alt) + '" loading="lazy"></a>').join(""); }

  /* ---------------- barra móvil ---------------- */
  const vis = { hero: true, funnel: false, footer: false };
  function updateMbar() {
    const n = cartCount(), mc = $("#mbarCart");
    mc.hidden = !n; mc.textContent = n ? "🛒 " + n + " · " + money(cartTotal()) : "";
    const chatOpen = !$("#chat").hidden, cartOpen = !$("#cart").hidden;
    $("#mbar").classList.toggle("hide", vis.hero || vis.funnel || vis.footer || chatOpen || cartOpen);
    $("#chatfab").classList.toggle("hide", vis.footer || chatOpen);
  }
  function watchSections() {
    const map = new Map([[$(".hero"), "hero"], [$("#pedido"), "funnel"], [$("#footer"), "footer"]]);
    new IntersectionObserver((ens) => { ens.forEach((en) => (vis[map.get(en.target)] = en.isIntersecting)); updateMbar(); }, { threshold: .08 }).observe($(".hero"));
    const io = new IntersectionObserver((ens) => { ens.forEach((en) => (vis[map.get(en.target)] = en.isIntersecting)); updateMbar(); }, { threshold: .05 });
    io.observe($("#pedido")); io.observe($("#footer"));
  }

  /* ---------------- reveal ---------------- */
  function reveal() {
    if (reduced || !("IntersectionObserver" in window)) { $$(".reveal").forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((ens) => ens.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: .12 });
    $$(".reveal:not(.in)").forEach((e) => io.observe(e));
  }

  /* ================== LeonIA (asistente) ================== */
  const chat = $("#chat"), log = $("#chatLog");
  let LS = store.get("leonia_state", null, true) || { cart: {}, order: {}, stage: "browsing", history: [] };
  let LOG = store.get("leonia_log", [], true);
  let busy = false;
  const ENDPOINT = "/api/leonia";
  function mdSafe(t) {
    let h = esc(t).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
    const lines = h.split(/\n/); let out = "", inList = false;
    for (const ln of lines) {
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
    if (!ids.length) return '<h4>Carrito</h4><p style="margin:0">Vacío</p>';
    let t = 0; const li = ids.map((id) => { const s = P(id).price * c[id]; t += s; return "<li><span>" + c[id] + "× " + esc(P(id).short) + "</span><span>" + money(s) + "</span></li>"; }).join("");
    return "<h4>Tu carrito</h4><ul>" + li + '</ul><div class="ctot"><span>Total</span><span>' + money(t) + '</span></div><button class="btn btn--red" data-open-cart>Ver carrito</button>';
  }
  function addCard(cls, html) { const d = document.createElement("div"); d.className = "ccard " + cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function chips(opts, el) {
    const box = el || $("#chatChips");
    box.innerHTML = (opts || []).slice(0, 4).map((o) => '<button type="button">' + esc(o) + "</button>").join("");
  }
  function starterChips() {
    const o = ["¿Qué promos hay hoy?", "Quiero una creatina", "¿Qué sucursales están abiertas?", "Necesito proteína"];
    if (store.get("leonia_orders", []).length) o.unshift("🦁 Lo de siempre");
    chips(o);
  }
  $("#chatChips").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) send(b.textContent); });
  log.addEventListener("click", (e) => { const b = e.target.closest(".qchips button"); if (b) send(b.textContent); const loc = e.target.closest("[data-share-loc]"); if (loc) shareLocation(loc); const s = e.target.closest("[data-save-order]"); if (s) saveOrderEntry(JSON.parse(s.dataset.saveOrder)); });
  function restoreLog() {
    log.innerHTML = "";
    if (!LOG.length) addMsg("bot", "¡Hola! Soy **LeonIA** 🦁, tu asistente de compras de Bolivia Fitness. ¿Qué estás buscando hoy?");
    LOG.forEach((m) => addMsg(m.role, m.content));
    starterChips();
  }
  function openChat() { lastFocus = document.activeElement; chat.hidden = false; document.body.classList.add("chat-open"); if (!log.children.length) restoreLog(); updateMbar(); setTimeout(() => $("#chatInput").focus(), 50); if (voice.ok) $("#voicebar").hidden = false; }
  function closeChat() { chat.hidden = true; document.body.classList.remove("chat-open"); stopVoice(); updateMbar(); if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); }
  document.addEventListener("click", (e) => { if (e.target.closest("[data-open-chat]")) { e.preventDefault(); closeNav(); openChat(); } });
  $("#chatClose").addEventListener("click", closeChat);
  $("#chatForm").addEventListener("submit", (e) => { e.preventDefault(); const v = $("#chatInput").value.trim(); if (v) send(v); });

  function friendlyError(kind) {
    const txt = { setup: "Estoy terminando de prepararme 🛠️ Muy pronto voy a poder ayudarte a comprar.", rate: "Muchas preguntas seguidas 😅 Esperá un minuto y seguimos.", net: "Se cortó la conexión. Probá de nuevo en un ratito." }[kind] || "Algo falló de mi lado.";
    const d = addMsg("bot", txt + "\nMientras tanto podés ver la tienda o pedir directo por WhatsApp.");
    d.insertAdjacentHTML("beforeend", '<div class="qchips" style="margin-top:6px"><a class="btn btn--red" style="padding:8px 14px;font-size:.78rem" href="#tienda">Ver tienda</a> <a class="btn btn--wa" style="padding:8px 14px;font-size:.78rem" href="#pedido">Pedir por WhatsApp</a></div>');
  }

  async function send(text, opts) {
    if (busy || !text) return;
    stopSpeaking();
    busy = true; $("#chatInput").value = ""; chips([]);
    addMsg("user", text); LOG.push({ role: "user", content: text });
    const typing = addMsg("bot", ""); typing.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
    setVoiceState("thinking");
    LS.cart = Object.assign({}, cart);
    LS.myOrders = store.get("leonia_orders", []);
    let botText = "", bubble = typing, cartCard = null, gotText = false;
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
          if (ev.type === "text") { if (!gotText) { gotText = true; } botText += ev.text; if (bubble === typing && !typing.isConnected) { bubble = addMsg("bot", ""); } bubble.innerHTML = mdSafe(botText); log.scrollTop = log.scrollHeight; }
          else if (ev.type === "cart") { setCart(ev.cart, { bump: true }); if (cartCard) cartCard.innerHTML = cartCardHTML(ev.cart); else cartCard = addCard("", cartCardHTML(ev.cart)); if (!gotText) { typing.remove(); bubble = addMsg("bot", ""); } }
          else if (ev.type === "options") chips(ev.options);
          else if (ev.type === "readback") { const s = ev.summary || {}; addCard("ccard--receipt", "<h4>Revisá tu pedido</h4><ul>" + (s.lines || []).map((l) => "<li><span>" + l.qty + "× " + esc(l.name) + "</span><span>" + money(l.subtotal) + "</span></li>").join("") + '</ul><div class="ctot"><span>Total</span><span>' + money(s.total || 0) + "</span></div><p style=\"margin:6px 0 0\">" + esc([s.service, s.branch, s.address, s.when, s.name, s.gift ? "🎁 " + s.gift : ""].filter(Boolean).join(" · ")) + '</p><div class="qchips" style="margin-top:8px"><button>Sí, confirmar</button><button>Cambiar algo</button></div>'); }
          else if (ev.type === "location") addCard("", '<button class="btn btn--red" data-share-loc>📍 Compartir mi ubicación</button>');
          else if (ev.type === "order" && safeWa(ev.url)) { addCard("ccard--order", "<b>Pedido " + esc(ev.id) + " listo · " + money(ev.total) + '</b><a class="btn btn--wa btn--block" target="_blank" rel="noopener" href="' + esc(ev.url) + '" data-save-order=\'' + esc(JSON.stringify(ev.entry || {})) + "'>Enviar pedido por WhatsApp a " + esc(ev.branch || "Bolivia Fitness") + "</a>"); if (ev.entry) saveOrderEntry(ev.entry); }
          else if (ev.type === "handoff" && safeWa(ev.url)) addCard("", '<a class="btn btn--wa" target="_blank" rel="noopener" href="' + esc(ev.url) + '">Hablar con una persona' + (ev.to ? " · " + esc(ev.to) : "") + "</a>");
          else if (ev.type === "state") { LS = ev.state || LS; }
          else if (ev.type === "error") { if (!botText) { typing.remove(); LOG.pop(); friendlyError(ev.kind === "not_configured" ? "setup" : ev.kind === "rate_limited" ? "rate" : "other"); } }
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
  function saveOrderEntry(entry) {
    if (!entry || !entry.cart) return;
    const h = store.get("leonia_orders", []).filter((x) => x.id !== entry.id);
    h.unshift(entry); store.set("leonia_orders", h.slice(0, 3));
  }
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
  const voice = { ok: !!SR, rec: null, listening: false, speaking: false, wake: null, voiceObj: null };
  function setVoiceState(s) {
    const mic = $("#micBtn"); mic.classList.remove("listening", "thinking", "speaking"); if (s !== "idle") mic.classList.add(s);
    $("#voicebar").classList.toggle("live", s !== "idle");
    $("#voiceStatus").textContent = { idle: "Tocá el micrófono y hablá", listening: "Escuchando…", thinking: "Pensando…", speaking: "Hablando… tocá para interrumpir" }[s];
  }
  function pickVoice() {
    const vs = speechSynthesis.getVoices();
    voice.voiceObj = vs.find((v) => /es-BO/i.test(v.lang)) || vs.find((v) => /es-(419|US|MX|AR)/i.test(v.lang)) || vs.find((v) => /^es/i.test(v.lang)) || null;
  }
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
    r.onerror = (e) => { voice.listening = false; setVoiceState("idle"); if (e.error === "not-allowed" || e.error === "service-not-allowed") addMsg("bot", "No tengo permiso para usar el micrófono. Podés escribirme igual 🙂"); else if (e.error === "language-not-supported") { r.lang = "es-419"; } };
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
  $("#chatForm").addEventListener("submit", () => { voice.lastWasVoice = false; }, true);

  /* ---------------- init ---------------- */
  function init() {
    buildTicker(); buildNav(); buildHero(); buildOrderbox(); buildOffers(); railButtons(); buildBF(); buildSpot(); buildShop();
    buildFeatured(); renderFunnel(); buildBranches(); buildFooter(); buildFeed(); renderCart(); watchSections(); onScroll(); reveal();
    setInterval(() => { CAT = B.catalog(); buildBranches(); }, 60000);
    if (location.hash === "#leonia") openChat();
  }
  init();
})();
