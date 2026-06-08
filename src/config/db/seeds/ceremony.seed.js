const crypto = require("crypto");
const mongoose = require("mongoose");
const { Category, Ceremony, Movie, Professional, Vote } = require("../../../models");

const BASE_CEREMONIES = [
  {
    anio: 2025,
    fecha: new Date("2025-03-02T00:00:00.000Z"),
    lugar: "Teatro Colon, Buenos Aires",
    estado: "abierta"
  },
  {
    anio: 2024,
    fecha: new Date("2024-03-10T00:00:00.000Z"),
    lugar: "Tokyo Dome, Tokyo",
    estado: "abierta"
  },
  {
    anio: 2023,
    fecha: new Date("2023-03-12T00:00:00.000Z"),
    lugar: "Dolby Theatre, Los Angeles",
    estado: "abierta"
  }
];

const NOMINATION_DEFINITIONS_BY_YEAR = {
  2025: [
    { categoria: "Mejor Pelicula", pelicula: "Oppenheimer" },
    { categoria: "Mejor Pelicula", pelicula: "Poor Things" },
    { categoria: "Mejor Pelicula", pelicula: "Barbie" },
    { categoria: "Mejor Actor", profesional: "Cillian Murphy" },
    { categoria: "Mejor Actor", profesional: "Matt Damon" },
    { categoria: "Mejor Actor", profesional: "Robert Downey Jr" },
    { categoria: "Mejor Director", profesional: "Christopher Nolan" },
    { categoria: "Mejor Director", profesional: "Greta Gerwig" },
    { categoria: "Mejor Director", profesional: "Steven Spielberg" },
    { categoria: "Mejor Productor", profesional: "Christopher Nolan" },
    { categoria: "Mejor Productor", profesional: "Margot Robbie" },
    { categoria: "Mejor Productor", profesional: "Steven Spielberg" }
  ],
  2024: [
    { categoria: "Mejor Pelicula", pelicula: "Avengers: Endgame" },
    { categoria: "Mejor Pelicula", pelicula: "The Martian" },
    { categoria: "Mejor Pelicula", pelicula: "Spotlight" },
    { categoria: "Mejor Actriz", profesional: "Emma Stone" },
    { categoria: "Mejor Actriz", profesional: "Emily Blunt" },
    { categoria: "Mejor Actriz", profesional: "Jennifer Aniston" },
    { categoria: "Mejor Director", profesional: "Steven Spielberg" },
    { categoria: "Mejor Director", profesional: "Christopher Nolan" },
    { categoria: "Mejor Director", profesional: "Greta Gerwig" },
    { categoria: "Mejor Productor", profesional: "Matt Damon" },
    { categoria: "Mejor Productor", profesional: "Christopher Nolan" },
    { categoria: "Mejor Productor", profesional: "Margot Robbie" }
  ],
  2023: [
    { categoria: "Mejor Pelicula", pelicula: "Iron Man" },
    { categoria: "Mejor Pelicula", pelicula: "Scream" },
    { categoria: "Mejor Pelicula", pelicula: "A Quiet Place Part II" },
    { categoria: "Mejor Actor", profesional: "Robert Downey Jr" },
    { categoria: "Mejor Actor", profesional: "Mark Ruffalo" },
    { categoria: "Mejor Actor", profesional: "David Schwimmer" },
    { categoria: "Mejor Actriz", profesional: "Courteney Cox" },
    { categoria: "Mejor Actriz", profesional: "Lisa Kudrow" },
    { categoria: "Mejor Actriz", profesional: "Emily Blunt" }
  ]
};

