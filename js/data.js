/* ==========================================================================
   Bolivia Fitness · contenido único del sitio y de LeonIA (asistente)
   --------------------------------------------------------------------------
   TODO dato sale de las publicaciones de @boliviafitness. Cada precio, producto,
   sucursal y promo lleva su fuente (URL del post) en un comentario.
   El sitio (js/app.js) y las herramientas del asistente (api/_tools.js) leen
   ESTE archivo y el mismo catalog(), así nunca se contradicen en un precio.
   ========================================================================== */
(function (root, factory) {
  const data = factory();
  if (typeof module === "object" && module.exports) module.exports = data;
  else root.BFIT = data;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const IG = "https://www.instagram.com/p/";

  const BFIT = {
    config: {
      brand: "Bolivia Fitness",
      // WhatsApp / info nacional: "Para más información al 75666702" (DfK8C--g055, DfKlxcDA_Jj, DfII7diMzem)
      // y bio de TikTok "wa.me/59175666702".
      callCenter: "59175666702",
      callCenterLabel: "756 66702",
      instagram: "https://www.instagram.com/boliviafitness/",
      facebook: "https://www.facebook.com/Boliviafitnessbol/",
      tiktok: "https://www.tiktok.com/@boliviafitness",
      timezone: "America/La_Paz",
      locale: "es-BO",
      currency: "Bs",
    },

    // Bio de Instagram: "Representantes oficiales de suplementos americanos🇺🇸 @dragonpharma_llc @prosupps"
    brands: {
      dp: { name: "Dragon Pharma", ig: "https://www.instagram.com/dragonpharma_llc/" },
      ps: { name: "ProSupps", ig: "https://www.instagram.com/prosupps/" },
    },

    categories: [
      { id: "creatinas", name: "Creatinas" },
      { id: "proteinas", name: "Proteínas" },
      { id: "preentrenos", name: "Pre-entrenos" },
      { id: "recuperacion", name: "Recuperación" },
      { id: "ellas", name: "Para ellas" },
      { id: "ganadores", name: "Ganadores de masa" },
    ],

    /* Campaña vigente. Fuente: Df21PuBFsA_ ("hasta 40% de descuento en todos nuestros
       productos americanos del 16 al 30 de noviembre ... accesorios de regalo"),
       Df0Gh8wPEol ("accesorio gratis por cualquier compra ... en todas nuestras sucursales"),
       Df0PZ-HDu_j. Cuando termina, el sitio vuelve solo al precio "antes" de cada producto. */
    campaign: {
      id: "blackfriday",
      name: "Black Friday",
      from: "2026-11-16",
      to: "2026-11-30",
      upTo: 40,
      gift: "1 accesorio gratis por cualquier compra",
      // Accesorios que muestra la pieza "Accesorios de regalo" (Df21PuBFsA_, slide 3)
      gifts: ["Shaker ProSupps", "Shaker Dragon Pharma", "Mochila Bolivia Fitness", "Gorra Bolivia Fitness"],
      img: "assets/img/bf-accesorios.webp",
      src: IG + "Df21PuBFsA_/",
    },

    /* Catálogo. price = precio Black Friday ("AHORA"), before = precio "ANTES" impreso en la
       etiqueta del mismo post. line = familia, para cambiar de tamaño (30 ↔ 60 ↔ 200 servicios). */
    products: [
      // Carrusel "Todas nuestras creatinas ... a precio Black Friday" (Df-1xcVjsis, slides 2–8)
      { id: "dp-creatine-30", line: "dp-creatine", brand: "dp", cat: "creatinas", name: "Creatine Monohydrate Essentials", short: "Creatina DP 30 servicios",
        size: "30 servicios · 150 g", servings: 30, flavor: "Sin sabor", price: 219, before: 250, img: "assets/product/dp-creatine-30.webp",
        desc: "Creatina monohidratada 100% micronizada, 5 g por servicio.", src: IG + "Df-1xcVjsis/" },
      { id: "dp-creatine-60", line: "dp-creatine", brand: "dp", cat: "creatinas", name: "Creatine Monohydrate Essentials", short: "Creatina DP 60 servicios",
        size: "60 servicios · 300 g", servings: 60, flavor: "Sin sabor", price: 319, before: 350, img: "assets/product/dp-creatine-60.webp",
        desc: "Creatina monohidratada 100% micronizada, 5 g por servicio.", src: IG + "Df-1xcVjsis/" },
      // "Creatina DP 200 servicios ... la creatina que te dura meses" (DgAZTXnDmjd)
      { id: "dp-creatine-200", line: "dp-creatine", brand: "dp", cat: "creatinas", name: "Creatine Monohydrate Essentials", short: "Creatina DP 200 servicios",
        size: "200 servicios · 1 kg", servings: 200, flavor: "Sin sabor", price: 749, before: 800, img: "assets/product/dp-creatine-200.webp", star: true,
        desc: "La creatina que te dura meses: 100% micronizada, 5 g por servicio, 200 servicios.", src: IG + "Df-1xcVjsis/" },
      // Slide 5 + "Creatina con sabor: 299 Bs" (Df-ED29B89U) + Df5rhQ1jmk7 slide 1
      { id: "dp-creatine-lemon", line: "dp-creatine-flavor", brand: "dp", cat: "creatinas", name: "Creatine Monohydrate Essentials Lemon Lime", short: "Creatina DP con sabor Lemon Lime",
        size: "45 servicios · 306 g", servings: 45, flavor: "Lemon Lime", price: 299, before: 420, img: "assets/product/dp-creatine-lemon.webp",
        desc: "Creatina con sabor: 100% micronizada, 5 g por servicio, sabor Lemon Lime.", src: IG + "Df-1xcVjsis/" },
      { id: "ps-creatine-300", line: "ps-creatine", brand: "ps", cat: "creatinas", name: "Creatine Monohydrate", short: "Creatina ProSupps 300 g",
        size: "60 servicios · 300 g", servings: 60, flavor: "Sin sabor", price: 299, before: 350, img: "assets/product/ps-creatine-300.webp",
        desc: "5000 mg de creatina micronizada por servicio. Power · Strength · Muscle growth.", src: IG + "Df-1xcVjsis/" },
      { id: "ps-creatine-1200", line: "ps-creatine", brand: "ps", cat: "creatinas", name: "Creatine Monohydrate", short: "Creatina ProSupps 1200 g",
        size: "200 servicios · 1200 g", servings: 200, flavor: "Sin sabor", price: 679, before: 740, img: "assets/product/ps-creatine-1200.webp",
        desc: "5000 mg de creatina micronizada por servicio, 200 servicios.", src: IG + "Df-1xcVjsis/" },
      { id: "ps-creatine-bluerazz", line: "ps-creatine-flavor", brand: "ps", cat: "creatinas", name: "Creatine Monohydrate Blue Razz | Unflavored", short: "Creatina ProSupps Blue Razz",
        size: "40 + 40 servicios · 502 g", servings: 80, flavor: "Blue Razz + sin sabor", price: 399, before: 450, img: "assets/product/ps-creatine-bluerazz.webp",
        desc: "5 g de creatina micronizada por servicio. Dos versiones en un envase: Blue Razz y sin sabor.", src: IG + "Df-1xcVjsis/" },

      // Carrusel "¡Black Friday en Bolivia Fitness! ... precios de locura" (Df5rhQ1jmk7)
      { id: "dp-whey-phorm", line: "dp-whey-phorm", brand: "dp", cat: "proteinas", name: "Whey Phorm", short: "Whey Phorm Horchata",
        size: "52 servicios", servings: 52, flavor: "Horchata", price: 949, before: 1000, img: "assets/product/dp-whey-phorm.webp", star: true,
        desc: "Proteína whey concentrada premium, 25 g de proteína por servicio, sabor Horchata.", src: IG + "Df5rhQ1jmk7/" },
      { id: "dp-iso-phorm", line: "dp-iso-phorm", brand: "dp", cat: "proteinas", name: "Iso Phorm", short: "Iso Phorm Apple Pie",
        size: "25 servicios", servings: 25, flavor: "Apple Pie", price: 599, before: 650, img: "assets/product/dp-iso-phorm.webp",
        desc: "Proteína whey aislada premium, 25 g de proteína por servicio, sabor Apple Pie.", src: IG + "Df5rhQ1jmk7/" },
      { id: "dp-glutamine", line: "dp-glutamine", brand: "dp", cat: "recuperacion", name: "Glutamine Fermented Essentials", short: "Glutamina DP",
        size: "60 servicios", servings: 60, flavor: "Sin sabor", price: 249, before: 300, img: "assets/product/dp-glutamine.webp",
        desc: "Glutamina fermentada, vegana, 5 g por servicio.", src: IG + "Df5rhQ1jmk7/" },
      { id: "dp-fema-trope", line: "dp-fema-trope", brand: "dp", cat: "ellas", name: "Fema Trope", short: "Fema Trope",
        size: "60 cápsulas", servings: 60, flavor: null, price: 359, before: 430, img: "assets/product/dp-fema-trope.webp",
        desc: "Línea Hardcore Ladies de Dragon Pharma. Según la etiqueta: apoya el crecimiento muscular magro y la recuperación, la salud celular y la absorción de nutrientes.", src: IG + "Df5rhQ1jmk7/" },

      // "Venom Inferno: 299 Bs" (Df-ED29B89U, 20 nov). "Antes Bs. 350" (DfTDD37uJzc).
      { id: "dp-venom-inferno", line: "dp-venom", brand: "dp", cat: "preentrenos", name: "Venom Inferno", short: "Venom Inferno",
        size: "Pre-entreno", servings: null, flavor: null, price: 299, before: 350, img: "assets/product/dp-venom-inferno.webp", star: true,
        desc: "El pre-entreno de Dragon Pharma. Productos originales con registro SENASAG y sello de autenticidad.", src: IG + "Df-ED29B89U/" },

      // "INCREDBULK – ProSupps Antes Bs 590" (DflSNzoJeel, promo 1–15 nov ya vencida → se usa el precio regular publicado).
      { id: "ps-incredibulk", line: "ps-incredibulk", brand: "ps", cat: "ganadores", name: "Incredibulk", short: "Incredibulk",
        size: "16 servicios", servings: 16, flavor: null, price: 590, before: null, noCampaign: true, img: "assets/product/ps-incredibulk.webp",
        desc: "Ganador de masa de ProSupps: 25 g de proteína por servicio. Precio regular publicado; consultá si tiene precio Black Friday.", src: IG + "DflSNzoJeel/" },
    ],

    // "Descubrí nuestras ofertas": solo posts de la campaña vigente
    offers: [
      { img: "assets/img/bf-40off.webp", href: IG + "Df21PuBFsA_/", alt: "Hasta 40% de descuento del 16 al 30 de noviembre" },
      { img: "assets/img/bf-creatinas.webp", href: IG + "Df-1xcVjsis/", alt: "Todas nuestras creatinas a precio Black Friday" },
      { img: "assets/img/bf-accesorios.webp", href: IG + "Df21PuBFsA_/", alt: "Accesorios de regalo por la compra de tu suplemento" },
      { img: "assets/img/bf-lemon.webp", href: IG + "Df5rhQ1jmk7/", alt: "Creatina DP Lemon Lime antes 420 Bs, ahora 299 Bs" },
      { img: "assets/img/bf-whey.webp", href: IG + "Df5rhQ1jmk7/", alt: "Whey Phorm antes 1000 Bs, ahora 949 Bs" },
      { img: "assets/img/bf-modo-on.webp", href: IG + "DgAZTXnDmjd/", alt: "Modo Black Friday ON: Creatina DP 200 servicios" },
      { img: "assets/img/bf-creatina-dp.webp", href: IG + "Df21PuBFsA_/", alt: "Creatine Monohydrate Dragon Pharma 200 servicios" },
      { img: "assets/img/bf-launch.webp", href: IG + "Df0PZ-HDu_j/", alt: "Black Friday del 16 al 30 de noviembre" },
    ],

    // Los más buscados (con video propio de la marca)
    featured: [
      { ref: "dp-venom-inferno", tag: "Pre-entreno", video: "assets/video/venom-delivery", img: "assets/video/venom-delivery.webp",
        title: "Venom Inferno a Bs 299", text: "El pre-entreno de Dragon Pharma al precio más bajo del año.", url: IG + "Df-ED29B89U/" },
      { ref: "dp-creatine-30", tag: "Creatina", video: "assets/video/bf-precios", img: "assets/video/bf-precios.webp",
        title: "Creatina desde Bs 219", text: "Creatina 30 servicios a 219 Bs y con sabor a 299 Bs. Válido a nivel nacional.", url: IG + "Df-ED29B89U/" },
      { ref: null, tag: "Nuevo", video: "assets/video/dp-sabores", img: "assets/video/dp-sabores.webp",
        title: "Nuevos sabores Dragon Pharma", text: "Novedades y sabores en colaboración con Derek Lunsford. Ya disponibles en todas nuestras sucursales.", url: IG + "Dfskk-1Pv62/" },
    ],

    /* Sucursales. Solo lo publicado:
       - Ciudades: bio de Instagram (Santa Cruz • La Paz • Cochabamba • Sucre • Oruro • El Alto • Tarija).
       - Cochabamba tiene 2 sucursales (post de Facebook "2da sucursal en Cochabamba").
       - Sucre: dirección y horario (DWRynTMDr3y).
       - Santa Cruz: horario 11:00–22:00 (post de Facebook de la marca).
       Sin dirección/horario publicados → se muestran sin hora y el pedido va al WhatsApp nacional. */
    branches: [
      { id: "santa-cruz", name: "Santa Cruz", city: "Santa Cruz", open: "11:00", close: "22:00", whatsapp: "59175666702", hoursSrc: "facebook.com/Boliviafitnessbol" },
      { id: "la-paz", name: "La Paz", city: "La Paz", whatsapp: "59175666702" },
      { id: "el-alto", name: "El Alto", city: "El Alto", whatsapp: "59175666702" },
      { id: "cochabamba", name: "Cochabamba", city: "Cochabamba", note: "2 sucursales", whatsapp: "59175666702" },
      { id: "sucre", name: "Sucre", city: "Sucre", open: "10:00", close: "22:00", whatsapp: "59175666702",
        address: "Calle Camargo #526 (Multicentro Libertad), entrada a mano izquierda", src: IG + "DWRynTMDr3y/" },
      { id: "oruro", name: "Oruro", city: "Oruro", whatsapp: "59175666702" },
      { id: "tarija", name: "Tarija", city: "Tarija", whatsapp: "59175666702" },
    ],

    // "Envíos gratis a domicilio y envíos a nivel nacional" (DfTDD37uJzc, DfPpQ9jlmBB, DfK8C--g055)
    delivery: "Envíos gratis a domicilio y envíos a nivel nacional.",

    facts: [
      "Bolivia Fitness es representante oficial en Bolivia de los suplementos americanos Dragon Pharma y ProSupps.",
      "Hay tiendas en Santa Cruz, La Paz, Cochabamba (2 sucursales), Sucre, Oruro, El Alto y Tarija.",
      "Los productos son originales, con registro SENASAG y sello de autenticidad.",
      "Hacen envíos gratis a domicilio y envíos a nivel nacional.",
      "Black Friday: hasta 40% de descuento del 16 al 30 de noviembre de 2026, y 1 accesorio gratis por cualquier compra, en todas las sucursales y por delivery.",
      "Los accesorios de regalo que muestran son shakers ProSupps y Dragon Pharma, mochila y gorra Bolivia Fitness.",
      "Para información y pedidos: WhatsApp 75666702.",
      "Sucre: Calle Camargo #526 (Multicentro Libertad), abierto todos los días de 10:00 a 22:00.",
      "Dragon Pharma lanzó nuevos sabores en colaboración con Derek Lunsford, disponibles en todas las sucursales.",
      "Bolivia Fitness estuvo en la Expocruz 2026 y en la FEIPOBOL de Potosí (stand 77), y fue auspiciador del Bolivia Super Show 2026.",
    ],

    reels: [
      { src: "assets/video/bf-launch", caption: "El Black Friday ya está aquí 🖤🔥", url: IG + "Df0Gh8wPEol/" },
      { src: "assets/video/bf-precios", caption: "Se acabó pagar precio completo 💥", url: IG + "Df-ED29B89U/" },
      { src: "assets/video/venom-299", caption: "Venom Inferno a 299 Bs 🐉", url: IG + "DfcrGfTsUg-/" },
      { src: "assets/video/teaser-bf", caption: "¿10%… 40%… o 100%? 👀", url: IG + "DfySEH4uo6E/" },
      { src: "assets/video/dp-sabores", caption: "Nuevos sabores, otro nivel 🔥", url: IG + "Dfskk-1Pv62/" },
      { src: "assets/video/pov-leo", caption: "POV: convenciendo a Leo 😂", url: IG + "DfLPCNngb0P/" },
      { src: "assets/video/feipobol", caption: "¡Potosí, prepárense! 🦁", url: IG + "DfYcHMdOGn8/" },
      { src: "assets/video/venom-delivery", caption: "Más potencia, mejor precio 🔥", url: IG + "DfTDD37uJzc/" },
    ],

    feed: [
      { img: "assets/img/expocruz.webp", url: IG + "Dd7MfSkGlHk/", alt: "Expocruz en modo Bolivia Fitness" },
      { img: "assets/img/bf-40off.webp", url: IG + "Df21PuBFsA_/", alt: "Black Friday hasta 40%" },
      { img: "assets/img/training.webp", url: IG + "Ddxb4-6jmzv/", alt: "Entrenamiento en Expocruz" },
      { img: "assets/img/bf-creatinas.webp", url: IG + "Df-1xcVjsis/", alt: "Todas nuestras creatinas" },
      { img: "assets/img/expocruz-dia3.webp", url: IG + "DdrxkCiDruq/", alt: "Expocruz día 3" },
      { img: "assets/img/bf-accesorios.webp", url: IG + "Df21PuBFsA_/", alt: "Accesorios de regalo" },
      { img: "assets/img/mejor-precio.webp", url: IG + "DfPpQ9jlmBB/", alt: "Tu mejor versión al mejor precio" },
      { img: "assets/img/bf-modo-on.webp", url: IG + "DgAZTXnDmjd/", alt: "Modo Black Friday ON" },
    ],
  };

  /* ---------- funciones puras compartidas por el sitio y el asistente ---------- */

  // Fecha local "YYYY-MM-DD" en la zona horaria de la tienda
  BFIT.localDate = function (now) {
    const d = now instanceof Date ? now : new Date(now || Date.now());
    return new Intl.DateTimeFormat("en-CA", { timeZone: BFIT.config.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  };

  BFIT.campaignActive = function (now) {
    const c = BFIT.campaign; if (!c) return false;
    const day = BFIT.localDate(now);
    return day >= c.from && day <= c.to;
  };

  // Precio vigente: precio de campaña mientras dura; después, el precio "antes" (regular).
  BFIT.priceOf = function (p, now) {
    if (!p) return null;
    if (p.noCampaign || !p.before) return p.price;
    return BFIT.campaignActive(now) ? p.price : p.before;
  };

  BFIT.catalog = function (now) {
    const out = {};
    const active = BFIT.campaignActive(now);
    for (const p of BFIT.products) {
      const price = BFIT.priceOf(p, now);
      const before = active && p.before && !p.noCampaign ? p.before : null;
      out[p.id] = {
        id: p.id, name: p.name, short: p.short, kind: "producto", cat: p.cat, line: p.line,
        brand: BFIT.brands[p.brand].name, size: p.size, servings: p.servings, flavor: p.flavor,
        price, before, save: before ? before - price : 0,
        off: before ? Math.round((1 - price / before) * 100) : 0,
        perServing: p.servings ? Math.round((price / p.servings) * 100) / 100 : null,
        desc: p.desc, img: p.img, star: !!p.star, src: p.src,
      };
    }
    return out;
  };

  BFIT.money = (n) => "Bs " + Number(n).toLocaleString("es-BO", { maximumFractionDigits: 2 });

  BFIT.branchById = (id) => BFIT.branches.find((b) => b.id === id) || null;

  /* Mensaje de WhatsApp: mismo formato para el checkout del sitio y para LeonIA.
     o = { lines:[{id,qty}], mode, branch, address, reference, when, name, gift, note, payment, location:{lat,lng}, orderId, topic, question } */
  BFIT.orderMessage = function (o, now) {
    const cat = BFIT.catalog(now);
    const L = [];
    if (o.mode === "question") {
      L.push("¡Hola Bolivia Fitness! 🦁 Tengo una consulta" + (o.topic ? " sobre " + o.topic : "") + ":");
      if (o.question) L.push(o.question);
    } else {
      L.push("¡Hola Bolivia Fitness! 🦁 Quiero hacer un pedido" + (o.orderId ? " (" + o.orderId + ")" : "") + ":");
      let total = 0;
      for (const ln of o.lines || []) {
        const p = cat[ln.id]; if (!p) continue;
        const sub = p.price * ln.qty; total += sub;
        L.push("• " + ln.qty + "× " + p.short + " (" + p.size + ") — " + BFIT.money(sub));
      }
      L.push("Total: " + BFIT.money(total));
      if (BFIT.campaignActive(now)) L.push("🎁 Accesorio de regalo: " + (o.gift || "el que esté disponible"));
    }
    const b = BFIT.branchById(o.branch);
    const modes = { delivery: "🚚 Envío a domicilio", pickup: "🏬 Retiro en tienda", national: "📦 Envío a otra ciudad" };
    if (modes[o.mode]) L.push(modes[o.mode] + (b ? " · " + b.name : ""));
    if (o.mode !== "pickup" && o.mode !== "question" && o.address) L.push("📍 Dirección: " + o.address + (o.reference ? " (Ref: " + o.reference + ")" : ""));
    if (o.location && isFinite(o.location.lat)) L.push("📌 Ubicación: https://maps.google.com/?q=" + (+o.location.lat).toFixed(6) + "," + (+o.location.lng).toFixed(6));
    if (o.mode !== "question") L.push("⏰ " + (!o.when || o.when === "asap" ? "Lo antes posible" : "Para las " + o.when));
    if (o.name) L.push("👤 Nombre: " + o.name);
    if (o.payment) L.push("💳 Pago: " + o.payment);
    if (o.note) L.push("📝 Nota: " + o.note);
    return L.join("\n");
  };

  BFIT.waLink = (number, text) => "https://wa.me/" + number + "?text=" + encodeURIComponent(text);

  return BFIT;
});
