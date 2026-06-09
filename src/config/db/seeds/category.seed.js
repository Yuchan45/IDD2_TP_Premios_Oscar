const { Category } = require("../../../models");

const BASE_CATEGORIES = [
  {
    nombre: "Mejor Actor",
    descripcion: "Premio al mejor actor principal.",
    tipo: "profesional"
  },
  {
    nombre: "Mejor Actriz",
    descripcion: "Premio a la mejor actriz principal.",
    tipo: "profesional"
  },
  {
    nombre: "Mejor Pelicula",
    descripcion: "Premio a la mejor pelicula.",
    tipo: "pelicula"
  },
  {
    nombre: "Mejor Director",
    descripcion: "Premio a la mejor direccion.",
    tipo: "profesional"
  },
  {
    nombre: "Mejor Productor",
    descripcion: "Premio al mejor productor.",
    tipo: "profesional"
  }
];

async function seedCategories() {
  const operations = BASE_CATEGORIES.map((category) => ({
    updateOne: {
      filter: { nombre: category.nombre },
      update: {
        $set: {
          descripcion: category.descripcion,
          tipo: category.tipo
        },
        $setOnInsert: {
          nombre: category.nombre
        }
      },
      upsert: true
    }
  }));

  if (!operations.length) {
    return { processed: 0 };
  }

  const result = await Category.bulkWrite(operations, { ordered: false });

  return {
    processed: operations.length,
    inserted: result.upsertedCount || 0,
    modified: result.modifiedCount || 0,
    matched: result.matchedCount || 0
  };
}

module.exports = {
  seedCategories,
  BASE_CATEGORIES
};
