const { Category, Professional, Movie, Ceremony } = require("../../models");
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
    { nombre: "Mejor Película",           descripcion: "La mejor producción cinematográfica del año" },
    { nombre: "Mejor Director",           descripcion: "La mejor dirección de una película" },
    { nombre: "Mejor Actor Principal",    descripcion: "La mejor actuación masculina protagónica" },
    { nombre: "Mejor Actriz Principal",   descripcion: "La mejor actuación femenina protagónica" },
    { nombre: "Mejor Actor de Reparto",   descripcion: "La mejor actuación masculina secundaria" },
    { nombre: "Mejor Actriz de Reparto",  descripcion: "La mejor actuación femenina secundaria" },
    { nombre: "Mejor Guión Original",     descripcion: "El mejor guión escrito directamente para la pantalla" },
    { nombre: "Mejor Guión Adaptado",     descripcion: "El mejor guión basado en material previo" },
    { nombre: "Mejor Película Internacional", descripcion: "La mejor película no hablada en inglés" },
    { nombre: "Mejor Banda Sonora",       descripcion: "La mejor música original compuesta para una película" },
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

  await Ceremony.create({
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
  await Ceremony.create({
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

  logger.info("MongoDB seed complete: 10 categorías, 14 profesionales, 7 películas, 2 ceremonias");
}

module.exports = { seedMongo };
