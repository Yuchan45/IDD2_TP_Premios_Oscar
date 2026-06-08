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
  },
  {
    titulo: "Avengers: Endgame",
    anioEstreno: 2019,
    genero: "Accion / Ciencia ficcion",
    descripcion: "Los Vengadores restantes se unen para revertir el chasquido de Thanos.",
    reparto: [
      { nombre: "Robert", apellido: "Downey Jr", rol: "Actor Principal" },
      { nombre: "Mark", apellido: "Ruffalo", rol: "Actor Secundario" }
    ]
  },
  {
    titulo: "Iron Man",
    anioEstreno: 2008,
    genero: "Accion / Superheroes",
    descripcion: "Tony Stark construye una armadura y redefine su destino.",
    reparto: [
      { nombre: "Robert", apellido: "Downey Jr", rol: "Actor Principal" }
    ]
  },
  {
    titulo: "Spotlight",
    anioEstreno: 2015,
    genero: "Drama periodistico",
    descripcion: "Un equipo de investigacion revela abusos sistemicos dentro de la Iglesia.",
    reparto: [
      { nombre: "Mark", apellido: "Ruffalo", rol: "Actor Principal" }
    ]
  },
  {
    titulo: "We're the Millers",
    anioEstreno: 2013,
    genero: "Comedia",
    descripcion: "Una falsa familia cruza la frontera en una mision absurda.",
    reparto: [
      { nombre: "Jennifer", apellido: "Aniston", rol: "Actor Principal" }
    ]
  },
  {
    titulo: "Scream",
    anioEstreno: 1996,
    genero: "Terror",
    descripcion: "Un asesino enmascarado desata una ola de crimenes en Woodsboro.",
    reparto: [
      { nombre: "Courteney", apellido: "Cox", rol: "Actor Principal" }
    ]
  },
  {
    titulo: "Romy and Michele's High School Reunion",
    anioEstreno: 1997,
    genero: "Comedia",
    descripcion: "Dos amigas reinventan sus vidas antes de una reunion escolar.",
    reparto: [
      { nombre: "Lisa", apellido: "Kudrow", rol: "Actor Principal" }
    ]
  },
  {
    titulo: "Lost in Space",
    anioEstreno: 1998,
    genero: "Aventura espacial",
    descripcion: "La familia Robinson se pierde en el espacio durante una mision.",
    reparto: [
      { nombre: "Matt", apellido: "LeBlanc", rol: "Actor Principal" }
    ]
  },
  {
    titulo: "Fools Rush In",
    anioEstreno: 1997,
    genero: "Comedia romantica",
    descripcion: "Una relacion inesperada cambia la vida de dos desconocidos.",
    reparto: [
      { nombre: "Matthew", apellido: "Perry", rol: "Actor Principal" }
    ]
  },
  {
    titulo: "The Pallbearer",
    anioEstreno: 1996,
    genero: "Comedia dramatica",
    descripcion: "Un joven sin rumbo queda atrapado en un triangulo sentimental incomodo.",
    reparto: [
      { nombre: "David", apellido: "Schwimmer", rol: "Actor Principal" }
    ]
  },
  {
    titulo: "The Martian",
    anioEstreno: 2015,
    genero: "Ciencia ficcion",
    descripcion: "Un astronauta debe sobrevivir solo en Marte tras ser dado por muerto.",
    reparto: [
      { nombre: "Matt", apellido: "Damon", rol: "Actor Principal" }
    ]
  },
  {
    titulo: "A Quiet Place Part II",
    anioEstreno: 2021,
    genero: "Thriller / Terror",
    descripcion: "La familia Abbott enfrenta nuevas amenazas fuera de su refugio.",
    reparto: [
      { nombre: "Emily", apellido: "Blunt", rol: "Actor Principal" }
    ]
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
