const { Professional } = require("../../../models");

const BASE_PROFESSIONALS = [
  {
    nombre: "Cillian",
    apellido: "Murphy",
    nacionalidad: "Irlandesa",
    roles: [{ nombre: "Actor Principal" }]
  },
  {
    nombre: "Emma",
    apellido: "Stone",
    nacionalidad: "Estadounidense",
    roles: [{ nombre: "Actor Principal" }]
  },
  {
    nombre: "Christopher",
    apellido: "Nolan",
    nacionalidad: "Britanica",
    roles: [{ nombre: "Director" }, { nombre: "Productor" }]
  },
  {
    nombre: "Greta",
    apellido: "Gerwig",
    nacionalidad: "Estadounidense",
    roles: [{ nombre: "Director" }]
  },
  {
    nombre: "Margot",
    apellido: "Robbie",
    nacionalidad: "Australiana",
    roles: [{ nombre: "Actor Principal" }, { nombre: "Productor" }]
  }
];

async function seedProfessionals() {
  const operations = BASE_PROFESSIONALS.map((professional) => ({
    updateOne: {
      filter: {
        nombre: professional.nombre,
        apellido: professional.apellido
      },
      update: {
        $set: {
          nacionalidad: professional.nacionalidad,
          roles: professional.roles
        },
        $setOnInsert: {
          nombre: professional.nombre,
          apellido: professional.apellido
        }
      },
      upsert: true
    }
  }));

  if (!operations.length) {
    return { processed: 0 };
  }

  const result = await Professional.bulkWrite(operations, { ordered: false });

  return {
    processed: operations.length,
    inserted: result.upsertedCount || 0,
    modified: result.modifiedCount || 0,
    matched: result.matchedCount || 0
  };
}

module.exports = {
  seedProfessionals,
  BASE_PROFESSIONALS
};