async function seedCeremonies() {
  const allDefinitions = Object.values(NOMINATION_DEFINITIONS_BY_YEAR).flat();
  const [categories, movies, professionals] = await Promise.all([
    Category.find({ nombre: { $in: allDefinitions.map((nomination) => nomination.categoria) } }),
    Movie.find({ titulo: { $in: allDefinitions.filter((nomination) => nomination.pelicula).map((nomination) => nomination.pelicula) } }),
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

  function nominationSignature(definition) {
    if (definition.pelicula) {
      return `${definition.categoria}::pelicula::${definition.pelicula}`;
    }

    return `${definition.categoria}::profesional::${definition.profesional}`;
  }

  function nominationObjectId(anio, definition) {
    const hex = crypto
      .createHash("md5")
      .update(`${anio}::${nominationSignature(definition)}`)
      .digest("hex")
      .slice(0, 24);

    return new mongoose.Types.ObjectId(hex);
  }

  function snapshotSignature(nomination) {
    if (nomination.pelicula?.titulo) {
      return `${nomination.categoria.nombre}::pelicula::${nomination.pelicula.titulo}`;
    }

    return `${nomination.categoria.nombre}::profesional::${nomination.profesional?.nombreCompleto || ""}`;
  }

  function buildNominations(anio, definitions) {
    return definitions.map((definition) => {
      const category = categoryByName.get(definition.categoria);
      if (!category) {
        return null;
      }

      const nomination = {
        _id: nominationObjectId(anio, definition),
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
  }

  const existingCeremonies = await Ceremony.find({ anio: { $in: BASE_CEREMONIES.map((ceremony) => ceremony.anio) } });
  const existingCeremonyByYear = new Map(existingCeremonies.map((ceremony) => [ceremony.anio, ceremony]));

  const operations = BASE_CEREMONIES.map((ceremony) => {
    const nominations = buildNominations(ceremony.anio, NOMINATION_DEFINITIONS_BY_YEAR[ceremony.anio] || []);

    return {
      updateOne: {
        filter: { anio: ceremony.anio },
        update: {
          $set: {
            fecha: ceremony.fecha,
            lugar: ceremony.lugar,
            estado: ceremony.estado,
            nominaciones: nominations
          },
          $setOnInsert: {
            anio: ceremony.anio,
            actuaciones: [],
            premios: []
          }
        },
        upsert: true
      }
    };
  });

  if (!operations.length) {
    return { processed: 0, nominations: 0 };
  }

  const yearsToKeep = BASE_CEREMONIES.map((ceremony) => ceremony.anio);
  const deleteResult = await Ceremony.deleteMany({ anio: { $in: [2020, 2021, 2022] } });

  for (const ceremony of BASE_CEREMONIES) {
    const existingCeremony = existingCeremonyByYear.get(ceremony.anio);
    if (!existingCeremony) {
      continue;
    }

    const nextNominations = buildNominations(
      ceremony.anio,
      NOMINATION_DEFINITIONS_BY_YEAR[ceremony.anio] || []
    );
    const nextNominationBySignature = new Map(
      nextNominations.map((nomination) => [snapshotSignature(nomination), nomination])
    );

    for (const previousNomination of existingCeremony.nominaciones) {
      const signature = snapshotSignature(previousNomination);
      const nextNomination = nextNominationBySignature.get(signature);

      if (nextNomination) {
        if (String(previousNomination._id) !== String(nextNomination._id)) {
          await Vote.updateMany(
            { ceremonyId: existingCeremony._id, nominacionId: previousNomination._id },
            {
              $set: {
                nominacionId: nextNomination._id,
                categoryId: nextNomination.categoria.id
              }
            }
          );
        }
      } else {
        await Vote.deleteMany({
          ceremonyId: existingCeremony._id,
          nominacionId: previousNomination._id
        });
      }
    }
  }

  const result = await Ceremony.bulkWrite(operations, { ordered: false });

  return {
    processed: operations.length,
    activeYears: yearsToKeep,
    nominationsByYear: Object.fromEntries(
      BASE_CEREMONIES.map((ceremony) => [
        ceremony.anio,
        (NOMINATION_DEFINITIONS_BY_YEAR[ceremony.anio] || []).length
      ])
    ),
    deletedLegacy: deleteResult.deletedCount || 0,
    inserted: result.upsertedCount || 0,
    modified: result.modifiedCount || 0,
    matched: result.matchedCount || 0
  };
}

module.exports = {
  seedCeremonies,
  BASE_CEREMONIES
};
