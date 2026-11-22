/* Bolivia Fitness · inglés / español y modo claro / oscuro.
   El sitio se escribe en español (fuente única: HTML + js/data.js). En inglés, este archivo
   traduce lo que se ve en pantalla: textos, aria-label, placeholder, alt, title y data-ask.
   Un MutationObserver traduce también lo que las páginas dibujan después (bolsa, filtros,
   LeonIA, cuenta regresiva…). Al volver a español se restaura el texto original.
   No se traduce: lo marcado con data-no-i18n (mensajes de LeonIA y del cliente, vista previa
   del WhatsApp que recibe la tienda) ni los nombres de productos y marcas. */
(function () {
  "use strict";
  const root = document.documentElement;

  /* ---------- diccionario exacto (texto recortado → inglés) ---------- */
  const D = {
    // navegación y layout
    "Saltar al contenido": "Skip to content", "Principal": "Main", "Bolivia Fitness, inicio": "Bolivia Fitness, home",
    "Inicio": "Home", "Tienda": "Shop", "Ofertas": "Deals", "Sucursales": "Stores", "Nosotros": "About us",
    "Buscar productos": "Search products", "Abrir bolsa": "Open bag", "Menú": "Menu", "Menú móvil": "Mobile menu", "Mi bolsa": "My bag",
    "Comprar ofertas →": "Shop deals →", "Comprar ofertas": "Shop deals", "Ruta": "Breadcrumb",
    "Representantes oficiales de Dragon Pharma y ProSupps en Bolivia. Suplementos americanos originales con registro SENASAG.": "Official Dragon Pharma and ProSupps distributors in Bolivia. Genuine American supplements with SENASAG registration.",
    "Ir a la tienda": "Go to the shop", "Comprar": "Buy", "Comprar con LeonIA": "Shop with LeonIA", "Comunidad": "Community",
    "Fotos y videos: @boliviafitness": "Photos and videos: @boliviafitness",
    "Tu bolsa": "Your bag", "Cerrar bolsa": "Close bag",
    "Abrir LeonIA, tu coach y asistente": "Open LeonIA, your coach and assistant", "Armemos tu plan": "Let's build your plan",
    "Coach y recepción · 24/7": "Coach & front desk · 24/7", "Cerrar asistente": "Close assistant", "Escribí tu mensaje": "Type your message",
    "Escribí o tocá el micrófono…": "Type or tap the mic…", "Hablar con LeonIA": "Talk to LeonIA", "Enviar": "Send",
    "Tocá el micrófono y hablá": "Tap the mic and speak", "Manos libres": "Hands-free",
    "LeonIA es una IA y puede equivocarse. Confirmá tu pedido por WhatsApp.": "LeonIA is an AI and can make mistakes. Confirm your order on WhatsApp.",
    "Abrir LeonIA": "Open LeonIA", "Comprar ahora": "Shop now",
    "Agregado a tu bolsa:": "Added to your bag:", "Quitar uno": "Remove one", "Agregar uno": "Add one", "Nuevo": "New",
    "Tu bolsa está vacía.": "Your bag is empty.", "Los más buscados": "Most popular", "Combinalo con": "Pair it with",
    "🎁 1 accesorio gratis por cualquier compra. Elegiste:": "🎁 1 free accessory with any purchase. You chose:",
    "🎁 1 accesorio gratis por cualquier compra. Elegilo al finalizar.": "🎁 1 free accessory with any purchase. Choose it at checkout.",
    "Finalizar pedido": "Checkout", "días": "days", "horas": "hours", "seg": "sec",
    // LeonIA
    "Vacía": "Empty", "Ver bolsa": "View bag",
    "Armá mi plan de entrenamiento": "Build my training plan", "¿Cómo tomo la creatina?": "How do I take creatine?",
    "¿Qué sucursales están abiertas?": "Which stores are open?", "¿Qué promos hay hoy?": "What deals are on today?", "🦁 Lo de siempre": "🦁 The usual",
    "¡Hola! Soy": "Hi! I'm",
    "🦁, tu coach y recepcionista de Bolivia Fitness. Contame tu objetivo y te armo rutina, proteína y suplementos, o preguntame por sucursales, envíos y promos.": "🦁, your Bolivia Fitness coach and front desk. Tell me your goal and I'll put together your routine, protein and supplements, or ask me about stores, delivery and deals.",
    "Estoy terminando de prepararme 🛠️ Muy pronto voy a poder ayudarte a comprar.": "I'm still getting ready 🛠️ Very soon I'll be able to help you shop.",
    "Muchas preguntas seguidas 😅 Esperá un minuto y seguimos.": "Lots of questions in a row 😅 Give me a minute and we'll continue.",
    "Se cortó la conexión. Probá de nuevo en un ratito.": "The connection dropped. Please try again in a moment.",
    "Algo falló de mi lado.": "Something went wrong on my end.",
    "Mientras tanto podés ver la tienda o pedir directo por WhatsApp.": "Meanwhile, you can browse the shop or order directly on WhatsApp.",
    "Ver tienda": "View shop", "Pedir por WhatsApp": "Order on WhatsApp", "LeonIA está pensando tu respuesta…": "LeonIA is thinking…",
    "Revisá tu pedido": "Review your order", "Sí, confirmar": "Yes, confirm", "Cambiar algo": "Change something",
    "📍 Compartir mi ubicación": "📍 Share my location", "Buscando tu ubicación…": "Finding your location…", "📍 Ubicación lista": "📍 Location ready",
    "Tu navegador no permite compartir ubicación. Escribime tu dirección y una referencia 🙏": "Your browser can't share your location. Type your address and a landmark 🙏",
    "No pude obtener tu ubicación. Escribime tu dirección y una referencia, porfa.": "I couldn't get your location. Please type your address and a landmark.",
    "Pensando…": "Thinking…", "Respondiendo…": "Replying…", "Escuchando…": "Listening…", "Hablando… tocá para interrumpir": "Speaking… tap to interrupt",
    "No tengo permiso para usar el micrófono. Podés escribirme igual 🙂": "I don't have permission to use the mic. You can still type to me 🙂",
    // categorías
    "Creatinas": "Creatine", "Proteínas": "Protein", "Pre-entrenos": "Pre-workouts", "Recuperación": "Recovery", "Para ellas": "For her",
    "Ganadores de masa": "Mass gainers", "Aminoácidos e hidratación": "Amino acids & hydration", "Quemadores y definición": "Fat burners & cutting",
    "Salud y bienestar": "Health & wellness", "Accesorios": "Accessories",
    // inicio · carrusel
    "Destacados de Bolivia Fitness": "Bolivia Fitness highlights", "carrusel": "carousel", "diapositiva": "slide",
    "Bolivia Fitness · Tienda online de suplementos americanos originales Dragon Pharma y ProSupps": "Bolivia Fitness · Online store for genuine American Dragon Pharma and ProSupps supplements",
    "Elegir diapositiva": "Choose slide", "Diapositiva anterior": "Previous slide", "Diapositiva siguiente": "Next slide",
    "Reproducir carrusel": "Play carousel", "Pausar carrusel": "Pause carousel",
    "Black Friday · 16 al 30 de noviembre": "Black Friday · November 16–30", "Hasta": "Up to", "Ver la tienda": "View the shop",
    "Nuevo · edición Derek Lunsford": "New · Derek Lunsford edition", "Recién": "Just", "llegados": "arrived", "Ver lanzamientos": "See new arrivals",
    "Pre-entrenos desde": "Pre-workouts from",
    "La familia Venom completa, Mr. Veinz para un pump extremo y Hyde Xtreme. ¿No sabés cuál? LeonIA te ayuda a elegir.": "The full Venom family, Mr. Veinz for an extreme pump, and Hyde Xtreme. Not sure which? LeonIA helps you choose.",
    "Ver pre-entrenos": "See pre-workouts", "Elegir con LeonIA": "Choose with LeonIA", "¿Qué pre-entreno me conviene?": "Which pre-workout is right for me?",
    "LeonIA Coach · gratis": "LeonIA Coach · free", "Tu coach con": "Your coach with", "IA": "AI",
    "Contale tu objetivo y te arma rutina, proteína diaria y suplementos para tu presupuesto. Por texto o por voz, 24/7.": "Tell it your goal and it builds your routine, daily protein and supplements for your budget. By text or voice, 24/7.",
    "Armar mi plan": "Build my plan", "Preguntar a LeonIA": "Ask LeonIA", "¿Qué sucursales están abiertas ahora?": "Which stores are open right now?",
    "Proteína desde": "Protein from",
    "Whey Phorm, Iso Phorm y Whey ProSupps: 24–25 g de proteína por servicio, en 2 y 5 libras y sabores que dan ganas.": "Whey Phorm, Iso Phorm and Whey ProSupps: 24–25 g of protein per serving, in 2 and 5 lb tubs, in flavors you'll crave.",
    "Ver proteínas": "See proteins", "¿Cuál me conviene?": "Which one is right for me?",
    "¿Cuánta proteína necesito y cuál me conviene?": "How much protein do I need, and which one should I get?",
    "Santa Cruz · 4 tiendas": "Santa Cruz · 4 stores", "Vení a": "Come", "conocernos": "meet us",
    "Ventura Mall, Cine Center, Shopping Fidalga y Ñuflo de Chávez #424. También en La Paz, El Alto, Cochabamba, Sucre, Oruro y Tarija, con envío gratis a domicilio.": "Ventura Mall, Cine Center, Shopping Fidalga and Ñuflo de Chávez #424. Also in La Paz, El Alto, Cochabamba, Sucre, Oruro and Tarija, with free home delivery.",
    "Ver sucursales": "See stores", "Comprar online": "Shop online",
    // inicio · secciones
    "Tienda online": "Online store", "Comprá por objetivo.": "Shop by goal.", "Todo original, todo online.": "All genuine, all online.",
    "Ver toda la tienda": "See the whole shop", "OFF": "OFF",
    "En todos nuestros productos americanos, y 1 accesorio gratis por cualquier compra. Termina en:": "On all our American products, plus 1 free accessory with any purchase. Ends in:",
    "En todos nuestros productos americanos, y 1 accesorio gratis por cualquier compra.": "On all our American products, plus 1 free accessory with any purchase.",
    "Ver todas las ofertas": "See all deals", "Anterior": "Previous", "Siguiente": "Next",
    "Por qué comprar acá": "Why shop here", "La diferencia": "The difference:",
    "Destacados": "Featured", "Lo más buscado.": "Most wanted.", "Directo a tu bolsa.": "Straight to your bag.", "Ver todos los productos": "See all products",
    "Armá tu stack": "Build your stack", "Combinaciones listas.": "Ready-made combos.", "Un clic y a tu bolsa.": "One click and into your bag.",
    "En línea · 24/7": "Online · 24/7", "LeonIA · coach y recepcionista con IA": "LeonIA · AI coach and front desk",
    "Tu coach personal.": "Your personal coach.", "Gratis, por texto o voz.": "Free, by text or voice.",
    "Contale tu objetivo y te arma la rutina semanal, tu proteína diaria y el stack justo para tu presupuesto. También te dice qué sucursal está abierta, cómo llega tu envío y deja tu pedido listo para WhatsApp.": "Tell it your goal and it builds your weekly routine, your daily protein and the right stack for your budget. It also tells you which store is open, how your delivery arrives, and gets your order ready for WhatsApp.",
    "Plan a tu medida": "A plan made for you", "Rutina por días, series y repeticiones según tu nivel.": "A routine by day, with sets and reps for your level.",
    "Suplementos sin vueltas": "Supplements, no fuss", "Qué sirve, cómo tomarlo y cuánto te sale por mes.": "What works, how to take it and what it costs per month.",
    "Recepción 24/7": "24/7 front desk", "Sucursales, horarios, envíos y promos al instante.": "Stores, hours, delivery and deals, instantly.",
    "Empezá con una pregunta": "Start with a question", "💪 Ganar masa": "💪 Build muscle", "🔥 Bajar grasa": "🔥 Lose fat",
    "🦁 Empiezo en el gym": "🦁 New to the gym", "📍 Sucursales": "📍 Stores",
    "Quiero ganar masa muscular": "I want to build muscle", "Quiero bajar grasa y marcar": "I want to lose fat and get lean",
    "Empiezo en el gimnasio, ¿por dónde arranco?": "I'm new to the gym. Where do I start?", "Armar mi plan gratis": "Build my free plan",
    "Una sola manada.": "One pack.", "Mirá lo que pasa en las tiendas.": "See what's happening in our stores.", "Ver comunidad": "See community",
    // bento y stacks
    "Originales, siempre.": "Always genuine.",
    "Representantes oficiales de Dragon Pharma y ProSupps, con registro SENASAG y sello de autenticidad.": "Official Dragon Pharma and ProSupps distributors, with SENASAG registration and an authenticity seal.",
    "Envío gratis a domicilio.": "Free home delivery.", "Y envíos a nivel nacional, a cualquier ciudad de Bolivia.": "Plus nationwide shipping to any city in Bolivia.",
    "1 accesorio gratis.": "1 free accessory.", "Shaker, mochila o gorra por cualquier compra.": "A shaker, drawstring bag or cap with any purchase.",
    "Promos todo el año.": "Deals all year round.", "Seguí la tienda para no perderte ninguna.": "Follow the shop so you never miss one.",
    "7 ciudades.": "7 cities.", "Retirá en tu sucursal o mirá todo el stock en persona.": "Pick up at your store or see all the stock in person.",
    "Pedido en minutos.": "Order in minutes.", "Armamos tu mensaje de WhatsApp con todo el detalle.": "We write your WhatsApp message with every detail.",
    "Coach con IA, gratis.": "Free AI coach.", "LeonIA te arma rutina, proteína y suplementos, por texto o por voz.": "LeonIA builds your routine, protein and supplements, by text or voice.",
    "Fuerza": "Strength", "Para entrenar pesado todos los días.": "For training heavy every day.", "Volumen": "Bulk",
    "Proteína, creatina y recuperación.": "Protein, creatine and recovery.",
    "La línea Hardcore Ladies, con proteína aislada y creatina con sabor.": "The Hardcore Ladies line, with whey isolate and flavored creatine.",
    "Agregar todo": "Add all", "Precio = suma de los productos.": "Price = sum of the products.",
    "Precio = suma de los productos. Incluye 1 accesorio gratis por compra.": "Price = sum of the products. Includes 1 free accessory per order.",
    "agregado a tu bolsa": "added to your bag", "agregados a tu bolsa": "added to your bag",
    // reels y feed
    "El Black Friday ya está aquí 🖤🔥": "Black Friday is here 🖤🔥", "Se acabó pagar precio completo 💥": "No more paying full price 💥",
    "Venom Inferno a 299 Bs 🐉": "Venom Inferno for Bs 299 🐉", "¿10%… 40%… o 100%? 👀": "10%… 40%… or 100%? 👀",
    "Nuevos sabores, otro nivel 🔥": "New flavors, next level 🔥", "POV: convenciendo a Leo 😂": "POV: convincing Leo 😂",
    "¡Potosí, prepárense! 🦁": "Potosí, get ready! 🦁", "Más potencia, mejor precio 🔥": "More power, better price 🔥",
    "Expocruz en modo Bolivia Fitness": "Expocruz in Bolivia Fitness mode", "Black Friday hasta 40%": "Black Friday up to 40%",
    "Entrenamiento en Expocruz": "Training at Expocruz", "Todas nuestras creatinas": "All our creatine", "Expocruz día 3": "Expocruz day 3",
    "Accesorios de regalo": "Free gift accessories", "Tu mejor versión al mejor precio": "Your best self at the best price", "Modo Black Friday ON": "Black Friday mode ON",
    // tienda
    "La": "The", "tienda.": "shop.", "Suplementos americanos originales, listos para tu bolsa.": "Genuine American supplements, ready for your bag.",
    "Filtros": "Filters", "Categorías": "Categories", "Marca": "Brand", "Precio": "Price", "Solo ofertas": "Deals only", "Buscar": "Search",
    "Buscar creatina, whey, pre-entreno…": "Search creatine, whey, pre-workout…", "Ordenar": "Sort", "Menor precio": "Lowest price",
    "Mayor precio": "Highest price", "Mayor ahorro": "Biggest savings", "Precio por servicio": "Price per serving",
    "Todos los precios": "All prices", "Hasta Bs 300": "Up to Bs 300", "Más de Bs 600": "Over Bs 600", "Todos": "All", "Todas": "All",
    "No encontramos productos con esos filtros.": "No products match those filters.", "Limpiar filtros": "Clear filters",
    // ofertas
    "Ofertas Black Friday": "Black Friday deals", "Todas las ofertas.": "All deals.", "Ordenadas por mayor descuento.": "Sorted by biggest discount.",
    "Promociones": "Promotions", "pronto": "coming soon",
    "No hay una campaña activa en este momento. Mirá la tienda completa o seguinos para enterarte de la próxima.": "There's no active campaign right now. Browse the full shop or follow us to hear about the next one.",
    "Accesorios de regalo: shakers, mochila y gorras": "Free gift accessories: shakers, drawstring bag and caps", "De regalo": "Free gift",
    "Elegí tu accesorio.": "Choose your accessory.",
    "1 accesorio gratis por cualquier compra. Lo anotamos en tu pedido y la tienda te confirma disponibilidad.": "1 free accessory with any purchase. We note it on your order and the store confirms availability.",
    "Shaker ProSupps": "ProSupps shaker", "Shaker Dragon Pharma": "Dragon Pharma shaker", "Mochila Bolivia Fitness": "Bolivia Fitness drawstring bag",
    "Gorra Bolivia Fitness": "Bolivia Fitness cap", "Regalo:": "Gift:", "sin elegir": "none chosen", "Seguir comprando": "Keep shopping",
    // sucursales
    "Visitá una": "Visit a", "sucursal.": "store.", "Envíos gratis a domicilio": "Free home delivery",
    "y envíos a nivel nacional. ¿Preferís que te llegue?": "and nationwide shipping. Rather have it delivered?",
    "4 tiendas": "4 stores", "2 sucursales": "2 branches", "Planta baja": "Ground floor", "Tienda a la calle": "Street-front store", "Piso 2": "2nd floor",
    "Calle Camargo #526 (Multicentro Libertad), entrada a mano izquierda": "Calle Camargo #526 (Multicentro Libertad), entrance on the left",
    "Ventura Mall (planta baja) · Calle Ñuflo de Chávez #424 · Cine Center (planta baja) · Shopping Fidalga (piso 2)": "Ventura Mall (ground floor) · Calle Ñuflo de Chávez #424 · Cine Center (ground floor) · Shopping Fidalga (2nd floor)",
    "Cómo llegar ↗": "Directions ↗", "Pedir para retirar →": "Order for pickup →", "Horario: consultá por WhatsApp": "Hours: ask on WhatsApp",
    // nosotros
    "Una sola": "One", "manada.": "pack.",
    "Representantes oficiales de suplementos americanos en Bolivia, con tiendas en siete ciudades y una comunidad que no para de crecer.": "Official distributors of American supplements in Bolivia, with stores in seven cities and a community that keeps on growing.",
    "Representantes oficiales": "Official distributors", "Dragon Pharma y ProSupps, 100% originales.": "Dragon Pharma and ProSupps, 100% genuine.",
    "Suplementos americanos respaldados por registro SENASAG y sello de autenticidad. Contamos con el stock más completo: proteínas, creatinas, pre-entrenos, quemadores y mucho más.": "American supplements backed by SENASAG registration and an authenticity seal. We carry the most complete stock: proteins, creatine, pre-workouts, fat burners and much more.",
    "Venom Inferno, creatinas ProSupps e Incredibulk": "Venom Inferno, ProSupps creatine and Incredibulk",
    "Miles de personas en la Expocruz.": "Thousands of people at Expocruz.",
    "Entrenamientos a otro nivel, disciplina pura y una motivación que contagia hasta las ganas de romper tus propios límites.": "Next-level workouts, pure discipline and motivation so contagious you'll want to break your own limits.",
    "Llegamos a Sucre: Calle Camargo #526": "We arrived in Sucre: Calle Camargo #526",
    "FEIPOBOL Potosí y auspiciador del Bolivia Super Show": "FEIPOBOL Potosí and sponsor of the Bolivia Super Show",
    "La comunidad.": "The community.", "Lo que pasa en Bolivia Fitness.": "What's happening at Bolivia Fitness.",
    "Seguinos en Instagram.": "Follow us on Instagram.", "Abrir Instagram": "Open Instagram",
    "¿Viste algo que te gustó? Todo está en la tienda online.": "See something you like? It's all in the online store.",
    // producto
    "Combinalo": "Pair it", "Se lleva bien con.": "Goes well with.", "Sumalos en un clic.": "Add them in one click.",
    "Recomendados": "Recommended", "También te puede interesar.": "You might also like.", "Vistos recientemente.": "Recently viewed.",
    "No encontramos ese producto.": "We couldn't find that product.", "Destacado": "Featured", "Presentación": "Size",
    "· ¿cuál es la ideal para vos?": "· which one is right for you?", "Cantidad": "Quantity", "Menos": "Less", "Más": "More",
    "Agregar a la bolsa": "Add to bag",
    "🎁 1 accesorio gratis por cualquier compra. Precio Black Friday hasta el 30 de noviembre.": "🎁 1 free accessory with any purchase. Black Friday price through November 30.",
    "Envío gratis a domicilio": "Free home delivery", "Original · registro SENASAG": "Genuine · SENASAG registered", "Retiro en 7 ciudades": "Pickup in 7 cities",
    "Detalles del producto": "Product details", "Producto": "Product", "Servicios": "Servings", "Sabor": "Flavor", "Categoría": "Category",
    "Precio antes": "Regular price", "Envíos y retiro": "Shipping & pickup",
    "Envíos gratis a domicilio y envíos a nivel nacional. También podés retirar en cualquiera de nuestras sucursales. Al finalizar armamos tu pedido y lo enviás por WhatsApp; la tienda te confirma stock, forma de pago y envío.": "Free home delivery and nationwide shipping. You can also pick up at any of our stores. At checkout we put your order together and you send it on WhatsApp; the store confirms stock, payment method and delivery.",
    "Autenticidad": "Authenticity",
    "Bolivia Fitness es representante oficial de Dragon Pharma y ProSupps en Bolivia. Productos originales con registro SENASAG y sello de autenticidad.": "Bolivia Fitness is the official Dragon Pharma and ProSupps distributor in Bolivia. Genuine products with SENASAG registration and an authenticity seal.",
    "Alérgenos y salud": "Allergens & health",
    "No tenemos información de alérgenos publicada para este producto: consultá en la sucursal antes de comprar. Si estás embarazada, tomás medicación o tenés alguna condición de salud, consultá con un profesional antes de usar suplementos.": "We don't have published allergen information for this product: please ask at the store before buying. If you're pregnant, take medication or have a health condition, talk to a professional before using supplements.",
    "¿Tenés dudas?": "Questions?", "Preguntale a LeonIA o escribinos al WhatsApp 756 66702.": "Ask LeonIA or message us on WhatsApp 756 66702.",
    "Ver la publicación original ↗": "See the original post ↗", "Total seleccionado": "Selected total", "Agregar seleccionados": "Add selected",
    // pedido
    "Pedido": "Order", "Finalizá tu": "Complete your", "pedido.": "order.",
    "Armamos el mensaje por vos y lo enviás a Bolivia Fitness por WhatsApp. Ahí te confirman stock, forma de pago y envío.": "We write the message for you and you send it to Bolivia Fitness on WhatsApp. They'll confirm stock, payment method and delivery there.",
    "Pasos": "Steps", "Vista previa del mensaje de WhatsApp": "WhatsApp message preview", "Entrega": "Delivery", "Tus datos": "Your details",
    "← Atrás": "← Back", "Continuar": "Continue", "🎁 Accesorio de regalo (1 por compra)": "🎁 Free accessory (1 per order)",
    "El que esté disponible": "Whatever's available", "¿Solo querés hacer una consulta?": "Just want to ask a question?",
    "¿Cómo lo querés recibir?": "How would you like to get it?", "Envío a domicilio": "Home delivery", "Gratis, en tu ciudad": "Free, in your city",
    "Retiro en tienda": "Store pickup", "En tu sucursal": "At your store", "Envío a otra ciudad": "Ship to another city",
    "A cualquier lugar de Bolivia": "Anywhere in Bolivia", "Tengo una consulta": "I have a question", "Productos, stock, uso": "Products, stock, usage",
    "Tema": "Topic", "Elegí un tema": "Choose a topic", "un producto": "a product", "precios y promos": "prices and deals", "envíos": "shipping",
    "otra cosa": "something else", "Pregunta": "Question", "Nombre": "Name", "Ciudad de destino": "Destination city", "Ciudad / sucursal": "City / store",
    "Elegí": "Choose", "Abierto": "Open", "Cerrado ahora": "Closed now", "Otra ciudad": "Other city", "WhatsApp nacional": "national WhatsApp",
    "Dirección": "Address", "Referencia": "Landmark", "¿Cuándo?": "When?", "Lo antes posible": "As soon as possible", "Programar hora": "Schedule a time",
    "Hora": "Time", "Nota (opcional)": "Note (optional)", "Revisar pedido": "Review order", "Revisá y enviá": "Review and send",
    "Tu mensaje va a": "Your message goes to", "Bolivia Fitness (WhatsApp nacional)": "Bolivia Fitness (national WhatsApp)",
    ". Ahí te confirman stock, forma de pago y envío.": ". They'll confirm stock, payment method and delivery there.",
    "Enviar pedido por WhatsApp": "Send order on WhatsApp", "Agregá al menos un producto.": "Add at least one product.",
    "Elegí cómo querés recibir tu pedido.": "Choose how you'd like to get your order.", "Escribí tu pregunta.": "Type your question.",
    "Contanos tu nombre.": "Tell us your name.", "Elegí tu ciudad o sucursal.": "Choose your city or store.",
    "Necesitamos tu dirección para el envío.": "We need your address for delivery.", "¡Listo! Se abrió WhatsApp con tu pedido. 🦁": "Done! WhatsApp opened with your order. 🦁",
    // títulos de página
    "Tienda online de suplementos americanos originales": "Online store for genuine American supplements",
    "Suplementos americanos originales": "Genuine American supplements",
    // productos: nombres cortos y accesorios
    "Creatina DP con sabor Lemon Lime": "DP Creatine, Lemon Lime flavor", "Shaker exclusivo": "Exclusive shaker",
    "Shaker exclusivo Dragon o ProSupps": "Exclusive Dragon or ProSupps shaker", "Gorra BF": "BF cap", "Chulo BF": "BF chullo beanie",
    "Chulo Bolivia Fitness": "Bolivia Fitness chullo beanie", "Mochila de tiras BF": "BF drawstring bag",
    "Mochila de tiras Bolivia Fitness": "Bolivia Fitness drawstring bag", "Gorro Dragon": "Dragon beanie",
    "Blanca o negra": "White or black", "Negro o blanco": "Black or white", "Negro": "Black",
    // productos: descripciones
    "Creatina monohidratada 100% micronizada, 5 g por servicio.": "100% micronized creatine monohydrate, 5 g per serving.",
    "La creatina que te dura meses: 100% micronizada, 5 g por servicio, 200 servicios.": "The creatine that lasts you months: 100% micronized, 5 g per serving, 200 servings.",
    "Creatina con sabor: 100% micronizada, 5 g por servicio, sabor Lemon Lime.": "Flavored creatine: 100% micronized, 5 g per serving, Lemon Lime flavor.",
    "5000 mg de creatina micronizada por servicio. Power · Strength · Muscle growth.": "5000 mg of micronized creatine per serving. Power · Strength · Muscle growth.",
    "5000 mg de creatina micronizada por servicio, 200 servicios.": "5000 mg of micronized creatine per serving, 200 servings.",
    "5 g de creatina micronizada por servicio. Dos versiones en un envase: Blue Razz y sin sabor.": "5 g of micronized creatine per serving. Two versions in one tub: Blue Razz and unflavored.",
    "Proteína whey concentrada premium, 25 g de proteína por servicio, sabor Horchata.": "Premium whey protein concentrate, 25 g of protein per serving, Horchata flavor.",
    "Proteína whey aislada premium, 25 g de proteína por servicio, sabor Apple Pie.": "Premium whey protein isolate, 25 g of protein per serving, Apple Pie flavor.",
    "Glutamina fermentada, vegana, 5 g por servicio.": "Fermented vegan glutamine, 5 g per serving.",
    "Línea Hardcore Ladies de Dragon Pharma. Según la etiqueta: apoya el crecimiento muscular magro y la recuperación, la salud celular y la absorción de nutrientes.": "Dragon Pharma's Hardcore Ladies line. Per the label: supports lean muscle growth and recovery, cellular health and nutrient absorption.",
    "El pre-entreno de Dragon Pharma. Productos originales con registro SENASAG y sello de autenticidad.": "Dragon Pharma's pre-workout. Genuine products with SENASAG registration and an authenticity seal.",
    "Ganador de masa de ProSupps: 25 g de proteína por servicio, sabor Chocolate Ice Cream.": "ProSupps mass gainer: 25 g of protein per serving, Chocolate Ice Cream flavor.",
    "Pre-entreno de potencia extrema: energía y foco con Infinergy y cafeína, pump con Nitrosigine. Según la etiqueta: mejora la resistencia en el entrenamiento.": "Extreme-potency pre-workout: energy and focus with Infinergy and caffeine, pump with Nitrosigine. Per the label: improves training endurance.",
    "El Venom Inferno (pre-entreno de alto estímulo) en sabor Mangonada.": "Venom Inferno (high-stim pre-workout) in Mangonada flavor.",
    "Pre-entreno completo de Dragon Pharma: pump y rendimiento, energía extrema y foco.": "Dragon Pharma's fully loaded pre-workout: pump and performance, extreme energy and focus.",
    "Pre-entreno diario (daily pre-workout formula): energía, foco y pump con óxido nítrico.": "Daily pre-workout formula: energy, focus and nitric-oxide pump.",
    "Pre-entreno de pump extremo (Extreme Pump Catalyst): máxima congestión muscular.": "Extreme Pump Catalyst pre-workout: maximum muscle pump.",
    "Pre-entreno de alta energía de ProSupps (hard-hitting energy pre-workout), sabor Green Apple.": "ProSupps' hard-hitting energy pre-workout, Green Apple flavor.",
    "Pre-entreno nootrópico + power: dos fórmulas en un envase (Jekyll y Hyde) para tomar por separado o combinadas (Berry Punch).": "Nootropic + power pre-workout: two formulas in one tub (Jekyll and Hyde) to take separately or combined (Berry Punch).",
    "Nuevo: matriz de pump con glicerol, sabor Mangonada. Precio por lanzamiento.": "New: glycerol pump matrix, Mangonada flavor. Launch price.",
    "Nuevo: edición firma de Derek Lunsford del Venom (fully-loaded pre-workout catalyst), sabor Sour Gummy. Precio por lanzamiento.": "New: Derek Lunsford signature edition of Venom (fully-loaded pre-workout catalyst), Sour Gummy flavor. Launch price.",
    "Nuevo: Venom Essential (pre-entreno diario) edición Derek Lunsford, sabor Sour Gummy. Precio por lanzamiento.": "New: Venom Essential (daily pre-workout), Derek Lunsford edition, Sour Gummy flavor. Launch price.",
    "Matriz de proteína whey premium, 25 g de proteína por servicio, sabor Cappuccino.": "Premium whey protein matrix, 25 g of protein per serving, Cappuccino flavor.",
    "Proteína whey premium, 24 g de proteína por servicio, sabor Double Chocolate Brownie.": "Premium whey protein, 24 g of protein per serving, Double Chocolate Brownie flavor.",
    "Proteína whey aislada premium, 25 g de proteína por servicio, sabor Cookies & Cream.": "Premium whey protein isolate, 25 g of protein per serving, Cookies & Cream flavor.",
    "Proteína whey aislada premium, 25 g de proteína por servicio, sabor Blueberry Ice Cream.": "Premium whey protein isolate, 25 g of protein per serving, Blueberry Ice Cream flavor.",
    "Nuevo: proteína whey aislada edición firma de Derek Lunsford, 25 g de proteína por servicio, sabor Cinnamon Roll. Precio por lanzamiento.": "New: Derek Lunsford signature whey protein isolate, 25 g of protein per serving, Cinnamon Roll flavor. Launch price.",
    "Proteína whey de ProSupps, 24 g de proteína por servicio, chocolate Ghirardelli.": "ProSupps whey protein, 24 g of protein per serving, Ghirardelli chocolate.",
    "Proteína premium de ProSupps, 24 g de proteína por servicio, sabor vainilla.": "ProSupps premium protein, 24 g of protein per serving, vanilla flavor.",
    "Beta alanina, 3,2 g por servicio, sin sabor.": "Beta-alanine, 3.2 g per serving, unflavored.",
    "L-citrulina, 3 g por servicio, sin sabor.": "L-citrulline, 3 g per serving, unflavored.",
    "Fórmula de aminoácidos esenciales (EAA) de espectro completo. Según la etiqueta: apoya la síntesis de proteína muscular y la recuperación, la capacidad de entrenamiento y la reposición de electrolitos.": "Full-spectrum essential amino acid (EAA) formula. Per the label: supports muscle protein synthesis and recovery, training capacity and electrolyte replenishment.",
    "Matriz de aminoácidos (BCAA + EAA) con electrolitos, para recuperación y rendimiento.": "Amino acid matrix (BCAA + EAA) with electrolytes, for recovery and performance.",
    "Hidratación con electrolitos y creatina en sobres individuales: agregá agua y listo.": "Hydration with electrolytes and creatine in single-serve sachets: just add water.",
    "Quemador termogénico con estimulantes. Según la etiqueta: energía, quema de calorías y mejor ánimo y foco.": "Thermogenic fat burner with stimulants. Per the label: energy, calorie burning, and better mood and focus.",
    "Diurético de alta potencia sin estimulantes. Según la etiqueta: apoyo diurético natural y ayuda a eliminar el exceso de agua.": "High-potency stim-free diuretic. Per the label: natural diuretic support that helps flush excess water.",
    "Ácido linoleico conjugado. Según la etiqueta: apoya una composición corporal saludable y el metabolismo.": "Conjugated linoleic acid. Per the label: supports healthy body composition and metabolism.",
    "L-carnitina líquida sin estimulantes, 3.000 mg por servicio.": "Stim-free liquid L-carnitine, 3,000 mg per serving.",
    "L-carnitina líquida (energizante metabólico), 3.000 mg por servicio, sabor Berry.": "Liquid L-carnitine (metabolic energizer), 3,000 mg per serving, Berry flavor.",
    "L-carnitina líquida (energizante metabólico), 1.500 mg por servicio, sabor Berry.": "Liquid L-carnitine (metabolic energizer), 1,500 mg per serving, Berry flavor.",
    "Multivitamínico de espectro completo con minerales esenciales, para el equilibrio nutricional diario.": "Full-spectrum multivitamin with essential minerals, for daily nutritional balance.",
    "Según la etiqueta: apoya la salud cardiovascular, la función cognitiva y el equilibrio inflamatorio.": "Per the label: supports cardiovascular health, cognitive function and inflammatory balance.",
    "Según la etiqueta: apoya la función articular, los cartílagos y el tejido conectivo.": "Per the label: supports joint function, cartilage and connective tissue.",
    "Según la etiqueta: ayuda a mantener enzimas hepáticas saludables y la función del hígado.": "Per the label: helps maintain healthy liver enzymes and liver function.",
    "Según la etiqueta: apoya la salud del hígado, el metabolismo de las grasas y la desintoxicación.": "Per the label: supports liver health, fat metabolism and detoxification.",
    "Según la etiqueta: apoya la flora intestinal, una digestión equilibrada y el sistema inmune.": "Per the label: supports gut flora, balanced digestion and the immune system.",
    "Superalimento orgánico y vegano de verduras y frutas. Según la etiqueta: apoya el sistema inmune y la salud digestiva.": "Organic, vegan fruit and vegetable superfood. Per the label: supports the immune system and digestive health.",
    "Anabólico natural de alta potencia. Según la etiqueta: apoya la síntesis de proteína muscular, la hipertrofia y el pump.": "High-potency natural anabolic. Per the label: supports muscle protein synthesis, hypertrophy and pump.",
    "Shaker exclusivo Dragon Pharma (blanco o negro) o ProSupps.": "Exclusive Dragon Pharma shaker (white or black) or ProSupps shaker.",
    "Gorra Bolivia Fitness con el león bordado.": "Bolivia Fitness cap with the embroidered lion.",
    "Chulo (gorro de lana) Bolivia Fitness.": "Bolivia Fitness chullo (knit beanie).", "Mochila de tiras Bolivia Fitness.": "Bolivia Fitness drawstring bag.",
    "Gorro de lana negro con el logo de Dragon Pharma.": "Black knit beanie with the Dragon Pharma logo.",
    "Vaso térmico Dragon Pharma edición 10 años, con asa y tapa.": "Dragon Pharma 10th-anniversary insulated tumbler, with handle and lid.",
    // descripciones meta
    "Tienda online oficial de Bolivia Fitness: Dragon Pharma y ProSupps originales con registro SENASAG. Creatinas, proteínas y pre-entrenos. Black Friday hasta 40% OFF + accesorio gratis. Envíos a toda Bolivia.": "Bolivia Fitness official online store: genuine Dragon Pharma and ProSupps with SENASAG registration. Creatine, protein and pre-workouts. Black Friday up to 40% OFF + free accessory. Shipping across Bolivia.",
  };

  /* ---------- frases con datos variables ---------- */
  const tr = (s) => translate(s) || s;
  const R = [
    [/^Abierto hasta las (\d\d:\d\d)$/, (m) => "Open until " + m[1]],
    [/^Cierra pronto · (\d\d:\d\d)$/, (m) => "Closing soon · " + m[1]],
    [/^Cerrado · abre hoy a las (\d\d:\d\d)$/, (m) => "Closed · opens today at " + m[1]],
    [/^Cerrado · abre mañana a las (\d\d:\d\d)$/, (m) => "Closed · opens tomorrow at " + m[1]],
    [/^hasta (\d+)% OFF \+ 1 accesorio gratis por cualquier compra, hasta el 30 de noviembre\.$/, (m) => "up to " + m[1] + "% OFF + 1 free accessory with any purchase, through November 30."],
    [/^© (\d{4}) Bolivia Fitness · (Precios Black Friday válidos del 16 al 30 de noviembre de 2026\. )?Stock, pago y envío se confirman por WhatsApp\.$/, (m) => "© " + m[1] + " Bolivia Fitness · " + (m[2] ? "Black Friday prices valid November 16–30, 2026. " : "") + "Stock, payment and delivery are confirmed on WhatsApp."],
    [/^Bolsa · (\d+) · (Bs .+)$/, (m) => "Bag · " + m[1] + " · " + m[2]],
    [/^Cantidad de (.+)$/, (m) => "Quantity of " + tr(m[1])],
    [/^Agregar (.+) a la bolsa$/, (m) => "Add " + tr(m[1]) + " to bag"],
    [/^Agregar los (\d+)$/, (m) => "Add all " + m[1]],
    [/^Agregar (.+)$/, (m) => "Add " + tr(m[1])],
    [/^(Bs [\d.,]+) \/ servicio$/, (m) => m[1] + " / serving"],
    [/^(Bs [\d.,]+) por servicio · (.+)$/, (m) => m[1] + " per serving · " + tr(m[2])],
    [/^Ahorrás (Bs [\d.,]+) vs\. precio antes$/, (m) => "You save " + m[1] + " vs. regular price"],
    [/^Ahorrás (Bs [\d.,]+)$/, (m) => "You save " + m[1]],
    [/^antes (Bs [\d.,]+)$/, (m) => "was " + m[1]],
    [/^En (\d+) productos americanos originales, y 1 accesorio gratis por cualquier compra\.$/, (m) => "On " + m[1] + " genuine American products, plus 1 free accessory with any purchase."],
    [/^Venom y Venom Essential Sour Gummy, e Iso Phorm Cinnamon Roll, a precio de lanzamiento desde (Bs [\d.,]+)\.$/, (m) => "Venom and Venom Essential Sour Gummy, plus Iso Phorm Cinnamon Roll, at launch prices from " + m[1] + "."],
    [/^(\d+) pre-entrenos · Dragon Pharma y ProSupps$/, (m) => m[1] + " pre-workouts · Dragon Pharma and ProSupps"],
    [/^(\d+) proteínas · whey y aislada$/, (m) => m[1] + " proteins · whey and isolate"],
    [/^(\d+) de (\d+)$/, (m) => m[1] + " of " + m[2]],
    [/^Ir a la diapositiva (\d+)$/, (m) => "Go to slide " + m[1]],
    [/^Ver imagen (\d+)$/, (m) => "View image " + m[1]],
    [/^(\d+) (productos?) · desde (Bs [\d.,]+)$/, (m) => m[1] + (m[2] === "producto" ? " product" : " products") + " · from " + m[3]],
    [/^(\d+) (productos?)(?: en (.+))?$/, (m) => m[1] + (m[2] === "producto" ? " product" : " products") + (m[3] ? " in " + tr(m[3]) : "")],
    [/^Son las (\d\d:\d\d) en Bolivia · (\d+) de (\d+) sucursales con horario publicado están abiertas ahora\.$/, (m) => "It's " + m[1] + " in Bolivia · " + m[2] + " of " + m[3] + " stores with published hours are open now."],
    [/^Todos los días · (.+)$/, (m) => "Every day · " + m[1]],
    [/^Tienda Bolivia Fitness (.+)$/, (m) => "Bolivia Fitness store, " + m[1]],
    [/^Este producto: (.+)$/, (m) => "This product: " + tr(m[1])],
    [/^(\d)\. (.+)$/, (m) => m[1] + ". " + tr(m[2])],
    [/^Pedido (\S+) listo · (Bs [\d.,]+)$/, (m) => "Order " + m[1] + " ready · " + m[2]],
    [/^Enviar pedido por WhatsApp a (.+)$/, (m) => "Send order on WhatsApp to " + m[1]],
    [/^Hablar con una persona( · .+)?$/, (m) => "Talk to a person" + (m[1] || "")],
  ];

  /* ---------- vocabulario de catálogo (presentaciones, sabores, nombres cortos) ---------- */
  const W = [
    [/(\d[\d–+ ]*) servicios\b/g, "$1 servings"], [/\bservicios\b/g, "servings"], [/\/serv\./g, "/serving"],
    [/cápsulas blandas/g, "softgels"], [/cápsulas/g, "capsules"], [/tabletas/g, "tablets"], [/sobres/g, "sachets"],
    [/\bpor servicio\b/g, "per serving"], [/Sin sabor/g, "Unflavored"], [/sin sabor/g, "unflavored"],
    [/Líquid[ao]/g, "Liquid"], [/líquid[ao]/g, "liquid"], [/^Pre-entreno$/, "Pre-workout"], [/Aminoácidos esenciales/g, "Essential amino acids"],
    [/Superalimento en polvo/g, "Powdered superfood"], [/Gorro de lana/g, "Knit beanie"], [/^Gorra$/, "Cap"], [/^Mochila$/, "Drawstring bag"], [/Vaso térmico/g, "Tumbler"],
    [/Creatina/g, "Creatine"], [/Glutamina/g, "Glutamine"], [/Beta Alanina/g, "Beta Alanine"], [/L-Citrulina/g, "L-Citrulline"],
    [/L-Carnitina/g, "L-Carnitine"], [/Hidratación/g, "Hydration"], [/Probióticos/g, "Probiotics"],
  ];
  const SPLIT = " · ";

  function translate(src) {
    const s = src.replace(/\s+/g, " ").trim();
    if (!s) return null;
    if (Object.prototype.hasOwnProperty.call(D, s)) return D[s];
    for (const [re, fn] of R) { const m = s.match(re); if (m) return fn(m); }
    if (s.includes(SPLIT)) {
      const parts = s.split(SPLIT), out = parts.map((p) => (p ? translate(p) || p : p));
      if (out.some((p, i) => p !== parts[i])) return out.join(SPLIT);
    }
    let w = s; for (const [re, rep] of W) w = w.replace(re, rep);
    return w !== s ? w : null;
  }

  /* ---------- aplicar / restaurar en el DOM ---------- */
  const ATTRS = ["aria-label", "placeholder", "alt", "title", "data-ask", "aria-roledescription"];
  const TXT = new WeakMap(), ATT = new WeakMap();
  const touched = new Set();   // elementos con atributos traducidos (para restaurar)
  const isEN = () => root.lang === "en";
  const skip = (el) => !el || el.closest("script, style, noscript, [data-no-i18n], [translate='no']");

  function doText(node) {
    if (skip(node.parentElement)) return;
    let rec = TXT.get(node);
    if (rec && node.data === rec.en) return;
    if (!rec) { rec = { es: node.data, en: null }; TXT.set(node, rec); } else rec.es = node.data;
    const en = translate(rec.es);
    if (!en) { rec.en = null; return; }
    const lead = rec.es.match(/^\s*/)[0], trail = rec.es.match(/\s*$/)[0];
    rec.en = lead + en + trail;
    if (node.data !== rec.en) node.data = rec.en;
  }
  function doAttr(el, a) {
    if (!el.hasAttribute(a) || skip(el)) return;
    const v = el.getAttribute(a);
    let m = ATT.get(el); if (!m) { m = {}; ATT.set(el, m); }
    const rec = m[a];
    if (rec && v === rec.en) return;
    const en = translate(v);
    m[a] = { es: v, en };
    if (en && en !== v) { el.setAttribute(a, en); touched.add(el); }
  }
  function walk(rootNode) {
    if (rootNode.nodeType === 3) return doText(rootNode);
    if (rootNode.nodeType !== 1) return;
    if (skip(rootNode)) return;
    ATTRS.forEach((a) => doAttr(rootNode, a));
    const tw = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let n; while ((n = tw.nextNode())) { if (n.nodeType === 3) doText(n); else ATTRS.forEach((a) => doAttr(n, a)); }
  }
  function restore() {
    const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n; while ((n = tw.nextNode())) { const rec = TXT.get(n); if (rec && rec.en && n.data === rec.en) n.data = rec.es; }
    touched.forEach((el) => { const m = ATT.get(el); if (!m) return; for (const a in m) if (m[a].en && el.getAttribute(a) === m[a].en) el.setAttribute(a, m[a].es); });
    touched.clear();
  }
  let ORIG_TITLE = document.title, SET_TITLE = null, ORIG_DESC = null;
  function doHead() {
    const md = document.querySelector('meta[name="description"]');
    if (document.title !== SET_TITLE) ORIG_TITLE = document.title;   // la página cambió el título
    if (isEN()) {
      SET_TITLE = tr(ORIG_TITLE); document.title = SET_TITLE;
      if (md) { if (ORIG_DESC == null) ORIG_DESC = md.content; md.content = tr(ORIG_DESC); }
    } else {
      document.title = ORIG_TITLE; SET_TITLE = null;
      if (md && ORIG_DESC != null) md.content = ORIG_DESC;
    }
  }

  const mo = new MutationObserver((list) => {
    if (!isEN()) return;
    for (const m of list) {
      if (m.type === "childList") m.addedNodes.forEach(walk);
      else if (m.type === "characterData") doText(m.target);
      else if (m.type === "attributes") doAttr(m.target, m.attributeName);
    }
  });
  mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  // títulos que las páginas cambian por JS (producto, filtros de la tienda)
  const titleEl = document.querySelector("title");
  if (titleEl) new MutationObserver(() => { if (isEN() && document.title !== SET_TITLE) doHead(); }).observe(titleEl, { childList: true, characterData: true, subtree: true });

  /* ---------- controles ---------- */
  const save = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* modo privado */ } };
  function labels() {
    const en = isEN(), light = root.getAttribute("data-theme") === "light";
    document.querySelectorAll("[data-lang-label]").forEach((el) => { el.textContent = en ? "ES" : "EN"; });
    document.querySelectorAll("[data-lang-name]").forEach((el) => { el.textContent = en ? "Español" : "English"; });
    document.querySelectorAll("[data-theme-label]").forEach((el) => { el.textContent = light ? (en ? "Dark mode" : "Modo oscuro") : (en ? "Light mode" : "Modo claro"); });
    document.querySelectorAll("button[data-toggle-lang]").forEach((el) => el.setAttribute("aria-label", en ? "Cambiar a español" : "Switch to English"));
    document.querySelectorAll("button[data-toggle-theme]").forEach((el) => el.setAttribute("aria-label", light ? (en ? "Switch to dark mode" : "Cambiar a modo oscuro") : (en ? "Switch to light mode" : "Cambiar a modo claro")));
    document.querySelectorAll("[data-toggle-lang], [data-toggle-theme]").forEach((el) => el.setAttribute("data-no-i18n", ""));
  }
  function setLang(l) {
    save("bf_lang", l);
    if (l === "en") { root.lang = "en"; walk(document.body); }
    else { root.lang = "es-BO"; restore(); }
    doHead(); labels();
    document.dispatchEvent(new CustomEvent("bf:lang", { detail: { lang: l } }));
  }
  function setTheme(t) {
    save("bf_theme", t);
    root.classList.add("theme-anim");
    root.setAttribute("data-theme", t);
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", t === "light" ? "#f6f2ee" : "#080606");
    setTimeout(() => root.classList.remove("theme-anim"), 450);
    labels();
  }
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-toggle-lang]")) { e.preventDefault(); setLang(isEN() ? "es" : "en"); }
    else if (e.target.closest("[data-toggle-theme]")) { e.preventDefault(); setTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light"); }
  });

  labels();
  if (isEN()) { walk(document.body); doHead(); }
  window.BFI18N = { translate, setLang, setTheme };
})();
