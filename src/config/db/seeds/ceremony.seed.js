const { Category, Ceremony, Movie, Professional } = require("../../../models");

const BASE_CEREMONIES = [
  {
    anio: 2024,
    fecha: new Date("2024-03-10T00:00:00.000Z"),
    lugar: "Dolby Theatre, Los Angeles",
    estado: "abierta"
  },
  {
    anio: 2023,
    fecha: new Date("2023-03-12T00:00:00.000Z"),
    lugar: "Dolby Theatre, Los Angeles",
    estado: "abierta"
  },
  {
    anio: 2022,
    fecha: new Date("2022-03-27T00:00:00.000Z"),
    lugar: "Union Station, Los Angeles",
    estado: "abierta"
  },
  {
    anio: 2021,
    fecha: new Date("2021-04-25T00:00:00.000Z"),
    lugar: "Teatro Colon, Buenos Aires",
    estado: "abierta"
  },
  {
    anio: 2020,
    fecha: new Date("2020-02-09T00:00:00.000Z"),
    lugar: "Dolby Theatre, Los Angeles",
    estado: "abierta"
  }
];

const NOMINATION_DEFINITIONS = [
  { categoria: "Mejor Pelicula", pelicula: "Oppenheimer" },
  { categoria: "Mejor Pelicula", pelicula: "Poor Things" },
  { categoria: "Mejor Pelicula", pelicula: "Barbie" },
  { categoria: "Mejor Actor", profesional: "Cillian Murphy" },
  { categoria: "Mejor Actriz", profesional: "Emma Stone" },
  { categoria: "Mejor Director", profesional: "Christopher Nolan" },
  { categoria: "Mejor Director", profesional: "Greta Gerwig" },
  { categoria: "Mejor Productor", profesional: "Margot Robbie" },
  { categoria: "Mejor Productor", profesional: "Christopher Nolan" }
];

async function seedCeremonies() {
  const [categories, movies, professionals] = await Promise.all([
    Category.find({ nombre: { $in: NOMINATION_DEFINITIONS.map((nomination) => nomination.categoria) } }),
    Movie.find({ titulo: { $in: NOMINATION_DEFINITIONS.filter((nomination) => nomination.pelicula).map((nomination) => nomination.pelicula) } }),
    Professional.find()
  ]);

  const categoryByName = new Map(categories.map((category) => [category.nombre, category]));
  const movieByTitle = new Map(movies.map((movie) => [movie.titulo, movie]));
  const professionalByFullName = new Map(
    professionals.map((professional) => [
      `${professional.nombre} ${professional.apellido}`,
      professional
    ])
  );

  const nominations = NOMINATION_DEFINITIONS.map((definition) => {
    const category = categoryByName.get(definition.categoria);
    if (!category) {
      return null;
    }

    const nomination = {
      categoria: {
        id: category._id,
        nombre: category.nombre
      },
      pelicula: null,
      profesional: null,
      esGanador: false
    };

    if (definition.pelicula) {
      const movie = movieByTitle.get(definition.pelicula);
      if (!movie) {
        return null;
      }

      nomination.pelicula = {
        id: movie._id,
        titulo: movie.titulo
      };
    }

    if (definition.profesional) {
      const professional = professionalByFullName.get(definition.profesional);
      if (!professional) {
        return null;
      }

      nomination.profesional = {
        id: professional._id,
        nombreCompleto: `${professional.nombre} ${professional.apellido}`
      };
    }

    return nomination;
  }).filter(Boolean);

  const operations = BASE_CEREMONIES.map((ceremony) => ({
    updateOne: {
      filter: { anio: ceremony.anio },
      update: {
        $set: {
          fecha: ceremony.fecha,
          lugar: ceremony.lugar,
          estado: ceremony.estado,
          actuaciones: [],
          nominaciones: nominations,
          premios: []
        },
        $setOnInsert: {
          anio: ceremony.anio
        }
      },
      upsert: true
    }
  }));

  if (!operations.length) {
    return { processed: 0, nominations: nominations.length };
  }

  const result = await Ceremony.bulkWrite(operations, { ordered: false });

  return {
    processed: operations.length,
    nominations: nominations.length,
    inserted: result.upsertedCount || 0,
    modified: result.modifiedCount || 0,
    matched: result.matchedCount || 0
  };
}

module.exports = {
  seedCeremonies,
  BASE_CEREMONIES
};
