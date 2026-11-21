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
  // Carpeta de Drive con el catálogo completo de la marca (tarjetas Black Friday y fotos de sucursales)
  const DRIVE = "https://drive.google.com/drive/folders/1WF946oKR0KDPLAZhBgRSnmWkP7QJesSD";
  // Producto del catálogo de Drive: imagen en assets/product/<id>.webp
  const P = (id, line, brand, cat, name, short, size, servings, flavor, price, before, desc, extra) =>
    Object.assign({ id, line, brand, cat, name, short, size, servings, flavor, price, before, img: "assets/product/" + id + ".webp", desc, src: DRIVE }, before == null ? { noCampaign: true } : {}, extra || {});

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
      bf: { name: "Bolivia Fitness", ig: "https://www.instagram.com/boliviafitness/" },
    },

    categories: [
      { id: "creatinas", name: "Creatinas" },
      { id: "proteinas", name: "Proteínas" },
      { id: "preentrenos", name: "Pre-entrenos" },
      { id: "recuperacion", name: "Recuperación" },
      { id: "ellas", name: "Para ellas" },
      { id: "ganadores", name: "Ganadores de masa" },
      { id: "aminoacidos", name: "Aminoácidos e hidratación" },
      { id: "quemadores", name: "Quemadores y definición" },
      { id: "salud", name: "Salud y bienestar" },
      { id: "accesorios", name: "Accesorios" },
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
        size: "16 servicios", servings: 16, flavor: "Chocolate Ice Cream", price: 549, before: 590, img: "assets/product/ps-incredibulk.webp",
        desc: "Ganador de masa de ProSupps: 25 g de proteína por servicio, sabor Chocolate Ice Cream.", src: DRIVE },

      /* ---------- Catálogo completo de la marca (carpeta de Drive "Bolivia Fitness", 21/11/2026) ----------
         Cada tarjeta Black Friday trae ANTES / AHORA impresos; "NUEVO PRODUCTO · por lanzamiento" = sin precio antes.
         Lo que no se lee en la etiqueta queda en null (no se inventa). */
      // Pre-entrenos
      P("dp-venom", "dp-venom-extreme", "dp", "preentrenos", "Venom Extreme Potency Pre-Workout", "Venom Grape", "40 servicios", 40, "Grape", 289, 330,
        "Pre-entreno de potencia extrema: energía y foco con Infinergy y cafeína, pump con Nitrosigine. Según la etiqueta: mejora la resistencia en el entrenamiento.", { star: true }),
      P("dp-venom-inferno-mangonada", "dp-venom-inferno-mangonada", "dp", "preentrenos", "Venom Inferno Mangonada", "Venom Inferno Mangonada", "20 servicios", 20, "Mangonada", 349, 400,
        "El Venom Inferno (pre-entreno de alto estímulo) en sabor Mangonada."),
      P("dp-venom-catalyst", "dp-venom-catalyst", "dp", "preentrenos", "Venom Fully-Loaded Pre-Workout Catalyst", "Venom Fully Loaded", "20 servicios · 491 g", 20, null, 379, 430,
        "Pre-entreno completo de Dragon Pharma: pump y rendimiento, energía extrema y foco."),
      P("dp-venom-essential", "dp-venom-essential", "dp", "preentrenos", "Venom Essential", "Venom Essential", "30 servicios", 30, null, 329, 380,
        "Pre-entreno diario (daily pre-workout formula): energía, foco y pump con óxido nítrico."),
      P("dp-mr-veinz", "dp-mr-veinz", "dp", "preentrenos", "Mr. Veinz Extreme Pump Catalyst", "Mr. Veinz Mango", "20–40 servicios · 380 g", 40, "Mango", 299, 420,
        "Pre-entreno de pump extremo (Extreme Pump Catalyst): máxima congestión muscular."),
      P("ps-hyde-xtreme", "ps-hyde-xtreme", "ps", "preentrenos", "Hyde Xtreme", "Hyde Xtreme Green Apple", "30 servicios · 222 g", 30, "Green Apple", 329, 380,
        "Pre-entreno de alta energía de ProSupps (hard-hitting energy pre-workout), sabor Green Apple."),
      P("ps-jekyll-hyde", "ps-jekyll-hyde", "ps", "preentrenos", "Jekyll & Hyde Nightmare", "Jekyll & Hyde Nightmare", "20 + 20 servicios", 40, "Blue Razz + Blood Berry", 399, 450,
        "Pre-entreno nootrópico + power: dos fórmulas en un envase (Jekyll y Hyde) para tomar por separado o combinadas (Berry Punch)."),
      P("dp-juicy-pump", "dp-juicy-pump", "dp", "preentrenos", "Juicy Pump Glycerol Pump Matrix", "Juicy Pump Mangonada", "Líquido", null, "Mangonada", 400, null,
        "Nuevo: matriz de pump con glicerol, sabor Mangonada. Precio por lanzamiento.", { isNew: true }),
      P("dp-venom-dl", "dp-venom-dl", "dp", "preentrenos", "Venom Derek Lunsford Signature Series", "Venom Sour Gummy · Derek Lunsford", "20 servicios · 491 g", 20, "Sour Gummy", 430, null,
        "Nuevo: edición firma de Derek Lunsford del Venom (fully-loaded pre-workout catalyst), sabor Sour Gummy. Precio por lanzamiento.", { isNew: true, star: true }),
      P("dp-venom-essential-dl", "dp-venom-essential-dl", "dp", "preentrenos", "Venom Essential Derek Lunsford", "Venom Essential Sour Gummy · Derek Lunsford", "30 servicios · 481 g", 30, "Sour Gummy", 380, null,
        "Nuevo: Venom Essential (pre-entreno diario) edición Derek Lunsford, sabor Sour Gummy. Precio por lanzamiento.", { isNew: true }),

      // Proteínas
      P("dp-whey-phorm-cappuccino", "dp-whey-phorm-cappuccino", "dp", "proteinas", "Whey Phorm Premium Whey Protein Matrix", "Whey Phorm Cappuccino 5 lb", "64 servicios · 5 lb", 64, "Cappuccino", 949, 1000,
        "Matriz de proteína whey premium, 25 g de proteína por servicio, sabor Cappuccino.", { star: true }),
      P("dp-whey-phorm-brownie", "dp-whey-phorm-brownie", "dp", "proteinas", "Whey Phorm", "Whey Phorm Double Chocolate Brownie 2 lb", "28 servicios · 2 lb", 28, "Double Chocolate Brownie", 499, 550,
        "Proteína whey premium, 24 g de proteína por servicio, sabor Double Chocolate Brownie."),
      P("dp-iso-phorm-cookies", "dp-iso-phorm-cookies", "dp", "proteinas", "Iso Phorm Premium Whey Protein Isolate", "Iso Phorm Cookies & Cream 5 lb", "73 servicios", 73, "Cookies & Cream", 1149, 1200,
        "Proteína whey aislada premium, 25 g de proteína por servicio, sabor Cookies & Cream."),
      P("dp-iso-phorm-blueberry", "dp-iso-phorm-blueberry", "dp", "proteinas", "Iso Phorm Premium Whey Protein Isolate", "Iso Phorm Blueberry Ice Cream", "28 servicios", 28, "Blueberry Ice Cream", 599, 650,
        "Proteína whey aislada premium, 25 g de proteína por servicio, sabor Blueberry Ice Cream."),
      P("dp-iso-phorm-cinnamon", "dp-iso-phorm-cinnamon", "dp", "proteinas", "Iso Phorm Derek Lunsford Signature Series", "Iso Phorm Cinnamon Roll · Derek Lunsford", "25 servicios", 25, "Cinnamon Roll", 650, null,
        "Nuevo: proteína whey aislada edición firma de Derek Lunsford, 25 g de proteína por servicio, sabor Cinnamon Roll. Precio por lanzamiento.", { isNew: true, star: true }),
      P("ps-whey-5lb", "ps-whey-5lb", "ps", "proteinas", "Whey Protein", "Whey ProSupps Rich Chocolate 5 lb", "60 servicios · 2,34 kg", 60, "Rich Chocolate (Ghirardelli)", 949, 1000,
        "Proteína whey de ProSupps, 24 g de proteína por servicio, chocolate Ghirardelli."),
      P("ps-whey-2lb", "ps-whey-2lb", "ps", "proteinas", "Whey Protein", "Whey ProSupps Rich Chocolate 2 lb", "30 servicios · 1,17 kg", 30, "Rich Chocolate (Ghirardelli)", 499, 550,
        "Proteína whey de ProSupps, 24 g de proteína por servicio, chocolate Ghirardelli."),
      P("ps-whey-vanilla", "ps-whey-vanilla", "ps", "proteinas", "Whey Premium Protein", "Whey ProSupps Vanilla", "69 servicios", 69, "Vanilla", 799, 850,
        "Proteína premium de ProSupps, 24 g de proteína por servicio, sabor vainilla."),

      // Aminoácidos e hidratación
      P("dp-beta-alanine", "dp-beta-alanine", "dp", "aminoacidos", "Beta Alanine Essentials", "Beta Alanina DP", "60 servicios · 192 g", 60, "Sin sabor", 249, 290,
        "Beta alanina, 3,2 g por servicio, sin sabor."),
      P("dp-l-citrulline", "dp-l-citrulline", "dp", "aminoacidos", "L-Citrulline Essentials", "L-Citrulina DP", "60 servicios · 180 g", 60, "Sin sabor", 289, 330,
        "L-citrulina, 3 g por servicio, sin sabor."),
      P("dp-dr-feaar", "dp-dr-feaar", "dp", "aminoacidos", "Dr. Feaar Advanced Full-Spectrum EAA Formula", "Dr. Feaar EAA", "Aminoácidos esenciales", null, null, 299, 350,
        "Fórmula de aminoácidos esenciales (EAA) de espectro completo. Según la etiqueta: apoya la síntesis de proteína muscular y la recuperación, la capacidad de entrenamiento y la reposición de electrolitos."),
      P("ps-hydrobcaa-eaa", "ps-hydrobcaa-eaa", "ps", "aminoacidos", "HydroBCAA + EAA", "HydroBCAA + EAA Blue Razz", "30 servicios", 30, "Blue Razz", 269, 320,
        "Matriz de aminoácidos (BCAA + EAA) con electrolitos, para recuperación y rendimiento."),
      P("ps-ioniq", "ps-ioniq", "ps", "aminoacidos", "ionIQ Intelligent Hydration", "ionIQ Hidratación Raspberry & Peach", "30 sobres", 30, "Raspberry & Peach", 249, 300,
        "Hidratación con electrolitos y creatina en sobres individuales: agregá agua y listo."),

      // Quemadores y definición
      P("dp-black-viper", "dp-black-viper", "dp", "quemadores", "Black Viper", "Black Viper DP", "90 cápsulas", 90, null, 329, 380,
        "Quemador termogénico con estimulantes. Según la etiqueta: energía, quema de calorías y mejor ánimo y foco."),
      P("dp-dry-up", "dp-dry-up", "dp", "quemadores", "Dry Up High Potency Diuretic", "Dry Up DP", "80 cápsulas", 80, null, 309, 350,
        "Diurético de alta potencia sin estimulantes. Según la etiqueta: apoyo diurético natural y ayuda a eliminar el exceso de agua."),
      P("dp-cla", "dp-cla", "dp", "quemadores", "CLA Human First", "CLA DP", "90 cápsulas blandas", 90, null, 249, 290,
        "Ácido linoleico conjugado. Según la etiqueta: apoya una composición corporal saludable y el metabolismo."),
      P("dp-lcarnitine-3000", "dp-lcarnitine-3000", "dp", "quemadores", "L-Carnitine 3000", "L-Carnitina 3000 DP", "32 servicios · líquida", 32, null, 299, 350,
        "L-carnitina líquida sin estimulantes, 3.000 mg por servicio."),
      P("ps-lcarnitine-3000", "ps-lcarnitine-3000", "ps", "quemadores", "L-Carnitine 3000 Liquid Shot", "L-Carnitina 3000 ProSupps", "Líquida · 3.000 mg por servicio", null, "Berry", 229, 320,
        "L-carnitina líquida (energizante metabólico), 3.000 mg por servicio, sabor Berry."),
      P("ps-lcarnitine-1500", "ps-lcarnitine-1500", "ps", "quemadores", "L-Carnitine 1500 Liquid Shot", "L-Carnitina 1500 ProSupps", "Líquida · 1.500 mg por servicio", null, "Berry", 199, null,
        "L-carnitina líquida (energizante metabólico), 1.500 mg por servicio, sabor Berry."),

      // Salud y bienestar (línea Human First de Dragon Pharma)
      P("dp-multi-rx", "dp-multi-rx", "dp", "salud", "Multi RX Human First", "Multi RX DP", "60 tabletas", 60, null, 269, 320,
        "Multivitamínico de espectro completo con minerales esenciales, para el equilibrio nutricional diario."),
      P("dp-omega3", "dp-omega3", "dp", "salud", "Omega 3 Human First", "Omega 3 DP", "60 cápsulas blandas", 60, null, 249, 290,
        "Según la etiqueta: apoya la salud cardiovascular, la función cognitiva y el equilibrio inflamatorio."),
      P("dp-joints", "dp-joints", "dp", "salud", "Joints Human First", "Joints DP", "60 cápsulas", 60, null, 269, 320,
        "Según la etiqueta: apoya la función articular, los cartílagos y el tejido conectivo."),
      P("dp-liver", "dp-liver", "dp", "salud", "Liver Human First", "Liver DP", "90 cápsulas", 90, null, 269, 320,
        "Según la etiqueta: ayuda a mantener enzimas hepáticas saludables y la función del hígado."),
      P("dp-tudca", "dp-tudca", "dp", "salud", "TUDCA Human First", "TUDCA DP", "30 cápsulas", 30, null, 320, null,
        "Según la etiqueta: apoya la salud del hígado, el metabolismo de las grasas y la desintoxicación."),
      P("dp-probiotics", "dp-probiotics", "dp", "salud", "Pre & Probiotics Human First", "Pre & Probióticos DP", "30 cápsulas", 30, null, 269, 320,
        "Según la etiqueta: apoya la flora intestinal, una digestión equilibrada y el sistema inmune."),
      P("dp-greens-reds", "dp-greens-reds", "dp", "salud", "Greens & Reds Organic and Vegan Superfood", "Greens & Reds DP", "Superalimento en polvo", null, null, 329, 380,
        "Superalimento orgánico y vegano de verduras y frutas. Según la etiqueta: apoya el sistema inmune y la salud digestiva."),

      // Recuperación
      P("dp-hydra", "dp-hydra", "dp", "recuperacion", "Hydra High-Potency Natural Anabolic", "Hydra DP", "120 cápsulas", 120, null, 359, 430,
        "Anabólico natural de alta potencia. Según la etiqueta: apoya la síntesis de proteína muscular, la hipertrofia y el pump."),

      // Accesorios (merch oficial)
      P("bf-shaker", "bf-shaker", "bf", "accesorios", "Shaker exclusivo", "Shaker exclusivo Dragon o ProSupps", "Shaker", null, null, 109, 150, "Shaker exclusivo Dragon Pharma (blanco o negro) o ProSupps."),
      P("bf-gorra", "bf-gorra", "bf", "accesorios", "Gorra Bolivia Fitness", "Gorra BF", "Gorra", null, "Blanca o negra", 109, 150, "Gorra Bolivia Fitness con el león bordado."),
      P("bf-chulo", "bf-chulo", "bf", "accesorios", "Chulo Bolivia Fitness", "Chulo BF", "Gorro de lana", null, "Negro o blanco", 109, 150, "Chulo (gorro de lana) Bolivia Fitness."),
      P("bf-mochila", "bf-mochila", "bf", "accesorios", "Mochila de tiras Bolivia Fitness", "Mochila de tiras BF", "Mochila", null, null, 109, 150, "Mochila de tiras Bolivia Fitness."),
      P("dp-gorro", "dp-gorro", "dp", "accesorios", "Gorro Dragon", "Gorro Dragon", "Gorro de lana", null, "Negro", 109, 150, "Gorro de lana negro con el logo de Dragon Pharma."),
      P("dp-tumbler", "dp-tumbler", "dp", "accesorios", "Dragon Tumbler 10 Years", "Dragon Tumbler", "Vaso térmico", null, null, 349, 400, "Vaso térmico Dragon Pharma edición 10 años, con asa y tapa."),
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
      // Santa Cruz: 4 tiendas (fotos de la carpeta de Drive de la marca)
      { id: "santa-cruz", name: "Santa Cruz", city: "Santa Cruz", open: "11:00", close: "22:00", whatsapp: "59175666702", hoursSrc: "facebook.com/Boliviafitnessbol", note: "4 tiendas",
        address: "Ventura Mall (planta baja) · Calle Ñuflo de Chávez #424 · Cine Center (planta baja) · Shopping Fidalga (piso 2)",
        stores: [
          { name: "Ventura Mall", addr: "Planta baja", img: "assets/stores/sc-ventura-mall.webp" },
          { name: "Calle Ñuflo de Chávez #424", addr: "Tienda a la calle", img: "assets/stores/sc-nuflo-de-chavez.webp" },
          { name: "Cine Center", addr: "Planta baja", img: "assets/stores/sc-cine-center.webp" },
          { name: "Shopping Fidalga", addr: "Piso 2", img: "assets/stores/sc-shopping-fidalga.webp" },
        ], src: DRIVE },
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
      "Hay tiendas en Santa Cruz (4 tiendas), La Paz, Cochabamba (2 sucursales), Sucre, Oruro, El Alto y Tarija.",
      "Santa Cruz tiene 4 tiendas: Ventura Mall (planta baja), Calle Ñuflo de Chávez #424, Cine Center (planta baja) y Shopping Fidalga (piso 2). Horario publicado: 11:00 a 22:00.",
      "Catálogo completo: creatinas, proteínas (Whey Phorm, Iso Phorm, Whey ProSupps), pre-entrenos (familia Venom, Mr. Veinz, Hyde Xtreme, Jekyll & Hyde), aminoácidos e hidratación, quemadores (Black Viper, L-carnitina, CLA, Dry Up), la línea de salud Human First de Dragon Pharma y accesorios oficiales.",
      "Nuevos productos por lanzamiento (edición Derek Lunsford): Venom Sour Gummy Bs 430, Venom Essential Sour Gummy Bs 380 e Iso Phorm Cinnamon Roll Bs 650; también Juicy Pump Mangonada Bs 400.",
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
        desc: p.desc, img: p.img, star: !!p.star, isNew: !!p.isNew, src: p.src,
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
