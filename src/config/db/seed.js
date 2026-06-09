const { Category, Professional, Movie, Ceremony, Vote } = require("../../models");
const { logger } = require("../logger");

async function seedMongo() {
  const existing = await Category.countDocuments();
  if (existing > 0) {
    logger.info("MongoDB already seeded — skipping");
    return;
  }

  logger.info("Seeding MongoDB with initial data...");

  // ── Categorías ────────────────────────────────────────────────────────────
  const categories = await Category.insertMany([
    { nombre: "Mejor Película",               descripcion: "La mejor producción cinematográfica del año",        tipo: "pelicula" },
    { nombre: "Mejor Director",               descripcion: "La mejor dirección de una película",                 tipo: "profesional" },
    { nombre: "Mejor Actor Principal",        descripcion: "La mejor actuación masculina protagónica",           tipo: "profesional" },
    { nombre: "Mejor Actriz Principal",       descripcion: "La mejor actuación femenina protagónica",           tipo: "profesional" },
    { nombre: "Mejor Actor de Reparto",       descripcion: "La mejor actuación masculina secundaria",            tipo: "profesional" },
    { nombre: "Mejor Actriz de Reparto",      descripcion: "La mejor actuación femenina secundaria",            tipo: "profesional" },
    { nombre: "Mejor Guión Original",         descripcion: "El mejor guión escrito directamente para la pantalla", tipo: "pelicula" },
    { nombre: "Mejor Guión Adaptado",         descripcion: "El mejor guión basado en material previo",          tipo: "pelicula" },
    { nombre: "Mejor Película Internacional", descripcion: "La mejor película no hablada en inglés",            tipo: "pelicula" },
    { nombre: "Mejor Banda Sonora",           descripcion: "La mejor música original compuesta para una película", tipo: "pelicula" },
  ]);

  const cat = (nombre) => categories.find((c) => c.nombre === nombre);

  // ── Profesionales ─────────────────────────────────────────────────────────
  const professionals = await Professional.insertMany([
    { nombre: "Christopher", apellido: "Nolan",     nacionalidad: "Británico-Estadounidense", roles: [{ nombre: "Director" }, { nombre: "Productor" }] },
    { nombre: "Steven",      apellido: "Spielberg", nacionalidad: "Estadounidense",           roles: [{ nombre: "Director" }, { nombre: "Productor" }] },
    { nombre: "Martin",      apellido: "Scorsese",  nacionalidad: "Estadounidense",           roles: [{ nombre: "Director" }] },
    { nombre: "Greta",       apellido: "Gerwig",    nacionalidad: "Estadounidense",           roles: [{ nombre: "Director" }, { nombre: "Productor" }] },
    { nombre: "Yorgos",      apellido: "Lanthimos", nacionalidad: "Griego",                   roles: [{ nombre: "Director" }] },
    { nombre: "Cillian",     apellido: "Murphy",    nacionalidad: "Irlandés",                 roles: [{ nombre: "Actor Principal" }] },
    { nombre: "Leonardo",    apellido: "DiCaprio",  nacionalidad: "Estadounidense",           roles: [{ nombre: "Actor Principal" }] },
    { nombre: "Robert",      apellido: "Downey Jr", nacionalidad: "Estadounidense",           roles: [{ nombre: "Actor de Reparto" }] },
    { nombre: "Emma",        apellido: "Stone",     nacionalidad: "Estadounidense",           roles: [{ nombre: "Actriz Principal" }] },
    { nombre: "Lily",        apellido: "Gladstone", nacionalidad: "Estadounidense",           roles: [{ nombre: "Actriz Principal" }] },
    { nombre: "Cate",        apellido: "Blanchett", nacionalidad: "Australiana",              roles: [{ nombre: "Actriz Principal" }] },
    { nombre: "Da'Vine Joy", apellido: "Randolph",  nacionalidad: "Estadounidense",           roles: [{ nombre: "Actriz de Reparto" }] },
    { nombre: "Ryan",        apellido: "Gosling",   nacionalidad: "Canadiense",              roles: [{ nombre: "Actor de Reparto" }] },
    { nombre: "Robert",      apellido: "De Niro",   nacionalidad: "Estadounidense",           roles: [{ nombre: "Actor Principal" }, { nombre: "Actor de Reparto" }] },
  ]);

  const pro = (nombre, apellido) => professionals.find((p) => p.nombre === nombre && p.apellido === apellido);

  // ── Películas ─────────────────────────────────────────────────────────────
  const movies = await Movie.insertMany([
    {
      titulo: "Oppenheimer",
      anioEstreno: 2023,
      genero: "Drama Histórico",
      descripcion: "La historia del físico J. Robert Oppenheimer y el desarrollo de la bomba atómica.",
      reparto: [
        { profesionalId: pro("Christopher", "Nolan")._id,   rol: "Director" },
        { profesionalId: pro("Cillian",     "Murphy")._id,  rol: "Actor Principal" },
        { profesionalId: pro("Robert",      "Downey Jr")._id, rol: "Actor de Reparto" },
      ],
    },
    {
      titulo: "Barbie",
      anioEstreno: 2023,
      genero: "Comedia / Fantasía",
      descripcion: "Barbie y Ken viajan al mundo real tras ser expulsados de Barbieland.",
      reparto: [
        { profesionalId: pro("Greta",  "Gerwig")._id,  rol: "Director" },
        { profesionalId: pro("Ryan",   "Gosling")._id, rol: "Actor de Reparto" },
      ],
    },
    {
      titulo: "Poor Things",
      anioEstreno: 2023,
      genero: "Drama / Ciencia Ficción",
      descripcion: "La extraordinaria historia de Bella Baxter, una joven devuelta a la vida por un científico excéntrico.",
      reparto: [
        { profesionalId: pro("Yorgos", "Lanthimos")._id, rol: "Director" },
        { profesionalId: pro("Emma",   "Stone")._id,     rol: "Actriz Principal" },
      ],
    },
    {
      titulo: "Killers of the Flower Moon",
      anioEstreno: 2023,
      genero: "Drama / Crimen",
      descripcion: "Los asesinatos en serie de miembros de la tribu Osage en Oklahoma en los años 20.",
      reparto: [
        { profesionalId: pro("Martin",   "Scorsese")._id,  rol: "Director" },
        { profesionalId: pro("Leonardo", "DiCaprio")._id,  rol: "Actor Principal" },
        { profesionalId: pro("Robert",   "De Niro")._id,   rol: "Actor de Reparto" },
        { profesionalId: pro("Lily",     "Gladstone")._id, rol: "Actriz Principal" },
      ],
    },
    {
      titulo: "The Holdovers",
      anioEstreno: 2023,
      genero: "Drama / Comedia",
      descripcion: "Un profesor gruñón queda a cargo de un estudiante problemático durante las vacaciones navideñas.",
      reparto: [
        { profesionalId: pro("Da'Vine Joy", "Randolph")._id, rol: "Actriz de Reparto" },
      ],
    },
    {
      titulo: "Anatomía de una Caída",
      anioEstreno: 2023,
      genero: "Drama / Thriller",
      descripcion: "Una mujer es juzgada por la muerte de su marido en los Alpes franceses.",
      reparto: [],
    },
    {
      titulo: "La Zona de Interés",
      anioEstreno: 2023,
      genero: "Drama",
      descripcion: "La vida cotidiana del comandante de Auschwitz y su familia junto al campo de concentración.",
      reparto: [],
    },
  ]);

  const mov = (titulo) => movies.find((m) => m.titulo === titulo);

  // ── Helpers para snapshots ────────────────────────────────────────────────
  const catSnap  = (c) => ({ id: c._id, nombre: c.nombre });
  const movSnap  = (m) => ({ id: m._id, titulo: m.titulo });
  const proSnap  = (p) => ({ id: p._id, nombreCompleto: `${p.nombre} ${p.apellido}` });

  // ── Ceremonia 96 — CERRADA (Oscar 2024) ───────────────────────────────────
  const nom96 = [
    // Mejor Película
    { categoria: catSnap(cat("Mejor Película")),          pelicula: movSnap(mov("Oppenheimer")),              esGanador: true  },
    { categoria: catSnap(cat("Mejor Película")),          pelicula: movSnap(mov("Poor Things")),              esGanador: false },
    { categoria: catSnap(cat("Mejor Película")),          pelicula: movSnap(mov("Killers of the Flower Moon")), esGanador: false },
    { categoria: catSnap(cat("Mejor Película")),          pelicula: movSnap(mov("The Holdovers")),            esGanador: false },
    { categoria: catSnap(cat("Mejor Película")),          pelicula: movSnap(mov("Anatomía de una Caída")),    esGanador: false },
    // Mejor Director
    { categoria: catSnap(cat("Mejor Director")),          profesional: proSnap(pro("Christopher", "Nolan")),  esGanador: true  },
    { categoria: catSnap(cat("Mejor Director")),          profesional: proSnap(pro("Yorgos",      "Lanthimos")), esGanador: false },
    { categoria: catSnap(cat("Mejor Director")),          profesional: proSnap(pro("Martin",      "Scorsese")), esGanador: false },
    // Mejor Actor Principal
    { categoria: catSnap(cat("Mejor Actor Principal")),   profesional: proSnap(pro("Cillian",   "Murphy")),   esGanador: true  },
    { categoria: catSnap(cat("Mejor Actor Principal")),   profesional: proSnap(pro("Leonardo",  "DiCaprio")), esGanador: false },
    // Mejor Actriz Principal
    { categoria: catSnap(cat("Mejor Actriz Principal")),  profesional: proSnap(pro("Emma",      "Stone")),    esGanador: true  },
    { categoria: catSnap(cat("Mejor Actriz Principal")),  profesional: proSnap(pro("Lily",      "Gladstone")), esGanador: false },
    { categoria: catSnap(cat("Mejor Actriz Principal")),  profesional: proSnap(pro("Cate",      "Blanchett")), esGanador: false },
    // Mejor Actor de Reparto
    { categoria: catSnap(cat("Mejor Actor de Reparto")),  profesional: proSnap(pro("Robert", "Downey Jr")),   esGanador: true  },
    { categoria: catSnap(cat("Mejor Actor de Reparto")),  profesional: proSnap(pro("Ryan",   "Gosling")),     esGanador: false },
    // Mejor Actriz de Reparto
    { categoria: catSnap(cat("Mejor Actriz de Reparto")), profesional: proSnap(pro("Da'Vine Joy", "Randolph")), esGanador: true },
    // Mejor Película Internacional
    { categoria: catSnap(cat("Mejor Película Internacional")), pelicula: movSnap(mov("La Zona de Interés")), esGanador: true  },
    { categoria: catSnap(cat("Mejor Película Internacional")), pelicula: movSnap(mov("Anatomía de una Caída")), esGanador: false },
  ];

  // Construir premios a partir de las nominaciones ganadoras
  const premios96 = nom96
    .filter((n) => n.esGanador)
    .map((n) => {
      const esPelicula = !!n.pelicula;
      return {
        categoria: n.categoria,
        nominadoGanadorId: esPelicula ? n.pelicula.id : n.profesional.id,
        ganador: esPelicula
          ? { tipo: "pelicula",    pelicula:    n.pelicula,    profesional: null }
          : { tipo: "profesional", profesional: n.profesional, pelicula:    null },
      };
    });

  const ceremony96 = await Ceremony.create({
    anio: 2024,
    fecha: new Date("2024-03-10"),
    lugar: "Dolby Theatre, Los Ángeles",
    estado: "cerrada",
    actuaciones: [
      { tipoActuacion: "Apertura", artistas: [{ nombre: "Ryan Gosling", tipo: "Cantante" }] },
    ],
    nominaciones: nom96,
    premios: premios96,
  });

  // ── Ceremonia 97 — ABIERTA (Oscar 2025) ───────────────────────────────────
  const ceremony97 = await Ceremony.create({
    anio: 2025,
    fecha: new Date("2025-03-02"),
    lugar: "Dolby Theatre, Los Ángeles",
    estado: "abierta",
    actuaciones: [],
    nominaciones: [
      { categoria: catSnap(cat("Mejor Película")),         pelicula: movSnap(mov("Oppenheimer")),   esGanador: false },
      { categoria: catSnap(cat("Mejor Película")),         pelicula: movSnap(mov("Barbie")),         esGanador: false },
      { categoria: catSnap(cat("Mejor Película")),         pelicula: movSnap(mov("Poor Things")),    esGanador: false },
      { categoria: catSnap(cat("Mejor Director")),         profesional: proSnap(pro("Greta", "Gerwig")),    esGanador: false },
      { categoria: catSnap(cat("Mejor Director")),         profesional: proSnap(pro("Christopher", "Nolan")), esGanador: false },
      { categoria: catSnap(cat("Mejor Actor Principal")),  profesional: proSnap(pro("Leonardo", "DiCaprio")), esGanador: false },
      { categoria: catSnap(cat("Mejor Actriz Principal")), profesional: proSnap(pro("Emma",     "Stone")),    esGanador: false },
      { categoria: catSnap(cat("Mejor Actriz Principal")), profesional: proSnap(pro("Cate",     "Blanchett")), esGanador: false },
      { categoria: catSnap(cat("Mejor Actor de Reparto")), profesional: proSnap(pro("Ryan",     "Gosling")),   esGanador: false },
      { categoria: catSnap(cat("Mejor Guión Original")),  pelicula: movSnap(mov("Barbie")),         esGanador: false },
      { categoria: catSnap(cat("Mejor Guión Original")),  pelicula: movSnap(mov("Anatomía de una Caída")), esGanador: false },
    ],
    premios: [],
  });

  // ── Votos ─────────────────────────────────────────────────────────────────
  // Helper: encontrar el _id de una nominación por categoría + nombre del nominado
  const nomId = (ceremony, catNombre, nomNombre) => {
    const n = ceremony.nominaciones.find(
      (n) =>
        n.categoria.nombre === catNombre &&
        (n.pelicula?.titulo === nomNombre || n.profesional?.nombreCompleto === nomNombre)
    );
    if (!n) throw new Error(`Seed: nominación no encontrada — ${catNombre} / ${nomNombre}`);
    return n._id;
  };

  const catId = (nombre) => cat(nombre)._id;

  // 12 usuarios ficticios para la ceremonia cerrada (2024)
  // Distribución: el ganador tiene mayoría de votos, el resto comparte los demás
  const votes96 = [
    // Mejor Película — Oppenheimer gana 7/12
    ...["u01","u02","u03","u04","u05","u06","u07"].map((u) => ({ userId: `seed_${u}`, ceremonyId: ceremony96._id, categoryId: catId("Mejor Película"),          nominacionId: nomId(ceremony96, "Mejor Película",          "Oppenheimer") })),
    ...["u08","u09"]                              .map((u) => ({ userId: `seed_${u}`, ceremonyId: ceremony96._id, categoryId: catId("Mejor Película"),          nominacionId: nomId(ceremony96, "Mejor Película",          "Poor Things") })),
    { userId: "seed_u10", ceremonyId: ceremony96._id, categoryId: catId("Mejor Película"), nominacionId: nomId(ceremony96, "Mejor Película", "Killers of the Flower Moon") },
    { userId: "seed_u11", ceremonyId: ceremony96._id, categoryId: catId("Mejor Película"), nominacionId: nomId(ceremony96, "Mejor Película", "The Holdovers") },
    { userId: "seed_u12", ceremonyId: ceremony96._id, categoryId: catId("Mejor Película"), nominacionId: nomId(ceremony96, "Mejor Película", "Anatomía de una Caída") },

    // Mejor Director — Nolan gana 8/12
    ...["u01","u02","u03","u04","u05","u06","u07","u08"].map((u) => ({ userId: `seed_${u}`, ceremonyId: ceremony96._id, categoryId: catId("Mejor Director"), nominacionId: nomId(ceremony96, "Mejor Director", "Christopher Nolan") })),
    ...["u09","u10"]                                    .map((u) => ({ userId: `seed_${u}`, ceremonyId: ceremony96._id, categoryId: catId("Mejor Director"), nominacionId: nomId(ceremony96, "Mejor Director", "Yorgos Lanthimos") })),
    ...["u11","u12"]                                    .map((u) => ({ userId: `seed_${u}`, ceremonyId: ceremony96._id, categoryId: catId("Mejor Director"), nominacionId: nomId(ceremony96, "Mejor Director", "Martin Scorsese") })),

    // Mejor Actor Principal — Murphy gana 9/12
    ...["u01","u02","u03","u04","u05","u06","u07","u08","u09"].map((u) => ({ userId: `seed_${u}`, ceremonyId: ceremony96._id, categoryId: catId("Mejor Actor Principal"), nominacionId: nomId(ceremony96, "Mejor Actor Principal", "Cillian Murphy") })),
    ...["u10","u11","u12"]                                    .map((u) => ({ userId: `seed_${u}`, ceremonyId: ceremony96._id, categoryId: catId("Mejor Actor Principal"), nominacionId: nomId(ceremony96, "Mejor Actor Principal", "Leonardo DiCaprio") })),

    // Mejor Actriz Principal — Stone gana 7/12
    ...["u01","u02","u03","u04","u05","u06","u07"].map((u) => ({ userId: `seed_${u}`, ceremonyId: ceremony96._id, categoryId: catId("Mejor Actriz Principal"), nominacionId: nomId(ceremony96, "Mejor Actriz Principal", "Emma Stone") })),
    ...["u08","u09","u10"]                        .map((u) => ({ userId: `seed_${u}`, ceremonyId: ceremony96._id, categoryId: catId("Mejor Actriz Principal"), nominacionId: nomId(ceremony96, "Mejor Actriz Principal", "Lily Gladstone") })),
    ...["u11","u12"]                              .map((u) => ({ userId: `seed_${u}`, ceremonyId: ceremony96._id, categoryId: catId("Mejor Actriz Principal"), nominacionId: nomId(ceremony96, "Mejor Actriz Principal", "Cate Blanchett") })),

    // Mejor Actor de Reparto — Downey Jr gana 10/12
    ...["u01","u02","u03","u04","u05","u06","u07","u08","u09","u10"].map((u) => ({ userId: `seed_${u}`, ceremonyId: ceremony96._id, categoryId: catId("Mejor Actor de Reparto"), nominacionId: nomId(ceremony96, "Mejor Actor de Reparto", "Robert Downey Jr") })),
    ...["u11","u12"]                                                 .map((u) => ({ userId: `seed_${u}`, ceremonyId: ceremony96._id, categoryId: catId("Mejor Actor de Reparto"), nominacionId: nomId(ceremony96, "Mejor Actor de Reparto", "Ryan Gosling") })),

    // Mejor Actriz de Reparto — Randolph gana 12/12 (única nominada)
    ...["u01","u02","u03","u04","u05","u06","u07","u08","u09","u10","u11","u12"].map((u) => ({ userId: `seed_${u}`, ceremonyId: ceremony96._id, categoryId: catId("Mejor Actriz de Reparto"), nominacionId: nomId(ceremony96, "Mejor Actriz de Reparto", "Da'Vine Joy Randolph") })),

    // Mejor Película Internacional — La Zona de Interés gana 9/12
    ...["u01","u02","u03","u04","u05","u06","u07","u08","u09"].map((u) => ({ userId: `seed_${u}`, ceremonyId: ceremony96._id, categoryId: catId("Mejor Película Internacional"), nominacionId: nomId(ceremony96, "Mejor Película Internacional", "La Zona de Interés") })),
    ...["u10","u11","u12"]                                    .map((u) => ({ userId: `seed_${u}`, ceremonyId: ceremony96._id, categoryId: catId("Mejor Película Internacional"), nominacionId: nomId(ceremony96, "Mejor Película Internacional", "Anatomía de una Caída") })),
  ];

  // 5 usuarios en la ceremonia abierta (2025) — votación parcial
  const votes97 = [
    // Mejor Película (5 votos)
    { userId: "seed_u01", ceremonyId: ceremony97._id, categoryId: catId("Mejor Película"), nominacionId: nomId(ceremony97, "Mejor Película", "Oppenheimer") },
    { userId: "seed_u02", ceremonyId: ceremony97._id, categoryId: catId("Mejor Película"), nominacionId: nomId(ceremony97, "Mejor Película", "Barbie") },
    { userId: "seed_u03", ceremonyId: ceremony97._id, categoryId: catId("Mejor Película"), nominacionId: nomId(ceremony97, "Mejor Película", "Barbie") },
    { userId: "seed_u04", ceremonyId: ceremony97._id, categoryId: catId("Mejor Película"), nominacionId: nomId(ceremony97, "Mejor Película", "Poor Things") },
    { userId: "seed_u05", ceremonyId: ceremony97._id, categoryId: catId("Mejor Película"), nominacionId: nomId(ceremony97, "Mejor Película", "Oppenheimer") },
    // Mejor Director (3 votos)
    { userId: "seed_u01", ceremonyId: ceremony97._id, categoryId: catId("Mejor Director"), nominacionId: nomId(ceremony97, "Mejor Director", "Greta Gerwig") },
    { userId: "seed_u02", ceremonyId: ceremony97._id, categoryId: catId("Mejor Director"), nominacionId: nomId(ceremony97, "Mejor Director", "Greta Gerwig") },
    { userId: "seed_u03", ceremonyId: ceremony97._id, categoryId: catId("Mejor Director"), nominacionId: nomId(ceremony97, "Mejor Director", "Christopher Nolan") },
    // Mejor Actriz Principal (3 votos)
    { userId: "seed_u01", ceremonyId: ceremony97._id, categoryId: catId("Mejor Actriz Principal"), nominacionId: nomId(ceremony97, "Mejor Actriz Principal", "Emma Stone") },
    { userId: "seed_u02", ceremonyId: ceremony97._id, categoryId: catId("Mejor Actriz Principal"), nominacionId: nomId(ceremony97, "Mejor Actriz Principal", "Emma Stone") },
    { userId: "seed_u03", ceremonyId: ceremony97._id, categoryId: catId("Mejor Actriz Principal"), nominacionId: nomId(ceremony97, "Mejor Actriz Principal", "Cate Blanchett") },
    // Mejor Actor de Reparto (2 votos)
    { userId: "seed_u01", ceremonyId: ceremony97._id, categoryId: catId("Mejor Actor de Reparto"), nominacionId: nomId(ceremony97, "Mejor Actor de Reparto", "Ryan Gosling") },
    { userId: "seed_u04", ceremonyId: ceremony97._id, categoryId: catId("Mejor Actor de Reparto"), nominacionId: nomId(ceremony97, "Mejor Actor de Reparto", "Ryan Gosling") },
    // Mejor Guión Original (2 votos)
    { userId: "seed_u01", ceremonyId: ceremony97._id, categoryId: catId("Mejor Guión Original"), nominacionId: nomId(ceremony97, "Mejor Guión Original", "Barbie") },
    { userId: "seed_u02", ceremonyId: ceremony97._id, categoryId: catId("Mejor Guión Original"), nominacionId: nomId(ceremony97, "Mejor Guión Original", "Anatomía de una Caída") },
    // Mejor Actor Principal — sin votos aún (intencionalmente)
  ];

  await Vote.insertMany([...votes96, ...votes97], { ordered: false });

  logger.info("MongoDB seed complete: 10 categorías, 14 profesionales, 7 películas, 2 ceremonias, votos simulados");
}

module.exports = { seedMongo };
