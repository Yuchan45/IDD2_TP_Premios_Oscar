const { Movie, Professional } = require("../../../models");

const BASE_MOVIES = [
  {
    titulo: "Oppenheimer",
    anioEstreno: 2023,
    genero: "Drama historico",
    descripcion: "Relato sobre el desarrollo de la bomba atomica.",
    reparto: [
      { nombre: "Cillian", apellido: "Murphy", rol: "Actor Principal" },
      { nombre: "Christopher", apellido: "Nolan", rol: "Director" }
    ]
  },
  {
    titulo: "Poor Things",
    anioEstreno: 2023,
    genero: "Comedia dramatica",
    descripcion: "Historia fantastica sobre identidad y autonomia.",
    reparto: [
      { nombre: "Emma", apellido: "Stone", rol: "Actor Principal" }
    ]
  },
  {
    titulo: "Barbie",
    anioEstreno: 2023,
    genero: "Comedia",
    descripcion: "Aventura satirica sobre una muneca iconica.",
    reparto: [
      { nombre: "Margot", apellido: "Robbie", rol: "Actor Principal" },
      { nombre: "Greta", apellido: "Gerwig", rol: "Director" }
    ]
  },
  {
    titulo: "The Holdovers",
    anioEstreno: 2023,
    genero: "Drama",
    descripcion: "Historia escolar ambientada durante las fiestas.",
    reparto: []
  },
  {
    titulo: "Anatomy of a Fall",
    anioEstreno: 2023,
    genero: "Drama judicial",
    descripcion: "Investigacion judicial sobre una muerte sospechosa.",
    reparto: []
  }
];

async function seedMovies() {
  const professionals = await Professional.find({
    $or: BASE_MOVIES.flatMap((movie) =>
      movie.reparto.map((member) => ({
        nombre: member.nombre,
        apellido: member.apellido
      }))
    )
  });

  const professionalByName = new Map(
    professionals.map((professional) => [
      `${professional.nombre} ${professional.apellido}`,
      professional
    ])
  );

  const operations = BASE_MOVIES.map((movie) => ({
    updateOne: {
      filter: { titulo: movie.titulo },
      update: {
        $set: {
          anioEstreno: movie.anioEstreno,
          genero: movie.genero,
          descripcion: movie.descripcion,
          reparto: movie.reparto
            .map((member) => {
              const professional = professionalByName.get(`${member.nombre} ${member.apellido}`);
              if (!professional) {
                return null;
              }

              return {
                profesionalId: professional._id,
                rol: member.rol
              };
            })
            .filter(Boolean)
        },
        $setOnInsert: {
          titulo: movie.titulo
        }
      },
      upsert: true
    }
  }));

  if (!operations.length) {
    return { processed: 0 };
  }

  const result = await Movie.bulkWrite(operations, { ordered: false });

  return {
    processed: operations.length,
    inserted: result.upsertedCount || 0,
    modified: result.modifiedCount || 0,
    matched: result.matchedCount || 0
  };
}

module.exports = {
  seedMovies,
  BASE_MOVIES
};
